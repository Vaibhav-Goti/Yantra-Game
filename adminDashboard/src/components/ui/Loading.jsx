import React from 'react';

const Loading = ({ 
  size = 'md',
  variant = 'spinner',
  className = '',
  text = '',
  ...props 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  const Spinner = () => (
    <svg 
      className={`animate-spin ${sizes[size]} ${className}`} 
      fill="none" 
      viewBox="0 0 24 24"
      {...props}
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
  
  const Dots = () => (
    <div className={`flex space-x-1 ${className}`} {...props}>
      <div className={`${sizes[size]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${sizes[size]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${sizes[size]} bg-current rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );
  
  const Pulse = () => (
    <div className={`${sizes[size]} bg-current rounded-full animate-pulse ${className}`} {...props} />
  );
  
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <Dots />;
      case 'pulse':
        return <Pulse />;
      default:
        return <Spinner />;
    }
  };
  
  if (text) {
    return (
      <div className="flex items-center space-x-2">
        {renderLoader()}
        <span className="text-sm text-gray-600">{text}</span>
      </div>
    );
  }
  
  return renderLoader();
};

export const LoadingOverlay = ({ 
  isLoading, 
  children, 
  className = '',
  overlayClassName = '',
  ...props 
}) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
      {isLoading && (
        <div className={`absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 ${overlayClassName}`}>
          <Loading size="lg" text="Loading..." />
        </div>
      )}
    </div>
  );
};

export const LoadingPage = ({ 
  text = 'Loading...',
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center justify-center min-h-screen ${className}`} {...props}>
      <div className="text-center">
        <Loading size="xl" variant="spinner" />
        <p className="mt-4 text-lg text-gray-600">{text}</p>
      </div>
    </div>
  );
};

export default Loading;
