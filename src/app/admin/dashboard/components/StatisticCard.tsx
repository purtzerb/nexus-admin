'use client';

import React from 'react';
import { formatCurrency, formatTime, formatPercentage } from '@/lib/db/dashboardService';
import {
  TrendingUp,
  TrendingDown,
  Banknote,
  Clock,
  FileText,
  AlertTriangle
} from './DashboardIcons';

interface StatisticCardProps {
  title: string;
  value: number;
  valueType: 'currency' | 'time' | 'number';
  change: number;
  icon: 'revenue' | 'time' | 'workflow' | 'exception';
}

export default function StatisticCard({
  title,
  value,
  valueType,
  change,
  icon
}: StatisticCardProps) {
  // Format the value based on its type
  const formattedValue = React.useMemo(() => {
    switch (valueType) {
      case 'currency':
        return formatCurrency(value);
      case 'time':
        return formatTime(value);
      case 'number':
      default:
        return value.toLocaleString();
    }
  }, [value, valueType]);

  // Format the change percentage
  const formattedChange = React.useMemo(() => {
    return formatPercentage(change);
  }, [change]);

  // Determine if the change is positive (green) or negative (red)
  // For exceptions, the meaning is inverted: a decrease is positive
  const isPositiveChange = icon === 'exception' ? change < 0 : change > 0;

  // Choose icon based on type
  const IconComponent = React.useMemo(() => {
    switch (icon) {
      case 'revenue':
        return Banknote;
      case 'time':
        return Clock;
      case 'workflow':
        return FileText;
      case 'exception':
        return AlertTriangle;
      default:
        return Banknote;
    }
  }, [icon]);

  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold mt-1">{formattedValue}</p>
        </div>
        <div className={`p-2 rounded-full ${
          icon === 'revenue' ? 'bg-green-100' :
          icon === 'time' ? 'bg-blue-100' :
          icon === 'workflow' ? 'bg-purple-100' :
          'bg-orange-100'
        }`}>
          <IconComponent className={`w-5 h-5 ${
            icon === 'revenue' ? 'text-green-600' :
            icon === 'time' ? 'text-blue-600' :
            icon === 'workflow' ? 'text-purple-600' :
            'text-orange-600'
          }`} />
        </div>
      </div>
      <div className="flex items-center mt-4">
        {isPositiveChange ? (
          <TrendingUp className={`w-4 h-4 mr-1 ${icon === 'exception' ? 'text-green-500' : 'text-green-500'}`} />
        ) : (
          <TrendingDown className={`w-4 h-4 mr-1 ${icon === 'exception' ? 'text-red-500' : 'text-red-500'}`} />
        )}
        <span className={`text-sm font-medium ${
          isPositiveChange ? 'text-green-500' : 'text-red-500'
        }`}>
          {formattedChange}
        </span>
      </div>
    </div>
  );
}
