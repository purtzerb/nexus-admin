import React from 'react';
import Sidebar from '@/components/shared/Sidebar';
import { adminNavItems } from '@/config/navigation';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This is where you would check for authentication
  // For now, we'll just use a placeholder
  const userInfo = {
    name: 'Admin User',
    role: 'Admin',
  };

  return (
    <div className="flex h-screen">
      <Sidebar navItems={adminNavItems} userInfo={userInfo} />
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
