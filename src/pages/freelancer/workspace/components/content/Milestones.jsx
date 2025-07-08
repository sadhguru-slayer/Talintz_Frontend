import React, { useState, useEffect } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  MessageOutlined,
  UploadOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  EditOutlined,
  CommentOutlined,
  DollarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { getBaseURL } from "../../../../../config/axios";
import { message } from "antd";

// Status badge with icon and color
const statusBadge = (statusRaw) => {
  if (!statusRaw) return null;
  // Normalize status: lowercase, replace underscores with spaces
  const status = statusRaw.replace(/_/g, " ").toLowerCase();
  // Capitalize each word for display
  const prettyStatus = status
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  // All keys are lowercase!
  const statusConfig = {
    "pending":         { color: "bg-gray-200 text-gray-800", icon: "⏳" },
    "in progress":     { color: "bg-blue-100 text-blue-800", icon: "🚧" },
    "under review":    { color: "bg-blue-100 text-blue-800", icon: "🔍" },
    "approved":        { color: "bg-green-100 text-green-800", icon: "✅" },
    "completed":       { color: "bg-green-200 text-green-900", icon: "🏁" },
    "submitted":       { color: "bg-blue-50 text-blue-700", icon: "📤" },
    "revision":        { color: "bg-orange-100 text-orange-800", icon: "✏️" },
    "changes requested": { color: "bg-orange-100 text-orange-800", icon: "✏️" },
    "disputed":        { color: "bg-red-100 text-red-800", icon: "⚠️" },
    "qa phase":        { color: "bg-purple-100 text-purple-800", icon: "🧪" },
    // Add more as needed
  };

  // Always use lowercase for lookup and fallback
  const config = statusConfig[status] || statusConfig["pending"];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.color} font-semibold text-xs`}
    >
      {config.icon} {prettyStatus}
    </span>
  );
};

// Dummy countdown logic (replace with real date logic)
const getCountdown = (due) => {
  // For demo: always "Due in 2 days"
  return <span className="text-xs text-white/60 ml-2">(Due in 2 days)</span>;
};

const sectionInfo = {
  summary: "This section describes what this milestone is about and any special instructions from the client.",
  deliverables: "Here you'll find all files and links you've submitted for this milestone.",
  comments: "Discuss this milestone with your client. Comments here are only for this milestone.",
  actions: "You can upload work, submit revisions, or respond to client feedback for this milestone.",
  payout: "Shows how much you'll receive when this milestone is approved.",
  history: "A record of all important actions and changes for this milestone."
};

const Milestones = () => {
  const [milestonesData, setMilestonesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIdx, setOpenIdx] = useState(-1); // Initialize with -1
  const params = useParams();
  const workspace_id = params.workspaceId;

  // For modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadNote, setUploadNote] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);

  // At the top of your component
  const [historyPage, setHistoryPage] = useState({}); // {milestoneId: pageNumber}
  const HISTORY_PAGE_SIZE = 5;

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        setLoading(true);
        const accessToken = Cookies.get('accessToken');
        const response = await fetch(`${getBaseURL()}/api/workspace/freelancer/milestones/${parseInt(workspace_id)}/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Milestone Data:", data)
        setMilestonesData(data);
      } catch (err) {
        console.error('Error fetching milestones:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (workspace_id) {
      fetchMilestones();
    }
  }, [workspace_id]);

  // Set default open milestone after data is loaded
  useEffect(() => {
    if (milestonesData && milestonesData.milestones) {
      const milestones = milestonesData.milestones;
      // Find the current milestone index
      const currentIdx = milestones.findIndex(m => ["Submitted", "In Progress", "Revision", "Pending"].includes(m.status));
      // By default, expand the current milestone, or the last completed if none current
      const defaultOpen = currentIdx !== -1 ? currentIdx : milestones.findIndex(m => m.status === "Completed");
      setOpenIdx(defaultOpen !== -1 ? defaultOpen : 0); // Default to first milestone if none found
    }
  }, [milestonesData]);

  useEffect(() => {
    if (openIdx !== -1 && milestonesData && milestonesData.milestones) {
      setHistoryPage((prev) => ({
        ...prev,
        [milestonesData.milestones[openIdx].id]: 1,
      }));
    }
  }, [openIdx]);

  // Helper to update a milestone in milestonesData
  const updateMilestone = (milestoneId, updater) => {
    setMilestonesData((prev) => {
      if (!prev || !prev.milestones) return prev;
      return {
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === milestoneId ? updater(m) : m
        ),
      };
    });
  };

  // 1. Acknowledge Feedback
  const handleAcknowledgeFeedback = async (milestone, feedbackId) => {
    const milestoneType = milestonesData.type === "obsp" ? "obsp" : "project";
    try {
      const accessToken = Cookies.get('accessToken');
      const res = await fetch(
        `${getBaseURL()}/api/workspace/freelancer/workspace/${workspace_id}/milestone/${milestoneType}/${milestone.id}/acknowledge-feedback/`,
        {
          method: "POST",
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ feedback_id: feedbackId }),
        }
      );
      if (!res.ok) throw new Error("Failed to acknowledge feedback");
      message.success("Feedback acknowledged!");

      // Update feedback as acknowledged in local state
      updateMilestone(milestone.id, (m) => ({
        ...m,
        notes: {
          ...m.notes,
          client_feedback: m.notes.client_feedback.map((fb) =>
            fb.id === feedbackId ? { ...fb, isAcknowledged: true } : fb
          ),
        },
      }));
    } catch (err) {
      message.error(err.message || "Error acknowledging feedback");
    }
  };

  // 2. Post Note
  const handlePostNote = async (milestone) => {
    if (!noteContent.trim()) return;
    setNoteSubmitting(true);
    try {
      const accessToken = Cookies.get('accessToken');
      const milestoneType = milestonesData.type === "obsp" ? "obsp" : "project";
      const res = await fetch(
        `${getBaseURL()}/api/workspace/freelancer/workspace/${workspace_id}/milestone/${milestoneType}/${milestone.id}/post-note/`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ content: noteContent }),
        }
      );
      if (!res.ok) throw new Error("Failed to post note");
      message.success("Note posted!");

      // Add to history in local state
      updateMilestone(milestone.id, (m) => ({
        ...m,
        history: [
          {
            action: "Note Added",
            by: "You",
            details: noteContent,
            time: new Date().toLocaleString(),
          },
          ...(m.history || []),
        ],
      }));
      setNoteContent("");
    } catch (err) {
      message.error(err.message || "Error posting note");
    } finally {
      setNoteSubmitting(false);
    }
  };

  // 3. Submit Deliverables
  const handleSubmitDeliverables = async () => {
    if (!selectedMilestone) return;
    setUploading(true);
    const formData = new FormData();
    uploadFiles.forEach(f => formData.append("files", f));
    formData.append("note", uploadNote);

    try {
      const accessToken = Cookies.get('accessToken');
      const milestoneType = milestonesData.type === "obsp" ? "obsp" : "project";
      const res = await fetch(
        `${getBaseURL()}/api/workspace/freelancer/workspace/${workspace_id}/milestone/${milestoneType}/${selectedMilestone.id}/submit/`,
        {
          method: "POST",
          headers: { 'Authorization': `Bearer ${accessToken}` },
          body: formData,
        }
      );
      if (!res.ok) throw new Error("Failed to submit deliverables");
      message.success("Deliverables submitted!");
      setShowUploadModal(false);
      setUploadFiles([]);
      setUploadNote("");

      // Add to history in local state
      updateMilestone(selectedMilestone.id, (m) => ({
        ...m,
        history: [
          {
            action: "Deliverables Submitted",
            by: "You",
            details: uploadNote || "Files submitted",
            time: new Date().toLocaleString(),
          },
          ...(m.history || []),
        ],
      }));
    } catch (err) {
      message.error(err.message || "Error submitting deliverables");
    } finally {
      setUploading(false);
    }
  };

  const getPaginatedHistory = (milestone) => {
    const page = historyPage[milestone.id] || 1;
    const start = (page - 1) * HISTORY_PAGE_SIZE;
    const end = start + HISTORY_PAGE_SIZE;
    return (milestone.history || []).slice(start, end);
  };

  const getHistoryPageCount = (milestone) => {
    return Math.ceil((milestone.history?.length || 0) / HISTORY_PAGE_SIZE);
  };

  if (loading) {
    return (
      <div className="space-y-8 p-4">
        <div className="text-white text-center">Loading milestones...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-4">
        <div className="text-red-400 text-center">Error loading milestones: {error}</div>
      </div>
    );
  }

  if (!milestonesData || !milestonesData.milestones) {
    return (
      <div className="space-y-8 p-4">
        <div className="text-white text-center">No milestones found.</div>
      </div>
    );
  }

  const milestones = milestonesData.milestones;

  return (
    <div className="space-y-10 p-6 max-w-4xl mx-auto">
      {/* Page Title */}
      <header className="mb-8 border-b border-white/10 pb-4">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <CheckCircleOutlined className="text-freelancer-accent" />
          Project Milestones
        </h1>
        <p className="text-white/70 mt-2">
          Track your progress, upload work, and respond to client feedback for each milestone.
        </p>
      </header>

      {/* Milestone List */}
      <section className="space-y-6">
      {milestones.map((milestone, idx) => {
        const isOpen = openIdx === idx;
        const status = (milestone.status || "").toLowerCase();
        const isInProgress = status === "in progress" || status === "in_progress";
        const isCompleted = status === "completed";
        const isFuture = !isInProgress && !isCompleted;

        const unacknowledgedFeedbacks = (milestone.notes?.client_feedback || []).filter(
          fb => fb.isAcknowledged === false || fb.isAcknowledged === undefined // fallback for old data
        );

        return (
            <article
            key={milestone.id}
              className={`transition-shadow duration-200 bg-freelancer-bg-grey border ${isInProgress ? 'border-freelancer-accent shadow-lg' : 'border-freelancer-border shadow'} rounded-2xl`}
          >
              {/* Milestone Header */}
            <button
                className="w-full flex justify-between items-center p-5 rounded-2xl focus:outline-none hover:bg-white/5 transition"
              onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                aria-expanded={isOpen}
            >
                <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-freelancer-accent" />
                    <span className="text-lg font-semibold text-white">{milestone.title}</span>
                  {statusBadge(milestone.status)}
                </div>
                  <div className="flex items-center gap-6 text-xs text-white/60 mt-1">
                    <span>
                      <CalendarOutlined className="mr-1" />
                      Due: {milestone.due ? new Date(milestone.due).toLocaleDateString() : 'No due date'}
                    </span>
                    <span>
                      <DollarOutlined className="mr-1" />
                      {milestone.payout_percentage || 0}% Payout
                    </span>
                </div>
                {!isOpen && milestone.description && (
                  <p className="text-sm text-white/70 mt-1 truncate">
                      {milestone.description.slice(0, 60)}{milestone.description.length > 60 ? "..." : ""}
                  </p>
                )}
              </div>
                <span className="text-white/40 text-xl">{isOpen ? "▲" : "▼"}</span>
            </button>

              {/* Expanded Milestone Details */}
            {isOpen && (
                <div className="p-6 pt-0 space-y-8 border-t border-white/10">
                  {/* 1. Milestone Overview */}
                  <section>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                      <InfoCircleOutlined className="text-freelancer-accent" /> Overview
                  </h3>
                    <p className="text-white/90">{milestone.description || "No summary provided."}</p>
                    {milestone.instructions && (
                      <p className="text-white/60 mt-1">{milestone.instructions}</p>
                    )}
                    <p className="text-xs text-white/40 mt-2">{sectionInfo.summary}</p>
                  </section>

                  {/* 2. Deliverables */}
                  <section>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                    <FileOutlined className="text-freelancer-accent" /> 
                    {milestonesData.type === 'obsp' ? 'Expected Deliverables' : 'Your Submissions'}
                  </h3>
                  <p className="text-xs text-white/40 mb-2">
                    {milestonesData.type === 'obsp' 
                      ? 'What you need to deliver for this milestone'
                        : sectionInfo.deliverables}
                  </p>
                  
                  {milestonesData.type === 'obsp' ? (
                    // Show expected deliverables for OBSP
                    milestone.deliverables && milestone.deliverables.length > 0 ? (
                      <ul className="space-y-2">
                        {milestone.deliverables.map((deliverable, i) => (
                          <ul className="list-inside space-y-2">
  <li key={i} className="pl-2 flex items-center gap-3 text-white/90">
  <IoIosArrowRoundForward className="text-freelancer-accent bg-freelancer-secondary/10 rounded-full"/>
    <span>{deliverable}</span>
    <span className="text-xs text-white/50">(Expected)</span>
  </li>
</ul>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-white/60">No deliverables specified for this milestone.</div>
                    )
                  ) : (
                    // Show actual submissions for regular projects
                    milestone.deliverables && milestone.deliverables.length > 0 ? (
                      <ul className="space-y-2">
                        {milestone.deliverables.map((d, i) => (
                          <li key={i} className="flex items-center gap-3 text-white/90">
                            <FileOutlined className="text-freelancer-accent" />
                            {d.type === "file" ? (
                              <a href={d.url} className="underline" target="_blank" rel="noopener noreferrer">{d.name}</a>
                            ) : (
                              <a href={d.url} className="underline text-blue-400" target="_blank" rel="noopener noreferrer">{d.name}</a>
                            )}
                            <span className="text-xs text-white/50">Submitted: {d.submittedAt}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-white/60">No submissions yet.</div>
                    )
                  )}
                  </section>

                  {/* 3. Client Feedback (separate section) */}
                  {milestone.notes?.client_feedback?.length > 0 && (
                    <section className="mt-8 bg-white/5 border border-freelancer-accent/30 rounded-xl p-3 shadow-sm">
                      <h4 className="text-base font-semibold text-freelancer-accent flex items-center gap-2 mb-3">
                        <CommentOutlined /> Client Feedback
                      </h4>
                      <ul className="space-y-3">
                        {milestone.notes.client_feedback.map((fb) => (
                          <li
                            key={fb.id}
                            className={`p-3 rounded-lg flex justify-between border ${
                              fb.isAcknowledged
                                ? "border-gray-300 bg-white/10"
                                : "border-blue-400 bg-blue-50/10"
                            }`}
                          >
                            <div className="flex flex-col items-center justify-between">
                              <span className="font-medium text-freelancer-accent">
                                {fb.created_by || "Client"}
                              </span>
                              
                              <div className="text-gray-100">{fb.content}</div>
                              
                            </div>
                            <div className="flex flex-col items-end justify-between">

                              <span className="text-xs text-gray-400">
                                {new Date(fb.created_at).toLocaleDateString()}
                              </span>
                            {!fb.isAcknowledged && (
                              <button
                                onClick={() => handleAcknowledgeFeedback(milestone, fb.id)}
                                className="mt-2 text-xs bg-freelancer-text-accent text-text-light p-1 rounded-lg hover:underline"
                              >
                                Mark as Acknowledged
                              </button>
                            )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {/* 4. Private Note (separate section) */}
                  <section className="mt-8 bg-white/5 border border-freelancer-border rounded-xl p-3 shadow-sm">
                    <h4 className="text-base font-semibold text-freelancer-accent flex items-center gap-2 mb-3">
                      <CommentOutlined /> Your Private Note
                    </h4>
                    <textarea
                      className="w-full rounded p-2 bg-white/10 text-white border border-freelancer-border"
                      placeholder="Add a private note (only visible to you)..."
                      rows={2}
                      value={noteContent}
                      onChange={e => setNoteContent(e.target.value)}
                    />
                    <button
                      className={`mt-2 px-4 py-1 rounded font-semibold ${
                        noteContent.trim()
                          ? "bg-freelancer-accent text-white hover:bg-freelancer-accent/90"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      onClick={() => handlePostNote(milestone)}
                      disabled={noteSubmitting || !noteContent.trim()}
                    >
                      {noteSubmitting ? "Saving..." : "Save Note"}
                    </button>
                    <p className="text-xs text-white/40 mt-1">This note is private and only visible to you.</p>
                  </section>

                  {/* 5. Actions */}
                {isInProgress && (
                    <section>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                      <EditOutlined className="text-freelancer-accent" /> Your Actions
                    </h3>
                    <p className="text-xs text-white/40 mb-2">{sectionInfo.actions}</p>
                      <div className="flex gap-3 flex-wrap">
                      {isInProgress && (
                        <button 
                          onClick={() => {
                            setSelectedMilestone(milestone);
                            setShowUploadModal(true);
                          }}
                          className="px-4 py-2 rounded bg-freelancer-accent text-white font-semibold flex items-center gap-1"
                        >
                          <UploadOutlined /> Upload & Submit Work
                        </button>
                      )}
                      {status === "submitted" && (
                        <button className="px-4 py-2 rounded border border-freelancer-accent text-freelancer-accent font-semibold flex items-center gap-1">
                          <EyeOutlined /> View Submission
                        </button>
                      )}
                    </div>
                    {isInProgress && (
                      <div className="mt-2 text-xs text-white/60">
                        <InfoCircleOutlined className="mr-1" />
                        <span>
                          Upload your work and submit for client review. Make sure to include all required deliverables.
                        </span>
                      </div>
                    )}
                    </section>
                )}

                  {/* 6. Payout Info */}
                  <section>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                    <DollarOutlined className="text-freelancer-accent" /> Payout Info
                  </h3>
                  <p className="text-xs text-white/40 mb-2">{sectionInfo.payout}</p>
                  {milestone.payout_percentage ? (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-freelancer-bg-grey/60 border border-freelancer-border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-white/90 font-semibold">{milestone.payout_percentage}% will be released on approval</span>
                      </div>
                      <div className="flex gap-6 mt-4 md:mt-0">
                        <span className="text-white/60">Status: <span className={`font-semibold ${status === "approved" ? "text-green-400" : "text-yellow-400"}`}>{status === "approved" ? "released" : "held"}</span></span>
                        <span className="text-white/60">Auto Pay: <span className="font-semibold">Yes</span></span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/60">No payout info yet.</div>
                  )}
                  </section>

                  {/* 7. History */}
                  <section>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                    <HistoryOutlined className="text-freelancer-accent" /> Change Log / History
                  </h3>
                  <p className="text-xs text-white/40 mb-2">{sectionInfo.history}</p>
                  {milestone.history && milestone.history.length > 0 ? (
                    <>
                      <ul className="divide-y divide-white/10">
                        {getPaginatedHistory(milestone).map((h, i) => (
                          <li key={i} className="py-2 flex justify-between items-center text-white/80">
                            <span>
                              <span className="font-semibold">{h.action}</span> by {h.by}
                              {h.details && <>: <span className="text-white/60">{h.details}</span></>}
                            </span>
                            <span className="text-xs text-white/50">{h.time}</span>
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
                    <div className="text-white/60">No history yet.</div>
                  )}
                  </section>
              </div>
            )}

            {/* Upload Modal */}
            {isOpen && showUploadModal && selectedMilestone && selectedMilestone.id === milestone.id && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-freelancer-bg-grey p-6 rounded-xl w-full max-w-md border border-freelancer-border">
                  <h3 className="text-lg font-semibold text-white mb-2">Upload & Submit Work</h3>
                  <div className="mb-3">
                    <label className="block text-white/80 font-semibold mb-1">Milestone</label>
                    <div className="bg-freelancer-primary/40 border border-freelancer-border rounded px-3 py-2 text-white/90">
                      {selectedMilestone.title}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-white/80 font-semibold mb-1">Upload Files</label>
                    <input
                      type="file"
                      multiple
                      className="w-full bg-freelancer-primary/40 border border-freelancer-border rounded px-2 py-1 text-white"
                      onChange={e => setUploadFiles(Array.from(e.target.files))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-white/80 font-semibold mb-1">Notes for Client</label>
                    <textarea
                      className="w-full rounded p-2 bg-white/10 text-white border border-freelancer-border"
                      placeholder="Add any notes about your submission..."
                      rows={3}
                      value={uploadNote}
                      onChange={e => setUploadNote(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowUploadModal(false)} className="px-4 py-1 rounded bg-white/10 text-white">Cancel</button>
                    <button
                      className="px-4 py-1 rounded bg-freelancer-accent text-white font-semibold"
                      onClick={handleSubmitDeliverables}
                      disabled={uploading}
                    >
                      {uploading ? "Submitting..." : "Submit Work"}
                    </button>
                  </div>
                </div>
              </div>
            )}
            </article>
        );
      })}
      </section>
    </div>
  );
};

export default Milestones;