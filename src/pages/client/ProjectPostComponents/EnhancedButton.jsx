import React from 'react';

const EnhancedButton = ({ 
  children, 
  variant = "primary", 
  onClick, 
  type = "button",
  className = "",
  disabled = false,
  ...props 
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`enhanced-button ${variant} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    {...props}
  >
    {children}
  </button>
);

export default EnhancedButton; 