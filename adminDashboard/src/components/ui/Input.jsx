import React, { useState } from 'react';

const Input = ({ 
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  required = false,
  type = 'text',
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
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
  
  const inputElement = (
    <div className="relative">
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">{leftIcon}</span>
        </div>
      )}
      <input
        type={type}
        className={`${combinedInputClasses} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''}`}
        disabled={disabled}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-gray-400">{rightIcon}</span>
        </div>
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

export const Textarea = ({ 
  label,
  error,
  helperText,
  className = '',
  textareaClassName = '',
  labelClassName = '',
  errorClassName = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  required = false,
  rows = 3,
  ...props 
}) => {
  const baseClasses = 'block w-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-vertical';
  
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
  const combinedClasses = `${baseClasses} ${sizes[size]} ${variants[inputVariant]} ${textareaClassName}`;
  
  const labelClasses = `block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`;
  const errorClasses = `mt-1 text-sm text-red-600 ${errorClassName}`;
  const helperClasses = `mt-1 text-sm text-gray-500`;
  
  return (
    <div className={className}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={combinedClasses}
        disabled={disabled}
        rows={rows}
        {...props}
      />
      {error && <p className={errorClasses}>{error}</p>}
      {helperText && !error && <p className={helperClasses}>{helperText}</p>}
    </div>
  );
};

export default Input;
