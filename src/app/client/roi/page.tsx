'use client';

import React from 'react';
import Header from '@/components/shared/PageHeader';

export default function ClientROIPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="ROI" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Time Saved</h2>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <span className="text-textSecondary">Last 7 days:</span>
                <span className="font-semibold text-textPrimary">24.5 hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Last 30 days:</span>
                <span className="font-semibold text-textPrimary">98.2 hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Last 90 days:</span>
                <span className="font-semibold text-textPrimary">312.5 hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">All time:</span>
                <span className="font-semibold text-textPrimary">568.7 hrs</span>
              </div>
            </div>
          </div>
          
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Money Saved</h2>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                <span className="text-textSecondary">Last 7 days:</span>
                <span className="font-semibold text-textPrimary">$2,450</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Last 30 days:</span>
                <span className="font-semibold text-textPrimary">$9,820</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Last 90 days:</span>
                <span className="font-semibold text-textPrimary">$31,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">All time:</span>
                <span className="font-semibold text-textPrimary">$56,820</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-textPrimary">ROI by Workflow</h2>
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Executions</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Saved</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Money Saved</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Invoice Processing</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">245</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">122.5 hrs</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$12,250</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Data Entry Automation</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">184</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">92.0 hrs</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$9,200</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Customer Onboarding</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">156</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">78.0 hrs</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$7,800</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Report Generation</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">125</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">62.5 hrs</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$6,250</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
