'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

interface SupportEngineer {
  _id: string;
  name: string;
  email: string;
  role: string;
  isLead?: boolean;
}

interface AssignedSupportEngineersProps {
  clientId: string;
}

const AssignedSupportEngineers: React.FC<AssignedSupportEngineersProps> = ({ clientId }) => {
  // Fetch assigned support engineers
  const { data: engineers, isLoading, isError } = useQuery({
    queryKey: ['client-engineers', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/clients/${clientId}/engineers`);
      if (!response.ok) {
        throw new Error('Failed to fetch assigned engineers');
      }
      const data = await response.json();
      return data.engineers || [];
    }
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Assigned Support Engineers</h3>
        <div className="text-textSecondary">Loading engineers...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Assigned Support Engineers</h3>
        <div className="text-error">Error loading engineers</div>
      </div>
    );
  }

  if (!engineers || engineers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Assigned Support Engineers</h3>
        <div className="text-textSecondary">No support engineers assigned to this client</div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Assigned Support Engineers</h3>
      <div className="flex flex-wrap gap-4">
        {engineers.map((engineer: SupportEngineer) => (
          <div key={engineer._id} className="bg-white rounded-lg shadow p-4 flex items-center space-x-3 min-w-[200px]">
            <div className="relative w-10 h-10 rounded-full bg-darkerBackground flex items-center justify-center overflow-hidden">
              {/* Use a placeholder avatar or first letter of name */}
              {engineer.name ? (
                <span className="text-lg font-medium">{engineer.name.charAt(0)}</span>
              ) : (
                <Image 
                  src="/images/placeholder-avatar.png" 
                  alt="Avatar" 
                  width={40} 
                  height={40}
                  className="object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
            <div>
              <p className="font-medium text-textPrimary">{engineer.name}</p>
              <p className="text-sm text-textSecondary">
                {engineer.isLead ? 'Lead SE' : 'Support SE'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedSupportEngineers;
