
import { useCallback } from 'react';
import { loggingService } from '@/services/loggingService';

export const useLogging = () => {
  const logInfo = useCallback((action: string, details?: any) => {
    loggingService.info(action, details);
  }, []);

  const logError = useCallback((action: string, details?: any) => {
    loggingService.error(action, details);
  }, []);

  const logWarning = useCallback((action: string, details?: any) => {
    loggingService.warning(action, details);
  }, []);

  const logFormSuccess = useCallback((formName: string, action: string, formData?: any) => {
    loggingService.formSuccess(formName, action, formData);
  }, []);

  const logFormError = useCallback((formName: string, action: string, error: any, formData?: any, validationErrors?: string[]) => {
    loggingService.formError(formName, action, error, formData, validationErrors);
  }, []);

  return {
    logInfo,
    logError,
    logWarning,
    logFormSuccess,
    logFormError,
  };
};
