'use client';

import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import AdminApp from '@/components/admin/AdminApp';
import ClientApp from '@/components/client/ClientApp';

export default function AppOrchestrator() {
  const { user, loading, error, isAdminOrSE, isClientUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-error mb-4">Authentication Error</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-4 py-2 bg-buttonPrimary text-white rounded-md hover:bg-buttonPrimary/90"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the appropriate app based on role
  if (user) {
    if (isAdminOrSE) {
      return <AdminApp />;
    } else if (isClientUser) {
      return <ClientApp />;
    }
  }

  // This should not happen due to middleware redirects, but as a fallback
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-4">Please log in to access this page.</p>
        <button
          onClick={() => window.location.href = '/login'}
          className="px-4 py-2 bg-buttonPrimary text-white rounded-md hover:bg-buttonPrimary/90"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}
