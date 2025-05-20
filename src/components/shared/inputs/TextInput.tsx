'use client';

import React from 'react';

interface TextInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'url' | 'tel' | 'number';
  className?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  type = 'text',
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border ${error ? 'border-error' : 'border-buttonBorder'} rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary`}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default TextInput;
