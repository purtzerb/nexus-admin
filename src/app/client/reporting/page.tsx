'use client';

import React from 'react';
import Header from '@/components/shared/PageHeader';

export default function ClientReportingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Reporting" />
      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-textPrimary">Available Reports</h2>
            <div className="flex space-x-2">
              <select className="border border-buttonBorder rounded-md px-3 py-1 text-sm bg-white text-textPrimary">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
                <option>All time</option>
              </select>
              <button className="px-3 py-1 bg-buttonPrimary text-white rounded-md hover:bg-opacity-90 transition-colors text-sm">
                Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Generated</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Workflow Performance</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Summary of all workflow executions and their performance metrics</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 21, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">View</button>
                    <button>Download</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Cost Savings Analysis</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Detailed breakdown of time and money saved by automation</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 18, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">View</button>
                    <button>Download</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Exception Analytics</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Analysis of workflow exceptions and their resolution times</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 15, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">View</button>
                    <button>Download</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Usage Statistics</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Detailed usage metrics across all workflows and integrations</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 10, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">View</button>
                    <button>Download</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Report Schedules</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="font-medium text-textPrimary">Weekly Performance Report</h3>
                  <p className="text-sm text-textSecondary">Every Monday at 8:00 AM</p>
                </div>
                <div>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="font-medium text-textPrimary">Monthly ROI Report</h3>
                  <p className="text-sm text-textSecondary">1st of every month at 9:00 AM</p>
                </div>
                <div>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <h3 className="font-medium text-textPrimary">Quarterly Business Review</h3>
                  <p className="text-sm text-textSecondary">Last day of quarter at 2:00 PM</p>
                </div>
                <div>
                  <button className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors text-sm">
                Create New Schedule
              </button>
            </div>
          </div>
          
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-textPrimary">Custom Reports</h2>
            <p className="text-textSecondary mb-4">
              Build custom reports with specific metrics and data points relevant to your business needs.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="workflows" className="rounded" />
                <label htmlFor="workflows" className="text-textPrimary">Workflow Data</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="exceptions" className="rounded" />
                <label htmlFor="exceptions" className="text-textPrimary">Exception Data</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="savings" className="rounded" />
                <label htmlFor="savings" className="text-textPrimary">Cost Savings</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="usage" className="rounded" />
                <label htmlFor="usage" className="text-textPrimary">Usage Statistics</label>
              </div>
            </div>
            <div className="mt-4">
              <button className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors text-sm">
                Generate Custom Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
