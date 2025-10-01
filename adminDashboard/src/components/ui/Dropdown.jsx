import React, { useState, useRef, useEffect } from 'react';

const Dropdown = ({ 
  children, 
  trigger, 
  placement = 'bottom-start',
  className = '',
  triggerClassName = '',
  contentClassName = '',
  disabled = false,
  closeOnSelect = true,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  const placements = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
    'left-start': 'right-full top-0 mr-1',
    'left-end': 'right-full bottom-0 mr-1',
    'right-start': 'left-full top-0 ml-1',
    'right-end': 'left-full bottom-0 ml-1'
  };
  
  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const closeDropdown = () => {
    if (closeOnSelect) {
      setIsOpen(false);
    }
  };
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef} {...props}>
      <div 
        className={`cursor-pointer ${triggerClassName}`}
        onClick={handleToggle}
      >
        {trigger}
      </div>
      
      {isOpen && (
        <div className={`absolute z-50 ${placements[placement]} ${contentClassName}`}>
          <div className="bg-white rounded-md shadow-lg border border-gray-200 py-1 min-w-[200px]">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, { closeDropdown });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ 
  children, 
  onClick,
  className = '',
  disabled = false,
  icon = null,
  closeDropdown,
  ...props 
}) => {
  const baseClasses = 'flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const combinedClasses = `${baseClasses} ${disabledClasses} ${className}`;
  
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      if (closeDropdown) {
        closeDropdown();
      }
    }
  };
  
  return (
    <div className={combinedClasses} onClick={handleClick} {...props}>
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </div>
  );
};

export const DropdownDivider = ({ className = '' }) => {
  return <div className={`border-t border-gray-200 my-1 ${className}`} />;
};

export const DropdownHeader = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </div>
  );
};

export default Dropdown;
