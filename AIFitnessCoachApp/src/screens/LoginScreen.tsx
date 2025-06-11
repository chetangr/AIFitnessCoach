import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LiquidGlassView, LiquidButton, LiquidCard } from '../components/glass';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LiquidLoginScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeStore();
  const { colors } = theme;
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.9)).current;
  const rippleAnimation = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Trigger ripple animation
    Animated.sequence([
      Animated.timing(rippleAnimation, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(rippleAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // For now, create a mock user (same as demo login)
      // In production, this would make an API call to authenticate
      const user = {
        id: Date.now().toString(),
        email: email,
        name: email.split('@')[0],
        token: 'mock-token-' + Date.now(),
      };
      
      await login(user);
      // Navigation handled by auth store
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@fitness.com');
    setPassword('demo123');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + '20', colors.secondary + '20', colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnimation,
                transform: [{ scale: scaleAnimation }],
              },
            ]}
          >
            {/* Logo Section */}
            <LiquidGlassView intensity={90} style={styles.logoContainer}>
              <Ionicons name="fitness" size={80} color={colors.primary.main} />
              <Text style={[styles.appName, { color: colors.text }]}>AI Fitness Coach</Text>
              <Text style={[styles.tagline, { color: colors.text + '80' }]}>
                Your Personal Training Assistant
              </Text>
            </LiquidGlassView>

            {/* Login Form */}
            <LiquidCard style={styles.formCard}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Welcome Back</Text>
              
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Email</Text>
                <LiquidGlassView intensity={70} style={styles.inputContainer}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={colors.text + '60'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.text + '40'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={[styles.input, { color: colors.text }]}
                  />
                </LiquidGlassView>
              </View>
              
              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Password</Text>
                <LiquidGlassView intensity={70} style={styles.inputContainer}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={colors.text + '60'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.text + '40'}
                    secureTextEntry={!showPassword}
                    style={[styles.input, styles.passwordInput, { color: colors.text }]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={colors.text + '60'} 
                    />
                  </TouchableOpacity>
                </LiquidGlassView>
              </View>
              
              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: colors.secondary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
              
              {/* Login Button */}
              <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
                <LiquidGlassView intensity={90} style={styles.loginButton}>
                  {isLoading ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <>
                      <Animated.View
                        style={[
                          StyleSheet.absoluteFillObject,
                          styles.ripple,
                          {
                            backgroundColor: colors.background + '20',
                            transform: [
                              {
                                scale: rippleAnimation.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 4],
                                }),
                              },
                            ],
                            opacity: rippleAnimation.interpolate({
                              inputRange: [0, 0.5, 1],
                              outputRange: [0, 0.3, 0],
                            }),
                          },
                        ]}
                      />
                      <LinearGradient
                        colors={[colors.primary.main, colors.secondary]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <Text style={styles.loginButtonText}>Login</Text>
                    </>
                  )}
                </LiquidGlassView>
              </TouchableOpacity>
              
              {/* Demo Account */}
              <TouchableOpacity onPress={handleDemoLogin} style={styles.demoButton}>
                <Text style={[styles.demoText, { color: colors.text + '60' }]}>
                  Use Demo Account
                </Text>
              </TouchableOpacity>
            </LiquidCard>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: colors.text + '80' }]}>
                Don't have an account?
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
                <Text style={[styles.signupLink, { color: colors.primary.main }]}> Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    padding: 32,
    borderRadius: 30,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
  },
  formCard: {
    padding: 24,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: 56,
    justifyContent: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 16,
  },
  ripple: {
    borderRadius: 28,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    zIndex: 1,
  },
  demoButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  demoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
  },
  signupLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});