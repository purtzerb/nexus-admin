'use client';

import React from 'react';
import Header from '@/components/shared/PageHeader';

export default function ClientDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Time Saved</h2>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">24.5 hrs</span>
              <div className="text-sm text-gray-500">Last 7 days</div>
            </div>
          </div>
          
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Money Saved</h2>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">$2,450</span>
              <div className="text-sm text-gray-500">Last 7 days</div>
            </div>
          </div>
          
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Active Workflows</h2>
            <div className="flex justify-between items-center">
              <span className="text-3xl font-bold">12</span>
              <div className="text-sm text-gray-500">View workflows →</div>
            </div>
          </div>
        </div>
        
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Pipeline Progress</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Discovery: Initial Survey</p>
                <p className="text-sm text-gray-500">Completed Jan 15, 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">Discovery: Process deep dive</p>
                <p className="text-sm text-gray-500">Completed Jan 23, 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <div>
                <p className="font-medium">ADA Proposal Sent</p>
                <p className="text-sm text-gray-500">Completed Jan 25, 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-medium">ADA Proposal Review</p>
                <p className="text-sm text-gray-500">In progress</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <div>
                <p className="font-medium">ADA Contract Sent</p>
                <p className="text-sm text-gray-500"></p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <div>
                <p className="font-medium">ADA Contract Signed</p>
                <p className="text-sm text-gray-500"></p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <div>
                <p className="font-medium">Credentials collected</p>
                <p className="text-sm text-gray-500"></p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <div>
                <p className="font-medium">Factory build initiated</p>
                <p className="text-sm text-gray-500"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
