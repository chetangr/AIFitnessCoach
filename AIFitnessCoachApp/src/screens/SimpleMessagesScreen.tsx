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

const SimpleMessagesScreen = () => {
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
    // Load previous conversation
    openaiService.loadConversation();
  }, []);

  const sendMessage = async (messageText?: string, imageUri?: string) => {
    const textToSend = messageText || inputText.trim();
    if (!textToSend && !imageUri) return;

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

    try {
      console.log('User Message Sent', { message: textToSend, hasImage: !!imageUri });
      
      const response = await openaiService.sendMessage(textToSend, imageUri);
      
      console.log('AI Response Received', { response });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: typeof response === 'string' ? response : 'No response received',
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
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
          intensity={isUser ? 100 : 80}
          tint={isUser ? 'light' : 'dark'}
          style={[styles.messageBubble, isUser ? styles.userMessage : styles.aiMessage]}
        >
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.text}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </BlurView>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Coach</Text>
        <Text style={styles.subtitle}>Your personal fitness assistant</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View key={message.id}>{renderMessage({ item: message })}</View>
        ))}
        
        {isTyping && (
          <View style={styles.typingIndicator}>
            <BlurView intensity={80} tint="dark" style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#667eea" />
              <Text style={styles.typingText}>AI Coach is typing...</Text>
            </BlurView>
          </View>
        )}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <BlurView intensity={90} tint="light" style={styles.inputWrapper}>
          <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
            <Icon name="image-outline" size={24} color="#667eea" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.input}
            placeholder="Ask your AI coach anything..."
            placeholderTextColor="rgba(0,0,0,0.4)"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          
          <TouchableOpacity
            onPress={() => sendMessage()}
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            disabled={!inputText.trim()}
          >
            <Icon name="send" size={24} color={inputText.trim() ? '#667eea' : '#ccc'} />
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 140 : 130, // Extra padding for input container + tab bar
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
  },
  userMessage: {
    marginLeft: 40,
  },
  aiMessage: {
    marginRight: 40,
  },
  messageText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
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
  inputContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80, // Position above tab bar
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default SimpleMessagesScreen;