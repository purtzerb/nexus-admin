'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function HomeRedirect() {
  const { user, loading, error, isAdminOrSE, isClientUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect based on user role
      if (isAdminOrSE) {
        router.push('/admin/dashboard');
      } else if (isClientUser) {
        router.push('/client/dashboard');
      }
    }
  }, [user, loading, isAdminOrSE, isClientUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading...</p>
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
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-buttonPrimary text-white rounded-md hover:bg-buttonPrimary/90"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show login message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please log in to access this page.</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-buttonPrimary text-white rounded-md hover:bg-buttonPrimary/90"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // This is a fallback that should rarely be seen as the useEffect should handle redirects
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
