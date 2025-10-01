import React from 'react';

const StatusBadge = ({ 
  status, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    primary: 'bg-blue-100 text-blue-800'
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };
  
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={combinedClasses} {...props}>
      {status}
    </span>
  );
};

export const MachineStatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    'Active': { variant: 'success', text: 'Active' },
    'Inactive': { variant: 'danger', text: 'Inactive' },
    'Maintenance': { variant: 'warning', text: 'Maintenance' }
  };
  
  const config = statusConfig[status] || { variant: 'default', text: status };
  
  return (
    <StatusBadge 
      status={config.text} 
      variant={config.variant}
      className={className}
    />
  );
};

export const GameStatusBadge = ({ status, className = '' }) => {
  const statusConfig = {
    'Completed': { variant: 'success', text: 'Completed' },
    'Active': { variant: 'info', text: 'Active' },
    'Cancelled': { variant: 'danger', text: 'Cancelled' }
  };
  
  const config = statusConfig[status] || { variant: 'default', text: status };
  
  return (
    <StatusBadge 
      status={config.text} 
      variant={config.variant}
      className={className}
    />
  );
};

export default StatusBadge;
