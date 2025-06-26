import React from 'react';
import { IoMdAdd } from "react-icons/io";
import { Switch } from 'antd';
import MilestoneCard from './MilestoneCard';

const MilestoneForm = ({ 
  milestones, 
  showMilestones, 
  onToggleMilestones, 
  onMilestoneChange, 
  onAddMilestone, 
  onDeleteMilestone, 
  errors, 
  projectDeadline,
  today 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <div>
          <label className="text-sm font-medium text-white/90">
            Add Project Milestones
          </label>
          <p className="text-xs text-white/60 mt-1">Break your project into manageable phases</p>
        </div>
        <Switch
          checked={showMilestones}
          onChange={onToggleMilestones}
          className={`${
            showMilestones ? 'bg-client-accent' : 'bg-white/20'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300`}
        >
          <span className="sr-only">Enable project milestones</span>
          <span
            className={`${
              showMilestones ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm`}
          />
        </Switch>
      </div>

      {showMilestones && (
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <MilestoneCard
              key={index}
              milestone={milestone}
              index={index}
              onMilestoneChange={onMilestoneChange}
              onDelete={onDeleteMilestone}
              errors={errors[index]}
              projectDeadline={projectDeadline}
              today={today}
            />
          ))}
          <button
            type="button"
            onClick={onAddMilestone}
            className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-white/70 hover:border-client-accent/50 hover:text-client-accent hover:bg-white/5 transition-all duration-300 backdrop-blur-sm"
          >
            <IoMdAdd className="inline-block mr-2 text-lg" />
            Add Milestone
          </button>
        </div>
      )}
    </div>
  );
};

export default MilestoneForm; 