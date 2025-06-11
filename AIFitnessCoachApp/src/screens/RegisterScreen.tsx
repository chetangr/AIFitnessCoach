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
import { LiquidGlassView, LiquidButton, LiquidCard, LiquidInput } from '../components/glass';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

const { width: screenWidth } = Dimensions.get('window');

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const { theme } = useThemeStore();
  const { colors } = theme;
  const progress = (currentStep / totalSteps) * 100;
  const animatedProgress = useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);
  
  return (
    <LiquidGlassView intensity={10} style={styles.stepIndicator}>
      <View style={styles.stepBar}>
        <Animated.View
          style={[
            styles.stepProgress,
            {
              width: animatedProgress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: colors.primary.main,
            },
          ]}
        />
      </View>
      <Text style={[styles.stepText, { color: colors.text }]}>
        Step {currentStep} of {totalSteps}
      </Text>
    </LiquidGlassView>
  );
};

export default function LiquidRegisterScreen() {
  const navigation = useNavigation();
  const { theme } = useThemeStore();
  const { colors } = theme;
  const { signUp } = useAuthStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!email || !password || !confirmPassword) {
          Alert.alert('Error', 'Please fill in all fields');
          return false;
        }
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return false;
        }
        if (password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters');
          return false;
        }
        return true;
      case 2:
        if (!name) {
          Alert.alert('Error', 'Please enter your name');
          return false;
        }
        return true;
      case 3:
        if (!age || !weight || !height) {
          Alert.alert('Error', 'Please fill in all fields');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < 4) {
        fadeAnimation.setValue(0);
        slideAnimation.setValue(50);
        setCurrentStep(currentStep + 1);
      } else {
        handleRegister();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      fadeAnimation.setValue(0);
      slideAnimation.setValue(-50);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await signUp({
        email,
        password,
        name,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        fitnessGoal,
      });
      // Navigation handled by auth store
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const fitnessGoals = [
    { id: 'weight_loss', label: 'Lose Weight', icon: 'trending-down' },
    { id: 'muscle_gain', label: 'Build Muscle', icon: 'trending-up' },
    { id: 'endurance', label: 'Improve Endurance', icon: 'fitness' },
    { id: 'strength', label: 'Increase Strength', icon: 'barbell' },
    { id: 'general', label: 'General Fitness', icon: 'heart' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View
            style={[
              styles.stepContent,
              {
                opacity: fadeAnimation,
                transform: [{ translateX: slideAnimation }],
              },
            ]}
          >
            <Text style={[styles.stepTitle, { color: colors.text }]}>Create Your Account</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Email</Text>
              <LiquidGlassView intensity={10} style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={colors.text + '60'} style={styles.inputIcon} />
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
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Password</Text>
              <LiquidGlassView intensity={10} style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text + '60'} style={styles.inputIcon} />
                <LiquidInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={colors.text + '60'} />
                </TouchableOpacity>
              </LiquidGlassView>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Confirm Password</Text>
              <LiquidGlassView intensity={10} style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.text + '60'} style={styles.inputIcon} />
                <LiquidInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                />
              </LiquidGlassView>
            </View>
          </Animated.View>
        );
        
      case 2:
        return (
          <Animated.View
            style={[
              styles.stepContent,
              {
                opacity: fadeAnimation,
                transform: [{ translateX: slideAnimation }],
              },
            ]}
          >
            <Text style={[styles.stepTitle, { color: colors.text }]}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Full Name</Text>
              <LiquidGlassView intensity={10} style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={colors.text + '60'} style={styles.inputIcon} />
                <LiquidInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  style={styles.input}
                />
              </LiquidGlassView>
            </View>
          </Animated.View>
        );
        
      case 3:
        return (
          <Animated.View
            style={[
              styles.stepContent,
              {
                opacity: fadeAnimation,
                transform: [{ translateX: slideAnimation }],
              },
            ]}
          >
            <Text style={[styles.stepTitle, { color: colors.text }]}>Physical Stats</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Age</Text>
              <LiquidGlassView intensity={10} style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={colors.text + '60'} style={styles.inputIcon} />
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="Your age"
                  placeholderTextColor={colors.text + '40'}
                  keyboardType="numeric"
                  style={[styles.input, { color: colors.text }]}
                />
              </LiquidGlassView>
            </View>
            
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Weight (kg)</Text>
                <LiquidGlassView intensity={10} style={styles.inputContainer}>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    placeholder="70"
                    placeholderTextColor={colors.text + '40'}
                    keyboardType="numeric"
                    style={[styles.input, { color: colors.text }]}
                  />
                </LiquidGlassView>
              </View>
              
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text + '80' }]}>Height (cm)</Text>
                <LiquidGlassView intensity={10} style={styles.inputContainer}>
                  <TextInput
                    value={height}
                    onChangeText={setHeight}
                    placeholder="175"
                    placeholderTextColor={colors.text + '40'}
                    keyboardType="numeric"
                    style={[styles.input, { color: colors.text }]}
                  />
                </LiquidGlassView>
              </View>
            </View>
          </Animated.View>
        );
        
      case 4:
        return (
          <Animated.View
            style={[
              styles.stepContent,
              {
                opacity: fadeAnimation,
                transform: [{ translateX: slideAnimation }],
              },
            ]}
          >
            <Text style={[styles.stepTitle, { color: colors.text }]}>Fitness Goals</Text>
            <Text style={[styles.stepSubtitle, { color: colors.text + '80' }]}>
              What would you like to achieve?
            </Text>
            
            <View style={styles.goalsGrid}>
              {fitnessGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => setFitnessGoal(goal.id)}
                >
                  <LiquidGlassView
                    intensity={fitnessGoal === goal.id ? 85 : 10}
                    style={[
                      styles.goalCard,
                      fitnessGoal === goal.id && styles.selectedGoalCard,
                    ] as any}
                  >
                    <Ionicons
                      name={goal.icon as any}
                      size={32}
                      color={fitnessGoal === goal.id ? colors.primary.main : colors.text + '80'}
                    />
                    <Text
                      style={[
                        styles.goalText,
                        { color: fitnessGoal === goal.id ? colors.primary.main : colors.text },
                      ]}
                    >
                      {goal.label}
                    </Text>
                  </LiquidGlassView>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );
    }
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
          {/* Header */}
          <View style={styles.header}>
            {currentStep > 1 && (
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} totalSteps={4} />
          
          {/* Form Card */}
          <LiquidCard style={styles.formCard}>
            {renderStep()}
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <LiquidButton
                label={currentStep === 4 ? 'Complete Registration' : 'Continue'}
                onPress={handleNext}
                style={styles.continueButton}
                loading={isLoading}
              />
            </View>
          </LiquidCard>
          
          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.text + '80' }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Text style={[styles.loginLink, { color: colors.primary.main }]}> Sign In</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  stepIndicator: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
  },
  stepBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  stepProgress: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 14,
    textAlign: 'center',
  },
  formCard: {
    marginHorizontal: 20,
    padding: 24,
    marginBottom: 24,
  },
  stepContent: {
    minHeight: 300,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
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
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: 56,
    justifyContent: 'center',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  goalCard: {
    width: (screenWidth - 88) / 2,
    margin: 8,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedGoalCard: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  goalText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '600',
  },
});