import React from 'react';

const LogoCode = ({ width = "40", height = "40", className = "" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient
          id="logoGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" style={{ stopColor: '#2B96ED' }} />
          <stop offset="100%" style={{ stopColor: '#19B88C' }} />
        </linearGradient>
      </defs>

      {/* Main Logo Shape */}
      <path
        d="M 100 150 
           C 100 122.385 122.385 100 150 100 
           H 350 
           C 377.615 100 400 122.385 400 150 
           V 350 
           C 400 377.615 377.615 400 350 400 
           H 150 
           C 122.385 400 100 377.615 100 350 
           V 150 Z
           
           M 200 175
           C 200 175 300 175 300 250
           C 300 325 200 325 200 325
           V 175 Z"
        fill="url(#logoGradient)"
      />
    </svg>
  );
};

export default LogoCode;
