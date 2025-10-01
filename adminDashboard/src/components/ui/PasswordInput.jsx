import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordInput = ({ 
  label,
  error,
  helperText,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  required = false,
  showToggle = true,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const baseClasses = 'block w-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  const variants = {
    default: 'border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    error: 'border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500',
    success: 'border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500'
  };
  
  const inputVariant = error ? 'error' : variant;
  const combinedInputClasses = `${baseClasses} ${sizes[size]} ${variants[inputVariant]} ${inputClassName}`;
  
  const labelClasses = `block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`;
  const errorClasses = `mt-1 text-sm text-red-600 ${errorClassName}`;
  const helperClasses = `mt-1 text-sm text-gray-500`;
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const inputElement = (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        className={`${combinedInputClasses} ${showToggle ? 'pr-10' : ''}`}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {showToggle && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          onClick={togglePasswordVisibility}
          disabled={disabled}
        >
          {showPassword ? (
            <FaEyeSlash className="w-4 h-4" />
          ) : (
            <FaEye className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
  
  if (label) {
    return (
      <div className={className}>
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {inputElement}
        {error && <p className={errorClasses}>{error}</p>}
        {helperText && !error && <p className={helperClasses}>{helperText}</p>}
      </div>
    );
  }
  
  return (
    <div className={className}>
      {inputElement}
      {error && <p className={errorClasses}>{error}</p>}
      {helperText && !error && <p className={helperClasses}>{helperText}</p>}
    </div>
  );
};

export default PasswordInput;
