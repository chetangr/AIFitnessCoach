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
  Keyboard,
  Pressable,
  Dimensions,
  Clipboard,
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
  suggestedWorkout?: any; // Store suggested workout modifications
  canApplyModifications?: boolean;
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
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{ message: Message; index: number } | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedPersonality = isQuantumMode ? 'dr_progress' : (isTurboMode ? 'max' : 'emma');

  const personalities = {
    'max': { emoji: '💪', color: '#FF6B6B', name: 'Iron Max' },
    'emma': { emoji: '🧘', color: '#4ECDC4', name: 'Harmony Emma' },
    'dr_progress': { emoji: '⚡', color: '#4DA2FF', name: 'Dr. Progress' },
  };

  const currentPersonality = personalities[selectedPersonality as keyof typeof personalities] || personalities.emma;

  const parseWorkoutFromText = (text: string) => {
    // Parse workout modifications from AI text
    const exercises = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      // Look for various exercise patterns:
      // Pattern 1: "1. **Exercise Name:** 3 sets of 10-12 reps"
      // Pattern 2: "1. Exercise Name: 3 sets of 10-12 reps"
      // Pattern 3: "**Exercise Name:** 3 sets of 10-12 reps"
      // Pattern 4: "- Exercise Name: 3 sets of 10-12 reps"
      let exerciseMatch = line.match(/\d+\.\s*\*?\*?([^:*]+?)(?:\s*\([^)]+\))?\*?\*?:\*?\*?\s*(\d+)\s*sets?\s*of\s*(\d+(?:-\d+)?)\s*reps?/i);
      
      // If first pattern doesn't match, try without number prefix
      if (!exerciseMatch) {
        exerciseMatch = line.match(/\*?\*?([^:*]+?)(?:\s*\([^)]+\))?\*?\*?:\*?\*?\s*(\d+)\s*sets?\s*of\s*(\d+(?:-\d+)?)\s*reps?/i);
      }
      
      // Try pattern with dash
      if (!exerciseMatch) {
        exerciseMatch = line.match(/[-•]\s*([^:]+?):\s*(\d+)\s*sets?\s*of\s*(\d+(?:-\d+)?)\s*reps?/i);
      }
      
      if (exerciseMatch) {
        const exerciseName = exerciseMatch[1].trim().replace(/\*+/g, ''); // Remove any remaining asterisks
        exercises.push({
          id: `ex_${Date.now()}_${exercises.length}`,
          name: exerciseName,
          sets: parseInt(exerciseMatch[2]),
          reps: exerciseMatch[3],
          muscleGroups: [], // Will be filled based on exercise type
          category: 'strength' as any,
          difficulty: 'intermediate' as any
        });
      }
    }
    
    console.log('Parsed exercises:', exercises);
    return exercises;
  };

  const applyWorkoutModifications = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.text) return;
    
    console.log('Applying workout modifications from message:', messageId);
    
    try {
      // Parse exercises from the AI's text
      const modifiedExercises = parseWorkoutFromText(message.text);
      
      if (modifiedExercises.length === 0) {
        Alert.alert('Error', 'Could not parse workout modifications from the message.');
        return;
      }
      
      console.log('Parsed exercises:', modifiedExercises);
      
      // Get today's workout
      const today = new Date();
      const currentWorkout = await workoutScheduleService.getWorkoutForDate(today);
      
      if (!currentWorkout) {
        Alert.alert('Error', 'No workout scheduled for today.');
        return;
      }
      
      // Update the workout - ensure date is included
      const updatedWorkout = {
        ...currentWorkout,
        date: today, // Make sure date is included
        exercises: modifiedExercises,
        modifiedAt: new Date(),
        notes: `Modified by AI Coach for injury/pain accommodation on ${new Date().toLocaleDateString()}`
      };
      
      console.log('Saving updated workout:', updatedWorkout);
      await workoutScheduleService.saveWorkout(updatedWorkout);
      
      Alert.alert(
        'Success!',
        'Your workout has been updated in the Timeline. The modifications have been applied to accommodate your needs.',
        [{ text: 'Great!' }]
      );
      
      // Update the message to show it's been applied
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, canApplyModifications: false }
          : msg
      ));
      
    } catch (error) {
      console.error('Error applying workout modifications:', error);
      Alert.alert('Error', 'Failed to apply workout modifications. Please try again.');
    }
  };

  const processActionItems = async (actionItems: any[]) => {
    console.log('=== PROCESSING ACTION ITEMS ===');
    
    for (const action of actionItems) {
      console.log('Processing action:', action);
      
      try {
        if (action.type === 'update_workout' || action.type === 'modify_workout') {
          // Get today's date
          const today = new Date();
          
          // Update the workout with modified exercises
          if (action.data && action.data.exercises) {
            console.log('Updating workout with modified exercises:', action.data.exercises);
            
            // Get the current workout
            const currentWorkout = await workoutScheduleService.getWorkoutForDate(today);
            
            if (currentWorkout) {
              // Update the workout with new exercises
              const updatedWorkout = {
                ...currentWorkout,
                exercises: action.data.exercises,
                modifiedAt: new Date(),
                notes: `Modified for neck pain by AI Coach on ${new Date().toLocaleDateString()}`
              };
              
              // Save the updated workout
              await workoutScheduleService.saveWorkout(updatedWorkout);
              
              console.log('Workout updated successfully');
              
              // Show success message
              Alert.alert(
                'Workout Updated',
                'Your workout has been modified to accommodate your neck pain. Check your Timeline to see the changes.',
                [{ text: 'OK' }]
              );
            }
          }
        } else if (action.type === 'add_note') {
          // Handle adding notes to workout
          console.log('Adding note to workout:', action.data);
        }
        
      } catch (error) {
        console.error('Error processing action item:', error);
      }
    }
    
    console.log('=== ACTION ITEMS PROCESSED ===');
  };

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
      // Check if user is requesting workout modifications
      const isRequestingModification = 
        inputText.toLowerCase().includes('pain') ||
        inputText.toLowerCase().includes('hurt') ||
        inputText.toLowerCase().includes('injury') ||
        inputText.toLowerCase().includes('modify') ||
        inputText.toLowerCase().includes('change') ||
        inputText.toLowerCase().includes('alternative') ||
        (inputText.toLowerCase() === 'yes' && messages.length > 0 && 
         messages[messages.length - 1].text.toLowerCase().includes('modify'));

      // Build context with conversation history
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
        } : null,
        conversationHistory: messages.slice(-10).map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
          timestamp: msg.timestamp
        })),
        requestingWorkoutModification: isRequestingModification,
        generateActionItems: isRequestingModification
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
        // Check if the response contains workout modifications
        const hasWorkoutModifications = 
          response.response.includes('modified version') ||
          response.response.includes('Here\'s a modified') ||
          response.response.includes('customize your') ||
          response.response.includes('Shoulder-Friendly') ||
          response.response.includes('modifications') ||
          (response.response.includes('sets') && response.response.includes('reps'));

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response || 'I understand. Let me help you with that.',
          isUser: false,
          timestamp: new Date(),
          canApplyModifications: hasWorkoutModifications && !response.action_items?.length
        };
        console.log('AI Response Text:', aiMessage.text);
        console.log('Has workout modifications:', hasWorkoutModifications);
        setMessages(prev => [...prev, aiMessage]);
        
        // Process action items if present
        if (response.action_items && response.action_items.length > 0) {
          console.log('Processing action items:', response.action_items);
          await processActionItems(response.action_items);
        }
        
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

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const copyToClipboard = (text: string) => {
    try {
      Clipboard.setString(text);
      Alert.alert('Copied', 'Message copied to clipboard');
    } catch (error) {
      console.error('Failed to copy text:', error);
      Alert.alert('Error', 'Failed to copy message');
    }
  };

  const regenerateResponse = async (messageIndex: number) => {
    // Find the last user message before this AI message
    let lastUserMessage = '';
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].isUser) {
        lastUserMessage = messages[i].text;
        break;
      }
    }

    if (!lastUserMessage) {
      Alert.alert('Error', 'Could not find the original question to regenerate response');
      return;
    }

    // Remove the current AI response
    const newMessages = messages.filter((_, index) => index !== messageIndex);
    setMessages(newMessages);

    // Temporarily store the input and trigger a new response
    const tempInput = inputText;
    setInputText(lastUserMessage);
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      sendMessage();
      setInputText(tempInput);
    }, 100);
  };

  const deleteMessage = (messageIndex: number) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const newMessages = messages.filter((_, index) => index !== messageIndex);
            setMessages(newMessages);
          }
        }
      ]
    );
  };

  const handleMessageLongPress = (event: any, message: Message, messageIndex: number) => {
    // Prevent keyboard from dismissing
    event.preventDefault();
    event.stopPropagation();
    
    const { pageX, pageY } = event.nativeEvent;
    setMenuPosition({ x: pageX, y: pageY });
    setSelectedMessage({ message, index: messageIndex });
    setActionSheetVisible(true);
  };

  const handleActionPress = (action: string) => {
    if (!selectedMessage) return;

    const { message, index } = selectedMessage;

    switch (action) {
      case 'copy':
        copyToClipboard(message.text);
        break;
      case 'delete':
        deleteMessage(index);
        break;
      case 'regenerate':
        regenerateResponse(index);
        break;
    }

    setActionSheetVisible(false);
    setSelectedMessage(null);
  };

  const renderActionSheet = () => {
    if (!selectedMessage || !actionSheetVisible) return null;

    const { message } = selectedMessage;
    const actions = message.isUser
      ? [
          { id: 'copy', label: 'Copy', icon: 'copy-outline' },
          { id: 'delete', label: 'Delete', icon: 'trash-outline', destructive: true },
        ]
      : [
          { id: 'regenerate', label: 'Regenerate', icon: 'refresh-outline' },
          { id: 'copy', label: 'Copy', icon: 'copy-outline' },
        ];

    // Calculate menu position
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const menuWidth = 200;
    const menuHeight = actions.length * 44 + 16;
    
    let menuX = menuPosition.x - menuWidth / 2;
    let menuY = menuPosition.y - menuHeight - 10;
    
    // Ensure menu stays within screen bounds
    if (menuX < 10) menuX = 10;
    if (menuX + menuWidth > screenWidth - 10) menuX = screenWidth - menuWidth - 10;
    
    // Check if menu would be too high or too low
    const safeAreaTop = 50;
    const safeAreaBottom = screenHeight - keyboardHeight - 100;
    
    if (menuY < safeAreaTop) {
      menuY = menuPosition.y + 10; // Show below the touch point
    }
    if (menuY + menuHeight > safeAreaBottom) {
      menuY = menuPosition.y - menuHeight - 10; // Show above the touch point
    }

    return (
      <>
        <Pressable 
          style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
          onPress={() => setActionSheetVisible(false)}
          pointerEvents="auto"
        />
        <View 
          style={[
            styles.contextMenu,
            {
              position: 'absolute',
              left: menuX,
              top: menuY,
            }
          ]}
          pointerEvents="auto"
        >
          {actions.map((action, index) => (
            <TouchableOpacity
              key={action.id}
              style={[
                styles.contextMenuItem,
                index === actions.length - 1 && styles.contextMenuItemLast
              ]}
              onPress={() => handleActionPress(action.id)}
            >
              <Ionicons 
                name={action.icon as any} 
                size={20} 
                color={action.destructive ? theme.colors.error : theme.colors.textPrimary} 
              />
              <Text style={[
                styles.contextMenuText,
                action.destructive && styles.contextMenuTextDestructive
              ]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

  const renderMessage = (message: Message, index: number) => (
    <View key={message.id}>
      <Pressable
        onLongPress={(event) => handleMessageLongPress(event, message, index)}
        delayLongPress={500}
        style={({ pressed }) => [
          styles.messageContainer,
          message.isUser ? styles.userMessageContainer : styles.aiMessageContainer,
          pressed && { opacity: 0.8 }
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
      </Pressable>
      
      {/* Apply Modifications Button */}
      {!message.isUser && message.canApplyModifications && (
        <TouchableOpacity
          style={styles.applyButton}
          onPress={() => applyWorkoutModifications(message.id)}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.applyButtonText}>Apply to Timeline</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const styles = React.useMemo(() => StyleSheet.create({
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
    keyboardAvoidingContainer: {
      flex: 1,
      marginBottom: 83,
    },
    messagesScrollView: {
      flex: 1,
    },
    messagesContent: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.md,
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
      paddingBottom: theme.spacing.sm,
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
    applyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.success,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      marginLeft: 40 + theme.spacing.sm,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.sm,
      alignSelf: 'flex-start',
    },
    applyButtonText: {
      ...theme.typography.footnote,
      color: '#FFFFFF',
      fontWeight: '600' as '600',
      marginLeft: theme.spacing.xs,
    },
    modalOverlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    },
    contextMenu: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
      minWidth: 200,
      paddingVertical: theme.spacing.xs,
      zIndex: 1001,
    },
    contextMenuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border + '20',
    },
    contextMenuItemLast: {
      borderBottomWidth: 0,
    },
    contextMenuText: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      marginLeft: theme.spacing.sm,
      flex: 1,
    },
    contextMenuTextDestructive: {
      color: theme.colors.error,
    },
  }), [theme]);

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
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        pointerEvents="box-none"
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesScrollView}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          {messages.map((message, index) => renderMessage(message, index))}
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
      
      {/* Action sheet overlay - rendered inside SafeAreaView to not dismiss keyboard */}
      {actionSheetVisible && renderActionSheet()}
    </SafeAreaView>
  );
};

export default ModernMessagesScreen;