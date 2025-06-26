import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Avatar, Rate, message, Modal, Steps } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  RocketOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  StarOutlined,
  TeamOutlined
} from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import Cookies from 'js-cookie';

const QuickAssignment = ({ 
  project, 
  bids, 
  onBack, 
  onAssign, 
  onBidSelect, 
  timeRemaining, 
  onRefreshBids 
}) => {
  const [assigning, setAssigning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [assignedBid, setAssignedBid] = useState(null);
  const [invitationSent, setInvitationSent] = useState(false);

  const steps = [
    { 
      title: 'Review Bids', 
      description: 'Quick assessment', 
      icon: <FileTextOutlined />,
      key: 'review'
    },
    { 
      title: 'Invitation Sent', 
      description: 'Waiting for response', 
      icon: <ClockCircleOutlined />,
      key: 'invitation'
    },
    { 
      title: 'Assignment Confirmed', 
      description: 'Project assigned', 
      icon: <CheckCircleOutlined />,
      key: 'confirmed'
    }
  ];

  const formatTime = (seconds) => {
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      return `${days}d ${hours}h`;
    }
  };

  // UPDATED: Handle quick assignment with proper state management
  const handleQuickAssign = async (bid) => {
    try {
      setAssigning(true);
      
      // Step 1: Mark bid as under_review (internal state change)
      const reviewResponse = await axios.post(
        `http://127.0.0.1:8000/api/client/mark_bid_under_review/`,
        { 
          bid_id: bid.id,
          project_complexity: 'entry'
        },
        { headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` } }
      );

      if (reviewResponse.data.status === 'success') {
        // Step 2: Create project assignment invitation
        const invitationResponse = await axios.post(
          `http://127.0.0.1:8000/api/client/invitations/create_project_assignment/`,
          { 
            bid_id: bid.id,
            message: `Congratulations! You have been selected for quick assignment to the project "${project.title}". Please review the terms and accept the assignment within 24 hours.`,
            expires_in_hours: 24
          },
          { headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` } }
        );

        if (invitationResponse.data.status === 'success') {
          message.success('Quick assignment invitation sent! Freelancer has 24 hours to respond.');
          setInvitationSent(true);
          setCurrentStep(1); // Move to invitation step
          
          // Refresh bids to show updated state
          onRefreshBids();
        }
      }
    } catch (error) {
      console.error('Error sending quick assignment:', error);
      message.error('Failed to send quick assignment invitation');
    } finally {
      setAssigning(false);
    }
  };

  // UPDATED: Step navigation with validation
  const handleNextStep = () => {
    const currentStepKey = steps[currentStep].key;
    
    // Validate before moving to next step
    if (currentStepKey === 'review' && bids.length === 0) {
      message.warning('No bids available to proceed');
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // FIXED: Check for assigned freelancer using assigned_freelancers array
  useEffect(() => {
    const checkForAssignedFreelancer = () => {
      if (project.assigned_freelancers && project.assigned_freelancers.length > 0) {
        const assignedFreelancerId = project.assigned_freelancers[0].id;
        const bid = bids.find(b => b.freelancer.id === assignedFreelancerId);
        if (bid) {
          setAssignedBid(bid);
          setCurrentStep(2); // Move to confirmed step
        }
      }
    };

    checkForAssignedFreelancer();
  }, [project.assigned_freelancers, bids]);

  const getCurrentStepKey = () => {
    return steps[currentStep].key;
  };

  // FIXED: Check if any freelancer is assigned using assigned_freelancers
  const isAnyFreelancerAssigned = project.assigned_freelancers && project.assigned_freelancers.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header - CONSISTENT STYLING */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-client-accent rounded-full"></div>
              <h2 className="text-xl font-semibold text-white">Quick Assignment</h2>
            </div>
            <Tag className="bg-client-accent/20 text-client-accent border-client-accent/30">
              Entry Level Project
            </Tag>
            {isAnyFreelancerAssigned && (
              <Tag className="bg-green-500/20 text-green-400 border-green-500/30">
                Assigned
              </Tag>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-xs text-white/60">Decision Window</div>
            <div className={`text-lg font-bold ${timeRemaining > 0 ? 'text-client-accent' : 'text-red-400'}`}>
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <div className="text-sm text-white/80">
            ⏱️ 24-hour window • Direct assignment • Fastest method
          </div>
        </div>
      </div>

      {/* UPDATED: Progress Steps with Consistent UI */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-client-accent rounded-full"></div>
          <h3 className="text-lg font-semibold text-white">Assignment Process</h3>
        </div>
        
        {/* FIXED: Steps container with proper overflow handling */}
        <div className="relative mb-6 overflow-hidden">
          <div className="flex items-center justify-between min-w-0">
            {steps.map((step, index) => (
              <div key={step.key} className="flex flex-col items-center flex-1 min-w-0 px-2">
                <div className={`relative mb-3 ${
                  index <= currentStep ? 'text-client-accent' : 'text-white/40'
                }`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    index < currentStep 
                      ? 'bg-client-accent border-client-accent text-white' 
                      : index === currentStep
                      ? 'bg-client-accent/20 border-client-accent text-client-accent'
                      : 'bg-white/10 border-white/20 text-white/40'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircleOutlined className="text-lg" />
                    ) : (
                      <div className="text-lg">{step.icon}</div>
                    )}
                  </div>
                  
                  <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center ${
                    index <= currentStep 
                      ? 'bg-client-accent text-white' 
                      : 'bg-white/20 text-white/40'
                  }`}>
                    {index + 1}
                  </div>
                </div>
                
                <div className={`text-center mb-1 min-w-0 w-full ${
                  index <= currentStep ? 'text-white' : 'text-white/60'
                }`}>
                  <div className="font-semibold text-sm truncate">{step.title}</div>
                  <div className="text-xs mt-1 opacity-80 truncate">{step.description}</div>
                </div>
                
                {/* Connector line - FIXED positioning */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-0.5 transition-all duration-300 z-0"
                    style={{ 
                      transform: 'translateX(50%)',
                      background: index < currentStep ? 'var(--client-accent)' : 'rgba(255, 255, 255, 0.2)'
                    }} 
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* UPDATED: Step navigation with back button */}
        <div className="flex justify-between items-center">
          <div className="text-white/60">
            {getCurrentStepKey() === 'review' && `${bids.length} bids received`}
            {getCurrentStepKey() === 'invitation' && (assignedBid ? 'Assignment confirmed' : 'Waiting for response')}
            {getCurrentStepKey() === 'confirmed' && 'Project assigned'}
          </div>
          
          <div className="flex gap-3">
            {/* Back Button */}
            {currentStep > 0 && (
              <Button 
                onClick={handlePreviousStep}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Previous
              </Button>
            )}
            
            {/* Next Button - Only show if not on invitation step */}
            {currentStep < 2 && getCurrentStepKey() !== 'invitation' && (
              <Button 
                type="primary"
                onClick={handleNextStep}
                className="bg-client-accent hover:bg-client-accent/90 shadow-none shadow-none border-0"
                disabled={getCurrentStepKey() === 'review' && bids.length === 0}
              >
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* UPDATED: Step Content with Proper Assignment Check */}
      <AnimatePresence mode="wait">
        {getCurrentStepKey() === 'review' && (
          <motion.div
            key="step-review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-client-accent rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">All Bids ({bids.length})</h3>
              </div>
              
              {bids.length === 0 ? (
                <div className="text-center py-12">
                  <UserOutlined className="text-4xl text-white/40 mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Bids Yet</h3>
                  <p className="text-white/60">Bids will appear here once freelancers submit their proposals</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bids.map((bid) => {
                    // FIXED: Check if this freelancer is assigned using assigned_freelancers
                    const isAssigned = project.assigned_freelancers && 
                      project.assigned_freelancers.some(freelancer => freelancer.id === bid.freelancer.id);
                    
                    return (
                      <div 
                        key={bid.id}
                        className={`bg-client-bg/80 backdrop-blur-xl rounded-xl border transition-all duration-300 overflow-hidden group ${
                          isAssigned 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : 'border-white/10 hover:border-client-accent/30'
                        }`}
                      >
                        {/* Bid Header - CONSISTENT STRUCTURE */}
                        <div className="p-6 border-b border-white/10">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar 
                                  size={60} 
                                  src={bid.freelancer.avatar}
                                  className="ring-2 ring-client-accent/30 ring-offset-2 ring-offset-client-bg-dark"
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-white mb-1">
                                  {bid.freelancer.name}
                                </h4>
                                <div className="flex items-center gap-1">
                                  <Rate disabled defaultValue={bid.freelancer.rating || 0} className="text-xs" />
                                  <span className="text-xs text-white/60 ml-1">
                                    ({bid.freelancer.rating || 0.0})
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {isAssigned ? (
                                <Tag className="bg-green-500/20 text-green-400 border-green-500/30 mb-2">
                                  Assigned
                                </Tag>
                              ) : (
                                <Tag className={`mb-2 ${
                                  bid.state === 'submitted' 
                                    ? 'bg-client-accent/20 text-client-accent border-client-accent/30'
                                    : bid.state === 'under_review'
                                    ? 'bg-status-warning/20 text-status-warning border-status-warning/30'
                                    : 'bg-white/20 text-white/80 border-white/30'
                                }`}>
                                  {bid.state === 'submitted' ? 'Ready to Assign' : 
                                   bid.state === 'under_review' ? 'Under Review' : bid.state}
                                </Tag>
                              )}
                              
                              <div className="text-lg font-bold text-client-accent mb-2">
                                ₹{bid.total_value.toLocaleString()}
                              </div>
                              
                              {/* UPDATED: Show invitation status or assignment status */}
                              {isAssigned ? (
                                <Button
                                  type="primary"
                                  disabled
                                  className="bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed"
                                  icon={<CheckCircleOutlined />}
                                >
                                  Assigned
                                </Button>
                              ) : bid.has_pending_invitation ? (
                                <div className="space-y-2">
                                  <Button
                                    type="primary"
                                    disabled
                                    className="bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed"
                                    icon={<CheckCircleOutlined />}
                                  >
                                    Invitation Sent
                                  </Button>
                                  <div className="text-xs text-white/60">
                                    Expires: {moment(bid.invitation_expires_at).format('MMM D, h:mm A')}
                                  </div>
                                </div>
                              ) : (
                                <Button
                                  type="primary"
                                  onClick={() => handleQuickAssign(bid)}
                                  className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
                                  loading={assigning}
                                  disabled={bid.state === 'under_review' || isAnyFreelancerAssigned}
                                >
                                  {bid.state === 'under_review' ? 'Invitation Sent' : 'Quick Assign'}
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Bid Amount & Timeline - CONSISTENT LAYOUT */}
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-white">
                                {bid.delivery_time} days
                              </div>
                              <div className="text-xs text-white/60">Delivery Time</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-medium text-white">
                                {moment().add(bid.delivery_time, 'days').format('MMM D')}
                              </div>
                              <div className="text-xs text-white/60">Expected Delivery</div>
                            </div>
                          </div>
                        </div>

                        {/* Bid Content - CONSISTENT STRUCTURE */}
                        <div className="p-6">
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-white/80 mb-2">Proposal</h5>
                            <div className="text-sm text-white/70 line-clamp-3 leading-relaxed">
                              {bid.proposal}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-4 border-t border-white/10">
                            <Button
                              size="small"
                              icon={<MessageOutlined />}
                              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                              onClick={() => onBidSelect(bid)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {getCurrentStepKey() === 'invitation' && (
          <motion.div
            key="step-invitation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              {assignedBid ? (
                // Assignment confirmed
                <div className="text-center py-8">
                  <CheckCircleOutlined className="text-6xl text-client-accent mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">Assignment Confirmed!</h3>
                  
                  {/* Show assigned freelancer details */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10 mt-6 mb-6">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Avatar 
                        size={80} 
                        src={assignedBid.freelancer.avatar}
                        className="ring-2 ring-client-accent/50 ring-offset-2 ring-offset-client-bg-dark"
                      />
                      <div className="text-left">
                        <h4 className="text-xl font-semibold text-white mb-1">
                          {assignedBid.freelancer.name}
                        </h4>
                        <div className="flex items-center gap-1 mb-2">
                          <Rate disabled defaultValue={assignedBid.freelancer.rating || 0} className="text-sm" />
                          <span className="text-white/60 text-sm">({assignedBid.freelancer.rating || 0.0})</span>
                        </div>
                        <div className="text-lg font-bold text-client-accent">
                          ₹{assignedBid.total_value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-sm text-white/60">Delivery Time</div>
                        <div className="text-lg font-semibold text-white">{assignedBid.delivery_time} days</div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Expected Delivery</div>
                        <div className="text-lg font-semibold text-white">
                          {moment().add(assignedBid.delivery_time, 'days').format('MMM D, YYYY')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/60 mb-6">
                    The project has been successfully assigned to {assignedBid.freelancer.name}.
                    You can now track progress and communicate through the project dashboard.
                  </p>
                  
                  <div className="flex gap-4 justify-center">
                    <Button 
                      type="primary"
                      className="bg-client-accent hover:bg-client-accent/90 shadow-none shadow-none border-0"
                      onClick={() => window.location.href = '/client/dashboard'}
                    >
                      Go to Dashboard
                    </Button>
                    <Button 
                      className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                      onClick={() => window.location.href = `/client/view-bids/posted-project/${project.id}`}
                    >
                      View Project
                    </Button>
                  </div>
                </div>
              ) : (
                // Waiting for response
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-client-accent mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Waiting for Response</h3>
                  <p className="text-white/60 mb-6">
                    The quick assignment invitation has been sent to the selected freelancer. 
                    They have 24 hours to accept the project.
                  </p>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                    <div className="text-sm text-white/60">
                      ⏰ You'll be notified as soon as the freelancer accepts the assignment.
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                    onClick={() => window.location.href = '/client/dashboard'}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {getCurrentStepKey() === 'confirmed' && (
          <motion.div
            key="step-confirmed"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="text-center py-8">
                <CheckCircleOutlined className="text-6xl text-client-accent mb-4" />
                <h3 className="text-2xl font-semibold text-white mb-2">Project Assigned!</h3>
                <p className="text-white/60 mb-6">
                  The project has been successfully assigned to the selected freelancer.
                </p>
                <Button 
                  type="primary"
                  className="bg-client-accent hover:bg-client-accent/90 shadow-none shadow-none border-0"
                  onClick={() => window.location.href = '/client/dashboard'}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      
    </motion.div>
  );
};

export default QuickAssignment; 