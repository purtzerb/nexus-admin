import dynamic from 'next/dynamic';

// Use dynamic import with no SSR to avoid hydration issues with authentication
const HomeRedirectWithNoSSR = dynamic(
  () => import('@/components/HomeRedirect'),
);

export default function Home() {
  return <HomeRedirectWithNoSSR />;
}
