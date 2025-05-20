'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AdminApp() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Nexus Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.name} ({user?.role})</span>
            <button 
              onClick={logout}
              className="px-3 py-1 bg-buttonPrimary text-white rounded-md hover:bg-buttonPrimary/90"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">Welcome to the Admin Dashboard for {user?.role === 'ADMIN' ? 'Administrators' : 'Solutions Engineers'}.</p>
          
          {user?.role === 'ADMIN' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Admin Features</h3>
              <ul className="list-disc pl-5 mb-4">
                <li>Manage all clients</li>
                <li>Manage all users (including other admins and solutions engineers)</li>
                <li>View system-wide analytics</li>
              </ul>
            </div>
          )}
          
          {user?.role === 'SOLUTIONS_ENGINEER' && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Solutions Engineer Features</h3>
              <ul className="list-disc pl-5 mb-4">
                <li>Manage assigned clients</li>
                <li>Manage client users for assigned clients</li>
                <li>View client-specific analytics</li>
              </ul>
              
              {user?.assignedClientIds && user.assignedClientIds.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-semibold mb-2">Your Assigned Clients</h4>
                  <p className="text-sm text-gray-600">You have {user.assignedClientIds.length} assigned clients</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
