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
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backendAgentService } from '../services/backendAgentService';
import { workoutScheduleService } from '../services/workoutScheduleService';
import { workoutActionService } from '../services/workoutActionService';
import { aiCoachService } from '../services/aiCoachService';
import measurementsService from '../services/measurementsService';
import { workoutTrackingService } from '../services/workoutTrackingService';
import { SAFE_BOTTOM_PADDING } from '../constants/layout';
import { useAISettingsStore } from '../store/aiSettingsStore';
import { useThemeStore } from '../store/themeStore';
import { LiquidGlassView, LiquidButton, LiquidCard, LiquidInput } from '../components/glass';

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

const LiquidMessagesScreen = ({ route }: any) => {
  const { theme } = useThemeStore();
  const { actionMode, isTurboMode, isQuantumMode } = useAISettingsStore();
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
  const [useMultiAgent, setUseMultiAgent] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showMessageOptions, setShowMessageOptions] = useState(false);
  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  const [selectedAgentsForChat, setSelectedAgentsForChat] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const quickActionsSlide = useRef(new Animated.Value(0)).current;
  const messageSlide = useRef(new Animated.Value(0)).current;
  const headerAnimation = useRef(new Animated.Value(0)).current;
  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    console.log('AI Coach Chat Opened');
    
    // Animate messages in
    Animated.timing(messageSlide, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Handle auto-message from route params
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

  // Comprehensive context gathering function
  const gatherUserContext = async () => {
    try {
      const today = new Date();
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Gather all user data in parallel for performance
      const [
        todayWorkouts,
        weekWorkouts,
        recentMeasurements,
        workoutStats,
        progressMetrics,
        userProfile,
        activeFasting
      ] = await Promise.all([
        workoutScheduleService.getWorkoutForDate(today).catch(() => null),
        workoutScheduleService.getWorkoutsForDateRange(oneWeekAgo, today).catch(() => null),
        measurementsService.getLatestMeasurement().catch(() => {
          console.log('Measurements API not available for demo user');
          return null;
        }),
        workoutScheduleService.getWorkoutStats(oneMonthAgo, today).catch(() => null),
        workoutTrackingService.getProgressMetrics().catch(() => null),
        AsyncStorage.getItem('userProfile').then(data => data ? JSON.parse(data) : null).catch(() => null),
        measurementsService.getCurrentFasting().catch(() => {
          console.log('Fasting API not available for demo user');
          return null;
        })
      ]);

      const weeklyCaloriesBurned = weekWorkouts?.reduce((total: number, workout: any) => 
        total + (workout.completed ? workout.calories : 0), 0) || 0;

      const personalRecords = progressMetrics?.exerciseProgress?.map((ep: any) => ({
        exercise: ep.exerciseName,
        maxWeight: ep.personalRecords.maxWeight,
        maxReps: ep.personalRecords.maxReps
      })) || [];

      return {
        date: today.toISOString(),
        day_of_week: today.toLocaleDateString('en-US', { weekday: 'long' }),
        
        user_profile: {
          name: userProfile?.name || 'User',
          age: userProfile?.age,
          gender: userProfile?.gender,
          fitness_level: userProfile?.fitnessLevel || 'intermediate',
          goals: userProfile?.goals || ['general fitness'],
          height: userProfile?.height,
          injuries: userProfile?.injuries || []
        },
        
        scheduled_workouts: todayWorkouts,
        is_rest_day: (!todayWorkouts || todayWorkouts.type === 'rest' || todayWorkouts.exercises?.length === 0) ? 'yes' : 'no',
        workout_type: todayWorkouts?.type || 'rest',
        
        weekly_stats: {
          workouts_completed: weekWorkouts?.filter((w: any) => w.completed).length || 0,
          total_workouts: weekWorkouts?.length || 0,
          calories_burned: weeklyCaloriesBurned,
          workout_streak: workoutStats?.completedWorkouts || 0,
          completion_rate: workoutStats?.completionRate || 0
        },
        
        monthly_stats: workoutStats || {
          totalWorkouts: 0,
          completedWorkouts: 0,
          totalCalories: 0,
          totalDuration: 0,
          averageDuration: 0,
          completionRate: 0
        },
        
        current_measurements: recentMeasurements ? {
          weight: recentMeasurements.weight,
          body_fat: recentMeasurements.body_fat_percentage,
          muscle_mass: recentMeasurements.muscle_mass,
          recorded_at: recentMeasurements.recorded_at
        } : null,
        
        progress_metrics: progressMetrics ? {
          total_workouts: progressMetrics.totalWorkouts,
          strength_gains: progressMetrics.strengthGains,
          consistency_score: progressMetrics.consistencyScore,
          personal_records: personalRecords
        } : null,
        
        active_fasting: activeFasting ? {
          type: activeFasting.fasting_type,
          started_at: activeFasting.started_at,
          planned_duration: activeFasting.planned_duration_hours
        } : null
      };
    } catch (error) {
      console.error('Error gathering user context:', error);
      return null;
    }
  };

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
    Animated.spring(quickActionsSlide, {
      toValue: showQuickActions ? 0 : 1,
      useNativeDriver: true,
    }).start();
  };

  const parseWorkoutActions = (message: string): ActionItem[] => {
    const actions: ActionItem[] = [];
    
    const workoutPatterns = [
      /(\d+)\.\s*\*\*([^*]+)\*\*:/gi,
      /•\s*\*\*([^*]+)\*\*:/gi,
      /[-]\s*\*\*([^*]+)\*\*:/gi,
      /(\d+)\.\s+([A-Z][^:]+):/gi,
      /workout|exercise|sets|reps/gi,
    ];
    
    let hasWorkoutSuggestions = false;
    for (const pattern of workoutPatterns) {
      if (pattern.test(message)) {
        hasWorkoutSuggestions = true;
        break;
      }
    }
    
    const modificationKeywords = /increase.*difficulty|step.*up|advanced.*workout|challenging.*weight|extra.*weight/gi;
    const hasModificationContext = modificationKeywords.test(message);
    
    const nutritionKeywords = /eat|food|diet|nutrition|meal|breakfast|lunch|dinner|snack|protein|carb|calorie|hungry|recipe|cook/gi;
    const hasNutritionContext = nutritionKeywords.test(message);
    
    const painKeywords = /pain|injury|hurt|sore|strain|sprain|discomfort|ache/gi;
    const hasPainContext = painKeywords.test(message);
    
    if (hasNutritionContext) {
      return actions;
    } else if (hasPainContext) {
      actions.push({
        id: `action_${Date.now()}_remove`,
        type: 'remove_workout',
        label: 'Cancel Today\'s Workout',
        icon: 'close-circle',
        color: '#F44336',
        priority: 1,
        action: 'remove_workout'
      });
      
      actions.push({
        id: `action_${Date.now()}_substitute`,
        type: 'substitute_exercises',
        label: 'Get Safe Alternatives',
        icon: 'medkit',
        color: '#FF9800',
        priority: 2,
        action: 'substitute_safe'
      });
      
      actions.push({
        id: `action_${Date.now()}_rest`,
        type: 'schedule_rest',
        label: 'Take Rest Day',
        icon: 'bed',
        color: '#4CAF50',
        priority: 3,
        action: 'schedule_rest'
      });
    } else if (hasWorkoutSuggestions || hasModificationContext) {
      actions.push({
        id: `action_${Date.now()}_add_all`,
        type: 'add_workout',
        label: 'Add All Workouts',
        icon: 'add-circle',
        color: '#4CAF50',
        priority: 1,
        action: 'add_all_workouts'
      });
      
      actions.push({
        id: `action_${Date.now()}_modify`,
        type: 'modify_workout',
        label: 'Replace Today\'s Workout',
        icon: 'swap-horizontal',
        color: '#FF9800',
        priority: 2,
        action: 'modify_workout'
      });
      
      actions.push({
        id: `action_${Date.now()}_schedule`,
        type: 'schedule_workout',
        label: 'Schedule for Later',
        icon: 'calendar',
        color: '#2196F3',
        priority: 3,
        action: 'schedule_workout'
      });
    }
    
    return actions;
  };

  const generateAIResponseActions = (responseText: string): ActionItem[] => {
    const actions: ActionItem[] = [];
    
    if (responseText.toLowerCase().includes('workout') || 
        responseText.toLowerCase().includes('exercise') ||
        responseText.toLowerCase().includes('routine')) {
      
      actions.push({
        id: `action_${Date.now()}_add`,
        type: 'add_workout',
        label: 'Add to Schedule',
        icon: 'add-circle',
        color: '#4CAF50',
        priority: 1,
        action: 'add_workout'
      });
      
      actions.push({
        id: `action_${Date.now()}_view`,
        type: 'view_schedule',
        label: 'View Schedule',
        icon: 'calendar',
        color: '#2196F3',
        priority: 2,
        action: 'view_schedule'
      });
    }
    
    return actions;
  };

  const sendMessage = async (messageText?: string, imageUri?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend && !imageUri) return;

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

    Animated.timing(messageSlide, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      console.log('User Message Sent', { message: textToSend, hasImage: !!imageUri, useMultiAgent });
      
      let response: any;
      let respondingAgents: any[] = [];
      
      const lowerMessage = textToSend.toLowerCase();
      const isNutritionQuery = lowerMessage.includes('nutrition') || 
                              lowerMessage.includes('diet') || 
                              lowerMessage.includes('meal') || 
                              lowerMessage.includes('food') ||
                              lowerMessage.includes('calories') ||
                              lowerMessage.includes('eat');
      const isWorkoutQuery = lowerMessage.includes('workout') || 
                            lowerMessage.includes('exercise') || 
                            lowerMessage.includes('training');
      
      console.log('Backend Service Config:', backendAgentService.getConfig());
      console.log('Is Configured:', backendAgentService.isConfigured());
      
      if (backendAgentService.isConfigured()) {
        if (useMultiAgent) {
          const fullContext = await gatherUserContext();
          console.log('Sending full context to AI:', JSON.stringify(fullContext, null, 2));
          
          let agentsToUse = selectedAgentsForChat.length > 0 ? selectedAgentsForChat : undefined;
          
          if (!agentsToUse || agentsToUse.length === 0) {
            if (textToSend.toLowerCase().includes('stats') || 
                textToSend.toLowerCase().includes('calories burnt') ||
                textToSend.toLowerCase().includes('progress')) {
              agentsToUse = ['fitness_coach', 'goal_achievement'];
              console.log('Auto-selecting fitness coach and goal achievement agents for stats query');
            } 
            else if (isNutritionQuery) {
              agentsToUse = ['nutrition_specialist'];
              console.log('Auto-selecting nutrition specialist for nutrition query');
            }
            else if (textToSend.toLowerCase().includes('recovery') || 
                     textToSend.toLowerCase().includes('pain') ||
                     textToSend.toLowerCase().includes('sore')) {
              agentsToUse = ['recovery_wellness'];
              console.log('Auto-selecting recovery wellness agent');
            }
            else if (isWorkoutQuery) {
              agentsToUse = ['fitness_coach'];
              console.log('Auto-selecting fitness coach for workout query');
            }
          }
          
          console.log('Selected agents:', agentsToUse);
          
          if (isTurboMode) {
            console.log('Turbo Mode: Getting quick response from local AI');
            
            try {
              const localResponse = await aiCoachService.sendMessage(textToSend, imageUri, fullContext || undefined);
              
              let agentType = 'primary';
              let agentName = 'AI Coach (Turbo)';
              let agentEmoji = '⚡';
              
              if (isNutritionQuery) {
                agentType = 'nutrition';
                agentName = 'Nutrition Expert (Turbo)';
                agentEmoji = '🥗';
              }
              
              const turboMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: localResponse,
                sender: 'ai',
                timestamp: new Date(),
                actions: parseWorkoutActions(localResponse),
                confirmations: [],
                respondingAgents: [{
                  type: agentType,
                  name: agentName,
                  emoji: agentEmoji,
                  confidence: 'turbo'
                }],
              };
              
              setMessages((prev) => [...prev, turboMessage]);
              setIsTyping(false);
              
              backendAgentService.sendMultiAgentMessage(
                textToSend,
                'emma',
                fullContext || undefined,
                agentsToUse,
                { fastMode: true }
              ).then((betterResponse) => {
                console.log('Turbo Mode backend response:', betterResponse);
                if (betterResponse?.response && !betterResponse.response.includes("I'm taking a bit longer")) {
                  console.log('Turbo Mode: Received enhanced response from backend');
                }
              }).catch(() => {
                console.log('Turbo Mode: Backend response failed, but local response already shown');
              });
              
              return;
            } catch (error) {
              console.error('Turbo Mode local AI failed, falling back to backend:', error);
            }
          }
          
          const multiResponse = await backendAgentService.sendMultiAgentMessage(
            textToSend,
            'emma',
            fullContext || undefined,
            agentsToUse,
            { fastMode: false }
          );
          response = multiResponse;
          respondingAgents = multiResponse.responding_agents;
          
          if (response.response && response.response.includes("I'm taking a bit longer to process")) {
            console.log('Received timeout response, falling back to local AI service');
            
            try {
              const localResponse = await aiCoachService.sendMessage(textToSend, imageUri, fullContext || undefined);
              
              let agentType = 'primary';
              let agentName = 'AI Coach';
              let agentEmoji = '💪';
              
              if (isNutritionQuery) {
                agentType = 'nutrition';
                agentName = 'Nutrition Specialist';
                agentEmoji = '🥗';
              } else if (textToSend.toLowerCase().includes('recovery') || textToSend.toLowerCase().includes('pain')) {
                agentType = 'recovery';
                agentName = 'Recovery Specialist';
                agentEmoji = '🧘‍♀️';
              } else if (textToSend.toLowerCase().includes('form') || textToSend.toLowerCase().includes('technique')) {
                agentType = 'form';
                agentName = 'Form Expert';
                agentEmoji = '📐';
              }
              
              response.response = localResponse;
              response.responding_agents = [{
                type: agentType,
                name: agentName,
                emoji: agentEmoji,
                confidence: 'high'
              }];
              
              if (localResponse.includes('workout') || localResponse.includes('exercise')) {
                response.action_items = generateAIResponseActions(localResponse);
              }
              
            } catch (localError) {
              console.error('Local AI service also failed:', localError);
              response.response = "I'm having trouble processing your request right now. Please try again in a moment. If you have an urgent question, please be as specific as possible.";
              response.responding_agents = [{
                type: 'primary',
                name: 'AI Coach',
                emoji: '💪',
                confidence: 'low'
              }];
            }
          }
        } else {
          response = await backendAgentService.sendMessage(textToSend, 'emma');
        }
      } else {
        response = {
          text: "I'm not connected to the backend yet. Please make sure the Python backend is running and configured with your OpenAI API key.",
          actions: [],
          confirmations: []
        };
      }
      
      console.log('AI Response Received', { response, respondingAgents });
      console.log('Response structure:', {
        hasResponse: !!(response as any)?.response,
        hasPrimaryMessage: !!(response as any)?.primary_message,
        hasText: !!(response as any)?.text,
        responseKeys: response ? Object.keys(response) : []
      });

      const responseText = (response as any).response || (response as any).primary_message || (response as any).text || 'No response received';
      let actionItems = (response as any).action_items || (response as any).actions || [];
      
      if (actionMode === 'hybrid' || isTurboMode) {
        const parsedActions = parseWorkoutActions(responseText);
        
        const actionTypes = new Set(actionItems.map((a: ActionItem) => a.type));
        for (const parsedAction of parsedActions) {
          if (!actionTypes.has(parsedAction.type)) {
            actionItems.push(parsedAction);
          }
        }
        
        if (parsedActions.length > 0) {
          console.log(`Turbo Mode: Generated ${parsedActions.length} quick actions`);
        }
      } else if (actionMode === 'pure_ai' || isQuantumMode) {
        console.log('Quantum Mode: Using pure AI actions only', actionItems);
        
        if (actionItems.length === 0 && responseText.toLowerCase().includes('workout')) {
          console.log('Quantum Mode: No AI actions detected. AI may need more context.');
        }
      }
      
      console.log('Creating AI message with:', {
        responseText: responseText.substring(0, 100) + '...',
        actionCount: actionItems?.length || 0,
        agentCount: respondingAgents?.length || 0,
        source: isTurboMode ? 'local' : 'backend',
        hasBackendResponse: !!response
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'ai',
        timestamp: new Date(),
        actions: actionItems,
        confirmations: (response as any).confirmations || [],
        respondingAgents: respondingAgents || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
      
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
      mediaTypes: 'images' as any,
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
      const message = messages.find(m => m.id === messageId);
      const workoutText = message?.text || '';
      
      const workoutActions = ['add_workout', 'modify_workout', 'schedule_workout', 'schedule_rest', 'substitute_exercises', 'remove_workout', 'get_suggestions', 'apply_suggestion', 'swap_workout'];
      
      if (workoutActions.includes(action.type)) {
        const success = await workoutActionService.executeAction({
          type: action.type,
          workoutSuggestions: workoutText,
          data: action
        });
        
        if (success) {
          let confirmationMessage = '';
          switch (action.type) {
            case 'add_workout':
              confirmationMessage = `I've added the workouts to my schedule.`;
              break;
            case 'modify_workout':
              confirmationMessage = `I've modified today's workout.`;
              break;
            case 'schedule_workout':
              confirmationMessage = `I've scheduled the workouts for later.`;
              break;
            case 'schedule_rest':
              confirmationMessage = `I've scheduled a rest day.`;
              break;
            case 'get_suggestions':
              confirmationMessage = `Please suggest workouts based on my stats and progress.`;
              break;
            case 'apply_suggestion':
              confirmationMessage = `Apply the suggested workout to my schedule.`;
              break;
            case 'swap_workout':
              confirmationMessage = `Swap today's workout with the suggested one.`;
              break;
            default:
              confirmationMessage = `I've completed the action.`;
          }
          await sendMessage(confirmationMessage);
        }
      } else {
        setIsTyping(true);
        
        let actionMessage = '';
        switch (action.type) {
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
        
        await sendMessage(actionMessage);
        setIsTyping(false);
      }
    } catch (error) {
      console.error('Error handling action:', error);
      Alert.alert('Error', 'Failed to execute action. Please try again.');
      setIsTyping(false);
    }
  };

  const handleConfirmationAction = async (_confirmationId: string, _action: string, _data: any) => {
    try {
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: `Action "${_action}" has been processed. The backend agents are handling this request.`,
        sender: 'ai',
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
      
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

    const messageIndex = messages.findIndex(m => m.id === selectedMessage.id);
    if (messageIndex > 0) {
      const previousUserMessage = messages[messageIndex - 1];
      if (previousUserMessage.sender === 'user') {
        setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
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
      const newMessages = messages.slice(0, messageIndex);
      
      const updatedMessage: Message = {
        ...editingMessage,
        text: editText.trim(),
      };
      
      setMessages([...newMessages, updatedMessage]);
      setEditingMessage(null);
      setEditText('');
      
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
    
    if (selectedMessage) {
      const messageIndex = messages.findIndex(m => m.id === selectedMessage.id);
      if (messageIndex > 0) {
        const previousUserMessage = messages[messageIndex - 1];
        if (previousUserMessage.sender === 'user') {
          setIsTyping(true);
          
          try {
            const response = await backendAgentService.sendMultiAgentMessage(
              previousUserMessage.text,
              'emma',
              undefined,
              [agentType],
              { singleAgentMode: true }
            );
            
            const aiMessage: Message = {
              id: Date.now().toString(),
              text: response.response || 'No response received',
              sender: 'ai',
              timestamp: new Date(),
              actions: [],
              confirmations: [],
              respondingAgents: response.responding_agents,
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
      setSelectedAgentsForChat(prev => {
        if (prev.includes(agentType)) {
          return prev.filter(a => a !== agentType);
        } else {
          return [...prev, agentType];
        }
      });
    }
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
          <LiquidCard
            style={[styles.messageBubble, isUser ? styles.userMessage : styles.aiMessage] as any}
            
          >
            {!isUser && (
              <View style={styles.aiAvatar}>
                <Icon name="flash" size={16} color="white" />
              </View>
            )}
            <View style={styles.messageContent}>
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
              
              {!isUser && item.confirmations && renderConfirmationButtons(item.confirmations)}
              
              {!isUser && item.actions && item.actions.length > 0 && (
                <View style={styles.actionButtonsContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionButtonsScroll}>
                    {item.actions.map((action) => (
                      <LiquidButton
                        key={action.id}
                        label={action.label}
                        icon={action.icon}
                        size="small"
                        onPress={() => handleActionItem(action, item.id)}
                        style={styles.actionButton}
                        variant={
                          action.color === '#F44336' ? 'danger' :
                          'secondary'
                        }
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
        </LiquidCard>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;
    setScrollOffset(offset);
    
    // Animate header based on scroll
    Animated.timing(headerAnimation, {
      toValue: offset > 50 ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10]
              })
            }],
            opacity: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.95]
            })
          }
        ]}
      >
        <LiquidGlassView intensity={90} style={styles.headerContent}>
          <View style={styles.headerRow}>
            <Icon name="flash" size={24} color={theme.colors.primary.main} />
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>
                {selectedAgentsForChat.length > 0 
                  ? `AI Coach (${selectedAgentsForChat.length} agents)`
                  : 'AI Coach'
                }
              </Text>
              <View style={styles.modeIndicator}>
                <Icon 
                  name={isTurboMode ? "flash" : "planet"} 
                  size={14} 
                  color={isTurboMode ? "#FF9800" : theme.colors.primary.main} 
                />
                <Text style={styles.modeText}>
                  {isTurboMode ? 'Turbo' : 'Quantum'}
                </Text>
              </View>
            </View>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
            </View>
            <TouchableOpacity 
              style={styles.multiAgentToggle}
              onPress={() => setUseMultiAgent(!useMultiAgent)}
            >
              <Icon 
                name={useMultiAgent ? "people" : "person"} 
                size={20} 
                color={useMultiAgent ? theme.colors.primary.main : theme.colors.textSecondary} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.multiAgentToggle, { marginLeft: 8 }]}
              onPress={() => {
                setSelectedMessage(null);
                setShowAgentSelection(true);
              }}
            >
              <Icon 
                name="git-compare" 
                size={20} 
                color={theme.colors.primary.main} 
              />
            </TouchableOpacity>
          </View>
        </LiquidGlassView>
      </Animated.View>

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
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight + 120 : SAFE_BOTTOM_PADDING + 120 }
        ]}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isTyping ? (
            <Animated.View style={styles.typingIndicator}>
              <LiquidCard style={styles.typingBubble}>
                <ActivityIndicator size="small" color={theme.colors.primary.main} />
                <Text style={styles.typingText}>AI Coach is typing...</Text>
              </LiquidCard>
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
          <LiquidCard style={styles.optionsContainer}>
            {selectedMessage?.sender === 'ai' ? (
              <>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleAskOtherAgent}
                >
                  <Icon name="people" size={20} color={theme.colors.primary.main} />
                  <Text style={styles.optionText}>Ask Other Agent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleRegenerateMessage}
                >
                  <Icon name="refresh" size={20} color={theme.colors.primary.main} />
                  <Text style={styles.optionText}>Regenerate</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={handleEditMessage}
                >
                  <Icon name="create" size={20} color={theme.colors.primary.main} />
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
          </LiquidCard>
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
          <LiquidCard style={styles.agentSelectionContainer}>
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
              <LiquidButton
                label="Clear Selection"
                size="medium"
                variant="secondary"
                onPress={() => setSelectedAgentsForChat([])}
                style={styles.clearSelectionButton}
              />
            )}
          </LiquidCard>
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
            <LiquidCard style={styles.quickActionsContent}>
              <Text style={styles.quickActionsTitle}>Quick Actions</Text>
              <View style={styles.quickActionsGrid}>
                {quickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.quickActionButton}
                    onPress={action.action}
                  >
                    <Icon name={action.icon} size={24} color={theme.colors.primary.main} />
                    <Text style={styles.quickActionText}>{action.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </LiquidCard>
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
        <LiquidGlassView intensity={95} style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={toggleQuickActions} style={styles.quickActionsButton}>
              <Icon name="flash" size={20} color={theme.colors.primary.main} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
              <Icon name="image-outline" size={20} color={theme.colors.primary.main} />
            </TouchableOpacity>
            
            <LiquidInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your AI coach anything..."
              style={styles.input}
              multiline
            />
            
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <LiquidButton
                onPress={() => sendMessage()}
                label=""
                icon="send"
                size="small"
                disabled={!inputText.trim()}
                style={styles.sendButton}
              />
            </Animated.View>
          </View>
        </LiquidGlassView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    opacity: 0.9,
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
  multiAgentToggle: {
    position: 'absolute',
    right: 20,
    padding: 5,
  },
  chatContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 120 : 100,
  },
  chatContent: {
    paddingHorizontal: 20,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  userMessage: {
    marginLeft: 40,
  },
  aiMessage: {
    marginRight: 40,
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.3)',
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
    gap: 8,
  },
  typingText: {
    color: 'white',
    fontSize: 14,
  },
  inputArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  inputContainer: {
    borderRadius: 28,
    overflow: 'hidden',
    minHeight: 56,
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
  attachButton: {
    padding: 10,
    marginRight: 5,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  sendButton: {
    minWidth: 44,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    padding: 8,
    minWidth: 200,
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
    padding: 20,
    maxWidth: width * 0.9,
  },
  agentSelectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  agentSelectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
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
  agentCardSelected: {
    borderColor: '#667eea',
    borderWidth: 2,
    backgroundColor: 'rgba(102,126,234,0.1)',
  },
  agentCardName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  agentCardNameSelected: {
    color: '#667eea',
  },
  selectedCheckmark: {
    position: 'absolute',
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
    alignSelf: 'center',
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
    padding: 20,
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
  actionButtonsContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  actionButtonsScroll: {
    flexGrow: 0,
  },
  actionButton: {
    marginRight: 8,
  },
});

export default LiquidMessagesScreen;