'use client';

import React from 'react';
import Header from '@/components/shared/PageHeader';

export default function ClientUsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Users" />
      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-textPrimary">Organization Users</h2>
            <div>
              <button className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors text-sm">
                Add User
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">JD</div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">John Doe</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">john.doe@example.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Admin</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 21, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">Edit</button>
                    <button>Deactivate</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">JS</div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">jane.smith@example.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">User</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 20, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">Edit</button>
                    <button>Deactivate</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">RJ</div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Robert Johnson</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">robert.johnson@example.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">User</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Invited
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">Resend</button>
                    <button>Cancel</button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">MD</div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Maria Davis</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">maria.davis@example.com</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Read Only</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Inactive
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">May 5, 2025</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 hover:text-indigo-900">
                    <button className="mr-2">Edit</button>
                    <button>Activate</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-textPrimary">User Permissions</h2>
          <p className="text-textSecondary mb-6">
            Configure default permissions for user roles in your organization.  
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-textPrimary mb-2">Admin</h3>
              <ul className="text-textSecondary text-sm space-y-1">
                <li>• Full access to all workflows</li>
                <li>• Can add and manage users</li>
                <li>• Can view and modify billing</li>
                <li>• Can manage credentials</li>
                <li>• Can view and resolve exceptions</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-textPrimary mb-2">User</h3>
              <ul className="text-textSecondary text-sm space-y-1">
                <li>• Can view and run workflows</li>
                <li>• Can view assigned reports</li>
                <li>• Can report exceptions</li>
                <li>• Cannot view billing</li>
                <li>• Limited credential access</li>
              </ul>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium text-textPrimary mb-2">Read Only</h3>
              <ul className="text-textSecondary text-sm space-y-1">
                <li>• Can view workflows (not run)</li>
                <li>• Can view assigned reports</li>
                <li>• Cannot report exceptions</li>
                <li>• Cannot view billing</li>
                <li>• No credential access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
