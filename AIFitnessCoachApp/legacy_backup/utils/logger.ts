import { logger, consoleTransport, configLoggerType } from 'react-native-logs';

const defaultConfig: configLoggerType = {
  severity: __DEV__ ? 'debug' : 'error',
  transport: [consoleTransport],
  transportOptions: {
    colors: {
      info: 'blueBright',
      warn: 'yellowBright',
      error: 'redBright',
      debug: 'magentaBright',
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  enabled: true,
};

// Create the logger instance
const log = logger.createLogger(defaultConfig);

// Create specific loggers for different parts of the app
export const AppLogger = {
  // General app logs
  info: (message: string, ...args: any[]) => {
    log.info(`[APP] ${message}`, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    log.warn(`[APP] ${message}`, ...args);
  },
  
  error: (message: string, error?: any) => {
    log.error(`[APP] ${message}`, error);
  },
  
  debug: (message: string, ...args: any[]) => {
    log.debug(`[APP] ${message}`, ...args);
  },
  
  // UI interaction logs
  ui: (action: string, screen: string, details?: any) => {
    log.info(`[UI] ${action} on ${screen}`, details);
  },
  
  // Navigation logs
  navigation: (from: string, to: string, params?: any) => {
    log.info(`[NAV] ${from} → ${to}`, params);
  },
  
  // API/Network logs
  api: (method: string, endpoint: string, data?: any) => {
    log.info(`[API] ${method} ${endpoint}`, data);
  },
  
  // Workout/Exercise logs
  workout: (action: string, data?: any) => {
    log.info(`[WORKOUT] ${action}`, data);
  },
  
  // AI Coach logs
  aiCoach: (action: string, data?: any) => {
    log.info(`[AI_COACH] ${action}`, data);
  },
  
  // Performance logs
  performance: (metric: string, value: number, unit: string = 'ms') => {
    log.debug(`[PERF] ${metric}: ${value}${unit}`);
  },
  
  // User action logs
  userAction: (action: string, context?: any) => {
    log.info(`[USER] ${action}`, context);
  }
};

export default AppLogger;