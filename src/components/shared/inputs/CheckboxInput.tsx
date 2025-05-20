'use client';

import React from 'react';

interface CheckboxInputProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({
  id,
  label,
  checked,
  onChange,
  className = '',
}) => {
  return (
    <label htmlFor={id} className={`inline-flex items-center ${className}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="mr-2"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
};

export default CheckboxInput;
