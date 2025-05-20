import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues with authentication
const AppOrchestratorWithNoSSR = dynamic(
  () => import('@/components/AppOrchestrator'),
  { ssr: false }
);

export default function Home() {
  return <AppOrchestratorWithNoSSR />;
}
