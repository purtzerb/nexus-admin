'use client';

import React from 'react';
import Sidebar from '@/components/shared/Sidebar';
import { adminNavItems } from '@/config/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  
  // Show loading state while authenticating
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }
  
  // Use actual user info instead of placeholder
  const userInfo = {
    name: user?.name || 'User',
    role: user?.role || 'Unknown',
  };

  return (
    <div className="flex h-screen">
      <Sidebar navItems={adminNavItems} userInfo={userInfo} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
