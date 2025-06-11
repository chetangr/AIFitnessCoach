import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { modernTheme } from '../config/modernTheme';
import { ModernHeader } from '../components/modern/ModernComponents';
import { useAISettingsStore } from '../store/aiSettingsStore';
import { backendAgentService } from '../services/backendAgentService';
import { useAuthStore } from '../store/authStore';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ModernMessagesScreen = () => {
  const { user } = useAuthStore();
  const { isQuantumMode, isTurboMode } = useAISettingsStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI fitness coach. I'm here to help you reach your fitness goals. What would you like to work on today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedPersonality = isQuantumMode ? 'dr_progress' : (isTurboMode ? 'max' : 'emma');

  const personalities = {
    'max': { emoji: '💪', color: '#FF6B6B', name: 'Iron Max' },
    'emma': { emoji: '🧘', color: '#4ECDC4', name: 'Harmony Emma' },
    'dr_progress': { emoji: '⚡', color: '#4DA2FF', name: 'Dr. Progress' },
  };

  const currentPersonality = personalities[selectedPersonality as keyof typeof personalities] || personalities.emma;

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Try multi-agent endpoint which might handle context better
      const response = await backendAgentService.sendMultiAgentMessage(
        inputText.trim(),
        selectedPersonality as 'emma' | 'max' | 'dr_progress',
        { 
          user: {
            id: user?.id || 1,
            name: user?.name || 'User',
            fitness_goals: 'General fitness',
            current_weight: 70,
            height: 170,
            age: 25,
            gender: 'other'
          },
          mode: isQuantumMode ? 'quantum' : (isTurboMode ? 'turbo' : 'standard')
        },
        undefined, // required agents
        { singleAgentMode: true, fastMode: isTurboMode }
      );

      if (response.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response || 'I understand. Let me help you with that.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback to simple endpoint without context
      try {
        const simpleResponse = await backendAgentService.sendMessage(
          inputText.trim(),
          selectedPersonality as 'emma' | 'max' | 'dr_progress'
        );
        
        if (simpleResponse.text) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: simpleResponse.text,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting right now. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      ]}
    >
      {!message.isUser && (
        <View style={[styles.avatar, { backgroundColor: currentPersonality.color + '20' }]}>
          <Text style={styles.avatarEmoji}>{currentPersonality.emoji}</Text>
        </View>
      )}
      <View
        style={[
          styles.messageBubble,
          message.isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, message.isUser && styles.userMessageText]}>
          {message.text}
        </Text>
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ModernHeader
        title="AI Coach"
        rightAction={
          <View style={styles.personalityBadge}>
            <Text style={styles.personalityEmoji}>{currentPersonality.emoji}</Text>
            <Text style={styles.personalityName}>{currentPersonality.name}</Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScrollView}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>AI Coach is typing...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="camera-outline" size={24} color={modernTheme.colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Ask your AI coach..."
              placeholderTextColor={modernTheme.colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons
                name="send"
                size={20}
                color={inputText.trim() ? '#FFFFFF' : modernTheme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: modernTheme.colors.background,
  },
  personalityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: modernTheme.colors.surface,
    paddingHorizontal: modernTheme.spacing.sm,
    paddingVertical: 4,
    borderRadius: modernTheme.borderRadius.sm,
  },
  personalityEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  personalityName: {
    ...modernTheme.typography.caption1,
    color: modernTheme.colors.primary,
    fontWeight: '600' as '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesScrollView: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingBottom: modernTheme.spacing.md,
  },
  messageContainer: {
    marginVertical: modernTheme.spacing.xs,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  aiMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: modernTheme.spacing.sm,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: modernTheme.spacing.sm,
    paddingHorizontal: modernTheme.spacing.md,
    borderRadius: modernTheme.borderRadius.lg,
  },
  userBubble: {
    backgroundColor: modernTheme.colors.primary,
  },
  aiBubble: {
    backgroundColor: modernTheme.colors.surface,
  },
  messageText: {
    ...modernTheme.typography.body,
    color: modernTheme.colors.textPrimary,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  timestamp: {
    ...modernTheme.typography.caption2,
    color: modernTheme.colors.textTertiary,
    marginTop: modernTheme.spacing.xs,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 40,
    marginVertical: modernTheme.spacing.sm,
  },
  typingText: {
    ...modernTheme.typography.footnote,
    color: modernTheme.colors.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    paddingHorizontal: modernTheme.spacing.md,
    paddingTop: modernTheme.spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? 90 : 80,
    backgroundColor: modernTheme.colors.background,
    borderTopWidth: 1,
    borderTopColor: modernTheme.colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: modernTheme.colors.surface,
    borderRadius: modernTheme.borderRadius.xl,
    paddingHorizontal: modernTheme.spacing.sm,
    paddingVertical: modernTheme.spacing.xs,
  },
  attachButton: {
    padding: modernTheme.spacing.sm,
  },
  textInput: {
    flex: 1,
    ...modernTheme.typography.body,
    color: modernTheme.colors.textPrimary,
    paddingHorizontal: modernTheme.spacing.sm,
    paddingVertical: modernTheme.spacing.sm,
    maxHeight: 100
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: modernTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: modernTheme.spacing.xs,
  },
  sendButtonDisabled: {
    backgroundColor: modernTheme.colors.surface,
  },
});

export default ModernMessagesScreen;