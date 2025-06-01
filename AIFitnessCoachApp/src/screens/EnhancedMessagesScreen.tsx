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
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// BlurView removed - unused import
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  // withSpring, withTiming removed - unused
  interpolate,
} from 'react-native-reanimated';

// Import spatial components
import { ImmersiveEnvironment } from '../components/spatial/ImmersiveEnvironment';
import { SimpleSpatialContainer } from '../components/spatial/SimpleSpatialContainer';
import { VisionGlass } from '../components/spatial/VisionGlass';
import { FloatingElement } from '../components/spatial/FloatingElement';
import { SpatialAICoach, useSpatialAICoach } from '../components/spatial/SpatialAICoach';
import { ContextualOverlay, useContextualInfo } from '../components/spatial/ContextualOverlay';
import { SpatialGestureHandler } from '../components/spatial/SpatialGestureHandler';
import { spatialHaptics } from '../services/spatialHaptics';
import { aiCoachService } from '../services/aiCoachService';
// Logger removed - was causing import errors

const { width, height } = Dimensions.get('window');
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string;
  type?: 'text' | 'workout' | 'tip' | 'form_analysis';
}

const EnhancedMessagesScreen = () => {
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
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useSharedValue(0);

  // visionOS features
  const aiCoach = useSpatialAICoach();
  const contextualInfo = useContextualInfo();

  useEffect(() => {
    console.log('Enhanced AI Coach Chat Opened');
    aiCoach.showCoach();
    
    // Show welcome contextual tip
    setTimeout(() => {
      contextualInfo.showTip(
        "Try asking me about workouts, nutrition, or send a photo for form analysis!",
        { x: width * 0.5, y: height * 0.2 }
      );
    }, 2000);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const pickImage = async () => {
    spatialHaptics.floatingElementTouch();
    
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

    if (!result.canceled && result.assets[0]) {
      sendMessage('Let me analyze this image for you', result.assets[0].uri);
      
      // Show contextual info about image analysis
      contextualInfo.showInfo({
        content: "I'm analyzing your image for form and technique. This may take a moment...",
        type: 'form',
        position: { x: width * 0.3, y: height * 0.6 },
        duration: 5000,
      });
    }
  };

  const sendMessage = async (text?: string, imageUri?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() && !imageUri) return;

    spatialHaptics.aiCoachMessage();
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      image: imageUri,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    aiCoach.startThinking();

    console.log('User Message Sent', { message: messageText, hasImage: !!imageUri });

    try {
      // Call AI service
      const response = await aiCoachService.sendMessage(messageText, imageUri);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
        type: imageUri ? 'form_analysis' : 'text',
      };

      setMessages((prev) => [...prev, aiMessage]);
      aiCoach.sendMessage(response);
      spatialHaptics.aiCoachMessage();
      
      // Show contextual tips based on AI response
      if (response.toLowerCase().includes('form')) {
        contextualInfo.showFormTip(
          "Focus on proper alignment and controlled movements",
          { x: width * 0.7, y: height * 0.4 }
        );
      } else if (response.toLowerCase().includes('workout')) {
        contextualInfo.showTip(
          "Remember to warm up before starting any workout",
          { x: width * 0.2, y: height * 0.5 }
        );
      }
      
      console.log('AI Response Received', { response });
    } catch (error) {
      console.error('AI Chat Error', error);
      spatialHaptics.error();
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "I'm having trouble connecting right now. Let me give you a quick tip: Focus on compound movements like squats and deadlifts for maximum efficiency!",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
      aiCoach.stopThinking();
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.sender === 'user';
    const depth = index % 3; // Varying depths for spatial effect
    
    return (
      <FloatingElement
        key={message.id}
        variant="subtle"
        depth={depth}
        initialPosition={{ 
          x: isUser ? width * 0.2 : -width * 0.1, 
          y: index * 10 
        }}
      >
        <View style={[
          styles.messageWrapper,
          isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
        ]}>
          {!isUser && (
            <View style={styles.aiAvatar}>
              <VisionGlass variant="thick" borderRadius={20}>
                <Text style={styles.aiAvatarEmoji}>🤖</Text>
              </VisionGlass>
            </View>
          )}
          
          <SpatialGestureHandler
            enablePinch={!!message.image}
            enableRotation={false}
            enablePan={false}
            onGestureStart={() => spatialHaptics.floatingElementTouch()}
          >
            <VisionGlass
              variant={isUser ? "thick" : "light"}
              depth={depth + 1}
              floating
              interactive
              style={StyleSheet.flatten([
                styles.messageBubble,
                isUser ? styles.userMessage : styles.aiMessage,
              ])}
            >
              {message.image && (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: message.image }} style={styles.messageImage} />
                  <View style={styles.imageOverlay}>
                    <Icon name="scan-outline" size={20} color="white" />
                    <Text style={styles.imageOverlayText}>Tap to analyze</Text>
                  </View>
                </View>
              )}
              
              <Text style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.aiMessageText
              ]}>
                {message.text}
              </Text>
              
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              
              {/* Special indicators for different message types */}
              {message.type === 'form_analysis' && (
                <View style={styles.messageTypeIndicator}>
                  <Icon name="body-outline" size={12} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.messageTypeText}>Form Analysis</Text>
                </View>
              )}
              
              {message.type === 'workout' && (
                <View style={styles.messageTypeIndicator}>
                  <Icon name="fitness-outline" size={12} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.messageTypeText}>Workout Plan</Text>
                </View>
              )}
            </VisionGlass>
          </SpatialGestureHandler>
        </View>
      </FloatingElement>
    );
  };

  const suggestedPrompts = [
    "Create a workout plan",
    "Analyze my form",
    "Nutrition advice",
    "Track my progress",
    "Motivation needed!",
  ];

  const headerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 50],
          [0, -25]
        ),
      },
    ],
  }));

  return (
    <ImmersiveEnvironment environment="cosmic" intensity={0.5} animated>
      <SimpleSpatialContainer>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
              >
                {/* Enhanced Header */}
                <Animated.View style={[styles.header, headerStyle]}>
                  <VisionGlass variant="thick" depth={1} floating>
                    <View style={styles.headerContent}>
                      <View style={styles.headerLeft}>
                        <FloatingElement variant="pronounced" depth={1}>
                          <View style={styles.coachAvatar}>
                            <LinearGradient
                              colors={['#667eea', '#764ba2']}
                              style={styles.avatarGradient}
                            >
                              <Text style={styles.coachEmoji}>🤖</Text>
                            </LinearGradient>
                          </View>
                        </FloatingElement>
                        <View>
                          <Text style={styles.headerTitle}>AI Coach</Text>
                          <Text style={styles.headerSubtitle}>Spatial Intelligence Mode</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={() => {
                          spatialHaptics.spatialNavigation();
                          contextualInfo.showTip(
                            "Swipe up for more coach options",
                            { x: width - 50, y: 100 }
                          );
                        }}
                      >
                        <Icon name="options-outline" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </VisionGlass>
                </Animated.View>

                {/* Messages with spatial scrolling */}
                <AnimatedScrollView
                  ref={scrollViewRef}
                  style={styles.messagesContainer}
                  contentContainerStyle={styles.messagesContent}
                  onScroll={scrollHandler}
                  scrollEventThrottle={16}
                  onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.map((message, index) => renderMessage(message, index))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <FloatingElement variant="subtle" depth={1}>
                      <View style={styles.aiMessageWrapper}>
                        <View style={styles.aiAvatar}>
                          <VisionGlass variant="thick" borderRadius={20}>
                            <Text style={styles.aiAvatarEmoji}>🤖</Text>
                          </VisionGlass>
                        </View>
                        <VisionGlass variant="light" depth={2} style={styles.typingIndicator}>
                          <View style={styles.typingDots}>
                            <View style={[styles.dot, styles.dot1]} />
                            <View style={[styles.dot, styles.dot2]} />
                            <View style={[styles.dot, styles.dot3]} />
                          </View>
                        </VisionGlass>
                      </View>
                    </FloatingElement>
                  )}
                </AnimatedScrollView>

                {/* Suggested prompts */}
                {messages.length === 1 && (
                  <View style={styles.suggestionsContainer}>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.suggestionsScroll}
                    >
                      {suggestedPrompts.map((prompt, index) => (
                        <FloatingElement key={index} variant="subtle" depth={2}>
                          <TouchableOpacity
                            onPress={() => {
                              setInputText(prompt);
                              spatialHaptics.floatingElementTouch();
                            }}
                            style={styles.suggestionButton}
                          >
                            <VisionGlass variant="ultraThin" interactive>
                              <Text style={styles.suggestionText}>{prompt}</Text>
                            </VisionGlass>
                          </TouchableOpacity>
                        </FloatingElement>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Enhanced Input */}
                <VisionGlass variant="thick" depth={1} floating style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <TouchableOpacity 
                      onPress={pickImage} 
                      style={styles.attachButton}
                    >
                      <Icon name="camera-outline" size={24} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.input}
                      placeholder="Ask your AI coach anything..."
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={inputText}
                      onChangeText={setInputText}
                      multiline
                    />
                    
                    <TouchableOpacity
                      onPress={() => sendMessage()}
                      style={[
                        styles.sendButton,
                        inputText.trim() && styles.sendButtonActive
                      ]}
                      disabled={!inputText.trim()}
                    >
                      <LinearGradient
                        colors={inputText.trim() ? ['#667eea', '#764ba2'] : ['transparent', 'transparent']}
                        style={styles.sendButtonGradient}
                      >
                        <Icon
                          name="send"
                          size={20}
                          color={inputText.trim() ? 'white' : 'rgba(255,255,255,0.3)'}
                        />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </VisionGlass>
              </KeyboardAvoidingView>
      </SimpleSpatialContainer>
      
      {/* Contextual Information Overlay */}
      <ContextualOverlay
        infos={contextualInfo.infos}
        onInfoDismiss={contextualInfo.hideInfo}
        onInfoTap={(_info) => {
          spatialHaptics.floatingElementTouch();
          // Handle contextual info interactions
        }}
      />
      
      {/* Spatial AI Coach */}
      <SpatialAICoach
        isVisible={aiCoach.isVisible}
        currentMessage={aiCoach.currentMessage}
        isThinking={aiCoach.isThinking}
        onAvatarPress={() => {
          spatialHaptics.aiCoachAppear();
          contextualInfo.showTip(
            "I'm here to help with all your fitness needs!",
            { x: width - 150, y: height / 2 }
          );
        }}
        personality="supportive"
      />
    </ImmersiveEnvironment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundLayer: {
    height: height,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  headerButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageWrapper: {
    marginVertical: 8,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  aiAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    marginTop: 5,
    overflow: 'hidden',
  },
  aiAvatarEmoji: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 30,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    padding: 12,
    borderRadius: 16,
    position: 'relative',
  },
  userMessage: {
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    textAlign: 'right',
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  imageOverlayText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
  messageTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageTypeText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginLeft: 4,
  },
  typingIndicator: {
    padding: 12,
    borderRadius: 16,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
    marginHorizontal: 2,
  },
  dot1: {
    // Animation delay handled by React Native Reanimated
  },
  dot2: {
    // Animation delay handled by React Native Reanimated
  },
  dot3: {
    // Animation delay handled by React Native Reanimated
  },
  suggestionsContainer: {
    paddingVertical: 16,
  },
  suggestionsScroll: {
    paddingHorizontal: 20,
  },
  suggestionButton: {
    marginRight: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  suggestionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 8,
  },
  sendButtonActive: {
    // Active state handled by gradient
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EnhancedMessagesScreen;