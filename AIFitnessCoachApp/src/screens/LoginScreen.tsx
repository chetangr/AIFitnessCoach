import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuthStore } from '../store/authStore';
import { theme } from '../config/theme';
import { easings } from '../utils/animations';
import GlassComponents from '../components/glass/GlassComponents';
// Logger removed - causing import errors

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  
  // Animation values
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 500,
        delay: 200,
        easing: easings.easeOut,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 200,
        easing: easings.easeOut,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    console.log('Login Attempt', { email });

    try {
      // Call backend login API
      const { API_BASE_URL } = await import('../config/api');
      const response = await fetch(`${API_BASE_URL}/api/auth/login-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }

      const data = await response.json();
      
      // Set the auth token in backend service
      const { backendAgentService } = await import('../services/backendAgentService');
      await backendAgentService.setAuthToken(data.access_token);
      
      // Login with user data
      await login({
        id: data.user.id,
        email: data.user.email,
        name: data.user.display_name || data.user.email,
        token: data.access_token,
      });
      
      console.log('Login Successful', { email });
    } catch (error) {
      console.log('Login Failed', error);
      
      // If backend fails, check for demo credentials
      if (email === 'demo@fitness.com' && password === 'demo123') {
        const demoToken = 'demo-token-' + Date.now();
        const { backendAgentService } = await import('../services/backendAgentService');
        await backendAgentService.setAuthToken(demoToken);
        await login({
          id: 'demo-user-001',
          email: 'demo@fitness.com',
          name: 'Demo User',
          token: demoToken,
        });
      } else {
        Alert.alert('Error', 'Invalid credentials. Try demo@fitness.com / demo123');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setEmail('demo@fitness.com');
    setPassword('demo123');
    console.log('Demo Login Button Pressed');
  };

  return (
    <LinearGradient 
      colors={theme.colors.primary.gradient as [string, string, string]} 
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Animated Logo Section */}
          <Animated.View 
            style={[
              styles.logoSection,
              { transform: [{ scale: logoScale }] }
            ]}
          >
            <Text style={styles.logo}>💪</Text>
            <Text style={[styles.title, theme.typography.largeTitle]}>AI Fitness Coach</Text>
            <Text style={[styles.subtitle, theme.typography.subheadline]}>Your Personal AI Trainer</Text>
          </Animated.View>

          {/* Animated Login Form */}
          <Animated.View
            style={[
              { 
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }]
              }
            ]}
          >
            <GlassComponents.GlassContainer intensity="medium" style={styles.formContainer}>
              <Text style={[styles.formTitle, theme.typography.title2]}>Welcome Back!</Text>

              <GlassComponents.GlassTextInput
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.inputSpacing}
              />

              <GlassComponents.GlassTextInput
                icon="lock-closed-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.inputSpacing}
              />

              <GlassComponents.GlassButton
                title="Login"
                onPress={handleLogin}
                loading={loading}
                variant="primary"
                size="large"
                style={styles.loginButton}
              />

              <GlassComponents.GlassButton
                title="Use Demo Account"
                onPress={handleDemoLogin}
                variant="secondary"
                size="medium"
                style={styles.demoButton}
              />

              <View style={styles.footer}>
                <Text style={[styles.footerText, theme.typography.footnote]}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={[styles.linkText, theme.typography.footnote]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </GlassComponents.GlassContainer>
          </Animated.View>

          {/* Demo Credentials Info */}
          <GlassComponents.GlassContainer intensity="light" style={styles.demoInfo} animated={true} delay={400}>
            <Text style={[styles.demoInfoTitle, theme.typography.caption1]}>Demo Credentials:</Text>
            <Text style={[styles.demoInfoText, theme.typography.caption2]}>Email: demo@fitness.com</Text>
            <Text style={[styles.demoInfoText, theme.typography.caption2]}>Password: demo123</Text>
          </GlassComponents.GlassContainer>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    fontSize: 60,
    marginBottom: theme.spacing.sm,
  },
  title: {
    color: theme.colors.neutral.white,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.neutral.gray300,
  },
  formContainer: {
    padding: theme.spacing.lg,
  },
  formTitle: {
    color: theme.colors.neutral.gray900,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  inputSpacing: {
    marginBottom: theme.spacing.md,
  },
  loginButton: {
    marginTop: theme.spacing.lg,
  },
  demoButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    color: theme.colors.neutral.gray300,
  },
  linkText: {
    color: theme.colors.primary.pink,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  demoInfo: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
  },
  demoInfoTitle: {
    color: theme.colors.neutral.white,
    marginBottom: theme.spacing.xs,
  },
  demoInfoText: {
    color: theme.colors.neutral.gray300,
    marginBottom: theme.spacing.xs,
  },
});

export default LoginScreen;