import toast from 'react-hot-toast';

/**
 * Types of toast notifications
 */
export type ToastType = 'success' | 'error' | 'loading' | 'info';

/**
 * Interface for API error responses
 */
export interface ApiErrorResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Show a toast notification
 * @param message Message to display
 * @param type Type of toast notification
 * @param duration Duration in milliseconds (default: 4000)
 * @returns Toast ID
 */
export const showToast = (
  message: string,
  type: ToastType = 'info',
  duration: number = 4000
): string => {
  switch (type) {
    case 'success':
      return toast.success(message, { duration });
    case 'error':
      return toast.error(message, { duration });
    case 'loading':
      return toast.loading(message, { duration });
    case 'info':
    default:
      return toast(message, { duration });
  }
};

/**
 * Handle API error and show appropriate toast notification
 * @param error Error object from API call
 * @param fallbackMessage Fallback message if error doesn't contain a message
 * @returns Toast ID
 */
export const handleApiError = (
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred'
): string => {
  console.error('API Error:', error);
  
  // Try to extract error message from different error types
  let errorMessage = fallbackMessage;
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object') {
    const apiError = error as ApiErrorResponse;
    if (apiError.error) {
      errorMessage = apiError.error;
    } else if (apiError.message) {
      errorMessage = apiError.message;
    }
  }
  
  return showToast(errorMessage, 'error');
};

/**
 * Dismiss a toast notification
 * @param toastId ID of the toast to dismiss
 */
export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId);
};

/**
 * Update an existing toast notification
 * @param toastId ID of the toast to update
 * @param message New message
 * @param type New type
 */
export const updateToast = (
  toastId: string,
  message: string,
  type: ToastType
): void => {
  toast.dismiss(toastId);
  
  switch (type) {
    case 'success':
      toast.success(message, { id: toastId });
      break;
    case 'error':
      toast.error(message, { id: toastId });
      break;
    case 'loading':
      toast.loading(message, { id: toastId });
      break;
    case 'info':
    default:
      toast(message, { id: toastId });
      break;
  }
};
