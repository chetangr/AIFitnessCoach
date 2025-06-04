import { Platform } from 'react-native';

export const BOTTOM_TAB_HEIGHT = Platform.OS === 'ios' ? 90 : 80;
export const SAFE_BOTTOM_PADDING = BOTTOM_TAB_HEIGHT + 10; // Extra 10px for safety