import React, { useEffect } from 'react';

const Modal = ({
  isOpen,
  onClose,
  children,
  size = 'md',
  className = '',
  closeOnOverlayClick = true,
  showCloseButton = true,
  ...props
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md mx-2',
    md: 'max-w-lg mx-2',
    lg: 'max-w-2xl mx-2',
    xl: 'max-w-4xl mx-2',
    full: 'max-w-full mx-2'
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-500 opacity-50 transition-opacity z-40"
        aria-hidden="true"
        onClick={handleOverlayClick}
      />

      {/* Modal panel */}
      <div
        className={`relative z-50 bg-white rounded-lg text-left shadow-xl transform transition-all ${sizes[size]} w-full max-h-[90vh] sm:max-h-[95vh] overflow-y-auto ${className}`}
        {...props}
      >
        {children}
      </div>
    </div>
  );
};

export const ModalHeader = ({
  children,
  className = '',
  showCloseButton = true,
  onClose,
  ...props
}) => {
  return (
    <div
      className={`bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${className}`}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">{children}</div>
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="ml-4 bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export const ModalBody = ({
  children,
  className = '',
  padding = 'px-4 py-5 sm:p-6',
  ...props
}) => {
  return (
    <div className={`${padding} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const ModalFooter = ({
  children,
  className = '',
  padding = 'px-4 py-3 sm:px-6',
  border = 'border-t border-gray-200',
  background = 'bg-gray-50',
  ...props
}) => {
  return (
    <div
      className={`${background} ${border} ${padding} ${className}`}
      {...props}
    >
      <div className="flex justify-end space-x-3">{children}</div>
    </div>
  );
};

export default Modal;
