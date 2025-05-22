'use client';

import React, { useState, useEffect } from 'react';
import { 
  CredentialData, 
  SlackCredentials,
  GitHubCredentials,
  JiraCredentials,
  SalesforceCredentials,
  AWSCredentials
} from '@/models/Credential';

interface CredentialFormProps {
  credentialId: string;
  serviceName: string;
  status: string;
  currentCredentials: CredentialData;
  onSave: (id: string, serviceName: string, credentials: CredentialData) => Promise<void>;
}

export default function CredentialForm({ 
  credentialId, 
  serviceName, 
  status,
  currentCredentials, 
  onSave
}: CredentialFormProps) {
  // Initialize empty data objects for each type
  const emptySlackData: SlackCredentials = { workspaceUrl: '', botUserOAuthToken: '', signingSecret: '' };
  const emptyGitHubData: GitHubCredentials = { personalAccessToken: '', owner: '', repository: '' };
  const emptyJiraData: JiraCredentials = { domain: '', email: '', apiToken: '' };
  const emptySalesforceData: SalesforceCredentials = { instanceUrl: '', clientId: '', clientSecret: '', username: '', password: '' };
  const emptyAWSData: AWSCredentials = { accessKeyId: '', secretAccessKey: '', region: '' };

  const [credentials, setCredentials] = useState<CredentialData>(currentCredentials);
  const [isSaving, setIsSaving] = useState(false);
  
  // Update credentials when currentCredentials or serviceName changes
  useEffect(() => {
    // Initialize credentials based on the current service type
    if (serviceName) {
      let updatedCredentials: CredentialData;
      
      // Create properly typed credentials object
      switch(serviceName) {
        case 'Slack':
          updatedCredentials = { 
            type: 'Slack' as const, 
            data: (currentCredentials?.data as SlackCredentials) || emptySlackData
          };
          break;
        case 'GitHub':
          updatedCredentials = { 
            type: 'GitHub' as const, 
            data: (currentCredentials?.data as GitHubCredentials) || emptyGitHubData
          };
          break;
        case 'Jira':
          updatedCredentials = { 
            type: 'Jira' as const, 
            data: (currentCredentials?.data as JiraCredentials) || emptyJiraData
          };
          break;
        case 'Salesforce':
          updatedCredentials = { 
            type: 'Salesforce' as const, 
            data: (currentCredentials?.data as SalesforceCredentials) || emptySalesforceData
          };
          break;
        case 'AWS':
          updatedCredentials = { 
            type: 'AWS' as const, 
            data: (currentCredentials?.data as AWSCredentials) || emptyAWSData
          };
          break;
        default:
          return;
      }
      
      setCredentials(updatedCredentials);
    }
  }, [currentCredentials, serviceName]);

  const handleInputChange = (field: string, value: string) => {
    const updatedCredentials = { ...credentials };
    
    // Make sure data exists
    if (!updatedCredentials.data) {
      updatedCredentials.data = {} as any;
    }
    
    // Handle nested fields in the data object
    updatedCredentials.data = {
      ...updatedCredentials.data,
      [field]: value
    };
    
    setCredentials(updatedCredentials);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(credentialId, serviceName, credentials);
    } catch (error) {
      console.error('Error saving credentials:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Determine status badge
  const getStatusBadge = () => {
    if (status === 'CONNECTED') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Connected
        </span>
      );
    } else if (status === 'DISCONNECTED') {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
          Not Connected
        </span>
      );
    } else {
      return (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Error
        </span>
      );
    }
  };

  // Render different form fields based on the service type
  const renderFormFields = () => {
    // Make sure we're using the service name as the type
    const serviceType = serviceName;
    
    switch (serviceType) {
      case 'Slack':
        const slackData = (credentials.data as SlackCredentials) || emptySlackData;
        return (
          <>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Workspace URL
              </label>
              <input
                type="text"
                value={slackData.workspaceUrl || ''}
                onChange={(e) => handleInputChange('workspaceUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="https://your-workspace.slack.com"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Bot User OAuth Token
              </label>
              <input
                type="password"
                value={slackData.botUserOAuthToken || ''}
                onChange={(e) => handleInputChange('botUserOAuthToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="xoxb-************"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Signing Secret
              </label>
              <input
                type="password"
                value={slackData.signingSecret || ''}
                onChange={(e) => handleInputChange('signingSecret', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="********"
                autoComplete="off"
              />
            </div>
          </>
        );
        
      case 'GitHub':
        const githubData = (credentials.data as GitHubCredentials) || emptyGitHubData;
        return (
          <>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Personal Access Token
              </label>
              <input
                type="password"
                value={githubData.personalAccessToken || ''}
                onChange={(e) => handleInputChange('personalAccessToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="ghp_************"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Owner (User or Organization)
              </label>
              <input
                type="text"
                value={githubData.owner || ''}
                onChange={(e) => handleInputChange('owner', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="github-username-or-org"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Repository (optional)
              </label>
              <input
                type="text"
                value={githubData.repository || ''}
                onChange={(e) => handleInputChange('repository', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="repository-name"
                autoComplete="off"
              />
            </div>
          </>
        );
        
      case 'Jira':
        const jiraData = (credentials.data as JiraCredentials) || emptyJiraData;
        return (
          <>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Domain
              </label>
              <input
                type="text"
                value={jiraData.domain || ''}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="your-domain.atlassian.net"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={jiraData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="your-email@example.com"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                API Token
              </label>
              <input
                type="password"
                value={jiraData.apiToken || ''}
                onChange={(e) => handleInputChange('apiToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="********"
                autoComplete="off"
              />
            </div>
          </>
        );
        
      case 'Salesforce':
        const salesforceData = (credentials.data as SalesforceCredentials) || emptySalesforceData;
        return (
          <>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Instance URL
              </label>
              <input
                type="text"
                value={salesforceData.instanceUrl || ''}
                onChange={(e) => handleInputChange('instanceUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="https://yourinstance.salesforce.com"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Client ID
              </label>
              <input
                type="text"
                value={salesforceData.clientId || ''}
                onChange={(e) => handleInputChange('clientId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="Salesforce Client ID"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Client Secret
              </label>
              <input
                type="password"
                value={salesforceData.clientSecret || ''}
                onChange={(e) => handleInputChange('clientSecret', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="Salesforce Client Secret"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                value={salesforceData.username || ''}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="your-username@example.com"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={salesforceData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="********"
                autoComplete="off"
              />
            </div>
          </>
        );
        
      case 'AWS':
        const awsData = (credentials.data as AWSCredentials) || emptyAWSData;
        return (
          <>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Access Key ID
              </label>
              <input
                type="text"
                value={awsData.accessKeyId || ''}
                onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="AKIA***********"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Secret Access Key
              </label>
              <input
                type="password"
                value={awsData.secretAccessKey || ''}
                onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="********"
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label className="block text-textSecondary text-sm font-medium mb-2">
                Region
              </label>
              <input
                type="text"
                value={awsData.region || ''}
                onChange={(e) => handleInputChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary"
                placeholder="us-east-1"
                autoComplete="off"
              />
            </div>
          </>
        );
        
      default:
        return <p>Unsupported service type</p>;
    }
  };

  return (
    <div className="bg-cardBackground p-6 rounded-lg h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-textPrimary">
          {serviceName} Credentials
        </h2>
        <div>
          {getStatusBadge()}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
        {renderFormFields()}
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
