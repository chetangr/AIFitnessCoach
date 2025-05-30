import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { GlassTextField } from '@/components/glass/GlassTextField';
import { GlassButton } from '@/components/glass/GlassButton';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, loginDemo, isLoading, error, clearError } = useAuthStore();
  const { theme } = useThemeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const success = await login({ username: email, password });
    if (success) {
      // Navigation handled by AppNavigator based on auth state
    } else if (error) {
      Alert.alert('Login Failed', error);
      clearError();
    }
  };

  const handleDemoLogin = async () => {
    const success = await loginDemo();
    if (!success && error) {
      Alert.alert('Demo Login Failed', error);
      clearError();
    }
  };

  return (
    <LinearGradient
      colors={theme.colors.background === '#FFFFFF' 
        ? ['#F3F4F6', '#E5E7EB', '#D1D5DB']
        : ['#1F2937', '#111827', '#000000']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <GlassContainer style={styles.logo}>
                  <Text style={styles.logoEmoji}>💪</Text>
                </GlassContainer>
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Welcome Back!
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Sign in to continue your fitness journey
              </Text>
            </View>

            <View style={styles.form}>
              <GlassTextField
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="email-outline"
                error={errors.email}
              />

              <GlassTextField
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                icon="lock-outline"
                error={errors.password}
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={[styles.forgotPasswordText, { color: theme.colors.primary }]}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <GlassButton
                title="Sign In"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
                size="large"
              />

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
                <Text style={[styles.dividerText, { color: theme.colors.textSecondary }]}>
                  OR
                </Text>
                <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              </View>

              <GlassContainer style={styles.demoContainer}>
                <Icon name="information-outline" size={20} color={theme.colors.info} />
                <View style={styles.demoInfo}>
                  <Text style={[styles.demoTitle, { color: theme.colors.text }]}>
                    Demo Account
                  </Text>
                  <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
                    Email: demo@fitness.com
                  </Text>
                  <Text style={[styles.demoText, { color: theme.colors.textSecondary }]}>
                    Password: demo123
                  </Text>
                </View>
              </GlassContainer>

              <GlassButton
                title="Try Demo Account"
                onPress={handleDemoLogin}
                variant="secondary"
                loading={isLoading}
                style={styles.demoButton}
              />
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  demoContainer: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
  },
  demoInfo: {
    marginLeft: 12,
    flex: 1,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
  },
  demoButton: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});