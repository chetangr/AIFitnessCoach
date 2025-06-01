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
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
// Logger temporarily removed - was causing import errors
import { openaiService } from '../services/openaiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  image?: string;
}

const MessagesScreen = () => {
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

  useEffect(() => {
    console.log('AI Coach Chat Opened');
    // Load conversation history
    loadConversation();
  }, []);

  const loadConversation = async () => {
    try {
      await openaiService.loadConversation();
      console.log('Conversation history loaded');
    } catch (error) {
      console.error('Error loading conversation:', error);
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

    if (!result.canceled && result.assets[0]) {
      sendMessage('Check out this image', result.assets[0].uri);
    }
  };

  const sendMessage = async (text?: string, imageUri?: string) => {
    const messageText = text || inputText;
    if (!messageText.trim() && !imageUri) return;

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

    console.log('User Message Sent', { message: messageText, hasImage: !!imageUri });

    try {
      // Call AI service
      const response = await openaiService.sendMessageSimple(messageText, imageUri);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      console.log('AI Response Received', { response });
    } catch (error) {
      console.error('AI Chat Error', error);
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now. Let me help you with some general fitness advice. What's your current fitness goal?",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestedPrompts = [
    "Create a workout plan for me",
    "How can I lose weight?",
    "Best exercises for abs",
    "Nutrition tips for muscle gain",
  ];

  const handleSuggestedPrompt = (prompt: string) => {
    setInputText(prompt);
    console.log('Suggested Prompt Selected', { prompt });
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      {/* Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.coachInfo}>
          <View style={styles.coachAvatar}>
            <Text style={styles.coachAvatarText}>🤖</Text>
          </View>
          <View>
            <Text style={styles.coachName}>AI Fitness Coach</Text>
            <Text style={styles.coachStatus}>Always here to help</Text>
          </View>
        </View>
      </BlurView>

      {/* Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.messagesContainer}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
              ]}
            >
              <BlurView
                intensity={message.sender === 'user' ? 40 : 20}
                tint={message.sender === 'user' ? 'dark' : 'light'}
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userMessage : styles.aiMessage,
                ]}
              >
                {message.image && (
                  <Image source={{ uri: message.image }} style={styles.messageImage} />
                )}
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              </BlurView>
            </View>
          ))}
          
          {isTyping && (
            <View style={styles.aiMessageWrapper}>
              <BlurView intensity={20} tint="light" style={[styles.messageBubble, styles.aiMessage]}>
                <ActivityIndicator size="small" color="white" />
              </BlurView>
            </View>
          )}
        </ScrollView>

        {/* Suggested Prompts */}
        {messages.length === 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
          >
            {suggestedPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleSuggestedPrompt(prompt)}
              >
                <BlurView intensity={20} tint="light" style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>{prompt}</Text>
                </BlurView>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <BlurView intensity={80} tint="dark" style={styles.inputContainer}>
          <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
            <Icon name="image-outline" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask me anything about fitness..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
          </View>
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => sendMessage()}
            disabled={!inputText.trim() || isTyping}
          >
            <Icon
              name="send"
              size={24}
              color={inputText.trim() && !isTyping ? '#667eea' : 'rgba(255,255,255,0.3)'}
            />
          </TouchableOpacity>
        </BlurView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  coachInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coachAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  coachAvatarText: {
    fontSize: 30,
  },
  coachName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  coachStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageWrapper: {
    marginVertical: 8,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  userMessage: {
    borderTopRightRadius: 4,
  },
  aiMessage: {
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: 'white',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 50,
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    overflow: 'hidden',
  },
  suggestionText: {
    color: 'white',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
  inputWrapper: {
    flex: 1,
    maxHeight: 100,
    marginRight: 12,
  },
  input: {
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
});

export default MessagesScreen;