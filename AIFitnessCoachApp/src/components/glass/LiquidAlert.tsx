import { Alert, Platform } from 'react-native';

export const showGlassAlert = (
  title: string,
  message: string,
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>
) => {
  Alert.alert(
    title,
    message,
    buttons || [{ text: 'OK', style: 'default' }],
    { cancelable: true }
  );
};

// For compatibility with existing code
export const showAlert = showGlassAlert;