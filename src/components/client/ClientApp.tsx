'use client';

import { useAuth } from '@/hooks/useAuth';

export default function ClientApp() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Nexus Client Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user?.name}</span>
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
        <h2 className="text-2xl font-bold mb-6">Client Dashboard</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="mb-4">Welcome to your Client Dashboard.</p>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p>{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p>{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Notification Preferences</p>
                <p>
                  {user?.notifyByEmailForExceptions ? 'Email notifications enabled' : 'Email notifications disabled'} <br />
                  {user?.notifyBySmsForExceptions ? 'SMS notifications enabled' : 'SMS notifications disabled'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Access Level</p>
                <p>
                  {user?.isClientAdmin ? 'Client Administrator' : 'Standard User'} <br />
                  {user?.hasBillingAccess ? 'Has billing access' : 'No billing access'}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Client Features</h3>
            <ul className="list-disc pl-5">
              <li>View your client-specific data</li>
              <li>Manage your notification preferences</li>
              {user?.isClientAdmin && <li>Manage other users in your organization</li>}
              {user?.hasBillingAccess && <li>Access billing information</li>}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
