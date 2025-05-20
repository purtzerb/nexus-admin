'use client'

import React from 'react';
import { NotificationIcon } from '../shared/NavIcons';

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-cardBackground border-b border-buttonBorder">
      <h1 className="text-2xl font-semibold text-textPrimary">{pageTitle}</h1>
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-darkerBackground rounded-full">
          <NotificationIcon />
        </button>
        <div className="w-8 h-8 rounded-full bg-darkerBackground flex items-center justify-center">
          <span className="text-xs text-textSecondary">U</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
