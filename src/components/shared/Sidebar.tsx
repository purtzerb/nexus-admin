'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface IconProps {
  active?: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactElement<IconProps>;
}

interface SidebarProps {
  navItems: NavItem[];
  userInfo?: {
    name: string;
    role: string;
  };
}

const Sidebar: React.FC<SidebarProps> = ({ navItems, userInfo }) => {
  const pathname = usePathname();

  return (
    <aside className="w-[200px] h-screen bg-darkerBackground border-r border-buttonBorder flex flex-col px-4">
      <div className="p-4 border-b border-buttonBorder">
        <h2 className="text-lg font-semibold">Nexus Admin</h2>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center rounded-lg px-4 py-2 text-sm ${
                    active
                      ? 'bg-buttonPrimary text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">
                    {React.cloneElement(item.icon, { active: !!active })}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* <div className="p-4 border-t border-buttonBorder">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs">{userInfo?.name?.charAt(0) || 'U'}</span>
          </div>
          <div className="ml-2">
            <p className="text-xs font-medium">{userInfo?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{userInfo?.role || 'Role'}</p>
            <Link href="/api/auth/logout" className="text-xs text-gray-500 hover:underline">
              Logout
            </Link>
          </div>
        </div>
      </div> */}
    </aside>
  );
};

export default Sidebar;
