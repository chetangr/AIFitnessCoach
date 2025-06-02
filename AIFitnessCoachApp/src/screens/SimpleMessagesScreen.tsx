import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  Animated,
  Modal,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { openaiService } from '../services/openaiService';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string;
}

const SimpleMessagesScreen = ({ route }: any) => {
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
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation values
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const quickActionsSlide = useRef(new Animated.Value(0)).current;
  const messageSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('AI Coach Chat Opened');
    // Load previous conversation
    openaiService.loadConversation();
    
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
      console.log('User Message Sent', { message: textToSend, hasImage: !!imageUri });
      
      const response = await openaiService.sendMessageSimple(textToSend, imageUri);
      
      console.log('AI Response Received', { response });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: typeof response === 'string' ? response : 'No response received',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      
      // Scroll to bottom after AI response
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      await sendMessage('Can you analyze this image?', result.assets[0].uri);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
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
            <Text style={[styles.messageText, isUser && styles.userMessageText]}>
              {item.text}
            </Text>
            <Text style={styles.timestamp}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </BlurView>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      {/* Enhanced Header with Glow Effect */}
      <LinearGradient
        colors={['rgba(102, 126, 234, 0.1)', 'transparent']}
        style={styles.compactHeader}
      >
        <View style={styles.headerContent}>
          <Icon name="flash" size={24} color="#f093fb" />
          <Text style={styles.compactTitle}>AI Coach</Text>
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
          </View>
        </View>
      </LinearGradient>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={[
          styles.chatContent,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 80 : (Platform.OS === 'ios' ? 180 : 170) }
        ]}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
      {messages.map((message, index) => (
        <Animated.View 
          key={message.id}
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
          {renderMessage({ item: message })}
        </Animated.View>
      ))}
      
      {isTyping && (
        <Animated.View style={styles.typingIndicator}>
          <BlurView intensity={40} tint="dark" style={styles.typingBubble}>
            <ActivityIndicator size="small" color="#667eea" />
            <Text style={styles.typingText}>AI Coach is typing...</Text>
          </BlurView>
        </Animated.View>
      )}
      </ScrollView>

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
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
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
});

export default SimpleMessagesScreen;