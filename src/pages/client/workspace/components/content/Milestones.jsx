import React, { useState,useEffect } from "react";
import { FileOutlined, CheckCircleOutlined, ClockCircleOutlined, EditOutlined, CommentOutlined, DollarOutlined, HistoryOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import overviewData from "../../utils/data";
import { useParams } from "react-router-dom";
import { getBaseURL } from "../../../../../config/axios";
import Cookies from 'js-cookie';
import { MdFeaturedPlayList } from "react-icons/md";
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

  // State for milestones and loading/error
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [openIdx, setOpenIdx] = useState(0);

  // For modals
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

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

  useEffect(() => {
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
        setMilestones(data.milestones || []);
        // Optionally, set openIdx to the first current milestone
        const currentIdx = (data.milestones || []).findIndex(m =>
          ["submitted", "in progress", "revision"].includes((m.status || "").toLowerCase())
        );
        setOpenIdx(currentIdx !== -1 ? currentIdx : 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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

  return (
    <div className="space-y-8 p-4">
      {loading && <div className="text-white/80">Loading milestones...</div>}
      {error && <div className="text-red-400">Error: {error}</div>}
      {!loading && !error && milestones.length === 0 && (
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
            className={`bg-client-secondary/80 border ${isCurrent ? 'border-client-accent' : 'border-client-border'} rounded-xl shadow-card`}
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
                <section className="mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <InfoCircleOutlined className="text-client-accent" /> Overview
                  </h3>
                  <p className="text-white/90 text-base mb-1">{milestone.description || "No summary provided."}</p>
                  {milestone.instructions && (
                    <p className="text-white/60 text-sm mt-1">{milestone.instructions}</p>
                  )}
                </section>

                {/* 2. Deliverables */}
                <section className="mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                    <MdFeaturedPlayList className="text-client-accent" /> Deliverables
                  </h3>
                  {milestone.submissions && milestone.submissions.length > 0 ? (
                    <ul className="space-y-2">
                      {milestone.submissions.map((d, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/90 text-sm">
                          <FileOutlined className="text-client-accent" />
                          <a href={d.url} className="underline" target="_blank" rel="noopener noreferrer">{d.name}</a>
                          <span className="text-xs text-white/50">Submitted: {d.submittedAt}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-white/60">No deliverables submitted yet.</div>
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
                        onClick={() => setShowRevisionModal(true)}
                        className="px-4 py-2 rounded bg-yellow-500 text-white font-semibold flex items-center gap-1 hover:bg-yellow-600"
                      >
                        <EditOutlined /> Request Revision
                      </button>
                      <button
                        onClick={() => alert("Approved!")}
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

            {/* Dispute Modal */}
            {isOpen && showDisputeModal && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-client-secondary p-6 rounded-xl w-full max-w-md border border-client-border shadow-card">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="inline-block bg-red-500/20 text-red-500 rounded-full px-2 py-0.5 text-xs font-semibold">🚩</span>
                    Raise a Dispute
                  </h3>
                  {/* 🚩 Milestone Auto-selected */}
                  <div className="mb-3">
                    <label className="block text-white/80 font-semibold mb-1">Milestone</label>
                    <div className="bg-client-primary/40 border border-client-border rounded px-3 py-2 text-white/90">
                      {milestone.title}
                    </div>
                  </div>
                  {/* 📝 Issue Description */}
                  <div className="mb-3">
                    <label className="block text-white/80 font-semibold mb-1">Issue Description <span className="text-red-400">*</span></label>
                    <textarea
                      className="w-full rounded p-2 bg-white/10 text-white border border-client-border"
                      placeholder="Describe your concern in at least 30 words..."
                      rows={4}
                      minLength={150} // ~30 words
                      required
                    />
                    <div className="text-xs text-white/50 mt-1">Minimum 30 words required.</div>
                  </div>
                  {/* 📎 Attach Proof (Optional) */}
                  <div className="mb-3">
                    <label className="block text-white/80 font-semibold mb-1">Attach Proof (Optional)</label>
                    <input type="file" className="w-full bg-client-primary/40 border border-client-border rounded px-2 py-1 text-white" />
                  </div>
                  {/* 📅 Deadline Passed? */}
                  <div className="mb-3 flex items-center gap-2">
                    <input type="checkbox" id="deadline-passed" className="accent-client-accent" />
                    <label htmlFor="deadline-passed" className="text-white/80">Milestone deadline has passed with no response</label>
                  </div>
                  {/* 📬 Freelancer Response Note */}
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-block bg-blue-500/20 text-blue-400 rounded-full px-2 py-0.5 text-xs font-semibold">📬</span>
                    <span className="text-xs text-white/70">Freelancer will get 48h to respond before we step in</span>
                  </div>
                  {/* 🚨 Confirm Button */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowDisputeModal(false)}
                      className="px-4 py-1 rounded bg-white/10 text-white"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-1 rounded bg-red-500 text-white font-semibold"
                    >
                      Escalate to Talintz Support
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Milestones;
