import React, { useState } from 'react';

const EnhancedInput = ({ 
  label, 
  required = false, 
  icon = null, 
  placeholder, 
  value, 
  onChange, 
  type = "text",
  name,
  onWheel,
  className = "",
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="input-container">
      <label className={`input-label ${required ? 'required' : ''}`}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="input-icon">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onWheel={onWheel}
          placeholder={placeholder}
          className={`enhanced-input ${icon ? 'input-with-icon' : ''} ${className}`}
          {...props}
        />
      </div>
    </div>
  );
};

export default EnhancedInput; 