# Notification Rules

## Toast Notifications

All toast notifications in the application must follow these guidelines:

1. **Use the central toast utilities**
   - Always import and use the utility functions from `@/lib/toast/toastUtils.ts`
   - Never use the react-hot-toast library directly in components except for dismissing toasts
   - Follow the established patterns for showing, updating, and dismissing toasts

2. **Notification Types**
   - **Success**: Use for successful operations (green)
   - **Error**: Use for errors and failures (red)
   - **Loading**: Use for operations in progress (neutral)
   - **Info**: Use for general information (neutral)

3. **API Error Handling Pattern**
   ```typescript
   // Show loading toast when operation starts
   const loadingToastId = showToast('Operation in progress...', 'loading');
   
   try {
     // Perform API operation
     const response = await fetch('/api/endpoint');
     
     if (!response.ok) {
       const errorData = await response.json();
       throw new Error(errorData.error || 'Default error message');
     }
     
     // Dismiss loading toast and show success toast
     toast.dismiss(loadingToastId);
     showToast('Operation completed successfully!', 'success');
     
     // Additional success handling
   } catch (error) {
     // Dismiss loading toast and show error toast
     toast.dismiss(loadingToastId);
     handleApiError(error, 'Default error message');
     
     // Additional error handling
   }
   ```

4. **Message Guidelines**
   - Keep messages concise and clear (ideally under 80 characters)
   - Include specific details about the operation when possible
   - For errors, provide actionable information when available
   - Use consistent terminology across the application

5. **Duration Guidelines**
   - Success notifications: 3-4 seconds
   - Error notifications: 5-6 seconds (longer to ensure users see them)
   - Loading notifications: Indefinite (must be manually dismissed)
   - Info notifications: 3-4 seconds

6. **Accessibility Considerations**
   - Ensure notifications have sufficient color contrast
   - Don't rely solely on color to convey information
   - Critical errors should remain visible until dismissed by the user
   - Avoid showing multiple notifications simultaneously when possible

7. **Toast Placement**
   - All toasts appear in the top-right corner of the screen
   - Toasts should not obscure critical UI elements or forms

By following these guidelines, we ensure a consistent and user-friendly notification experience throughout the application.
