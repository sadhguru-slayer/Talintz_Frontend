import React, { useState, useEffect } from "react";
import { FileOutlined, CheckCircleOutlined, ClockCircleOutlined, EditOutlined, CommentOutlined, DollarOutlined, HistoryOutlined, ExclamationCircleOutlined, InfoCircleOutlined, InboxOutlined } from '@ant-design/icons';
import overviewData from "../../utils/data";
import { useParams } from "react-router-dom";
import { getBaseURL } from "../../../../../config/axios";
import Cookies from 'js-cookie';
import { MdFeaturedPlayList } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';  // Ensure this is imported
import { X as CloseIcon } from 'lucide-react';  // Ensure this is imported
import { message, Tabs, Input as AntInput, Upload as AntUpload, Modal } from 'antd';  // Ensure Tabs and Upload are imported
const { TabPane } = Tabs;
const { TextArea } = AntInput;
import { Input, Button } from 'antd'; // Assuming Input and Button are imported
import { UploadOutlined } from '@ant-design/icons'; // Assuming UploadOutlined is imported
import moment from 'moment'; // Assuming moment is imported
import { InputNumber } from 'antd'; // Assuming InputNumber is imported
import { useMemo } from 'react';

const statusColor = status =>
  status === "Completed"
    ? "bg-green-500 text-white"
    : status === "In Progress"
    ? "bg-yellow-400 text-gray-900"
    : status === "Revision"
    ? "bg-red-400 text-white"
    : status === "Submitted"
    ? "bg-blue-500 text-white"
    : "bg-gray-400 text-white";

const sectionInfo = {
  summary: "This section describes what this milestone is about and any special instructions.",
  deliverables: "Here you'll find all files and links submitted for this milestone.",
  comments: "Discuss this milestone with your freelancer. Comments here are only for this milestone.",
  actions: "You can approve, request changes, or raise a dispute for this milestone.",
  payout: "Shows how much will be paid out when this milestone is approved.",
  history: "A record of all important actions and changes for this milestone."
};

const statusBadge = (statusRaw) => {
  if (!statusRaw) return null;
  const status = statusRaw.replace(/_/g, " ").toLowerCase();
  const prettyStatus = status
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const statusConfig = {
    "pending":         { color: "bg-gray-200 text-gray-800", icon: "⏳" },
    "in progress":     { color: "bg-blue-100 text-blue-800", icon: "🚧" },
    "under review":    { color: "bg-blue-100 text-blue-800", icon: "🔍" },
    "approved":        { color: "bg-green-100 text-green-800", icon: "✅" },
    "completed":       { color: "bg-green-200 text-green-900", icon: "🏁" },
    "submitted":       { color: "bg-blue-50 text-blue-700", icon: "📤" },
    "revision":        { color: "bg-orange-100 text-orange-800", icon: "✏️" },
    "disputed":        { color: "bg-red-100 text-red-800", icon: "⚠️" },
  };
  const config = statusConfig[status] || statusConfig["pending"];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.color} font-semibold text-xs`}>
      {config.icon} {prettyStatus}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const Milestones = () => {
  const params = useParams();
  const workspace_id = params.workspaceId;

  // Updated state to include dataType
  const [milestones, setMilestones] = useState([]);
  const [dataType, setDataType] = useState(null);  // New state for data.type
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [openIdx, setOpenIdx] = useState(0);
  
  const [openBoxes, setOpenBoxes] = useState({});  // New state for boxes

  // For modals
  const [showApproveModal,setShowApproveModal] = useState(false)
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [activeDisputeTab, setActiveDisputeTab] = useState('instructions');
  const [extensionDays, setExtensionDays] = useState(0);  // For extend deadline
  const [feedback, setFeedback] = useState('');  // For approve feedback
  const [disputeDetails, setDisputeDetails] = useState({ milestoneName: '', description: '', files: [] });

  const [historyPage, setHistoryPage] = useState({}); // {milestoneId: pageNumber}
  const HISTORY_PAGE_SIZE = 5;

  const getPaginatedHistory = (milestone) => {
    const page = historyPage[milestone.id] || 1;
    const start = (page - 1) * HISTORY_PAGE_SIZE;
    const end = start + HISTORY_PAGE_SIZE;
    return (milestone.history || []).slice(start, end);
  };

  const getHistoryPageCount = (milestone) => {
    return Math.ceil((milestone.history?.length || 0) / HISTORY_PAGE_SIZE);
  };

  // Define fetchMilestones at the component level
  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const accessToken = Cookies.get('accessToken');
      const response = await fetch(`${getBaseURL()}/api/workspace/client/milestones/${parseInt(workspace_id)}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      setDataType(data.type);
      setMilestones(data.milestones || []);
      setLoading(false);  // Ensure loading is reset
      return data.milestones;  // Return the data for use in other functions
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];  // Return an empty array on error to avoid undefined issues
    }
  };

  useEffect(() => {


    if (workspace_id) {
      fetchMilestones();
    }
  }, [workspace_id]);

  useEffect(() => {
    if (openIdx !== -1 && milestones.length > 0) {
      setHistoryPage((prev) => ({
        ...prev,
        [milestones[openIdx].id]: 1,
      }));
    }
  }, [openIdx, milestones]);

  const handleApprove = async () => {
    if (!milestones || !milestones[openIdx]) {
      message.error('No milestone selected or available.');
      return;
    }
    
    try {
      const accessToken = Cookies.get('accessToken');
      const url = `${getBaseURL()}/api/workspace/client/milestone/${milestones[openIdx].id}/approve/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedback,
          extensionDays: milestones[openIdx].type === 'obsp' && extensionDays > 0 ? extensionDays : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        message.success(data.message);
        setShowApproveModal(false);
        // Refetch milestones
        const updatedMilestones = await fetchMilestones();  // Ensure this function is defined
        setMilestones(updatedMilestones);
      } else {
        message.error('Error: ' + data.error);
      }
    } catch (err) {
      message.error('Failed to approve milestone: ' + err.message);
    }
  };

  const handleRaiseDispute = async () => {
    if (!milestones || !milestones[openIdx]) {
      message.error('No milestone selected or available.');
      return;
    }
    
    try {
      const accessToken = Cookies.get('accessToken');
      const url = `${getBaseURL()}/api/workspace/client/milestone/${milestones[openIdx].id}/dispute/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: activeDisputeTab === 'details' ? 'details' : 'instructions',
          details: activeDisputeTab === 'details' ? disputeDetails.description : null,
          files: activeDisputeTab === 'details' ? disputeDetails.files.map(f => ({
            name: f.name,
            url: f.url || '',  // Safeguard for undefined URL
            uid: f.uid,
            status: 'done',
          })) : [],
        }),
      });
      const data = await response.json();
      if (data.success) {
        message.success(data.message);
        setShowDisputeModal(false);
        const updatedMilestones = await fetchMilestones();
        setMilestones(updatedMilestones);
      } else {
        message.error('Error: ' + data.error);
      }
    } catch (err) {
      message.error('Failed to raise dispute: ' + err.message);
    }
  };

  // Add the new state and function at the component level
  const [isExtendInputVisible, setIsExtendInputVisible] = useState(false);
  const [extensionInput, setExtensionInput] = useState(0);  // State for extension days input

  const calculateMaxExtensionDays = () => {
    if (milestones && milestones[openIdx] && milestones[openIdx + 1]) {
      const currentDue = moment(milestones[openIdx].due);
      const nextDue = moment(milestones[openIdx + 1].due);
      const daysBetween = nextDue.diff(currentDue, 'days');  // Difference in days
      return Math.floor(daysBetween / 2);  // Half, rounded down
    }
    return 0;  // Default if no next milestone
  };

  const fileList = useMemo(() => (
    <ul className="mt-1 list-disc pl-5 text-text-light text-sm space-y-1 text-left">
      {disputeDetails.files.map(file => (
        <li key={file.uid} className="flex items-start gap-2 text-left">
          {file.name}
        </li>
      ))}
    </ul>
  ), [disputeDetails.files]);

  return (
    <div className="space-y-8 p-4">
      {loading && <div className="text-white/80">Loading milestones...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      {!loading && !error && milestones?.length === 0 && (
        <div className="text-white/60">No milestones found.</div>
      )}
      {milestones.map((milestone, idx) => {
        const isOpen = openIdx === idx;
        const status = (milestone.status || "").toLowerCase();
        const isCurrent = ["submitted", "in progress", "revision"].includes(status);
        const isCompleted = status === "completed";

        return (
          <div
            key={milestone.id}
            className={`bg-client-secondary/80 border ${isOpen ? 'border-client-accent' : 'border-client-border'} rounded-xl shadow-card`}
          >
            {/* Header */}
            <button
              className="w-full flex justify-between items-start p-4 focus:outline-none"
              onClick={() => setOpenIdx(isOpen ? -1 : idx)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-client-accent" />
                  <span className="text-lg font-bold text-white">{milestone.title}</span>
                  <span className="ml-2">{statusBadge(milestone.status)}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span>Due: {formatDate(milestone.due || milestone.deadline)}</span>
                  <span>{milestone.payout_percentage || milestone.payout?.percent || 0}% Payout</span>
                </div>
                {!isOpen && milestone.description && (
                  <p className="text-sm text-white/70 mt-1 truncate">
                    {milestone.description.slice(0, 50)}{milestone.description.length > 50 ? "..." : ""}
                  </p>
                )}
              </div>
              <span className="text-white/40 text-sm">{isOpen ? "▲" : "▼"}</span>
            </button>

            {/* Expanded Content */}
            {isOpen && (
              <div className="p-8 pt-0 space-y-10 border-t border-white/10 bg-client-secondary/90 rounded-b-xl">
                {/* 1. Overview */}
                <section className="my-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <InfoCircleOutlined className="text-client-accent" /> Overview
                  </h3>
                  <p className="text-white/90 text-base mb-1">{milestone.description || "No summary provided."}</p>
                  {milestone.instructions && (
                    <p className="text-white/60 text-sm mt-1">{milestone.instructions}</p>
                  )}
                </section>


                {/* 3. Feedback & Comments */}
                <section className="mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <CommentOutlined className="text-client-accent" /> Feedback & Comments
                  </h3>
                  <p className="text-xs text-white/40 mb-3">{sectionInfo.comments}</p>
                  {milestone.comments && milestone.comments.length > 0 ? (
                    <ul className="space-y-2 mb-2">
                      {milestone.comments.map(c => (
                        <li key={c.id} className="flex justify-between items-center bg-white/5 rounded px-3 py-2">
                          <span className="text-white/90"><span className="font-semibold text-client-accent">{c.author}:</span> {c.text}</span>
                          <span className="text-xs text-white/50">{c.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-white/60 mb-2">No comments yet.</div>
                  )}
                  {isCurrent && (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea className="w-full rounded p-2 bg-white/10 text-white border border-client-border focus:ring-2 focus:ring-client-accent" placeholder="Add a comment..." rows={2} />
                      <div className="flex justify-end">
                        <button className="px-4 py-1 rounded bg-client-accent text-white font-semibold hover:bg-client-accent/90">Post Comment</button>
                      </div>
                    </div>
                  )}
                </section>

                {/* 4. Actions (only for in progress) */}
                {status === "in_progress" && (
                  <section className="mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                      <EditOutlined className="text-client-accent" /> Actions
                    </h3>
                    <p className="text-xs text-white/40 mb-3">{sectionInfo.actions}</p>
                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={() => setShowApproveModal(true)}
                        className="px-4 py-2 rounded bg-green-500 text-white font-semibold flex items-center gap-1 hover:bg-green-600"
                      >
                        <CheckCircleOutlined /> Approve
                      </button>
                      <button
                        onClick={() => setShowDisputeModal(true)}
                        className="px-4 py-2 rounded bg-red-500 text-white font-semibold flex items-center gap-1 hover:bg-red-600"
                      >
                        <ExclamationCircleOutlined /> Dispute
                      </button>
                    </div>
                    <div className="mt-3 text-xs text-white/60 flex items-center gap-2">
                      <InfoCircleOutlined className="mr-1" />
                      <span>
                        Approving this milestone will release the payout. If auto-pay is enabled, payment is deducted automatically.
                      </span>
                    </div>
                  </section>
                )}

                {/* 2. Submissions Section - Unified like freelancer's */}
                <section className="mb-6 border border-white/50 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <FileOutlined className="text-client-accent" /> Submissions
                  </h3>
                  <p className="text-xs text-white/40 mb-2">
                    View the submitted files and boxes for this milestone.
                  </p>

                  {/* 2.1 Regular Submissions */}
                  {milestone.submissions && milestone.submissions.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2 mb-2">
                        <FileOutlined className="text-client-accent" /> Submitted Files
                      </h4>
                    <ul className="space-y-2">
                        {milestone.submissions.map((submission, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-white/90 text-sm">
                            <a href={submission.url} className="underline" target="_blank" rel="noopener noreferrer">{submission.name}</a>
                            <span className="text-xs text-white/50">Submitted: {submission.submittedAt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-white/60 mb-4">No regular submissions yet.</div>
                  )}

                  {/* 2.2 Boxes */}
                  {milestone.boxes && milestone.boxes.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-client-accent flex items-center gap-2 mb-2">
                        <InboxOutlined /> Boxes
                      </h4>
                      <div className="flex flex-wrap gap-3">
                        {milestone.boxes.map((box, idx) => (
                          <>
                            <div
                              key={box.id || idx}
                              className={`w-72 rounded-3xl bg-client-secondary text-white p-6 relative shadow-sm cursor-pointer hover:scale-[1.005] border border-client-primary transition-transform ${box.status === 'approved' ? 'border-green-500' : ''}`}
                              onClick={() => setOpenBoxes(prev => ({ ...prev, [box.id || idx]: !prev[box.id || idx] }))}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm text-gray-300">Box Details</p>
                                  <h1 className="text-2xl font-bold mt-1 flex items-center gap-2">{box.title || `Box ${idx + 1}`}
                                    {box.status === 'approved' && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-semibold">
                                        <CheckCircleOutlined size={14} /> Approved
                                      </span>
                                    )}
                                  </h1>
                                </div>
                                <InboxOutlined className="text-client-accent w-5 h-5 mt-1" />
                              </div>

                              <div className="mt-6 space-y-4">
                                {box.files && box.files.length > 0 && (
                                  <div className="flex items-center space-x-3">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-client-accent text-white">
                                      {box.files.length} Files
                                    </span>
                                    {box.description && (
                                      <div>
                                        <span className="text-sm">
                                          {box.description.length > 100 ? box.description.slice(0, 100) + '...' : box.description}
                                        </span>
                                        {box.description.length > 100 && (
                                          <p className="text-xs text-gray-400 mt-1">Click to view full details</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <AnimatePresence>
                              {openBoxes[box.id || idx] && (
                                <motion.div
                                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                >
                                  <motion.div
                                    className="bg-client-secondary text-white rounded-3xl p-8 w-[90%] max-w-md shadow-2xl relative"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                  >
                                    <button
                                      onClick={() => setOpenBoxes(prev => ({ ...prev, [box.id || idx]: false }))}
                                      className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                    >
                                      <CloseIcon size={20} />
                                    </button>

                                    <p className="text-sm text-gray-300">Box Details</p>
                                    <h1 className="text-2xl font-bold mt-1">{box.title || `Box ${idx + 1}`}</h1>
                                    {box.status === 'approved' && (
                                      <div className="text-green-500 font-semibold flex items-center gap-2 mt-1">
                                        <CheckCircleOutlined /> Approved
                                      </div>
                                    )}

                                    <div className="mt-6 space-y-4">
                                      <p className="text-white/80">{box.description}</p>
                                      <ul className="space-y-2">
                                        {box.files.map((file, fidx) => (
                                          <li key={fidx} className="flex items-center space-x-3">
                                            <a href={file.url} className="underline text-client-accent" target="_blank" rel="noopener noreferrer">{file.name}</a>
                                          </li>
                                        ))}
                                      </ul>

                                      {typeof box.status === 'string' && box.status !== 'approved' && (
                                        <div className="mt-4 border-t border-white/20 pt-4">
                                          <h4 className="text-sm font-semibold text-client-accent mb-2">Client Actions</h4>
                                          {box.status === 'submitted' && (
                                            <>
                                              <button
                                                className="px-4 py-2 rounded bg-green-500 text-white font-semibold mr-2 hover:bg-green-600"
                                                onClick={async () => {
                                                  try {
                                                    const response = await fetch(`${getBaseURL()}/api/workspace/client/box/${box.id}/approve/`, {
                                                      method: 'POST',
                                                      headers: {
                                                        'Authorization': `Bearer ${Cookies.get('accessToken')}`,
                                                        'Content-Type': 'application/json',
                                                      },
                                                    });
                                                    const data = await response.json();
                                                    if (data.success) {
                                                      message.success(data.message);  // Or update state to reflect changes
                                                      setOpenBoxes(prev => ({ ...prev, [box.id || idx]: false }));  // Close modal
                                                      // Refetch milestones to update UI
                                                      const updatedMilestones = await fetchMilestones();
                                                      setMilestones(updatedMilestones);
                                                    } else {
                                                      message.error('Error: ' + data.error);
                                                    }
                                                  } catch (err) {
                                                    message.error('Failed to approve box');
                                                  }
                                                }}
                                              >
                                                Approve Box
                                              </button>
                                              <button
                                                className="px-4 py-2 rounded bg-yellow-500 text-white font-semibold hover:bg-yellow-600"
                                                onClick={async () => {
                                                  try {
                                                    const response = await fetch(`${getBaseURL()}/api/workspace/client/box/${box.id}/viewed/`, {
                                                      method: 'POST',
                                                      headers: {
                                                        'Authorization': `Bearer ${Cookies.get('accessToken')}`,
                                                        'Content-Type': 'application/json',
                                                      },
                                                    });
                                                    const data = await response.json();
                                                    console.log(data)
                                                    if (data.success) {
                                                      message.success(data.message);  // Or update state to reflect changes
                                                      setOpenBoxes(prev => ({ ...prev, [box.id || idx]: false }));  // Close modal
                                                      // Refetch milestones to update UI
                                                      const updatedMilestones = await fetchMilestones();
                                                      setMilestones(updatedMilestones);
                                                    } else {
                                                      message.error('Error: ' + data.error);
                                                    }
                                                  } catch (err) {
                                                   console.log(err)
                                                    message.error('Failed to mark as viewed');
                                                  }
                                                }}
                                              >
                                                Mark as Viewed
                                              </button>
                                            </>
                                          )}
                                          {box.status === 'viewed' && (
                                            <button
                                              className="px-4 py-2 rounded bg-green-500 text-white font-semibold mr-2 hover:bg-green-600"
                                              onClick={async () => {
                                                try {
                                                  const response = await fetch(`${getBaseURL()}/api/workspace/client/box/${box.id}/approve/`, {
                                                    method: 'POST',
                                                    headers: {
                                                      'Authorization': `Bearer ${Cookies.get('accessToken')}`,
                                                      'Content-Type': 'application/json',
                                                    },
                                                  });
                                                  const data = await response.json();
                                                  if (data.success) {
                                                    message.success(data.message);  // Or update state to reflect changes
                                                    setOpenBoxes(prev => ({ ...prev, [box.id || idx]: false }));  // Close modal
                                                    // Refetch milestones to update UI
                                                    const updatedMilestones = await fetchMilestones();
                                                    setMilestones(updatedMilestones);
                                                  } else {
                                                    message.error('Error: ' + data.error);
                                                  }
                                                } catch (err) {
                                                  message.error('Failed to approve box');
                                                }
                                              }}
                                            >
                                              Approve Box
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/60">No boxes submitted yet.</div>
                  )}
                </section>
                {/* 5. Payout Info */}
                <section className="mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <DollarOutlined className="text-client-accent" /> Payout Info
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-client-secondary/60 border border-client-border rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-white/90 font-semibold">{milestone.payout_percentage || milestone.payout?.percent || 0}% will be released on approval</span>
                    </div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                      <span className="text-white/60">Status: <span className={`font-semibold ${milestone.payout?.status === "released" ? "text-green-400" : "text-yellow-400"}`}>{milestone.payout?.status || "held"}</span></span>
                      <span className="text-white/60">Auto Pay: <span className="font-semibold">{milestone.payout?.autoPay ? "Yes" : "No"}</span></span>
                    </div>
                  </div>
                </section>

                {/* 6. History */}
                <section>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <HistoryOutlined className="text-client-accent" /> Change Log / History
                  </h3>
                  {milestone.history && Array.isArray(milestone.history) && milestone.history.filter(h => h != null && typeof h === 'object' && (h.action || h.by || h.details || h.time)).length > 0 ? (
                    <>
                      <ul className="divide-y divide-white/10">
                        {getPaginatedHistory(milestone).filter(h => h != null && typeof h === 'object').map((h, i) => (  // Also filter inside the map for safety
                          <li key={i} className="py-2 flex justify-between items-center text-white/80">
                            <span>
                              <span className="font-semibold">{h?.action}</span> by {h?.by}
                              {h?.details && <>: <span className="text-white/60">{h?.details}</span></>}
                            </span>
                            <span className="text-xs text-white/50">{h?.time}</span>
                          </li>
                        ))}
                      </ul>
                      {/* Pagination Controls */}
                      {getHistoryPageCount(milestone) > 1 && (
                        <div className="flex gap-2 mt-2 justify-end">
                          <button
                            className="px-2 py-1 rounded bg-white/10 text-white disabled:opacity-50"
                            disabled={(historyPage[milestone.id] || 1) === 1}
                            onClick={() =>
                              setHistoryPage((prev) => ({
                                ...prev,
                                [milestone.id]: (prev[milestone.id] || 1) - 1,
                              }))
                            }
                          >
                            Prev
                          </button>
                          <span className="text-white/60 text-xs flex items-center">
                            Page {(historyPage[milestone.id] || 1)} of {getHistoryPageCount(milestone)}
                          </span>
                          <button
                            className="px-2 py-1 rounded bg-white/10 text-white disabled:opacity-50"
                            disabled={(historyPage[milestone.id] || 1) === getHistoryPageCount(milestone)}
                            onClick={() =>
                              setHistoryPage((prev) => ({
                                ...prev,
                                [milestone.id]: (prev[milestone.id] || 1) + 1,
                              }))
                            }
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-white/60 text-center py-4">No history yet.</p>  // Ensure this is the fallback message
                  )}
                </section>
              </div>
            )}

            {/* Revision Modal */}
            {isOpen && showRevisionModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-client-secondary p-6 rounded-xl w-full max-w-md">
                  <h3 className="text-lg font-semibold text-white mb-2">Request Revision</h3>
                  <textarea className="w-full rounded p-2 bg-white/10 text-white border border-client-border mb-2" placeholder="Reason for revision..." rows={3} />
                  <input type="file" className="mb-2" />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowRevisionModal(false)} className="px-4 py-1 rounded bg-white/10 text-white">Cancel</button>
                    <button className="px-4 py-1 rounded bg-yellow-500 text-white font-semibold">Submit Revision</button>
                  </div>
                </div>
              </div>
            )}

            {/* Approve Modal */}
            <Modal
              title={
                <div className="flex items-center gap-2 text-sm mb-2">
                  <CheckCircleOutlined className="text-green-500" />
                  <span className="text-white text-lg">Approve Milestone</span>
                </div>
              }
              open={showApproveModal}
              onCancel={() => setShowApproveModal(false)}
              footer={null}
              width={500}
              className="custom-modal"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                
                <p className="text-text-light mb-6 text-sm">
                  By approving this milestone, you confirm that the work meets your expectations.
                </p>
                
                <div className="text-left space-y-3 mb-6 text-sm text-text-light">
                  <div className="flex items-start gap-3">
                    <CheckCircleOutlined className="text-green-400 mt-1" />
                    <span>Mark this milestone as complete</span>
                  </div>
                  
                  {/* Updated: Check for next milestone with highlighted title */}
                  {milestones && milestones.length > openIdx + 1 && milestones.slice(openIdx + 1).some(nextMilestone => 
                    ["pending", "in progress", "submitted"].includes((nextMilestone.status || "").toLowerCase())
                  ) && (
                    <div className="flex items-start gap-3">
                      <CheckCircleOutlined className="text-green-400 mt-1" />
                      <span>
                        Next milestone: <span className="bg-yellow-500/20 text-yellow-500 font-semibold px-1 rounded"> {milestones[openIdx + 1].title} </span> will be marked as In Progress
                      </span>
                    </div>
                  )}
                  
                  {/* Updated: AutoPay and Grace Period logic with highlights */}
                  {milestones && milestones[openIdx] && milestones[openIdx].payout?.autoPay ? (
                    <div className="flex items-start gap-3">
                      <CheckCircleOutlined className="text-green-400 mt-1" />
                      <span>
                        <span className="bg-green-500/20 text-green-500 font-semibold px-1 rounded"> {milestones[openIdx].payout.percent}% </span> of the project budget will be automatically deducted from your wallet
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 space-y-2">
                      <CheckCircleOutlined className="text-yellow-400 mt-1" />
                      <div className="">
                      <span>
                        Grace Period for Payment: You have <span className="bg-yellow-500/20 text-yellow-500 font-semibold px-1 rounded">48 hours</span> after approval to fund your wallet or release payment.
                      </span>
                      <span>
                        If not paid:
                        <ul className="list-disc pl-5 mt-1 text-sm">
                          <li>Freelancer can raise a dispute or escalate to support.</li>
                          <li>Notifications will be sent, and penalties or automatic disputes may apply.</li>
                        </ul>
                      </span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Extend Deadline Section - Only for OBSP type */}
                {milestones && milestones[openIdx] && milestones[openIdx].type === 'obsp' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 bg-white/10 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ClockCircleOutlined className="text-green-400" />
                      <span>Extend Deadline</span>
                    </div>
                    <InputNumber
                      min={1}
                      placeholder="Days to extend"
                      onChange={(value) => setExtensionDays(value)}
                      className="w-full text-sm rounded-xl bg-freelancer-primary backdrop-blur-sm border-white/10"
                    />
                    {extensionDays > 0 && (
                      <p className="text-sm mt-2 text-green-400">
                        New Due Date: {moment(milestones[openIdx].due).add(extensionDays, 'days').format('MMM DD, YYYY')}
                      </p>
                    )}
                  </motion.div>
                )}
                
                <div className="mb-4">
                  <TextArea
                    rows={3}
                    placeholder="Add feedback or notes (optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="rounded-xl bg-freelancer-primary backdrop-blur-sm text-text-light border-white/10 text-sm"
                  />
                </div>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleApprove}
                    loading={false}
                    className="bg-green-500 hover:bg-green-600 border-none text-sm"
                    icon={<CheckCircleOutlined />}
                  >
                    Confirm Approval
                  </Button>
                  <Button
                    size="large"
                    onClick={() => setShowApproveModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 border-none text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal>

            {/* Dispute Modal */}
            <Modal
              title={
                <div className="flex items-center gap-2 text-sm mb-2">
                  <ExclamationCircleOutlined className="text-red-500" />
                  <span className="text-white text-lg">Raise Dispute</span>
                </div>
              }
              open={showDisputeModal}
              onCancel={() => setShowDisputeModal(false)}
              footer={null}
              width={500}
              className="custom-modal"  // For global CSS overrides
            >
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-text-light mb-6 text-sm">
                  Raising a dispute will notify the freelancer and may lead to review. This action cannot be undone.
                </p>
                
                <Tabs activeKey={activeDisputeTab} onChange={setActiveDisputeTab} className="custom-tabs text-sm">
                  <TabPane tab="Instructions" key="instructions">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6 text-sm text-text-light"
                    >
                      <p>Follow these steps:</p>
                      <ul className="flex flex-col items-start list-disc pl-5">
                        <li>Explain the issue clearly.</li>
                        <li>Attach evidence if available.</li>
                        <li>Submit for review.</li>
                      </ul>
                    </motion.div>
                  </TabPane>
                  <TabPane tab="Details" key="details">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4 text-left text-sm"  // Changed to text-left for overall alignment
                    >
                      {/* Milestone Name Input - Auto-filled and compact, now left-aligned */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-text-light font-semibold text-left">Milestone Name</label>
                        <Input
                          placeholder="Milestone Name"
                          value={milestones[openIdx]?.title || ''}
                          readOnly
                          className="rounded-xl bg-freelancer-primary backdrop-blur-sm border-white/10 text-sm text-left"
                        />
                      </div>

                      {/* Description Textarea - Compact with reduced spacing, now left-aligned */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-text-light font-semibold text-left">Describe the Problem</label>
                        <TextArea
                          rows={3}
                          placeholder="Describe the problem"
                          onChange={(e) => setDisputeDetails({ ...disputeDetails, description: e.target.value })}
                          className="rounded-xl bg-freelancer-primary backdrop-blur-sm border-white/10 text-sm text-left"
                        />
                      </div>

                      {/* Upload Files Section - Neat alignment with minimal gaps, now left-aligned */}
                      <div className="flex flex-col space-y-1">
                        <label className="text-text-light font-semibold text-left">Upload Files</label>
                        <AntUpload
                          beforeUpload={() => false}
                          onChange={(info) => {
                            const uniqueFiles = info.fileList.filter((file, index, self) =>
                              index === self.findIndex(f => f.uid === file.uid)
                            );
                            setDisputeDetails({ ...disputeDetails, files: uniqueFiles });
                          }}
                          multiple
                          className="text-sm text-left !text-text-muted"
                        >
                          <Button 
                            icon={<UploadOutlined />} 
                            className="w-full text-sm bg-freelancer-primary/20 border-white/10 flex items-start justify-start py-2 px-4 rounded-xl text-text-light hover:bg-freelancer-primary/30"  // Added justify-start
                          >
                            Select Files
                          </Button>
                        </AntUpload>

                      </div>

                     
                    </motion.div>
                  </TabPane>
                </Tabs>
                
                {/* Added: Options to reduce disputes with emphasis */}
                <div className="mt-4 space-y-2 text-sm text-text-light border border-yellow-500/20 bg-yellow-500/10 p-4 rounded-xl">
                <p className="text-yellow-400 font-semibold">Before submitting, consider alternatives to avoid disputes:</p>
                <div className="flex gap-2">
                      <div className="flex flex-col space-y-2 mt-4">
                        <div className="flex items-start gap-3">
                          <Button
                            onClick={() => setIsExtendInputVisible(true)}  // Toggle visibility on click
                            className="bg-yellow-500 text-white text-sm"
                          >
                            Extend Deadline
                          </Button>
                          
                          {isExtendInputVisible && (
                            <div className="flex flex-col space-y-1 w-full">
                              {/* Replaced InputNumber with Input (type="number") to hide arrows and restrict to numbers */}
                              <Input
                                type="number"  // Restricts input to numbers only
                                min={1}
                                max={calculateMaxExtensionDays()}  // Enforces the maximum value dynamically
                                placeholder="Days to extend"
                                onChange={(e) => {
                                  const value = parseInt(e.target.value, 10);
                                  const maxDays = calculateMaxExtensionDays();
                                  if (!isNaN(value)) {
                                    const cappedValue = Math.min(Math.max(value, 1), maxDays);  // Enforce min and max
                                    setExtensionInput(cappedValue);
                                    if (value > maxDays) {
                                      message.warning(`Maximum extension is ${maxDays} days.`);
                                    }
                                  } else {
                                    setExtensionInput('');  // Clear input if non-numeric value is entered
                                  }
                                }}
                                value={extensionInput}
                                className="no-arrows w-24 rounded-xl bg-freelancer-primary backdrop-blur-sm border-white/10 text-sm text-left"  // Added 'no-arrows' class to hide spinners
                              />
                              
                              {extensionInput > 0 && milestones[openIdx]?.due && (
                                <p className="text-sm text-text-light">
                                  New Due Date: {moment(milestones[openIdx].due).add(extensionInput, 'days').format('MMM DD, YYYY')}
                                  {extensionInput > calculateMaxExtensionDays() && (
                                    <span className="text-red-500 ml-2"> (Exceeds maximum allowed)</span>
                                  )}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {isExtendInputVisible && (
                          <p className="text-xs text-text-light text-left">
                            Note: Maximum extension is half the time to the next milestone. Current max: {calculateMaxExtensionDays()} days.
                          </p>
                        )}
                      </div>
                  {milestones[openIdx]?.type === 'obsp' && (
                      <Button
                        onClick={() => {
                          message.info('Requesting revision...');
                          // Add revision logic here
                        }}
                        className="bg-blue-500 text-white text-sm"
                      >
                        Add Revision
                      </Button>
                      )}
                    </div>
                </div>
                
                <div className="flex gap-3 justify-start mt-4 text-left">  // Changed justify-center to justify-start
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleRaiseDispute}
                    className="bg-red-500 hover:bg-red-600 border-none text-sm text-left"
                    icon={<ExclamationCircleOutlined />}
                  >
                    Submit Dispute
                  </Button>
                  <Button
                    size="large"
                    onClick={() => setShowDisputeModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 border-none text-sm text-left"
                  >
                    Cancel
                  </Button>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
                  <p className="text-yellow-400">
                    💡 <strong>Tip:</strong> Consider discussing with the freelancer first if possible.
                  </p>
                </div>
              </div>
            </Modal>
          </div>
        );
      })}
    </div>
  );
};

export default Milestones;
