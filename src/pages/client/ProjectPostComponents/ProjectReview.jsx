import React from 'react';
import { motion } from 'framer-motion';

const ProjectReview = ({ project, isCollaborative }) => {
  // Helper function to calculate total milestone amount for fixed price projects
  const calculateTotalMilestoneAmount = (milestones) => {
    return milestones.reduce((total, milestone) => {
      if (milestone.milestone_type === 'hybrid' || milestone.milestone_type === 'payment') {
        return total + Number(milestone.amount || 0);
      }
      return total;
    }, 0);
  };

  // Helper function to calculate total hours for hourly projects
  const calculateTotalHours = (milestones) => {
    return milestones.reduce((total, milestone) => {
      return total + Number(milestone.estimated_hours || 0);
    }, 0);
  };

  // Helper function to calculate total max hours for hourly projects
  const calculateTotalMaxHours = (milestones) => {
    return milestones.reduce((total, milestone) => {
      return total + Number(milestone.max_hours || 0);
    }, 0);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format pricing strategy display
  const getPricingStrategyDisplay = () => {
    if (project.pricing_strategy === 'hourly') {
      return {
        label: 'Hourly Rate',
        icon: '⏰',
        description: `₹${project.hourly_rate}/hour`
      };
    } else {
      return {
        label: 'Fixed Price',
        icon: '💎',
        description: `₹${project.budget} total`
      };
    }
  };

  const pricingInfo = getPricingStrategyDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Project Overview */}
      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-lg p-6 shadow-sm border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Project Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-white/70">Project Type</p>
            <p className="font-medium text-white">{isCollaborative ? 'Collaborative' : 'Single Freelancer'}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Pricing Strategy</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{pricingInfo.icon}</span>
              <div>
                <p className="font-medium text-white">{pricingInfo.label}</p>
                <p className="text-xs text-white/60">{pricingInfo.description}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-white/70">Deadline</p>
            <p className="font-medium text-white">{formatDate(project.deadline)}</p>
          </div>
          <div>
            <p className="text-sm text-white/70">Domain</p>
            <p className="font-medium text-white">{project.domain}</p>
          </div>
        </div>

        {/* Hourly Project Specific Info */}
        {project.pricing_strategy === 'hourly' && (
          <div className="mt-4 p-4 bg-client-accent/10 rounded-lg border border-client-accent/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-white/70">Hourly Rate</p>
                <p className="font-medium text-client-accent">₹{project.hourly_rate}/hour</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Estimated Hours</p>
                <p className="font-medium text-white">{project.estimated_hours} hours</p>
              </div>
              <div>
                <p className="text-sm text-white/70">Max Hours</p>
                <p className="font-medium text-white">{project.max_hours} hours</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-white/70">Estimated Cost</p>
                <p className="font-bold text-client-accent text-lg">
                  ₹{((project.hourly_rate || 0) * (project.estimated_hours || 0)).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-lg">
                <p className="text-sm text-white/70">Maximum Cost</p>
                <p className="font-bold text-client-accent text-lg">
                  ₹{((project.hourly_rate || 0) * (project.max_hours || 0)).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fixed Price Project Specific Info */}
        {project.pricing_strategy === 'fixed' && (
          <div className="mt-4 p-4 bg-client-accent/10 rounded-lg border border-client-accent/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white/70">Total Budget</p>
                <p className="font-bold text-client-accent text-xl">₹{project.budget.toLocaleString()}</p>
              </div>
              {project.milestones.length > 0 && (
                <div className="text-right">
                  <p className="text-sm text-white/70">Milestone Payments</p>
                  <p className="font-medium text-white">₹{calculateTotalMilestoneAmount(project.milestones).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Project Description */}
      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-lg p-6 shadow-sm border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Project Description</h3>
        <div className="prose prose-sm max-w-none text-white/80" dangerouslySetInnerHTML={{ __html: project.description }} />
      </div>

      {/* Skills Required */}
      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-lg p-6 shadow-sm border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Required Skills</h3>
        <div className="flex flex-wrap gap-2">
          {project.skills_required.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-client-accent/20 text-client-accent rounded-full text-sm border border-client-accent/30">
              {skill.label}
            </span>
          ))}
        </div>
      </div>

      {/* Project Milestones */}
      {project.milestones.length > 0 && (
        <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-lg p-6 shadow-sm border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Project Milestones</h3>
          <div className="space-y-4">
            {project.milestones.map((milestone, index) => (
              <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{milestone.title}</h4>
                    
                    {/* Fixed Price Milestone Details */}
                    {project.pricing_strategy === 'fixed' && (
                      <>
                    <p className="text-sm text-white/70">Due: {formatDate(milestone.due_date)}</p>
                        {milestone.is_automated && (
                          <div className="mt-2">
                            <span className="px-2 py-1 bg-client-accent/20 text-client-accent text-xs rounded-full border border-client-accent/30">
                              Automated Payment
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Hourly Milestone Details */}
                    {project.pricing_strategy === 'hourly' && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-white/70">Estimated: <span className="text-white">{milestone.estimated_hours} hours</span></span>
                          <span className="text-white/70">Max: <span className="text-white">{milestone.max_hours} hours</span></span>
                        </div>
                        {milestone.priority_level && (
                          <div className="flex items-center gap-2">
                            <span className="text-white/70 text-sm">Priority:</span>
                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                              milestone.priority_level === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                              milestone.priority_level === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                              milestone.priority_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                              'bg-green-500/20 text-green-400 border border-green-500/30'
                            }`}>
                              {milestone.priority_level}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Amount Display for Fixed Price */}
                  {project.pricing_strategy === 'fixed' && 
                   (milestone.milestone_type === 'hybrid' || milestone.milestone_type === 'payment') && 
                   milestone.is_automated && (
                    <div className="text-right">
                      <p className="text-sm text-white/70">Amount</p>
                      <p className="font-medium text-white">₹{milestone.amount}</p>
                    </div>
                  )}

                  {/* Cost Display for Hourly */}
                  {project.pricing_strategy === 'hourly' && milestone.estimated_hours > 0 && (
                    <div className="text-right">
                      <div className="text-sm text-white/70">Estimated Cost</div>
                      <div className="font-medium text-client-accent">
                        ₹{((project.hourly_rate || 0) * (milestone.estimated_hours || 0)).toLocaleString()}
                      </div>
                      <div className="text-xs text-white/60">Max: ₹{((project.hourly_rate || 0) * (milestone.max_hours || 0)).toLocaleString()}</div>
                </div>
                  )}
                </div>

                {/* Quality Requirements and Deliverables for Hourly */}
                {project.pricing_strategy === 'hourly' && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {milestone.quality_requirements && (
                      <div>
                        <p className="text-xs text-white/60 mb-1">Quality Requirements</p>
                        <p className="text-sm text-white/80">{milestone.quality_requirements}</p>
                      </div>
                    )}
                    {milestone.deliverables && (
                      <div>
                        <p className="text-xs text-white/60 mb-1">Deliverables</p>
                        <p className="text-sm text-white/80">{milestone.deliverables}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Section (for collaborative projects) */}
      {isCollaborative && project.tasks.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks</h3>
          <div className="space-y-6">
            {project.tasks.map((task, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500">Due: {formatDate(task.deadline)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">₹{task.budget}</p>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none mb-4" 
                  dangerouslySetInnerHTML={{ __html: task.description }} 
                />

                {/* Task Skills */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {task.skills_required_for_task.map((skill, skillIndex) => (
                      <span key={skillIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {skill.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Task Milestones */}
                {task.milestones.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Milestones:</p>
                    <div className="space-y-3">
                      {task.milestones.map((milestone, mIndex) => (
                        <div key={mIndex} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">{milestone.title}</p>
                              <p className="text-xs text-gray-500">Due: {formatDate(milestone.due_date)}</p>
                            </div>
                            {(milestone.milestone_type === 'hybrid' || milestone.milestone_type === 'payment') && (
                              <div className="text-right">
                                <p className="text-xs text-gray-500">Amount</p>
                                <p className="font-medium">₹{milestone.amount}</p>
                              </div>
                            )}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              milestone.milestone_type === 'progress' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                            }`}>
                              {milestone.milestone_type === 'progress' ? 'Progress Only' : 'Progress & Payment'}
                            </span>
                            {milestone.is_automated && (
                              <span className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                                Automated Payment
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Summary */}
      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-lg p-6 shadow-sm border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Cost Summary</h3>
        <div className="space-y-3">
          {project.pricing_strategy === 'fixed' ? (
            <>
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <span className="text-white/70">Project Budget</span>
                <span className="font-medium text-white">₹{project.budget.toLocaleString()}</span>
          </div>
          {project.milestones.length > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-white/70">Milestone Payments</span>
                  <span className="font-medium text-white">₹{calculateTotalMilestoneAmount(project.milestones).toLocaleString()}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Hourly Rate</span>
                <span className="font-medium text-white">₹{project.hourly_rate}/hour</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Estimated Hours</span>
                <span className="font-medium text-white">{calculateTotalHours(project.milestones)} hours</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Maximum Hours</span>
                <span className="font-medium text-white">{calculateTotalMaxHours(project.milestones)} hours</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Estimated Cost</span>
                <span className="font-medium text-client-accent">₹{((project.hourly_rate || 0) * calculateTotalHours(project.milestones)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/70">Maximum Cost</span>
                <span className="font-medium text-client-accent">₹{((project.hourly_rate || 0) * calculateTotalMaxHours(project.milestones)).toLocaleString()}</span>
            </div>
            </>
          )}
          
          {isCollaborative && (
            <div className="flex justify-between items-center py-2 border-t border-white/10 mt-3">
              <span className="text-white/70">Task Budgets Total</span>
              <span className="font-medium text-white">
                ₹{project.tasks.reduce((total, task) => total + Number(task.budget), 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectReview;