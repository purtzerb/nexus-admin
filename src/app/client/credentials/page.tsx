'use client';

import React from 'react';
import Header from '@/components/shared/PageHeader';

export default function ClientCredentialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Credentials" />
      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-textPrimary">Manage Your Credentials</h2>
          <p className="text-textSecondary mb-6">
            Securely store and manage credentials needed for your workflows.
          </p>
          
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">SAP ERP</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Feb 12, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Salesforce</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jan 28, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oracle Database</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Expiring
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mar 1, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Google Workspace</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Expired
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Dec 15, 2024</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">Edit</button>
                    <button>Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <button className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors">
              Add New Credential
            </button>
          </div>
        </div>
        
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-textPrimary">Credential Usage</h2>
          <p className="text-textSecondary mb-6">
            Systems that are using your credentials for workflow automation.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-textPrimary">Invoice Processing</h3>
              <p className="text-textSecondary text-sm mt-1">Using: SAP ERP, Oracle Database</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-textPrimary">Customer Onboarding</h3>
              <p className="text-textSecondary text-sm mt-1">Using: Salesforce, Google Workspace</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-textPrimary">Report Generation</h3>
              <p className="text-textSecondary text-sm mt-1">Using: Oracle Database</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
