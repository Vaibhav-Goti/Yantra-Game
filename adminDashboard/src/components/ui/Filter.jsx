import React, { useState } from 'react';
import Dropdown from './Dropdown';

const Filter = ({ 
  options = [],
  value,
  onChange,
  placeholder = 'Filter by...',
  multiple = false,
  className = '',
  triggerClassName = '',
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState(multiple ? (value || []) : []);
  
  const handleOptionClick = (option) => {
    if (multiple) {
      const newValues = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value];
      
      setSelectedValues(newValues);
      if (onChange) {
        onChange(newValues);
      }
    } else {
      setSelectedValues([option.value]);
      if (onChange) {
        onChange(option.value);
      }
      setIsOpen(false);
    }
  };
  
  const getDisplayText = () => {
    if (multiple) {
      if (selectedValues.length === 0) return placeholder;
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0]);
        return option ? option.label : placeholder;
      }
      return `${selectedValues.length} selected`;
    } else {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : placeholder;
    }
  };
  
  const clearSelection = () => {
    if (multiple) {
      setSelectedValues([]);
      if (onChange) {
        onChange([]);
      }
    } else {
      if (onChange) {
        onChange(null);
      }
    }
  };
  
  const trigger = (
    <button
      className={`flex items-center justify-between w-full px-3 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${triggerClassName}`}
    >
      <span className="block truncate">{getDisplayText()}</span>
      <svg className="w-5 h-5 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
  
  return (
    <div className={className}>
      <Dropdown
        trigger={trigger}
        placement="bottom-start"
        className="w-full"
      >
        <div className="py-1">
          {options.map((option) => {
            const isSelected = multiple 
              ? selectedValues.includes(option.value)
              : value === option.value;
            
            return (
              <DropdownItem
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={`${isSelected ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <div className="flex items-center">
                  {multiple && (
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                    />
                  )}
                  <span>{option.label}</span>
                </div>
              </DropdownItem>
            );
          })}
          {(multiple ? selectedValues.length > 0 : value) && (
            <>
              <DropdownDivider />
              <DropdownItem onClick={clearSelection} className="text-red-600 hover:bg-red-50">
                Clear selection
              </DropdownItem>
            </>
          )}
        </div>
      </Dropdown>
    </div>
  );
};

export const FilterChips = ({ 
  filters = [],
  onRemove,
  className = '' 
}) => {
  if (filters.length === 0) return null;
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter, index) => (
        <span
          key={index}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
        >
          {filter.label}
          <button
            onClick={() => onRemove && onRemove(filter)}
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
    </div>
  );
};

export default Filter;
