"use client";

import dynamic from 'next/dynamic';
import '@scalar/api-reference-react/style.css'

// Dynamic import to avoid SSR issues
const ApiReferenceReact = dynamic(
  () => import('@scalar/api-reference-react').then(mod => mod.ApiReferenceReact),
  { ssr: false }
);

export default function ApiDocumentationPage() {
  return (
    <div className="api-documentation-container h-screen w-full">
      <style jsx global>{`
        .api-documentation-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      {/* Wrap the component with ts-ignore to bypass TypeScript errors */}
      {/* @ts-ignore */}
      <ApiReferenceReact
        configuration={{
          url: '/openapi.json',
        }}
      />
    </div>
  );
}
