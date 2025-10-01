import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  shadow = 'shadow-md',
  rounded = 'rounded-lg',
  border = 'border border-gray-200',
  background = 'bg-white',
  hover = false,
  ...props 
}) => {
  const baseClasses = `${background} ${border} ${rounded} ${shadow} ${padding}`;
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200' : '';
  const combinedClasses = `${baseClasses} ${hoverClasses} ${className}`;

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ 
  children, 
  className = '', 
  padding = 'px-0 py-4',
  border = 'border-b border-gray-200',
  background = 'bg-gray-50',
  ...props 
}) => {
  const combinedClasses = `${background} ${border} ${padding} ${className}`;
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export const CardBody = ({ 
  children, 
  className = '', 
  padding = 'p-6',
  ...props 
}) => {
  const combinedClasses = `${padding} ${className}`;
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export const CardFooter = ({ 
  children, 
  className = '', 
  padding = 'px-6 py-4',
  border = 'border-t border-gray-200',
  background = 'bg-gray-50',
  ...props 
}) => {
  const combinedClasses = `${background} ${border} ${padding} ${className}`;
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};

export default Card;
