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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

const { width } = Dimensions.get('window');

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { register, isLoading, error, clearError } = useAuthStore();
  const { theme } = useThemeStore();

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const success = await register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    if (success) {
      // Navigation handled by AppNavigator based on auth state
    } else if (error) {
      Alert.alert('Registration Failed', error);
      clearError();
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <GlassContainer style={styles.logo}>
                  <Text style={styles.logoEmoji}>🎯</Text>
                </GlassContainer>
              </View>
              <Text style={[styles.title, { color: theme.colors.text }]}>
                Create Account
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Start your fitness journey today
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <GlassTextField
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    onChangeText={(value) => updateField('firstName', value)}
                    icon="account-outline"
                  />
                </View>
                <View style={styles.nameField}>
                  <GlassTextField
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChangeText={(value) => updateField('lastName', value)}
                  />
                </View>
              </View>

              <GlassTextField
                label="Email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="email-outline"
                error={errors.email}
              />

              <GlassTextField
                label="Username"
                placeholder="johndoe"
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                autoCapitalize="none"
                icon="at"
                error={errors.username}
              />

              <GlassTextField
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                secureTextEntry
                icon="lock-outline"
                error={errors.password}
              />

              <GlassTextField
                label="Confirm Password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                secureTextEntry
                icon="lock-check-outline"
                error={errors.confirmPassword}
              />

              <GlassButton
                title="Create Account"
                onPress={handleRegister}
                loading={isLoading}
                style={styles.registerButton}
                size="large"
              />

              <View style={styles.termsContainer}>
                <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                  By creating an account, you agree to our{' '}
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                    Terms of Service
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.termsText, { color: theme.colors.textSecondary }]}>
                  {' '}and{' '}
                </Text>
                <TouchableOpacity>
                  <Text style={[styles.termsLink, { color: theme.colors.primary }]}>
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
                  Sign In
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
  backButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 40,
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
  nameRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
  },
  nameField: {
    flex: 1,
    paddingHorizontal: 8,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  termsText: {
    fontSize: 12,
  },
  termsLink: {
    fontSize: 12,
    fontWeight: '600',
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
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});