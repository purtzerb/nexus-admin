'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export default function AdminApp() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Extract the current page name from the pathname
  const currentPage = pathname.split('/').pop() || 'dashboard';
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  const userInfo = {
    name: user?.name || 'Admin User',
    role: user?.role || 'ADMIN',
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{pageTitle} Dashboard</h1>
        {/* The child pages will be rendered here through the Next.js router */}
      </main>
    </div>
  );
}
