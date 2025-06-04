import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { backendAgentService } from '../services/backendAgentService';
import { SAFE_BOTTOM_PADDING } from '../constants/layout';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

interface ActionItem {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  source?: string;
  priority?: number;
  action?: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string;
  actions?: ActionItem[];
  confirmations?: any[];
  respondingAgents?: Array<{
    type: string;
    name: string;
    emoji: string;
    confidence: string;
  }>;
}

const SimpleMessagesScreen = ({ route }: any) => {
  const { isDarkMode } = useThemeStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI fitness coach. I'm here to help you reach your fitness goals. What would you like to work on today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [useMultiAgent, setUseMultiAgent] = useState(true); // Default to multi-agent mode
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedAgentsForChat, setSelectedAgentsForChat] = useState<string[]>([]); // Track selected agents for chat
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const quickActionsSlide = useRef(new Animated.Value(0)).current;
  const messageSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('AI Coach Chat Opened');
    // Load previous conversation from backend if available
    if (backendAgentService.isConfigured()) {
      loadConversationHistory();
    }
    
    // Animate messages in
    Animated.timing(messageSlide, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Handle auto-message from route params (from workout completion, etc.)
    if (route?.params?.autoMessage) {
      setTimeout(() => {
        sendMessage(route.params.autoMessage);
      }, 1000);
    }

    // Keyboard listeners
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Quick action buttons
  const quickActions = [
    { 
      id: 'workout', 
      text: 'Add a workout', 
      icon: 'fitness', 
      action: () => sendQuickMessage("I'd like to add a new workout to my schedule") 
    },
    { 
      id: 'nutrition', 
      text: 'Nutrition advice', 
      icon: 'nutrition', 
      action: () => sendQuickMessage("Can you give me some nutrition advice?") 
    },
    { 
      id: 'progress', 
      text: 'Check progress', 
      icon: 'trending-up', 
      action: () => sendQuickMessage("How am I progressing with my fitness goals?") 
    },
    { 
      id: 'modify', 
      text: 'Modify routine', 
      icon: 'create', 
      action: () => sendQuickMessage("I'd like to modify my current workout routine") 
    },
  ];

  const sendQuickMessage = (message: string) => {
    setShowQuickActions(false);
    sendMessage(message);
  };

  const loadConversationHistory = async () => {
    try {
      const history = await backendAgentService.getConversationHistory(20);
      if (history.length > 0) {
        const formattedMessages: Message[] = history.map((msg: any, index: number) => ({
          id: `history_${index}`,
          text: msg.content || msg.message,
          sender: (msg.role === 'user' ? 'user' : 'ai') as 'user' | 'ai',
          timestamp: new Date(msg.timestamp || Date.now()),
        }));
        setMessages([...formattedMessages]);
      }
    } catch (error) {
      console.log('Could not load conversation history:', error);
      // Keep default welcome message
    }
  };

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
    Animated.spring(quickActionsSlide, {
      toValue: showQuickActions ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const sendMessage = async (messageText?: string, imageUri?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend && !imageUri) return;

    // Send button animation
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
      image: imageUri,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Animate new message
    Animated.timing(messageSlide, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      console.log('User Message Sent', { message: textToSend, hasImage: !!imageUri, useMultiAgent });
      
      let response;
      let respondingAgents;
      
      if (backendAgentService.isConfigured()) {
        // Use backend with multi-agent support
        if (useMultiAgent) {
          const multiResponse = await backendAgentService.sendMultiAgentMessage(
            textToSend,
            'supportive', // Can be made configurable
            undefined, // context
            selectedAgentsForChat.length > 0 ? selectedAgentsForChat : undefined,  // Use selected agents or let system auto-determine
            { fastMode: true } // Enable fast mode for quicker responses
          );
          response = multiResponse;
          respondingAgents = multiResponse.responding_agents;
        } else {
          // Single agent mode via backend
          response = await backendAgentService.sendMessage(textToSend, 'supportive');
        }
      } else {
        // Backend not configured - show helpful message
        response = {
          text: "I'm not connected to the backend yet. Please make sure the Python backend is running and configured with your OpenAI API key.",
          actions: [],
          confirmations: []
        };
      }
      
      console.log('AI Response Received', { response, respondingAgents });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: (response as any).text || (response as any).response || 'No response received',
        sender: 'ai',
        timestamp: new Date(),
        actions: (response as any).action_items || (response as any).actions || [],
        confirmations: (response as any).confirmations || [],
        respondingAgents: respondingAgents?.map(agent => ({
          type: agent,
          name: agent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          emoji: '🤖',
          confidence: 'high'
        })),
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // Scroll to bottom after AI response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('AI Chat Error', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images' as any, // Use string directly to avoid deprecated warning
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      await sendMessage('Can you analyze this image?', result.assets[0].uri);
    }
  };

  const handleActionItem = async (action: ActionItem, messageId: string) => {
    try {
      setIsTyping(true);
      
      // Create action context message
      let actionMessage = '';
      switch (action.type) {
        case 'add_workout':
          actionMessage = `Please add the suggested workout to my schedule for today.`;
          break;
        case 'schedule_workout':
          actionMessage = `I'd like to schedule this workout. Can you help me pick a good day?`;
          break;
        case 'schedule_rest':
          actionMessage = `Please schedule a rest day for me.`;
          break;
        case 'modify_workout':
          actionMessage = `Please modify my workout to accommodate my current condition.`;
          break;
        case 'substitute_exercises':
          actionMessage = `Please suggest alternative exercises that won't aggravate my condition.`;
          break;
        case 'create_meal_plan':
          actionMessage = `Please create a meal plan for me.`;
          break;
        case 'update_goals':
          actionMessage = `I'd like to update my fitness goals.`;
          break;
        case 'view_progress':
          actionMessage = `Show me my fitness progress.`;
          break;
        default:
          actionMessage = `Execute action: ${action.label}`;
      }
      
      // Send the action request
      await sendMessage(actionMessage);
      
    } catch (error) {
      console.error('Error handling action:', error);
      Alert.alert('Error', 'Failed to execute action. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmationAction = async (_confirmationId: string, _action: string, _data: any) => {
    try {
      // Backend agents handle confirmations differently
      // For now, just acknowledge the action
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: `Action "${_action}" has been processed. The backend agents are handling this request.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Error handling confirmation:', error);
      Alert.alert('Error', 'Failed to execute action. Please try again.');
    }
  };

  const renderConfirmationButtons = (confirmations: any[]) => {
    if (!confirmations || confirmations.length === 0) return null;
    
    return confirmations.map((confirmation) => (
      <View key={confirmation.id} style={styles.confirmationContainer}>
        <View style={styles.confirmationButtons}>
          {confirmation.options.map((option: any, index: number) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.confirmationButton,
                option.style === 'primary' && styles.primaryButton,
                option.style === 'destructive' && styles.destructiveButton,
              ]}
              onPress={() => handleConfirmationAction(confirmation.id, option.action, option.data)}
            >
              <Text style={[
                styles.confirmationButtonText,
                option.style === 'primary' && styles.primaryButtonText,
              ]}>
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    ));
  };

  const handleLongPress = (message: Message) => {
    setSelectedMessage(message);
    setShowMessageOptions(true);
  };

  const handleAskOtherAgent = () => {
    setShowMessageOptions(false);
    setShowAgentSelection(true);
  };

  const handleRegenerateMessage = async () => {
    setShowMessageOptions(false);
    if (!selectedMessage) return;

    // Find the user message that prompted this AI response
    const messageIndex = messages.findIndex(m => m.id === selectedMessage.id);
    if (messageIndex > 0) {
      const previousUserMessage = messages[messageIndex - 1];
      if (previousUserMessage.sender === 'user') {
        // Remove the current AI response
        setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
        // Resend the user message to get a new response
        setIsTyping(true);
        await sendMessage(previousUserMessage.text);
      }
    }
  };

  const handleEditMessage = () => {
    setShowMessageOptions(false);
    if (selectedMessage) {
      setEditingMessage(selectedMessage);
      setEditText(selectedMessage.text);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMessage || !editText.trim()) return;

    const messageIndex = messages.findIndex(m => m.id === editingMessage.id);
    if (messageIndex !== -1) {
      // Remove all messages after the edited message
      const newMessages = messages.slice(0, messageIndex);
      
      // Update the edited message
      const updatedMessage: Message = {
        ...editingMessage,
        text: editText.trim(),
      };
      
      setMessages([...newMessages, updatedMessage]);
      setEditingMessage(null);
      setEditText('');
      
      // Send the edited message to get a new AI response
      await sendMessage(editText.trim());
    }
  };

  const handleDeleteMessage = () => {
    setShowMessageOptions(false);
    if (selectedMessage) {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
            },
          },
        ]
      );
    }
  };

  const handleSelectAgent = async (agentType: string) => {
    setShowAgentSelection(false);
    
    // If we have a selected message, we're asking another agent about that message
    if (selectedMessage) {
      // Get the original user query from the previous message
      const messageIndex = messages.findIndex(m => m.id === selectedMessage.id);
      if (messageIndex > 0) {
        const previousUserMessage = messages[messageIndex - 1];
        if (previousUserMessage.sender === 'user') {
          setIsTyping(true);
          
          try {
            // Send to specific agent in single agent mode
            const response = await backendAgentService.sendMultiAgentMessage(
              previousUserMessage.text,
              'supportive',
              undefined,
              [agentType], // Specify which agent to use
              { singleAgentMode: true } // Only use the specified agent
            );
            
            const aiMessage: Message = {
              id: Date.now().toString(),
              text: response.response || 'No response received',
              sender: 'ai',
              timestamp: new Date(),
              actions: [], // MultiAgentResponse doesn't include actions
              confirmations: [], // MultiAgentResponse doesn't include confirmations
              respondingAgents: response.responding_agents?.map(agent => ({
                type: agent,
                name: agent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                emoji: getAgentEmoji(agent),
                confidence: 'high'
              })),
            };

            setMessages((prev) => [...prev, aiMessage]);
          
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        } catch (error) {
          console.error('Error asking other agent:', error);
          Alert.alert('Error', 'Failed to get response from the selected agent.');
        } finally {
          setIsTyping(false);
        }
      }
    }
    } else {
      // No selected message - this is for selecting agents for future conversations
      // Toggle the agent in the selected agents list
      setSelectedAgentsForChat(prev => {
        if (prev.includes(agentType)) {
          // Remove if already selected
          return prev.filter(a => a !== agentType);
        } else {
          // Add if not selected
          return [...prev, agentType];
        }
      });
    }
  };

  const getAgentEmoji = (agentType: string): string => {
    const emojiMap: { [key: string]: string } = {
      'fitness_coach': '💪',
      'nutrition_specialist': '🥗',
      'recovery_wellness': '🧘',
      'goal_achievement': '🎯',
      'form_safety': '🛡️',
      'fitness_action': '🏃',
    };
    return emojiMap[agentType] || '🤖';
  };

  const availableAgents = [
    { type: 'fitness_coach', name: 'Fitness Coach', emoji: '💪' },
    { type: 'nutrition_specialist', name: 'Nutrition Specialist', emoji: '🥗' },
    { type: 'recovery_wellness', name: 'Recovery & Wellness', emoji: '🧘' },
    { type: 'goal_achievement', name: 'Goal Achievement', emoji: '🎯' },
    { type: 'form_safety', name: 'Form & Safety', emoji: '🛡️' },
    { type: 'fitness_action', name: 'Fitness Action', emoji: '🏃' },
  ];

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const isEditing = editingMessage?.id === item.id;
    
    return (
      <TouchableWithoutFeedback
        onLongPress={() => handleLongPress(item)}
        delayLongPress={500}
      >
        <View style={[styles.messageRow, isUser && styles.userMessageRow]}>
          <BlurView
            intensity={isUser ? 30 : 40}
            tint="dark"
            style={[styles.messageBubble, isUser ? styles.userMessage : styles.aiMessage]}
          >
            {!isUser && (
              <LinearGradient
                colors={['#f093fb', '#667eea']}
                style={styles.aiAvatar}
              >
                <Icon name="flash" size={16} color="white" />
              </LinearGradient>
            )}
            <View style={styles.messageContent}>
              {/* Show responding agents for AI messages */}
              {!isUser && item.respondingAgents && item.respondingAgents.length > 0 && (
                <View style={styles.respondingAgentsContainer}>
                  <Text style={styles.respondingAgentsTitle}>Consulted Specialists:</Text>
                  <View style={styles.respondingAgentsList}>
                    {item.respondingAgents.map((agent, idx) => (
                      <View key={idx} style={styles.agentBadge}>
                        <Text style={styles.agentEmoji}>{agent.emoji}</Text>
                        <Text style={styles.agentName}>{agent.name}</Text>
                        <Text style={styles.agentConfidence}>({agent.confidence})</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {isEditing ? (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.editInput}
                    value={editText}
                    onChangeText={setEditText}
                    multiline
                    autoFocus
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => {
                        setEditingMessage(null);
                        setEditText('');
                      }}
                    >
                      <Icon name="close" size={20} color="#ff4444" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={handleSaveEdit}
                    >
                      <Icon name="checkmark" size={20} color="#44ff44" />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                  {item.text}
                </Text>
              )}
              <Text style={styles.timestamp}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              {/* Render confirmation buttons for AI messages */}
              {!isUser && item.confirmations && renderConfirmationButtons(item.confirmations)}
              
              {/* Render action buttons for AI messages */}
              {!isUser && item.actions && item.actions.length > 0 && (
                <View style={styles.actionButtonsContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionButtonsScroll}>
                    {item.actions.map((action) => (
                      <TouchableOpacity
                        key={action.id}
                        style={[styles.actionButton, { backgroundColor: action.color + '20' }]}
                        onPress={() => handleActionItem(action, item.id)}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={[action.color + '40', action.color + '20']}
                          style={styles.actionButtonGradient}
                        >
                          <Icon name={action.icon} size={20} color={action.color} />
                          <Text style={[styles.actionButtonText, { color: action.color }]}>
                            {action.label}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
        </BlurView>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const gradientColors = isDarkMode 
    ? ['#0f0c29', '#302b63', '#24243e'] as const
    : ['#667eea', '#764ba2', '#f093fb'] as const;

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      {/* Enhanced Header with Glow Effect */}
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.1)', 'transparent']}
        style={styles.compactHeader}
      >
        <View style={styles.headerContent}>
          <Icon name="flash" size={24} color="#f093fb" />
          <Text style={styles.compactTitle}>
            {selectedAgentsForChat.length > 0 
              ? `AI Coach (${selectedAgentsForChat.length} agents)`
              : 'AI Coach'
            }
          </Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
          </View>
          {/* Multi-agent toggle */}
          <TouchableOpacity 
            style={styles.multiAgentToggle}
            onPress={() => setUseMultiAgent(!useMultiAgent)}
          >
            <Icon 
              name={useMultiAgent ? "people" : "person"} 
              size={20} 
              color={useMultiAgent ? "#667eea" : "#8892b0"} 
            />
          </TouchableOpacity>
          
          {/* Agent selector button */}
          <TouchableOpacity 
            style={[styles.multiAgentToggle, { marginLeft: 8 }]}
            onPress={() => {
              setSelectedMessage(null); // Clear selected message to show general agent selection
              setShowAgentSelection(true);
            }}
          >
            <Icon 
              name="git-compare" 
              size={20} 
              color="#f093fb" 
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View 
            style={{
              opacity: messageSlide,
              transform: [{
                translateY: messageSlide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }]
            }}
          >
            {renderMessage({ item })}
          </Animated.View>
        )}
        style={styles.chatContainer}
        contentContainerStyle={[
          styles.chatContent,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : SAFE_BOTTOM_PADDING + 80 }
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
            <Animated.View style={styles.typingIndicator}>
              <BlurView intensity={40} tint="dark" style={styles.typingBubble}>
                <ActivityIndicator size="small" color="#667eea" />
                <Text style={styles.typingText}>AI Coach is typing...</Text>
              </BlurView>
            </Animated.View>
          ) : null
        }
      />

      {/* Message Options Modal */}
      <Modal
        visible={showMessageOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMessageOptions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMessageOptions(false)}
        >
          <View style={styles.optionsContainer}>
            {selectedMessage?.sender === 'ai' ? (
              <>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleAskOtherAgent}
                >
                  <Icon name="people" size={20} color="#667eea" />
                  <Text style={styles.optionText}>Ask Other Agent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleRegenerateMessage}
                >
                  <Icon name="refresh" size={20} color="#667eea" />
                  <Text style={styles.optionText}>Regenerate</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleEditMessage}
                >
                  <Icon name="create" size={20} color="#667eea" />
                  <Text style={styles.optionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.optionButton, styles.destructiveOption]}
                  onPress={handleDeleteMessage}
                >
                  <Icon name="trash" size={20} color="#ff4444" />
                  <Text style={[styles.optionText, styles.destructiveText]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Agent Selection Modal */}
      <Modal
        visible={showAgentSelection}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAgentSelection(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAgentSelection(false)}
        >
          <View style={styles.agentSelectionContainer}>
            <Text style={styles.agentSelectionTitle}>
              {selectedMessage ? 'Ask Another Agent' : 'Select Agents for Chat'}
            </Text>
            <Text style={styles.agentSelectionSubtitle}>
              {selectedMessage 
                ? 'Choose an agent to get another perspective' 
                : 'Select which agents should respond to your messages'
              }
            </Text>
            <View style={styles.agentGrid}>
              {availableAgents.map((agent) => {
                const isSelected = selectedAgentsForChat.includes(agent.type);
                return (
                  <TouchableOpacity
                    key={agent.type}
                    style={[
                      styles.agentCard,
                      !selectedMessage && isSelected && styles.agentCardSelected
                    ]}
                    onPress={() => handleSelectAgent(agent.type)}
                  >
                    <Text style={styles.agentEmoji}>{agent.emoji}</Text>
                    <Text style={[
                      styles.agentCardName,
                      !selectedMessage && isSelected && styles.agentCardNameSelected
                    ]}>{agent.name}</Text>
                    {!selectedMessage && isSelected && (
                      <View style={styles.selectedCheckmark}>
                        <Icon name="checkmark" size={12} color="white" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {!selectedMessage && selectedAgentsForChat.length > 0 && (
              <TouchableOpacity
                style={styles.clearSelectionButton}
                onPress={() => setSelectedAgentsForChat([])}
              >
                <Text style={styles.clearSelectionText}>Clear Selection</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Quick Actions Modal */}
      <Modal
        visible={showQuickActions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQuickActions(false)}
      >
        <TouchableOpacity 
          style={styles.quickActionsOverlay}
          activeOpacity={1}
          onPress={() => setShowQuickActions(false)}
        >
          <Animated.View
            style={[
              styles.quickActionsContainer,
              {
                transform: [{
                  translateY: quickActionsSlide.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0]
                  })
                }],
                opacity: quickActionsSlide,
              }
            ]}
          >
            <View style={styles.quickActionsContent}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.quickActionButton}
                    onPress={action.action}
                  >
                    <Icon name={action.icon} size={24} color="#667eea" />
                    <Text style={styles.quickActionText}>{action.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Enhanced Input Area */}
      <View style={[
        styles.inputArea,
        {
          bottom: keyboardHeight > 0 
            ? keyboardHeight + 10 
            : (Platform.OS === 'ios' ? 95 : 85)
        }
      ]}>
        <View style={styles.inputBackground}>
          <BlurView intensity={95} tint="light" style={styles.inputContainer}>
            <View style={styles.inputRow}>
              {/* Quick Actions Button */}
              <TouchableOpacity onPress={toggleQuickActions} style={styles.quickActionsButton}>
                <LinearGradient
                  colors={['#f093fb', '#667eea']}
                  style={styles.iconGradient}
                >
                  <Icon name="flash" size={18} color="white" />
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
                <Icon name="image-outline" size={18} color="#f093fb" />
              </TouchableOpacity>
              
              <TextInput
                style={styles.input}
                placeholder="Ask your AI coach anything..."
                placeholderTextColor="rgba(0,0,0,0.5)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage()}
              />
              
              <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
                <TouchableOpacity
                  onPress={() => sendMessage()}
                  style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                  disabled={!inputText.trim()}
                >
                  <LinearGradient
                    colors={inputText.trim() ? ['#f093fb', '#667eea'] : ['#444', '#555']}
                    style={styles.sendButtonGradient}
                  >
                    <Icon name="send" size={18} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </BlurView>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  compactHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  compactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: '#f093fb',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  onlineIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chatContent: {
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageRow: {
    marginVertical: 8,
    alignItems: 'flex-start',
  },
  userMessageRow: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(240, 147, 251, 0.2)',
  },
  userMessage: {
    marginLeft: 40,
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    borderColor: 'rgba(102, 126, 234, 0.5)',
  },
  aiMessage: {
    marginRight: 40,
    backgroundColor: 'rgba(36, 36, 62, 0.8)',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f093fb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  typingIndicator: {
    alignItems: 'flex-start',
    marginVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  typingText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
  },
  inputArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  inputBackground: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  inputContainer: {
    overflow: 'hidden',
    minHeight: 50,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickActionsButton: {
    padding: 10,
    marginRight: 5,
  },
  iconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButton: {
    padding: 10,
    marginRight: 5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontWeight: '500',
  },
  sendButton: {
    padding: 5,
    marginLeft: 5,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  quickActionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  quickActionsContainer: {
    margin: 20,
    marginBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  quickActionsContent: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  confirmationContainer: {
    marginTop: 10,
  },
  confirmationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  confirmationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  primaryButton: {
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
    borderColor: 'rgba(102, 126, 234, 0.5)',
  },
  destructiveButton: {
    backgroundColor: 'rgba(255, 69, 58, 0.3)',
    borderColor: 'rgba(255, 69, 58, 0.5)',
  },
  confirmationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButtonText: {
    color: '#667eea',
    fontWeight: '600',
  },
  respondingAgentsContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  respondingAgentsTitle: {
    fontSize: 12,
    color: '#8892b0',
    marginBottom: 5,
    fontWeight: '600',
  },
  respondingAgentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  agentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
    marginBottom: 5,
  },
  agentEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  agentName: {
    fontSize: 11,
    color: '#a8b2d1',
    fontWeight: '500',
  },
  agentConfidence: {
    fontSize: 10,
    color: '#667eea',
    marginLeft: 4,
  },
  multiAgentToggle: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    backgroundColor: 'rgba(30, 30, 46, 0.95)',
    borderRadius: 20,
    padding: 8,
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#764ba2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  optionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  destructiveOption: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  destructiveText: {
    color: '#ff4444',
  },
  editContainer: {
    flex: 1,
  },
  editInput: {
    color: 'white',
    fontSize: 16,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editButton: {
    padding: 5,
  },
  agentSelectionContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    maxWidth: width * 0.9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  agentSelectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  agentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  agentCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  agentCardName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  agentSelectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  agentCardSelected: {
    borderColor: '#667eea',
    borderWidth: 2,
    backgroundColor: 'rgba(102,126,234,0.1)',
  },
  agentCardNameSelected: {
    color: '#667eea',
  },
  selectedCheckmark: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSelectionButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    alignSelf: 'center' as const,
  },
  clearSelectionText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  actionButtonsScroll: {
    flexGrow: 0,
  },
  actionButton: {
    marginRight: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SimpleMessagesScreen;