declare module 'swagger-ui-react' {
  import React from 'react';
  
  interface SwaggerUIProps {
    spec: any;
    url?: string;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    requestInterceptor?: (req: any) => any;
    responseInterceptor?: (res: any) => any;
  }
  
  const SwaggerUI: React.FC<SwaggerUIProps>;
  
  export default SwaggerUI;
}
