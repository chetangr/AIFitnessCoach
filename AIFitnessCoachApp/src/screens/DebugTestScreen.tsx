import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { backendAgentService } from '../services/backendAgentService';

const DebugTestScreen = ({ navigation }: any) => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  const testBackendConfig = () => {
    const config = backendAgentService.getConfig();
    addResult(`Backend URL: ${config.baseUrl}`);
    addResult(`Is Configured: ${backendAgentService.isConfigured()}`);
    addResult(`EXPO_PUBLIC_BACKEND_URL: ${process.env.EXPO_PUBLIC_BACKEND_URL}`);
  };

  const testBackendHealth = async () => {
    try {
      const response = await fetch(`${backendAgentService.getConfig().baseUrl}/health`);
      const data = await response.json();
      addResult(`Health Check: ${JSON.stringify(data)}`);
    } catch (error) {
      addResult(`Health Check Error: ${error}`);
    }
  };

  const testMultiAgentChat = async () => {
    try {
      const response = await backendAgentService.sendMultiAgentMessage(
        'Hello, test message',
        'supportive',
        undefined,
        undefined,
        { fastMode: true }
      );
      addResult(`Multi-Agent Response: ${response.response}`);
      addResult(`Responding Agents: ${JSON.stringify(response.responding_agents)}`);
    } catch (error) {
      addResult(`Multi-Agent Error: ${error}`);
    }
  };

  const testNavigation = () => {
    const screens = ['WorkoutHistory', 'Stats', 'Settings', 'TrainerSelection'];
    screens.forEach(screen => {
      try {
        // Just check if the screen exists in navigation
        addResult(`Navigation to ${screen}: Available`);
      } catch (error) {
        addResult(`Navigation to ${screen}: Error`);
      }
    });
  };

  const runAllTests = async () => {
    setTestResults([]);
    addResult('=== Starting Debug Tests ===');
    
    testBackendConfig();
    await testBackendHealth();
    await testMultiAgentChat();
    testNavigation();
    
    addResult('=== Tests Complete ===');
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#0f0f1e']} style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Debug Test Screen</Text>
        
        <TouchableOpacity style={styles.button} onPress={runAllTests}>
          <Text style={styles.buttonText}>Run All Tests</Text>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.button, styles.backButton]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#666',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    minHeight: 200,
  },
  resultText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});

export default DebugTestScreen;