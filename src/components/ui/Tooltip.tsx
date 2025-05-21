'use client';

import React, { useState, ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2'
  };

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center cursor-help"
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className={`absolute z-50 px-3 py-2 text-sm text-white bg-buttonPrimary rounded shadow-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          <div 
            className={`absolute w-2 h-2 bg-buttonPrimary transform rotate-45 ${
              position === 'top' ? 'top-full -translate-x-1/2 left-1/2 -mt-1' :
              position === 'right' ? 'right-full -translate-y-1/2 top-1/2 -mr-1' :
              position === 'bottom' ? 'bottom-full -translate-x-1/2 left-1/2 -mb-1' :
              'left-full -translate-y-1/2 top-1/2 -ml-1'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
