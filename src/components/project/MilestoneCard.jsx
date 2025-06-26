import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const MilestoneCard = ({ 
  milestone, 
  index, 
  onMilestoneChange, 
  onDelete, 
  errors, 
  projectDeadline,
  today 
}) => {
  return (
    <div className="milestone-card bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-client-accent flex items-center justify-center">
              <span className="text-sm text-white font-medium">{index + 1}</span>
            </span>
            <h4 className="text-sm font-medium text-white">Milestone Details</h4>
          </span>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="text-status-error hover:text-status-error/90 transition-colors duration-200"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Milestone Title
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Design Phase Complete"
              value={milestone.title}
              onChange={(e) => onMilestoneChange(index, 'title', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Due Date
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="relative w-full">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={milestone.due_date ? dayjs(milestone.due_date) : null}
                  onChange={(newValue) => {
                    onMilestoneChange(
                      index,
                      'due_date',
                      newValue ? newValue.format('YYYY-MM-DD') : ''
                    );
                  }}
                  minDate={dayjs(today)}
                  maxDate={dayjs(projectDeadline)}
                  format="MMMM D, YYYY"
                  sx={{
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '12px',
                      minHeight: '48px',
                      backdropFilter: 'blur(8px)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(0, 212, 170, 0.6)',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'rgba(0, 212, 170, 0.6)',
                        boxShadow: '0 0 0 4px rgba(0, 212, 170, 0.15)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      padding: '14px 16px',
                      fontSize: '16px',
                    },
                    '& .MuiSvgIcon-root': {
                      color: 'rgba(255, 255, 255, 0.6)',
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <input
                type="checkbox"
                checked={milestone.is_automated}
                onChange={(e) => onMilestoneChange(index, 'is_automated', e.target.checked)}
                className="w-4 h-4 text-client-accent border-white/30 rounded focus:ring-client-accent/50 bg-white/10"
              />
              <span className="text-sm text-white/80">
                Auto-process payment on completion
              </span>
            </label>
          </div>

          {milestone.is_automated && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Amount (₹)
                <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="e.g., 15000"
                  value={milestone.amount}
                  onChange={(e) => onMilestoneChange(index, 'amount', e.target.value)}
                  onWheel={(e) => e.target.blur()}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-white placeholder-white/40 backdrop-blur-sm"
                  required={milestone.is_automated}
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 text-lg">₹</span>
              </div>
            </div>
          )}
        </div>

        {errors && errors.length > 0 && (
          <div className="p-3 rounded-md mt-4">
            {errors.map((error, i) => (
              <p key={i} className="text-sm text-status-error">{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneCard; 