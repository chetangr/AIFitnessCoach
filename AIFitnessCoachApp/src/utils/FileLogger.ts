import * as FileSystem from 'expo-file-system';

class FileLogger {
  private logFile: string;
  private logQueue: string[] = [];
  private isWriting: boolean = false;
  private isInternalLog: boolean = false;
  private logBuffer: string = '';

  constructor() {
    // Create a unique log file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFile = `${FileSystem.documentDirectory}app-logs-${timestamp}.txt`;
    
    // Initialize log file
    this.initializeLogFile();
  }

  private async initializeLogFile() {
    try {
      await FileSystem.writeAsStringAsync(
        this.logFile,
        `AI Fitness Coach App Logs - ${new Date().toISOString()}\n${'='.repeat(50)}\n\n`,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
      
      // Use internal flag to prevent recursion
      this.isInternalLog = true;
      console.log('📁 Logs are being saved to:', this.logFile);
      this.isInternalLog = false;
    } catch (error) {
      // Don't log errors to prevent recursion
    }
  }

  private async appendToFile(message: string) {
    try {
      // Read existing content
      let existingContent = '';
      try {
        existingContent = await FileSystem.readAsStringAsync(this.logFile);
      } catch {
        // File might not exist yet
      }
      
      // Write back with new content appended
      await FileSystem.writeAsStringAsync(
        this.logFile,
        existingContent + message,
        { encoding: FileSystem.EncodingType.UTF8 }
      );
    } catch (error) {
      // Don't log errors to prevent recursion
    }
  }

  private async writeToFile(message: string) {
    if (this.isWriting) {
      this.logQueue.push(message);
      return;
    }

    this.isWriting = true;
    
    try {
      // Batch write to reduce file operations
      this.logBuffer += message;
      
      // Process queued messages
      while (this.logQueue.length > 0) {
        const queuedMessage = this.logQueue.shift()!;
        this.logBuffer += queuedMessage;
      }
      
      // Write all buffered content at once
      if (this.logBuffer.length > 0) {
        await this.appendToFile(this.logBuffer);
        this.logBuffer = '';
      }
    } catch (error) {
      // Don't log errors to prevent recursion
    } finally {
      this.isWriting = false;
    }
  }

  log(level: string, ...args: any[]) {
    // Prevent logging internal FileLogger operations
    if (this.isInternalLog) {
      return;
    }

    const timestamp = new Date().toISOString();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    // Write to file asynchronously
    this.writeToFile(logEntry);
  }

  async getLogContent(): Promise<string> {
    try {
      // Flush any pending logs first
      if (this.logBuffer.length > 0) {
        await this.appendToFile(this.logBuffer);
        this.logBuffer = '';
      }
      return await FileSystem.readAsStringAsync(this.logFile);
    } catch (error) {
      return 'Failed to read log file: ' + error;
    }
  }

  async shareLogFile() {
    try {
      // Get the log content
      const content = await this.getLogContent();
      
      // Create a shareable file
      const shareFile = `${FileSystem.cacheDirectory}app-debug-logs.txt`;
      await FileSystem.writeAsStringAsync(shareFile, content);
      
      this.isInternalLog = true;
      console.log('📤 Log file ready for sharing:', shareFile);
      this.isInternalLog = false;
      return shareFile;
    } catch (error) {
      return null;
    }
  }
}

// Create singleton instance
export const fileLogger = new FileLogger();

// Store original console methods
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;
const originalInfo = console.info;

// Override console methods to also save to file
console.log = (...args: any[]) => {
  originalLog(...args);
  fileLogger.log('INFO', ...args);
};

console.error = (...args: any[]) => {
  originalError(...args);
  fileLogger.log('ERROR', ...args);
};

console.warn = (...args: any[]) => {
  originalWarn(...args);
  fileLogger.log('WARN', ...args);
};

console.info = (...args: any[]) => {
  originalInfo(...args);
  fileLogger.log('INFO', ...args);
};

// Export a function to restore original console if needed
export const restoreConsole = () => {
  console.log = originalLog;
  console.error = originalError;
  console.warn = originalWarn;
  console.info = originalInfo;
};