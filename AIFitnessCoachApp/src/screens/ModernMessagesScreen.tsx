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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { ModernHeader } from '../components/modern/ModernComponents';
import { useAISettingsStore } from '../store/aiSettingsStore';
import { backendAgentService } from '../services/backendAgentService';
import { useAuthStore } from '../store/authStore';
import { workoutScheduleService } from '../services/workoutScheduleService';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ModernMessagesScreen = () => {
  const { theme } = useTheme();
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

    console.log('=== AI COACH MESSAGE FLOW START ===');
    console.log('User Input:', inputText);
    console.log('Selected Personality:', selectedPersonality);
    console.log('Modes:', { isQuantumMode, isTurboMode });

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
      // Get today's workout for context
      console.log('Fetching today\'s workout...');
      const todaysWorkout = await workoutScheduleService.getWorkoutForDate(new Date());
      console.log('Today\'s Workout:', todaysWorkout ? {
        title: todaysWorkout.title,
        type: todaysWorkout.type,
        exerciseCount: todaysWorkout.exercises.length
      } : 'No workout scheduled');
      // Build context
      const context = { 
        user: {
          id: user?.id || 1,
          name: user?.name || 'User',
          fitness_goals: 'General fitness',
          current_weight: 70,
          height: 170,
          age: 25,
          gender: 'other'
        },
        mode: isQuantumMode ? 'quantum' : (isTurboMode ? 'turbo' : 'standard'),
        todaysWorkout: todaysWorkout ? {
          title: todaysWorkout.title,
          type: todaysWorkout.type,
          exercises: todaysWorkout.exercises.map(e => ({
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            muscleGroups: e.muscleGroups
          })),
          duration: todaysWorkout.duration,
          difficulty: todaysWorkout.difficulty
        } : null
      };

      console.log('Context being sent:', JSON.stringify(context, null, 2));
      console.log('Calling multi-agent endpoint...');

      // Try multi-agent endpoint which might handle context better
      const response = await backendAgentService.sendMultiAgentMessage(
        inputText.trim(),
        selectedPersonality as 'emma' | 'max' | 'dr_progress',
        context,
        undefined, // required agents
        { singleAgentMode: true, fastMode: isTurboMode }
      );

      console.log('Multi-agent response received:', response);

      if (response.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response || 'I understand. Let me help you with that.',
          isUser: false,
          timestamp: new Date(),
        };
        console.log('AI Response Text:', aiMessage.text);
        setMessages(prev => [...prev, aiMessage]);
        console.log('=== AI COACH MESSAGE FLOW END (SUCCESS) ===');
      } else {
        console.log('No response text in multi-agent response');
      }
    } catch (error: any) {
      console.error('Multi-agent endpoint error:', error);
      console.log('Error details:', {
        message: error?.message || 'Unknown error',
        response: error?.response?.data,
        status: error?.response?.status
      });
      
      // Fallback to simple endpoint without context
      console.log('Trying fallback to simple endpoint...');
      try {
        const simpleResponse = await backendAgentService.sendMessage(
          inputText.trim(),
          selectedPersonality as 'emma' | 'max' | 'dr_progress'
        );
        
        console.log('Simple endpoint response:', simpleResponse);
        
        if (simpleResponse.text) {
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: simpleResponse.text,
            isUser: false,
            timestamp: new Date(),
          };
          console.log('Fallback AI Response Text:', aiMessage.text);
          setMessages(prev => [...prev, aiMessage]);
          console.log('=== AI COACH MESSAGE FLOW END (FALLBACK SUCCESS) ===');
        } else {
          console.log('No text in simple response');
        }
      } catch (fallbackError: any) {
        console.error('Fallback also failed:', fallbackError);
        console.log('Fallback error details:', {
          message: fallbackError?.message || 'Unknown error',
          response: fallbackError?.response?.data,
          status: fallbackError?.response?.status
        });
        
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting right now. Please try again.",
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        console.log('=== AI COACH MESSAGE FLOW END (COMPLETE FAILURE) ===');
      }
    } finally {
      setIsTyping(false);
      console.log('Message processing complete');
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleMessageLongPress = (message: Message) => {
    if (message.isUser) {
      // User message options: Edit, Copy, Delete
      Alert.alert(
        'Message Options',
        '',
        [
          { text: 'Edit', onPress: () => console.log('Edit not implemented yet') },
          { text: 'Copy', onPress: () => console.log('Copy not implemented yet') },
          { text: 'Delete', onPress: () => console.log('Delete not implemented yet') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      // AI message options: Regenerate, Copy
      Alert.alert(
        'Message Options',
        '',
        [
          { text: 'Regenerate Response', onPress: () => console.log('Regenerate not implemented yet') },
          { text: 'Copy', onPress: () => console.log('Copy not implemented yet') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const renderMessage = (message: Message) => (
    <TouchableOpacity
      key={message.id}
      onLongPress={() => handleMessageLongPress(message)}
      activeOpacity={0.8}
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
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    personalityBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.sm,
    },
    personalityEmoji: {
      fontSize: 16,
      marginRight: 4,
    },
    personalityName: {
      ...theme.typography.caption1,
      color: theme.colors.primary,
      fontWeight: '600' as '600',
    },
    chatContainer: {
      flex: 1,
    },
    messagesScrollView: {
      flex: 1,
    },
    messagesContent: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    messageContainer: {
      marginVertical: theme.spacing.xs,
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
      marginRight: theme.spacing.sm,
    },
    avatarEmoji: {
      fontSize: 18,
    },
    messageBubble: {
      maxWidth: '80%',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    userBubble: {
      backgroundColor: theme.colors.primary,
    },
    aiBubble: {
      backgroundColor: theme.colors.surface,
    },
    messageText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    userMessageText: {
      color: '#FFFFFF',
    },
    timestamp: {
      ...theme.typography.caption2,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 40,
      marginVertical: theme.spacing.sm,
    },
    typingText: {
      ...theme.typography.footnote,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    inputContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: Platform.OS === 'ios' ? 90 : 80,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    attachButton: {
      padding: theme.spacing.sm,
    },
    textInput: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      maxHeight: 100
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.spacing.xs,
    },
    sendButtonDisabled: {
      backgroundColor: theme.colors.surface,
    },
  });

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
              <Ionicons name="camera-outline" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Ask your AI coach..."
              placeholderTextColor={theme.colors.textTertiary}
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
                color={inputText.trim() ? '#FFFFFF' : theme.colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ModernMessagesScreen;