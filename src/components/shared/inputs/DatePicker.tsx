'use client';

import React, { forwardRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  id: string;
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

// Custom input component for the date picker
const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void; placeholder: string; disabled?: boolean; error?: string }>(
  ({ value, onClick, placeholder, disabled, error }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      disabled={disabled}
      className={`w-full flex items-center justify-between rounded border ${
        error ? 'border-error' : 'border-buttonBorder'
      } px-3 py-2 text-sm ${
        disabled ? 'bg-darkerBackground text-gray-400 cursor-not-allowed' : 'bg-white hover:bg-darkerBackground'
      } focus:outline-none focus:ring-2 focus:ring-buttonPrimary focus:border-transparent transition-colors duration-200`}
    >
      <div className={`truncate ${value || placeholder ? 'mr-2' : ''}`}>
        {value || <span className="text-gray-400">{placeholder}</span>}
      </div>
      <svg className="h-4 w-4 text-gray-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
      </svg>
    </button>
  )
);

CustomInput.displayName = 'CustomInput';

// Custom clear button component
const ClearButton = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="mx-2 my-auto text-gray-400 hover:text-gray-600 transition-colors"
    aria-label="Clear date"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  </button>
);

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  disabled = false,
  className = '',
  placeholder = 'Select date',
  minDate,
  maxDate
}) => {
  // Custom styles to override react-datepicker default styling
  const customStyles = `
    .react-datepicker {
      font-family: inherit;
      border-color: #E9E7E4;
      border-radius: 0.375rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .react-datepicker__header {
      background-color: #E9E7E4;
      border-bottom: 1px solid #E9E7E4;
    }
    .react-datepicker__day--selected {
      background-color: #141417;
    }
    .react-datepicker__day--keyboard-selected {
      background-color: rgba(20, 20, 23, 0.7);
    }
    .react-datepicker__day:hover {
      background-color: rgba(20, 20, 23, 0.1);
    }
    /* Hide the default clear button */
    .react-datepicker__close-icon {
      display: none !important;
    }
  `;

  // Handle clearing the date manually
  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <style>{customStyles}</style>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium mb-1 text-gray-700"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <div className="relative flex justify-start">
        <ReactDatePicker
          id={id}
          selected={value}
          onChange={onChange}
          customInput={
            <CustomInput
              placeholder={placeholder}
              disabled={disabled}
              error={error}
            />
          }
          disabled={disabled}
          dateFormat="MMM d, yyyy"
          minDate={minDate}
          maxDate={maxDate}
          // We're handling clearing manually
          isClearable={false}
          showPopperArrow={false}
          popperClassName="z-50"
          popperPlacement="bottom-start"
          className="w-fit"
        />
        {value && !disabled && <ClearButton onClick={handleClear} />}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
};

export default DatePicker;
