'use client';

import React from 'react';
import Header from '@/components/shared/PageHeader';

export default function ClientExceptionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Exceptions" />
      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-textPrimary">Workflow Exceptions</h2>
            <div className="flex space-x-2">
              <select className="border border-buttonBorder rounded-md px-3 py-1 text-sm bg-white text-textPrimary">
                <option>All Workflows</option>
                <option>Invoice Processing</option>
                <option>Data Entry</option>
                <option>Customer Onboarding</option>
              </select>
              <select className="border border-buttonBorder rounded-md px-3 py-1 text-sm bg-white text-textPrimary">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exception</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Invoice Processing</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Missing invoice number</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 21, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Unresolved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button>View Details</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Data Entry</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Connection timeout</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 20, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      In Progress
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button>View Details</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Customer Onboarding</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Missing required field</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 18, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Resolved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button>View Details</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Invoice Processing</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Invalid date format</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 17, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Resolved
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button>View Details</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Exceptions Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-textSecondary">Total Exceptions:</span>
                <span className="font-semibold text-textPrimary">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Unresolved:</span>
                <span className="font-semibold text-red-500">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">In Progress:</span>
                <span className="font-semibold text-yellow-500">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Resolved:</span>
                <span className="font-semibold text-green-500">11</span>
              </div>
            </div>
          </div>
          
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Top Exception Types</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-textSecondary">Missing required field:</span>
                <span className="font-semibold text-textPrimary">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Connection timeout:</span>
                <span className="font-semibold text-textPrimary">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Invalid data format:</span>
                <span className="font-semibold text-textPrimary">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">API error:</span>
                <span className="font-semibold text-textPrimary">3</span>
              </div>
            </div>
          </div>
          
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Workflows with Exceptions</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-textSecondary">Invoice Processing:</span>
                <span className="font-semibold text-textPrimary">9</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Data Entry:</span>
                <span className="font-semibold text-textPrimary">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Customer Onboarding:</span>
                <span className="font-semibold text-textPrimary">5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Report Generation:</span>
                <span className="font-semibold text-textPrimary">3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
