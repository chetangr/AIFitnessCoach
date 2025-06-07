import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../config/theme';
import { useFadeIn, useSlideIn, useScale } from '../utils/animations';
import { 
  GlassContainer, 
  GlassButton, 
  GlassTextInput,
  GlassBadge
} from '../components/glass/GlassComponents';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';

const EnhancedLoginScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  
  // Animations
  const logoScale = useScale(0.5, 0);
  const formFadeIn = useFadeIn(300);
  const { translateY: formSlideY } = useSlideIn('bottom', 500);
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Auth store
  const { setUser, setIsAuthenticated } = useAuthStore();

  const validateForm = () => {
    const newErrors = { username: '', password: '' };
    
    if (!username) {
      newErrors.username = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(username)) {
      newErrors.username = 'Invalid email format';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    try {
      const success = await authService.login(username, password);
      
      if (success) {
        const userData = {
          email: username,
          name: username.split('@')[0],
          id: Date.now().toString(),
        };
        
        await AsyncStorage.setItem('currentUser', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
        
        // Navigate to main app
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setUsername('demo@fitness.com');
    setPassword('demo123');
  };

  const handleGoogleLogin = () => {
    Alert.alert('Coming Soon', 'Google login will be available soon!');
  };

  return (
    <ImageBackground
      source={{ uri: 'https://via.placeholder.com/1000x2000/667eea/ffffff' }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo */}
            <Animated.View 
              style={[
                styles.logoContainer,
                { transform: [{ scale: logoScale }] }
              ]}
            >
              <View style={styles.logoCircle}>
                <Icon name="barbell" size={50} color="white" />
              </View>
              <Text style={[styles.logoText, theme.typography.largeTitle]}>
                AI Fitness
              </Text>
              <Text style={[styles.tagline, theme.typography.subheadline]}>
                Your Personal AI Coach
              </Text>
            </Animated.View>

            {/* Login Form */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: formFadeIn,
                  transform: [{ translateY: formSlideY }],
                },
              ]}
            >
              <GlassContainer style={styles.glassForm} intensity="medium" animated delay={600}>
                <Text style={[styles.formTitle, theme.typography.title2]}>
                  Welcome Back
                </Text>
                
                <View style={styles.inputGroup}>
                  <GlassTextInput
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setErrors({ ...errors, username: '' });
                    }}
                    placeholder="Email"
                    icon="mail"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.username}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.passwordContainer}>
                    <GlassTextInput
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        setErrors({ ...errors, password: '' });
                      }}
                      placeholder="Password"
                      icon="lock-closed"
                      secureTextEntry={!showPassword}
                      error={errors.password}
                      style={{ flex: 1 }}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color={theme.colors.neutral.gray600}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={[styles.forgotPasswordText, theme.typography.footnote]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <GlassButton
                    title="Sign In"
                    onPress={handleLogin}
                    loading={isLoading}
                    size="large"
                    style={styles.loginButton}
                  />
                </Animated.View>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={[styles.dividerText, theme.typography.caption1]}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <GlassButton
                  title="Continue with Google"
                  onPress={handleGoogleLogin}
                  variant="secondary"
                  icon="logo-google"
                  size="large"
                />

                <TouchableOpacity onPress={handleDemoLogin} style={styles.demoButton}>
                  <GlassBadge
                    label="Try Demo Account"
                    icon="flask"
                    variant="success"
                  />
                </TouchableOpacity>
              </GlassContainer>
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View style={[styles.footer, { opacity: formFadeIn }]}>
              <Text style={[styles.footerText, theme.typography.callout]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.signUpLink, theme.typography.callout]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary.purple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.lg,
  },
  logoText: {
    color: 'white',
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: theme.colors.neutral.gray300,
    marginTop: theme.spacing.xs,
  },
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  glassForm: {
    padding: theme.spacing.xl,
  },
  formTitle: {
    color: theme.colors.neutral.gray900,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeButton: {
    position: 'absolute',
    right: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: theme.colors.primary.purple,
  },
  loginButton: {
    marginBottom: theme.spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.neutral.gray300,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.neutral.gray600,
  },
  demoButton: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.neutral.gray300,
  },
  signUpLink: {
    color: theme.colors.primary.pink,
    fontWeight: '600',
  },
});

export default EnhancedLoginScreen;