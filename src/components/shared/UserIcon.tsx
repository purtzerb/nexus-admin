'use client';
import React from 'react';

interface UserIconProps {
  size?: number;
}

export const UserIcon: React.FC<UserIconProps> = ({ size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M20 4C15.582 4 12 7.582 12 12C12 16.418 15.582 20 20 20C24.418 20 28 16.418 28 12C28 7.582 24.418 4 20 4Z" 
        fill="black" 
      />
      <path 
        d="M20 22C13.373 22 8 27.373 8 34V36H32V34C32 27.373 26.627 22 20 22Z" 
        fill="black" 
      />
    </svg>
  );
};

export default UserIcon;
