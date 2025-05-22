import { 
  SlackCredentials, 
  GitHubCredentials, 
  JiraCredentials, 
  SalesforceCredentials, 
  AWSCredentials, 
  CredentialData 
} from '@/models/Credential';

// List of supported services
export const SUPPORTED_SERVICES = ['Slack', 'GitHub', 'Jira', 'Salesforce', 'AWS'] as const;
export type SupportedService = typeof SUPPORTED_SERVICES[number];

// Validation functions for each credential type
export const validateSlackCredentials = (credentials: SlackCredentials): boolean => {
  // For now, just check if required fields are present
  return !!(
    credentials.workspaceUrl &&
    credentials.botUserOAuthToken &&
    credentials.signingSecret
  );
  // In the future, we'll actually verify these credentials with Slack API
};

export const validateGitHubCredentials = (credentials: GitHubCredentials): boolean => {
  return !!(
    credentials.personalAccessToken &&
    credentials.owner
  );
  // In the future, we'll verify with GitHub API
};

export const validateJiraCredentials = (credentials: JiraCredentials): boolean => {
  return !!(
    credentials.domain &&
    credentials.email &&
    credentials.apiToken
  );
  // In the future, we'll verify with Jira API
};

export const validateSalesforceCredentials = (credentials: SalesforceCredentials): boolean => {
  return !!(
    credentials.instanceUrl &&
    credentials.clientId &&
    credentials.clientSecret &&
    credentials.username &&
    credentials.password
  );
  // In the future, we'll verify with Salesforce API
};

export const validateAWSCredentials = (credentials: AWSCredentials): boolean => {
  return !!(
    credentials.accessKeyId &&
    credentials.secretAccessKey &&
    credentials.region
  );
  // In the future, we'll verify with AWS SDK
};

// Factory function to create empty credentials for a service
export function createEmptyCredentials(service: SupportedService): CredentialData {
  switch (service) {
    case 'Slack':
      return {
        type: 'Slack',
        data: {
          workspaceUrl: '',
          botUserOAuthToken: '',
          signingSecret: ''
        }
      };
    case 'GitHub':
      return {
        type: 'GitHub',
        data: {
          personalAccessToken: '',
          owner: '',
          repository: ''
        }
      };
    case 'Jira':
      return {
        type: 'Jira',
        data: {
          domain: '',
          email: '',
          apiToken: ''
        }
      };
    case 'Salesforce':
      return {
        type: 'Salesforce',
        data: {
          instanceUrl: '',
          clientId: '',
          clientSecret: '',
          username: '',
          password: ''
        }
      };
    case 'AWS':
      return {
        type: 'AWS',
        data: {
          accessKeyId: '',
          secretAccessKey: '',
          region: ''
        }
      };
  }
}

// Validate credentials based on service type
export function validateCredentials(credentials: CredentialData): boolean {
  switch (credentials.type) {
    case 'Slack':
      return validateSlackCredentials(credentials.data);
    case 'GitHub':
      return validateGitHubCredentials(credentials.data);
    case 'Jira':
      return validateJiraCredentials(credentials.data);
    case 'Salesforce':
      return validateSalesforceCredentials(credentials.data);
    case 'AWS':
      return validateAWSCredentials(credentials.data);
    default:
      return false;
  }
}
