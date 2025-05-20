'use client';

import React from 'react';
import { Toaster } from 'react-hot-toast';

/**
 * Toast provider component that wraps the application to provide toast notifications
 */
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: '#FFFFFF',
            color: '#141417',
            border: '1px solid #E9E7E4',
            padding: '16px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          },
          // Custom styling for success toasts
          success: {
            style: {
              background: '#F0FBF8',
              border: '1px solid #1D8560',
            },
            iconTheme: {
              primary: '#1D8560',
              secondary: '#FFFFFF',
            },
          },
          // Custom styling for error toasts
          error: {
            style: {
              background: '#FEF2F2',
              border: '1px solid #CE4343',
            },
            iconTheme: {
              primary: '#CE4343',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
