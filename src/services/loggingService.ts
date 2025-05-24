
import { supabase } from "@/integrations/supabase/client";

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warning';
  action: string;
  details: any;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export interface FormLogEntry extends LogEntry {
  formName: string;
  formData?: any;
  validationErrors?: string[];
}

class LoggingService {
  private logBuffer: LogEntry[] = [];
  private formLogBuffer: FormLogEntry[] = [];
  private bucketName = 'cutebaelogs';
  private maxBufferSize = 10;

  constructor() {
    this.initializeBucket();
    // Flush logs every 30 seconds
    setInterval(() => this.flushLogs(), 30000);
  }

  private async initializeBucket() {
    try {
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error } = await supabase.storage.createBucket(this.bucketName, {
          public: false,
          allowedMimeTypes: ['text/plain', 'application/json'],
          fileSizeLimit: 1024 * 1024 // 1MB
        });

        if (error) {
          console.error('Failed to create logging bucket:', error);
        } else {
          console.log('Logging bucket created successfully');
        }
      }
    } catch (error) {
      console.error('Error initializing logging bucket:', error);
    }
  }

  async log(level: LogEntry['level'], action: string, details: any = {}) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: (await supabase.auth.getUser()).data.user?.id
    };

    this.logBuffer.push(logEntry);
    console.log(`[${level.toUpperCase()}] ${action}:`, details);

    if (this.logBuffer.length >= this.maxBufferSize) {
      await this.flushLogs();
    }
  }

  async logForm(formName: string, level: FormLogEntry['level'], action: string, details: any = {}, formData?: any, validationErrors?: string[]) {
    const formLogEntry: FormLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      action,
      details,
      formName,
      formData,
      validationErrors,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: (await supabase.auth.getUser()).data.user?.id
    };

    this.formLogBuffer.push(formLogEntry);
    console.log(`[FORM-${level.toUpperCase()}] ${formName} - ${action}:`, details);

    if (this.formLogBuffer.length >= this.maxBufferSize) {
      await this.flushFormLogs();
    }
  }

  private async flushLogs() {
    if (this.logBuffer.length === 0) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `general/app-logs-${timestamp}.json`;
      
      const logData = JSON.stringify(this.logBuffer, null, 2);
      const blob = new Blob([logData], { type: 'application/json' });

      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, blob);

      if (error) {
        console.error('Failed to upload logs:', error);
      } else {
        console.log(`Logs uploaded successfully: ${fileName}`);
        this.logBuffer = [];
      }
    } catch (error) {
      console.error('Error flushing logs:', error);
    }
  }

  private async flushFormLogs() {
    if (this.formLogBuffer.length === 0) return;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `forms/form-logs-${timestamp}.json`;
      
      const logData = JSON.stringify(this.formLogBuffer, null, 2);
      const blob = new Blob([logData], { type: 'application/json' });

      const { error } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, blob);

      if (error) {
        console.error('Failed to upload form logs:', error);
      } else {
        console.log(`Form logs uploaded successfully: ${fileName}`);
        this.formLogBuffer = [];
      }
    } catch (error) {
      console.error('Error flushing form logs:', error);
    }
  }

  // Convenience methods
  info(action: string, details?: any) {
    return this.log('info', action, details);
  }

  error(action: string, details?: any) {
    return this.log('error', action, details);
  }

  warning(action: string, details?: any) {
    return this.log('warning', action, details);
  }

  // Form-specific methods
  formSuccess(formName: string, action: string, formData?: any) {
    return this.logForm(formName, 'info', action, { status: 'success' }, formData);
  }

  formError(formName: string, action: string, error: any, formData?: any, validationErrors?: string[]) {
    return this.logForm(formName, 'error', action, { status: 'error', error }, formData, validationErrors);
  }

  // Force flush for critical logs
  async forceFlush() {
    await Promise.all([
      this.flushLogs(),
      this.flushFormLogs()
    ]);
  }
}

export const loggingService = new LoggingService();

// Auto-flush logs before page unload
window.addEventListener('beforeunload', () => {
  loggingService.forceFlush();
});
