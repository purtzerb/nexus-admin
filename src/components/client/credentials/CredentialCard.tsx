'use client';

import React from 'react';
import { ICredential } from '@/models/Credential';
import { Types } from 'mongoose';

interface CredentialCardProps {
  credential: {
    _id: string;
    serviceName: string;
    status: string;
    updatedAt: Date;
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CredentialCard({ credential, onEdit, onDelete }: CredentialCardProps) {
  // Format the date to a readable string
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Determine status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Active
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Not Connected
          </span>
        );
      case 'ERROR_NEEDS_REAUTH':
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Expired
          </span>
        );
      default:
        return (
          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {credential.serviceName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(credential.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        {formatDate(credential.updatedAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
        <button 
          className="mr-2 hover:text-indigo-900" 
          onClick={() => onEdit(credential._id.toString())}
        >
          Edit
        </button>
        <button 
          className="hover:text-red-900 text-red-600" 
          onClick={() => onDelete(credential._id.toString())}
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
