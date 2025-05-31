import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { GlassButton } from '@/components/glass/GlassButton';
import aiCoachService, { COACH_PERSONALITIES } from '@/services/aiCoachService';
import { CoachingMessage, CoachPersonality } from '@/types/models';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HapticFeedback from 'react-native-haptic-feedback';

interface MessageBubble {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
}

export const MessagesScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<MessageBubble[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const coachPersonality = user?.preferredCoachId || CoachPersonality.EMMA;
  const coachConfig = COACH_PERSONALITIES[coachPersonality];

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    setIsLoading(true);
    
    try {
      // Start new session
      const sessionResponse = await aiCoachService.startNewSession(coachPersonality);
      if (sessionResponse.success && sessionResponse.data) {
        setSessionId(sessionResponse.data.sessionId);
      }

      // Load chat history
      const historyResponse = await aiCoachService.getCoachingHistory();
      if (historyResponse.success && historyResponse.data) {
        const messageBubbles = historyResponse.data.map((msg) => ({
          id: msg.id,
          text: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(messageBubbles);
      }

      // Add greeting if no messages
      if (messages.length === 0) {
        const greeting = aiCoachService.getCoachGreeting(coachPersonality);
        addMessage(greeting, false);
      }
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: MessageBubble = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, newMessage]);
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    HapticFeedback.trigger('impactLight');

    // Add user message
    addMessage(userMessage, true);

    // Show typing indicator
    setIsTyping(true);
    const typingMessage: MessageBubble = {
      id: 'typing',
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true,
    };
    setMessages((prev) => [...prev, typingMessage]);

    try {
      // Send to AI coach
      const response = await aiCoachService.sendMessage(
        userMessage,
        coachPersonality,
        sessionId || undefined,
      );

      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => msg.id !== 'typing'));
      setIsTyping(false);

      if (response.success && response.data) {
        addMessage(response.data.message, false);

        // Handle workout suggestions
        if (response.data.workoutSuggestion) {
          // TODO: Handle workout suggestion
        }
      } else {
        addMessage("I'm having trouble understanding. Could you try again?", false);
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== 'typing'));
      setIsTyping(false);
      addMessage("Sorry, I'm having connection issues. Please try again.", false);
    }
  };

  const renderMessage = ({ item }: { item: MessageBubble }) => {
    if (item.isTyping) {
      return (
        <View style={[styles.messageBubble, styles.aiMessage]}>
          <View style={styles.typingIndicator}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.typingText, { color: theme.colors.textSecondary }]}>
              {coachConfig.name} is typing...
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.messageContainer,
          item.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
        ]}
      >
        {!item.isUser && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{coachConfig.avatar}</Text>
          </View>
        )}
        <GlassContainer
          style={[
            styles.messageBubble,
            item.isUser ? styles.userMessage : styles.aiMessage,
          ]}
          gradientColors={
            item.isUser
              ? [theme.colors.primary + '20', theme.colors.primary + '10']
              : [theme.colors.glass, theme.colors.glassLight]
          }
        >
          <Text
            style={[
              styles.messageText,
              { color: item.isUser ? theme.colors.primary : theme.colors.text },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: theme.colors.textSecondary },
            ]}
          >
            {moment(item.timestamp).format('h:mm A')}
          </Text>
        </GlassContainer>
      </View>
    );
  };

  const quickActions = [
    { id: '1', text: "What's my workout today?", icon: 'calendar-today' },
    { id: '2', text: 'I need motivation!', icon: 'fire' },
    { id: '3', text: 'Suggest a quick workout', icon: 'timer' },
    { id: '4', text: 'Track my progress', icon: 'chart-line' },
  ];

  const handleQuickAction = (text: string) => {
    setInputText(text);
    handleSend();
  };

  return (
    <LinearGradient
      colors={theme.colors.background === '#FFFFFF' 
        ? ['#F9FAFB', '#F3F4F6']
        : ['#0F172A', '#1E293B']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.coachInfo}>
            <Text style={styles.coachAvatar}>{coachConfig.avatar}</Text>
            <View>
              <Text style={[styles.coachName, { color: theme.colors.text }]}>
                {coachConfig.name}
              </Text>
              <Text style={[styles.coachStatus, { color: theme.colors.success }]}>
                • Online
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.infoButton}>
            <Icon name="information-outline" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />

          {messages.length === 1 && (
            <View style={styles.quickActionsContainer}>
              <Text style={[styles.quickActionsTitle, { color: theme.colors.textSecondary }]}>
                Quick Actions
              </Text>
              <View style={styles.quickActions}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.quickActionButton}
                    onPress={() => handleQuickAction(action.text)}
                  >
                    <GlassContainer style={styles.quickActionContent}>
                      <Icon name={action.icon} size={20} color={theme.colors.primary} />
                      <Text style={[styles.quickActionText, { color: theme.colors.text }]}>
                        {action.text}
                      </Text>
                    </GlassContainer>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <GlassContainer style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                placeholder="Type your message..."
                placeholderTextColor={theme.colors.textSecondary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isTyping) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isTyping}
              >
                <Icon
                  name="send"
                  size={24}
                  color={inputText.trim() && !isTyping ? theme.colors.primary : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </GlassContainer>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    fontSize: 36,
    marginRight: 12,
  },
  coachName: {
    fontSize: 18,
    fontWeight: '600',
  },
  coachStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  infoButton: {
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    marginRight: 8,
    marginBottom: 4,
  },
  avatar: {
    fontSize: 24,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    marginLeft: 'auto',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  quickActionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickActionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickActionText: {
    fontSize: 14,
    marginLeft: 8,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});