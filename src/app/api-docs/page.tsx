'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Create a custom error boundary to suppress React lifecycle warnings from Swagger UI
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // Only log errors that aren't related to the known Swagger UI lifecycle warnings
    if (!error.toString().includes('UNSAFE_componentWillReceiveProps')) {
      console.error('Error in component:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-100 text-red-700 rounded">Error loading API documentation.</div>;
    }

    return this.props.children;
  }
}

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic<{spec: any}>
  (() => import('swagger-ui-react').then((mod) => mod.default),
  { ssr: false });

// Custom wrapper component for Swagger UI
const SafeSwaggerUI = ({ spec }: { spec: any }) => {
  // Suppress console errors from Swagger UI's deprecated lifecycle methods
  const originalConsoleError = console.error;
  useEffect(() => {
    console.error = (...args: any[]) => {
      // Filter out the specific React lifecycle warnings
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('UNSAFE_') || 
         args[0].includes('componentWillReceiveProps') ||
         args[0].includes('componentWillMount'))
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <ErrorBoundary>
      <SwaggerUI spec={spec} />
    </ErrorBoundary>
  );
};



const ApiDocsPage = () => {
  const [spec, setSpec] = useState<any>(null);

  useEffect(() => {
    // Fetch the OpenAPI spec from our endpoint
    fetch('/api/swagger')
      .then((response) => response.json())
      .then((data) => setSpec(data))
      .catch((error) => console.error('Error loading API docs:', error));
  }, []);

  if (!spec) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-buttonPrimary mx-auto"></div>
          <p className="mt-4 text-textPrimary">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-textPrimary">Nexus Admin External API Documentation</h1>
      <div className="bg-white rounded-lg shadow-lg p-4 overflow-auto">
        {spec && <SafeSwaggerUI spec={spec} />}
      </div>
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2 text-textPrimary">Authentication</h2>
        <p className="mb-2">All API endpoints require authentication using an API key.</p>
        <div className="p-3 bg-yellow-100 border-l-4 border-yellow-500 mb-4">
          <p className="font-bold">Important:</p>
          <p>The API key <strong>must</strong> be provided in the request headers as shown below:</p>
          <pre className="bg-gray-200 p-2 rounded mt-2 overflow-x-auto">
            <code>x-api-key: YOUR_API_KEY</code>
          </pre>
        </div>
        <p className="mb-2 text-gray-600 text-sm"><em>Note: While the system also supports query parameter authentication for backward compatibility, this method is discouraged and may be removed in future versions.</em></p>
        <p>The API key value should be set in the <code className="bg-gray-200 px-2 py-1 rounded">API_KEY</code> environment variable on the server.</p>
      </div>
    </div>
  );
};

export default ApiDocsPage;
