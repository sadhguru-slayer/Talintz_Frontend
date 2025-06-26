import React from 'react';

const PricingStrategyRadio = ({ value, label, description, icon, checked, onChange, price }) => (
  <div 
    className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
      checked 
        ? 'border-client-accent bg-client-accent/10 shadow-lg' 
        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
    }`}
    onClick={() => onChange(value)}
  >
    <div className="flex items-start gap-4">
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
        checked ? 'border-client-accent bg-client-accent' : 'border-white/30'
      }`}>
        {checked && <div className="w-2 h-2 rounded-full bg-white"></div>}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold text-text-light text-lg">{label}</span>
          {price && (
            <div className="ml-auto px-3 py-1 bg-client-accent/20 border border-client-accent/30 rounded-md">
              <span className="text-client-accent font-semibold text-sm">₹{price.toLocaleString()}</span>
            </div>
          )}
        </div>
        <div className="text-sm text-text-secondary">{description}</div>
      </div>
    </div>
  </div>
);

const PricingStrategySelector = ({ 
  pricingStrategy, 
  onStrategyChange, 
  hourlyRate, 
  estimatedHours, 
  maxHours, 
  onHourlyDataChange 
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PricingStrategyRadio
          value="fixed"
          label="Fixed Price"
          description="Set a fixed budget for the entire project. Perfect for well-defined projects with clear scope."
          icon="��"
          checked={pricingStrategy === 'fixed'}
          onChange={onStrategyChange}
        />
        
        <PricingStrategyRadio
          value="hourly"
          label="Hourly Rate"
          description="Pay based on actual time worked. Ideal for projects with evolving requirements."
          icon="⏰"
          checked={pricingStrategy === 'hourly'}
          onChange={onStrategyChange}
        />
      </div>
      
      {pricingStrategy === 'hourly' && (
        <HourlyPricingForm
          hourlyRate={hourlyRate}
          estimatedHours={estimatedHours}
          maxHours={maxHours}
          onChange={onHourlyDataChange}
        />
      )}
    </div>
  );
};

export default PricingStrategySelector; 