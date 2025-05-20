'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      // Redirect will be handled in the login function based on user role
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-darkerBackground rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-textPrimary">Nexus Admin Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-error/10 text-error rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 font-medium text-textPrimary">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-buttonBorder rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary bg-background text-textPrimary"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 font-medium text-textPrimary">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-buttonBorder rounded-md focus:outline-none focus:ring-2 focus:ring-buttonPrimary bg-background text-textPrimary"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-buttonPrimary text-textLight rounded-md hover:bg-buttonPrimary/90 focus:outline-none focus:ring-2 focus:ring-buttonPrimary focus:ring-offset-2 disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? (
              <>
                <ClipLoader size={20} color="#ffffff" className="mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
