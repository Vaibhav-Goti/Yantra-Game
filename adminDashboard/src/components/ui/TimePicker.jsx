import React, { useState, useRef, useEffect } from 'react';
import { FaClock, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const TimePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select time",
  disabled = false,
  className = "",
  size = "default"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value || '');
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');
  const [selectedAmPm, setSelectedAmPm] = useState('AM');
  const dropdownRef = useRef(null);

  const sizeClasses = {
    small: 'h-10 text-sm',
    default: 'h-12 text-base',
    large: 'h-14 text-lg'
  };

  useEffect(() => {
    setSelectedTime(value || '');
    if (value) {
      const parsed = parseTime12(value);
      if (parsed) {
        setSelectedHour(parsed.hour);
        setSelectedMinute(parsed.minute);
        setSelectedAmPm(parsed.ampm);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const parseTime12 = (time12) => {
    if (!time12) return null;
    const match = time12.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (match) {
      return {
        hour: match[1],
        minute: match[2],
        ampm: match[3].toUpperCase()
      };
    }
    return null;
  };

  const formatTime12 = (hour, minute, ampm) => {
    if (!hour || !minute) return '';
    return `${hour}:${minute} ${ampm}`;
  };

  const handleTimeChange = () => {
    const time12 = formatTime12(selectedHour, selectedMinute, selectedAmPm);
    setSelectedTime(time12);
    if (time12) {
      onChange && onChange(time12);
    }
  };

  const handleHourChange = (hour) => {
    setSelectedHour(hour);
    setTimeout(() => {
      const time12 = formatTime12(hour, selectedMinute, selectedAmPm);
      setSelectedTime(time12);
      if (time12) {
        onChange && onChange(time12);
      }
    }, 0);
  };

  const handleMinuteChange = (minute) => {
    setSelectedMinute(minute);
    setTimeout(() => {
      const time12 = formatTime12(selectedHour, minute, selectedAmPm);
      setSelectedTime(time12);
      if (time12) {
        onChange && onChange(time12);
      }
    }, 0);
  };

  const handleAmPmChange = (ampm) => {
    setSelectedAmPm(ampm);
    setTimeout(() => {
      const time12 = formatTime12(selectedHour, selectedMinute, ampm);
      setSelectedTime(time12);
      if (time12) {
        onChange && onChange(time12);
      }
    }, 0);
  };

  const handleConfirm = () => {
    const time12 = formatTime12(selectedHour, selectedMinute, selectedAmPm);
    setSelectedTime(time12);
    onChange && onChange(time12);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Generate options
  const hourOptions = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 1;
    return { value: hour.toString().padStart(2, '0'), label: hour.toString().padStart(2, '0') };
  });

  const minuteOptions = Array.from({ length: 12 }, (_, i) => {
    const minute = i * 5;
    return { value: minute.toString().padStart(2, '0'), label: minute.toString().padStart(2, '0') };
  });

  const ampmOptions = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`
          w-full border border-gray-300 rounded-md bg-white
          ${sizeClasses[size]}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          flex items-center justify-between px-3
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <input
          type="text"
          value={selectedTime}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent outline-none cursor-pointer"
          readOnly
        />
        <FaClock className="text-gray-400" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-xl">
          <div className="p-4">
            <div className="flex items-center justify-center gap-4 mb-4">
              {/* Hours Column */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-2">HOUR</div>
                <div className="w-16 h-32 overflow-y-auto border border-gray-200 rounded scrollbar-thin scrollbar-thumb-gray-300">
                  {hourOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`
                        w-full py-2 text-center text-sm hover:bg-blue-50
                        ${selectedHour === option.value ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'}
                      `}
                      onClick={() => handleHourChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <span className="text-2xl text-gray-400 font-bold">:</span>

              {/* Minutes Column */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-2">MIN</div>
                <div className="w-16 h-32 overflow-y-auto border border-gray-200 rounded scrollbar-thin scrollbar-thumb-gray-300">
                  {minuteOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`
                        w-full py-2 text-center text-sm hover:bg-blue-50
                        ${selectedMinute === option.value ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'}
                      `}
                      onClick={() => handleMinuteChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM Column */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-gray-500 mb-2">AM/PM</div>
                <div className="w-16 h-32 overflow-y-auto border border-gray-200 rounded scrollbar-thin scrollbar-thumb-gray-300">
                  {ampmOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`
                        w-full py-2 text-center text-sm hover:bg-blue-50
                        ${selectedAmPm === option.value ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'}
                      `}
                      onClick={() => handleAmPmChange(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
