import React, { useState, useEffect } from 'react';
import { Card, Button, Tag, Avatar, Rate, Steps, message, Modal, Input, Timeline, Progress } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MessageOutlined,
  StarOutlined,
  CrownOutlined,
  TeamOutlined,
  FileTextOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import moment from 'moment';

const { TextArea } = Input;

const PremiumAssignment = ({ project, onBack, onAssign, onBidSelect, timeRemaining, onRefreshBids }) => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [shortlistedBids, setShortlistedBids] = useState([]);
  const [interviewedBids, setInterviewedBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [interviewModal, setInterviewModal] = useState(false);
  const [interviewMessage, setInterviewMessage] = useState('');
  const [evaluationScores, setEvaluationScores] = useState({});
  const [includeInterview, setIncludeInterview] = useState(false);
  const [assignedBid, setAssignedBid] = useState(null);

  const getSteps = () => {
    const baseSteps = [
      { 
        title: 'Initial Review', 
        description: 'Review all submitted bids', 
        icon: <FileTextOutlined />,
        key: 'review'
      },
      { 
        title: 'Shortlist Phase', 
        description: 'Select top 5-8 candidates', 
        icon: <StarOutlined />,
        key: 'shortlist'
      }
    ];

    if (includeInterview) {
      baseSteps.push(
        { 
          title: 'Interview Phase', 
          description: 'Conduct detailed interviews', 
          icon: <MessageOutlined />,
          key: 'interview'
        }
      );
    }

    baseSteps.push(
      { 
        title: 'Final Selection', 
        description: 'Choose the best freelancer', 
        icon: <CheckCircleOutlined />,
        key: 'final'
      }
    );

    return baseSteps;
  };

  const steps = getSteps();

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://talintzbackend-production.up.railway.app/api/client/get_bids_on_project/${project.id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );
      setBids(response.data.bids || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
      message.error('Failed to load bids');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / 3600);
    return `${days}d ${hours}h`;
  };

  const handleShortlist = async (bidId) => {
    try {
      const bid = bids.find(b => b.id === bidId);
      if (!bid) return;

      const isCurrentlyShortlisted = bid.state === 'under_review';
      
      if (isCurrentlyShortlisted) {
        // If currently under review, move back to submitted
        const success = await axios.post(
          `https://talintzbackend-production.up.railway.app/api/client/mark_bid_submitted/`,
          { 
            bid_id: bidId,
            project_complexity: project.complexity_level
          },
          {
            headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` }
          }
        );

        if (success.data.status === 'success') {
          setShortlistedBids(prev => prev.filter(id => id !== bidId));
          message.success('Bid moved back to submitted state');
          fetchBids();
        }
      } else {
        // If currently submitted, move to under review
        const success = await axios.post(
          `https://talintzbackend-production.up.railway.app/api/client/mark_bid_under_review/`,
          { 
            bid_id: bidId,
            project_complexity: project.complexity_level
          },
          {
            headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` }
          }
        );

        if (success.data.status === 'success') {
          if (shortlistedBids.length < 8) {
            setShortlistedBids(prev => [...prev, bidId]);
            message.success('Bid shortlisted and moved to review phase');
          } else {
            message.warning('You can only shortlist up to 8 candidates');
            return;
          }
          fetchBids();
        }
      }
    } catch (error) {
      console.error('Error toggling bid state:', error);
      message.error('Failed to update bid state');
    }
  };

  const handleInterview = async () => {
    if (!interviewMessage.trim()) {
      message.error('Please enter an interview message');
      return;
    }

    try {
      // Get all under_review bids
      const underReviewBids = bids.filter(bid => bid.state === 'under_review');
      const bidIds = underReviewBids.map(bid => bid.id);
      
      // Create interview invitations
      const response = await axios.post(
        `https://talintzbackend-production.up.railway.app/api/client/invitations/create_interview_request/`,
        { 
          bid_ids: bidIds,
          message: interviewMessage,
          expires_in_hours: 48
        },
        { headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` } }
      );

      if (response.data.status === 'success') {
        message.success(`Interview requests sent to ${response.data.created_invitations} candidates`);
        setInterviewModal(false);
        setInterviewMessage('');
        setCurrentStep(2);
        
        // Refresh bids to show updated states
        fetchBids();
      }
    } catch (error) {
      console.error('Error sending interview requests:', error);
      message.error('Failed to send interview requests');
    }
  };

  const handleFinalSelection = async (bid) => {
    try {
      // Create project assignment invitation
      const response = await axios.post(
        `https://talintzbackend-production.up.railway.app/api/client/invitations/create_project_assignment/`,
        { 
          bid_id: bid.id,
          message: `Congratulations! You have been selected for the project "${project.title}". Please review the terms and accept the assignment.`,
          expires_in_hours: 24
        },
        { headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` } }
      );

      if (response.data.status === 'success') {
        message.success('Project assignment invitation sent successfully!');
          setAssignedBid(bid);
          setCurrentStep(steps.length - 1); // Move to final step
        fetchBids();
      }
    } catch (error) {
      console.error('Error creating assignment invitation:', error);
      message.error('Failed to send assignment invitation');
    }
  };

  // FIXED: Check for assigned freelancer using assigned_freelancers array
  useEffect(() => {
    const checkForAssignedFreelancer = () => {
      if (project.assigned_freelancers && project.assigned_freelancers.length > 0) {
        const assignedFreelancerId = project.assigned_freelancers[0].id;
        const bid = bids.find(b => b.freelancer.id === assignedFreelancerId);
        if (bid) {
          setAssignedBid(bid);
          setCurrentStep(steps.length - 1); // Move to final step
        }
      }
    };

    checkForAssignedFreelancer();
  }, [project.assigned_freelancers, bids, steps.length]);

  // UPDATED: Step navigation with proper validation
  const handleNextStep = () => {
    const currentStepKey = steps[currentStep].key;
    
    // Validate before moving to next step
    if (currentStepKey === 'review' && bids.length === 0) {
      message.warning('No bids available to proceed');
      return;
    }
    
    if (currentStepKey === 'shortlist' && bids.filter(bid => bid.state === 'under_review').length === 0) {
      message.warning('Please shortlist at least one candidate to proceed');
      return;
    }
    
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // FIXED: Check if any freelancer is assigned using assigned_freelancers
  const isAnyFreelancerAssigned = project.assigned_freelancers && project.assigned_freelancers.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-client-accent mx-auto mb-4"></div>
          <p className="text-white">Loading bids...</p>
        </div>
      </div>
    );
  }

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
              <h2 className="text-xl font-semibold text-white">Premium Assignment</h2>
            </div>
            <Tag className="bg-client-accent/20 text-client-accent border-client-accent/30">
              Advanced Project
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
            ⏱️ 7-14 days • Multi-stage selection • Highest quality
          </div>
        </div>
      </div>

      {/* Progress Steps - FIXED STYLING */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-client-accent rounded-full"></div>
            <h3 className="text-lg font-semibold text-white">Assignment Process</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">Include Interview Phase</span>
            <div 
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                includeInterview ? 'bg-client-accent' : 'bg-white/20'
              }`}
              onClick={() => setIncludeInterview(!includeInterview)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeInterview ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </div>
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
            {steps[currentStep].key === 'review' && `${bids.length} bids received`}
            {steps[currentStep].key === 'shortlist' && `${bids.filter(bid => bid.state === 'under_review').length} candidates shortlisted`}
            {steps[currentStep].key === 'interview' && 'Interview phase in progress'}
            {steps[currentStep].key === 'final' && (assignedBid ? 'Project assigned' : 'Waiting for assignment')}
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
            
            {/* Next Button */}
            {currentStep < steps.length - 1 && (
              <Button 
                type="primary"
                onClick={handleNextStep}
                className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
                disabled={
                  (steps[currentStep].key === 'review' && bids.length === 0) ||
                  (steps[currentStep].key === 'shortlist' && bids.filter(bid => bid.state === 'under_review').length === 0)
                }
              >
                Next Step
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Step Content - CONSISTENT BID CARDS */}
      <AnimatePresence mode="wait">
        {steps[currentStep].key === 'review' && (
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
                                : 'bg-white/20 text-white/80 border-white/30'
                            }`}>
                              {bid.state === 'submitted' ? 'Ready to Review' : bid.state}
                            </Tag>
                              )}
                              
                            <div className="text-lg font-bold text-client-accent mb-2">
                              ₹{bid.total_value.toLocaleString()}
                            </div>
                              
                              {isAssigned ? (
                                <Button
                                  type="primary"
                                  disabled
                                  className="bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed"
                                  icon={<CheckCircleOutlined />}
                                >
                                  Assigned
                                </Button>
                              ) : (
                            <Button
                              type={bid.state === 'under_review' ? "primary" : "default"}
                              onClick={() => handleShortlist(bid.id)}
                              className={bid.state === 'under_review' 
                                ? "bg-client-accent hover:bg-client-accent/90 border-0" 
                                : "bg-client-orange/60 hover:bg-white/20 text-white border-white/20"
                              }
                                  disabled={isAnyFreelancerAssigned}
                            >
                              {bid.state === 'under_review' ? 'Shortlisted' : 'Shortlist'}
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

        {steps[currentStep].key === 'shortlist' && (
          <motion.div
            key="step-shortlist"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-client-accent rounded-full"></div>
                  <h3 className="text-lg font-semibold text-white">
                    Shortlisted Candidates ({bids.filter(bid => bid.state === 'under_review').length})
                  </h3>
                </div>
                
                {includeInterview ? (
                  <Button 
                    type="primary"
                    icon={<MessageOutlined />}
                    onClick={() => setInterviewModal(true)}
                    className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
                    disabled={bids.filter(bid => bid.state === 'under_review').length === 0}
                  >
                    Send Interview Requests
                  </Button>
                ) : (
                  <div className="text-sm text-white/60">
                    {bids.filter(bid => bid.state === 'under_review').length} candidates ready for selection
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {bids
                  .filter(bid => bid.state === 'under_review')
                  .map((bid) => {
                    // FIXED: Check if this freelancer is assigned using assigned_freelancers
                    const isAssigned = project.assigned_freelancers && 
                      project.assigned_freelancers.some(freelancer => freelancer.id === bid.freelancer.id);
                    
                    return (
                    <div 
                      key={bid.id}
                        className={`bg-client-bg/80 backdrop-blur-xl rounded-xl border transition-all duration-300 overflow-hidden ${
                          isAssigned 
                            ? 'border-green-500/50 bg-green-500/10' 
                            : 'border-white/10 hover:border-client-accent/30'
                        }`}
                    >
                      <div className="p-6">
                        <div className="text-center">
                          <Avatar 
                            size={64} 
                            src={bid.freelancer.avatar}
                            className="mb-3 ring-2 ring-client-accent/30 ring-offset-2 ring-offset-client-bg-dark"
                          />
                          
                          <h4 className="text-white font-semibold mb-1">
                            {bid.freelancer.name}
                          </h4>
                          
                          <div className="text-lg font-bold text-client-accent mb-2">
                            ₹{bid.total_value.toLocaleString()}
                          </div>
                          
                          <div className="flex items-center justify-center gap-1 mb-2">
                            <Rate disabled defaultValue={bid.freelancer.rating || 0} className="text-xs" />
                            <span className="text-white/60 text-xs">({bid.freelancer.rating || 0.0})</span>
                          </div>
                          
                            {isAssigned ? (
                              <div className="space-y-2">
                                <Button
                                  type="primary"
                                  disabled
                                  className="bg-green-500/20 text-green-400 border-green-500/30 cursor-not-allowed"
                                  icon={<CheckCircleOutlined />}
                                >
                                  Assigned
                                </Button>
                                <Tag className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                  Project Assigned
                                </Tag>
                              </div>
                            ) : bid.has_pending_invitation ? (
                            <div className="space-y-2">
                              <Button
                                type="primary"
                                disabled
                                className="bg-green-500/20 !text-green-400 border-green-500/30 cursor-not-allowed"
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
                              onClick={() => handleFinalSelection(bid)}
                              className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
                                disabled={isAnyFreelancerAssigned}
                            >
                              Select This Freelancer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}

        {steps[currentStep].key === 'interview' && includeInterview && (
          <motion.div
            key="step-interview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-client-accent rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Interview Phase</h3>
              </div>
              <p className="text-white/60 mb-4">
                Interview requests have been sent to shortlisted candidates. 
                Review their responses and proceed to evaluation.
              </p>
              
              {/* Interview Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-client-accent">
                    {bids.filter(bid => bid.state === 'interview_accepted').length}
                  </div>
                  <div className="text-sm text-white/60">Accepted Interviews</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-yellow-400">
                    {bids.filter(bid => bid.state === 'interview_requested').length}
                  </div>
                  <div className="text-sm text-white/60">Pending Responses</div>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-2xl font-bold text-red-400">
                    {bids.filter(bid => bid.state === 'interview_declined').length}
                  </div>
                  <div className="text-sm text-white/60">Declined Interviews</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Show accepted interviews first */}
                {bids
                  .filter(bid => bid.state === 'interview_accepted')
                  .map((bid) => (
                    <div 
                      key={bid.id}
                      className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="text-center">
                          <div className="relative mb-3">
                            <Avatar 
                              size={64} 
                              src={bid.freelancer.avatar}
                              className="ring-2 ring-green-500/50 ring-offset-2 ring-offset-client-bg-dark"
                            />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                              <CheckCircleOutlined className="text-white text-xs" />
                            </div>
                          </div>
                          
                          <h4 className="text-white font-semibold mb-1">
                            {bid.freelancer.name}
                          </h4>
                          
                          <div className="text-lg font-bold text-green-400 mb-2">
                            ₹{bid.total_value.toLocaleString()}
                          </div>
                          
                          <Tag className="bg-green-500/20 text-green-400 border-green-500/30 mb-3">
                            Interview Accepted
                          </Tag>
                          
                          <div className="flex items-center justify-center gap-1 mb-3">
                            <Rate disabled defaultValue={bid.freelancer.rating || 0} className="text-xs" />
                            <span className="text-white/60 text-xs">({bid.freelancer.rating || 0.0})</span>
                          </div>
                          
                          <Button
                            type="primary"
                            onClick={() => handleFinalSelection(bid)}
                            className="bg-green-500 hover:bg-green-600 shadow-none border-0"
                          >
                            Select This Freelancer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {/* Show pending interview requests */}
                {bids
                  .filter(bid => bid.state === 'interview_requested')
                  .map((bid) => (
                    <div 
                      key={bid.id}
                      className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/10 hover:border-yellow-400/30 transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="text-center">
                          <div className="relative mb-3">
                            <Avatar 
                              size={64} 
                              src={bid.freelancer.avatar}
                              className="ring-2 ring-yellow-400/50 ring-offset-2 ring-offset-client-bg-dark"
                            />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                              <ClockCircleOutlined className="text-white text-xs" />
                            </div>
                          </div>
                          
                          <h4 className="text-white font-semibold mb-1">
                            {bid.freelancer.name}
                          </h4>
                          
                          <div className="text-lg font-bold text-yellow-400 mb-2">
                            ₹{bid.total_value.toLocaleString()}
                          </div>
                          
                          <Tag className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30 mb-3">
                            Awaiting Response
                          </Tag>
                          
                          <div className="flex items-center justify-center gap-1 mb-3">
                            <Rate disabled defaultValue={bid.freelancer.rating || 0} className="text-xs" />
                            <span className="text-white/60 text-xs">({bid.freelancer.rating || 0.0})</span>
                          </div>
                          
                          <Button
                            type="primary"
                            disabled
                            className="bg-white/10 text-white/40 border-white/20 cursor-not-allowed"
                          >
                            Waiting for Response
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {steps[currentStep].key === 'final' && (
          <motion.div
            key="step-final"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/10">
              {assignedBid ? (
                // Project is assigned - show success
                <div className="text-center py-8">
                  <CheckCircleOutlined className="text-6xl text-client-accent mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">Project Assigned!</h3>
                  
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
                      className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
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
                // Waiting for assignment acceptance
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-client-accent mx-auto mb-4"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Waiting for Assignment</h3>
                  <p className="text-white/60 mb-6">
                    The assignment invitation has been sent to the selected freelancer. 
                    They have 24 hours to accept the project.
                  </p>
                  
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-6">
                    <div className="text-sm text-white/60">
                      You'll be notified as soon as the freelancer accepts the assignment.
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
      </AnimatePresence>

      {/* Interview Modal - CONSISTENT STYLING */}
      <Modal
        visible={interviewModal}
        onCancel={() => setInterviewModal(false)}
        title="Send Interview Request"
        footer={[
          <Button key="cancel" onClick={() => setInterviewModal(false)}>
            Cancel
          </Button>,
          <Button 
            key="send" 
            type="primary"
            onClick={handleInterview}
            className="bg-client-accent hover:bg-client-accent/90 shadow-none border-0"
          >
            Send Requests
          </Button>
        ]}
        className="custom-modal"
      >
        <div className="space-y-4">
          <p className="text-white/60">
            Send an interview request to all shortlisted candidates. 
            They will be notified and can respond with additional information.
          </p>
          
          <div>
            <label className="block text-sm text-white/60 mb-2">Interview Message</label>
            <TextArea
              value={interviewMessage}
              onChange={(e) => setInterviewMessage(e.target.value)}
              placeholder="Enter your interview message or questions for the candidates..."
              rows={4}
              className="bg-white/5 border border-white/10 text-white"
            />
          </div>
        </div>
      </Modal>

      
      {/* Add the same custom CSS at the end */}
      <style jsx>{`
        .ant-steps .ant-steps-item-title {
          color: var(--text-light) !important;
        }
        .ant-steps .ant-steps-item-description {
          color: var(--text-secondary) !important;
        }
        .ant-steps .ant-steps-item-process .ant-steps-item-title {
          color: var(--client-accent) !important;
        }
        .ant-steps .ant-steps-item-finish .ant-steps-item-title {
          color: var(--client-accent) !important;
        }
        .ant-steps .ant-steps-item-finish .ant-steps-item-description {
          color: var(--text-light) !important;
        }
        .ant-steps .ant-steps-item-icon {
          background: var(--client-accent) !important;
          border-color: var(--client-accent) !important;
        }
        .ant-steps .ant-steps-item-finish .ant-steps-item-icon {
          background: var(--client-accent) !important;
          border-color: var(--client-accent) !important;
        }
        .ant-steps .ant-steps-item-process .ant-steps-item-icon {
          background: var(--client-accent) !important;
          border-color: var(--client-accent) !important;
        }
        .ant-steps .ant-steps-item-wait .ant-steps-item-icon {
          background: transparent !important;
          border-color: var(--text-secondary) !important;
        }
        .ant-steps .ant-steps-item-wait .ant-steps-item-icon .ant-steps-icon {
          color: var(--text-secondary) !important;
        }
        .ant-steps .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon {
          color: white !important;
        }
        .ant-steps .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon {
          color: white !important;
        }
        .ant-steps .ant-steps-item-finish .ant-steps-item-tail::after {
          background: var(--client-accent) !important;
        }
        .ant-steps .ant-steps-item-process .ant-steps-item-tail::after {
          background: var(--client-accent) !important;
        }
        .ant-steps .ant-steps-item-wait .ant-steps-item-tail::after {
          background: var(--text-secondary) !important;
        }
      `}</style>
    </motion.div>
  );
};

export default PremiumAssignment; 