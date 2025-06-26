import React from 'react';

const HourlyPricingForm = ({ hourlyRate, estimatedHours, maxHours, onChange }) => {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Hourly Rate</label>
          <div className="relative">
            <input
              type="number"
              value={hourlyRate || ''}
              onChange={(e) => {
                const rate = Number(e.target.value) || 0;
                onChange('hourly_rate', rate);
              }}
              placeholder="e.g., 500"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm text-sm"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 text-sm">₹</span>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Estimated Hours</label>
          <input
            type="number"
            value={estimatedHours || ''}
            onChange={(e) => {
              const hours = Number(e.target.value) || 0;
              onChange('estimated_hours', hours);
            }}
            placeholder="e.g., 40"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">Max Hours</label>
          <input
            type="number"
            value={maxHours || ''}
            onChange={(e) => {
              const maxHrs = Number(e.target.value) || 0;
              onChange('max_hours', maxHrs);
            }}
            placeholder="e.g., 60"
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm text-sm"
          />
        </div>
      </div>
      
      {hourlyRate > 0 && maxHours > 0 && (
        <div className="mt-3 p-3 bg-client-accent/10 rounded-lg border border-client-accent/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text-secondary">Estimated Cost:</span>
            <span className="text-client-accent font-semibold">₹{((hourlyRate || 0) * (estimatedHours || 0)).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-text-secondary">Maximum Cost:</span>
            <span className="text-client-accent font-semibold">₹{((hourlyRate || 0) * (maxHours || 0)).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HourlyPricingForm; 