'use client';

import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  required = false,
  error,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border ${error ? 'border-error' : 'border-buttonBorder'} rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-error">{error}</p>}
    </div>
  );
};

export default SelectInput;
