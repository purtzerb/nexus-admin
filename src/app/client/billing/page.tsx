'use client';

import React from 'react';
import Header from '@/components/shared/PageHeader';

export default function ClientBillingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Billing" />
      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-textPrimary">Subscription Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-textSecondary">Current Plan</h3>
                <p className="text-base font-semibold text-textPrimary">Enterprise Plan</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-textSecondary">Billing Cycle</h3>
                <p className="text-base font-semibold text-textPrimary">Monthly</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-textSecondary">Next Billing Date</h3>
                <p className="text-base font-semibold text-textPrimary">June 15, 2025</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-textSecondary">Monthly Fee</h3>
                <p className="text-base font-semibold text-textPrimary">$2,500.00</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-textSecondary">Additional Costs</h3>
                <p className="text-base font-semibold text-textPrimary">$0.00</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-textSecondary">Contract End Date</h3>
                <p className="text-base font-semibold text-textPrimary">May 15, 2026</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex">
            <button className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors text-sm mr-3">
              Manage Subscription
            </button>
            <button className="px-4 py-2 border border-buttonBorder rounded hover:bg-darkerBackground transition-colors text-sm">
              View Contract
            </button>
          </div>
        </div>
        
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-textPrimary">Billing History</h2>
            <div>
              <button className="px-4 py-2 border border-buttonBorder rounded hover:bg-darkerBackground transition-colors text-sm">
                Export History
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">INV-2025-0512</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 15, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,500.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">View</button>
                    <button>Download</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">INV-2025-0415</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">April 15, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,500.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">View</button>
                    <button>Download</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">INV-2025-0315</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">March 15, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,500.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">View</button>
                    <button>Download</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">INV-2025-0215</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">February 15, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$2,500.00</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Paid
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">View</button>
                    <button>Download</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-textPrimary">Payment Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-textPrimary">Credit Card</h3>
                  <p className="text-textSecondary text-sm mt-1">VISA ending in 4242</p>
                  <p className="text-textSecondary text-sm">Expires 12/27</p>
                </div>
                <div className="flex items-start">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                    Default
                  </span>
                </div>
              </div>
              <div className="mt-4 flex">
                <button className="text-indigo-600 hover:text-indigo-900 text-sm mr-3">Edit</button>
                <button className="text-indigo-600 hover:text-indigo-900 text-sm">Remove</button>
              </div>
            </div>
            <div className="border rounded-lg p-4 border-dashed flex items-center justify-center">
              <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Payment Method
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
