'use client';

import { ClipLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 40, 
  color = '#141417', // Using buttonPrimary color from theme
  className = ''
}: LoadingSpinnerProps) {
  return (
    <div className={`flex items-center justify-center w-full h-full ${className}`}>
      <ClipLoader size={size} color={color} />
    </div>
  );
}
