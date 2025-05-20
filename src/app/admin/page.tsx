'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AdminApp from '@/components/admin/AdminApp';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AdminPage() {
  const { user, loading, isAdminOrSE } = useAuth();
  const router = useRouter();

  // Redirect if user is not an admin or solutions engineer
  useEffect(() => {
    if (!loading && user && !isAdminOrSE) {
      router.push('/client');
    } else if (!loading && user) {
      // Redirect to dashboard if at the root admin page
      router.push('/admin/dashboard');
    }
  }, [loading, user, isAdminOrSE, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdminOrSE) {
    return null; // Will be redirected by the useEffect
  }

  return <AdminApp />;
}
