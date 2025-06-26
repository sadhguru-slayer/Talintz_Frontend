import React from 'react';

const ProgressSteps = ({ currentStep, totalSteps, steps }) => (
  <div className="step-indicator">
    {steps.map((step, index) => {
      const stepNumber = index + 1;
      const isActive = stepNumber === currentStep;
      const isCompleted = stepNumber < currentStep;
      const isPending = stepNumber > currentStep;

      return (
        <div key={stepNumber} className="step-item">
          <div 
            className={`step-circle ${
              isActive ? 'active' : isCompleted ? 'completed' : 'pending'
            }`}
          >
            {isCompleted ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              stepNumber
            )}
          </div>
          <span className="step-label">{step}</span>
        </div>
      );
    })}
  </div>
);

export default ProgressSteps; 