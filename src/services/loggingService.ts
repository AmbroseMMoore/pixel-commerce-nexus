
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
  private isEnabled = false; // Disabled to prevent bucket errors

  constructor() {
    // Commenting out initialization to prevent bucket creation errors
    // this.initializeBucket();
    // setInterval(() => this.flushLogs(), 30000);
  }

  private async initializeBucket() {
    // Disabled to prevent "Bucket not found" errors
    return;
  }

  async log(level: LogEntry['level'], action: string, details: any = {}) {
    if (!this.isEnabled) {
      // Just console.log without trying to store in Supabase
      console.log(`[${level.toUpperCase()}] ${action}:`, details);
      return;
    }

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
    if (!this.isEnabled) {
      // Just console.log without trying to store in Supabase
      console.log(`[FORM-${level.toUpperCase()}] ${formName} - ${action}:`, details);
      return;
    }

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
    if (!this.isEnabled || this.logBuffer.length === 0) return;
    // Disabled to prevent storage errors
    this.logBuffer = [];
  }

  private async flushFormLogs() {
    if (!this.isEnabled || this.formLogBuffer.length === 0) return;
    // Disabled to prevent storage errors
    this.formLogBuffer = [];
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
    if (!this.isEnabled) return;
    await Promise.all([
      this.flushLogs(),
      this.flushFormLogs()
    ]);
  }
}

export const loggingService = new LoggingService();

// Auto-flush logs before page unload - disabled to prevent errors
// window.addEventListener('beforeunload', () => {
//   loggingService.forceFlush();
// });
