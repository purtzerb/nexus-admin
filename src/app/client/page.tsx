'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ClientApp from '@/components/client/ClientApp';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function ClientPage() {
  const { user, loading, isClientUser } = useAuth();
  const router = useRouter();

  // Redirect if user is not a client user
  useEffect(() => {
    if (!loading && user && !isClientUser) {
      router.push('/admin');
    }
  }, [loading, user, isClientUser, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading client dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isClientUser) {
    return null; // Will be redirected by the useEffect
  }

  return <ClientApp />;
}
