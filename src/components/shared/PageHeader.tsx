'use client'

import React, { useState, useRef, useEffect } from 'react';
import { NotificationIcon } from './NavIcons';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        router.push('/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="flex justify-between items-center py-4 px-6 bg-cardBackground border-b border-buttonBorder">
      <h1 className="text-2xl font-semibold text-textPrimary">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-darkerBackground rounded-full">
          <NotificationIcon />
        </button>
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center space-x-1 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-darkerBackground flex items-center justify-center">
              <span className="text-xs text-textSecondary">U</span>
            </div>
            <svg 
              className={`w-4 h-4 text-textSecondary transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-cardBackground rounded-md shadow-lg py-1 z-10 border border-buttonBorder">
              <button
                className="w-full text-left px-4 py-2 text-sm text-textPrimary hover:bg-darkerBackground focus:outline-none"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
