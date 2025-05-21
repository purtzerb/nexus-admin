import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = () => {
  const spec = createSwaggerSpec({
    apiFolder: 'src/app/api/external', // Path to API folder
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Nexus Admin External API',
        version: '1.0.0',
        description: 'API documentation for the Nexus Admin external API endpoints',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
      },
      servers: [
        {
          url: '/api/external',
          description: 'External API server',
        },
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
            description: 'API key for external API access. Must be provided in the request headers.',
          },
        },
      },
      security: [
        {
          apiKey: [],
        },
      ],
      tags: [
        {
          name: 'Workflow Exceptions',
          description: 'Endpoints for managing workflow exceptions',
        },
        {
          name: 'Workflow Executions',
          description: 'Endpoints for recording workflow executions',
        },
        {
          name: 'Workflow Nodes',
          description: 'Endpoints for managing workflow nodes',
        },
      ],
    },
  });
  return spec;
};
