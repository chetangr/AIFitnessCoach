import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Share,
  Alert,
} from 'react-native';
import { fileLogger } from '../utils/FileLogger';
import Icon from 'react-native-vector-icons/Ionicons';

const DebugLogScreen = () => {
  const [logs, setLogs] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const loadLogs = async () => {
    try {
      const logContent = await fileLogger.getLogContent();
      setLogs(logContent);
    } catch (error) {
      setLogs('Failed to load logs: ' + error);
    }
  };

  useEffect(() => {
    loadLogs();
    
    // Auto-refresh logs every 2 seconds
    const interval = setInterval(loadLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
  };

  const shareLogs = async () => {
    try {
      const logFile = await fileLogger.shareLogFile();
      if (logFile) {
        const logContent = await fileLogger.getLogContent();
        await Share.share({
          message: logContent,
          title: 'AI Fitness Coach Debug Logs',
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share logs: ' + error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Logs</Text>
        <TouchableOpacity onPress={shareLogs} style={styles.shareButton}>
          <Icon name="share-outline" size={24} color="#4ECDC4" />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4ECDC4"
          />
        }
      >
        <Text style={styles.logText}>{logs || 'No logs yet...'}</Text>
      </ScrollView>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Pull down to refresh • Tap share to export</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  logText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#0f0',
    lineHeight: 18,
  },
  footer: {
    padding: 16,
    backgroundColor: '#2a2a2a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});

export default DebugLogScreen;