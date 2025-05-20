import React from 'react';
import {
  DashboardIcon,
  UsersIcon,
  ClientsIcon,
  BillingIcon,
  SubscriptionsIcon,
  MessagingIcon,
  ReportingIcon,
  ExceptionsIcon,
  SettingsIcon
} from '@/components/shared/NavIcons';
import { NavItem } from '@/components/shared/Sidebar';

export const adminNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: <UsersIcon />,
  },
  {
    label: 'Clients',
    href: '/admin/clients',
    icon: <ClientsIcon />,
  },
  {
    label: 'Billing',
    href: '/admin/billing',
    icon: <BillingIcon />,
  },
  {
    label: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: <SubscriptionsIcon />,
  },
  {
    label: 'Messaging',
    href: '/admin/messaging',
    icon: <MessagingIcon />,
  },
  {
    label: 'Reporting',
    href: '/admin/reporting',
    icon: <ReportingIcon />,
  },
  {
    label: 'Exceptions',
    href: '/admin/exceptions',
    icon: <ExceptionsIcon />,
  },
];

export const clientNavItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/client/dashboard',
    icon: <DashboardIcon />,
  },
  {
    label: 'Users',
    href: '/client/users',
    icon: <UsersIcon />,
  },
  {
    label: 'Billing',
    href: '/client/billing',
    icon: <BillingIcon />,
  },
  {
    label: 'Reporting',
    href: '/client/reporting',
    icon: <ReportingIcon />,
  },
  {
    label: 'Settings',
    href: '/client/settings',
    icon: <SettingsIcon />,
  },
];
