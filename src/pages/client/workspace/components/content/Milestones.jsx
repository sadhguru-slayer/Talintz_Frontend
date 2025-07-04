import React, { useState } from "react";
import { FileOutlined, CheckCircleOutlined, ClockCircleOutlined, EditOutlined, CommentOutlined, DollarOutlined, HistoryOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import overviewData from "../../utils/data";

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

const Milestones = () => {
  const milestones = overviewData.project.milestones;
  // Find the current milestone index
  const currentIdx = milestones.findIndex(m => ["Submitted", "In Progress", "Revision"].includes(m.status));
  // By default, expand the current milestone, or the last completed if none current
  const defaultOpen = currentIdx !== -1 ? currentIdx : milestones.findIndex(m => m.status === "Completed");
  const [openIdx, setOpenIdx] = useState(defaultOpen);

  // For modals
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  return (
    <div className="space-y-8 p-4 ">
      {milestones.map((milestone, idx) => {
        const isOpen = openIdx === idx;
        const isCurrent = ["Submitted", "In Progress", "Revision"].includes(milestone.status);
        const isCompleted = milestone.status === "Completed";
        const isFuture = !isCurrent && !isCompleted;

        return (
          <div
            key={milestone.id}
            className={`bg-client-secondary/80 border ${isCurrent ? 'border-client-accent' : 'border-client-border'} rounded-xl shadow-card`}
          >
            {/* Header - More info in collapsed state */}
            <button
              className="w-full flex justify-between items-start p-4 focus:outline-none"
              onClick={() => setOpenIdx(isOpen ? -1 : idx)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-client-accent" />
                  <span className="text-lg font-bold text-white">{milestone.title}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(milestone.status)}`}>
                    {milestone.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/60">
                  <span>Due: {milestone.due}</span>
                  <span>{milestone.payoutPercent || 0}% Payout</span>
                </div>
                {!isOpen && milestone.summary && (
                  <p className="text-sm text-white/70 mt-1 truncate">
                    {milestone.summary.slice(0, 50)}{milestone.summary.length > 50 ? "..." : ""}
                  </p>
                )}
              </div>
              <span className="text-white/40 text-sm">{isOpen ? "▲" : "▼"}</span>
            </button>

            {/* Expanded Content */}
            {isOpen && (
              <div className="p-6 pt-0 space-y-8">
                {/* What is this milestone? */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-1 flex items-center gap-2">
                    <InfoCircleOutlined className="text-client-accent" /> What is this milestone?
                  </h3>
                  <p className="text-white/80">{milestone.summary || "No summary provided."}</p>
                  <p className="text-white/60 mt-1">{milestone.instructions || ""}</p>
                  <p className="text-xs text-white/40 mt-2">{sectionInfo.summary}</p>
                </div>

                {/* Deliverables */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-1 flex items-center gap-2">
                    <FileOutlined className="text-client-accent" /> Deliverables
                  </h3>
                  <p className="text-xs text-white/40 mb-2">{sectionInfo.deliverables}</p>
                  {milestone.deliverables && milestone.deliverables.length > 0 ? (
                    <ul className="space-y-2">
                      {milestone.deliverables.map((d, i) => (
                        <li key={i} className="flex items-center gap-3 text-white/90">
                          <FileOutlined className="text-client-accent" />
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
                    <div className="text-white/60">No deliverables submitted yet.</div>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-1 flex items-center gap-2">
                    <CommentOutlined className="text-client-accent" /> Feedback & Comments
                  </h3>
                  <p className="text-xs text-white/40 mb-2">{sectionInfo.comments}</p>
                  {milestone.comments && milestone.comments.length > 0 ? (
                    <ul className="space-y-2 mb-2">
                      {milestone.comments.map(c => (
                        <li key={c.id} className="flex justify-between items-center">
                          <span className="text-white/90"><span className="font-semibold text-client-accent">{c.author}:</span> {c.text}</span>
                          <span className="text-xs text-white/50">{c.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-white/60 mb-2">No comments yet.</div>
                  )}
                  {isCurrent && (
                    <>
                      <textarea className="w-full rounded p-2 bg-white/10 text-white border border-client-border" placeholder="Add a comment..." rows={2} />
                      <button className="mt-2 px-4 py-1 rounded bg-client-accent text-white font-semibold">Post Comment</button>
                    </>
                  )}
                </div>

                {/* Actions (only for current) */}
                {isCurrent && (
                  <div>
                    <h3 className="text-md font-semibold text-white mb-1 flex items-center gap-2">
                      <EditOutlined className="text-client-accent" /> Actions
                    </h3>
                    <p className="text-xs text-white/40 mb-2">{sectionInfo.actions}</p>
                    <div className="flex gap-2">
                      {milestone.status === "Submitted" && (
                        <>
                          <button onClick={() => setShowRevisionModal(true)} className="px-4 py-2 rounded bg-yellow-500 text-white font-semibold flex items-center gap-1">
                            <EditOutlined /> Request Revision
                          </button>
                          <button onClick={() => alert("Approved!")} className="px-4 py-2 rounded bg-green-500 text-white font-semibold flex items-center gap-1">
                            <CheckCircleOutlined /> Approve
                          </button>
                          <button onClick={() => setShowDisputeModal(true)} className="px-4 py-2 rounded bg-red-500 text-white font-semibold flex items-center gap-1">
                            <ExclamationCircleOutlined /> Dispute
                          </button>
                        </>
                      )}
                    </div>
                    {milestone.status === "Submitted" && (
                      <div className="mt-2 text-xs text-white/60">
                        <InfoCircleOutlined className="mr-1" />
                        <span>
                          Approving this milestone will release the payout. If auto-pay is enabled, payment is deducted automatically.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Payout Info */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-1 flex items-center gap-2">
                    <DollarOutlined className="text-client-accent" /> Payout Info
                  </h3>
                  <p className="text-xs text-white/40 mb-2">{sectionInfo.payout}</p>
                  {milestone.payout ? (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-client-secondary/60 border border-client-border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-white/90 font-semibold">{milestone.payoutPercent || 0}% will be released on approval</span>
                      </div>
                      <div className="flex gap-6 mt-4 md:mt-0">
                        <span className="text-white/60">Status: <span className={`font-semibold ${milestone.payout?.status === "released" ? "text-green-400" : "text-yellow-400"}`}>{milestone.payout?.status || "held"}</span></span>
                        <span className="text-white/60">Auto Pay: <span className="font-semibold">{milestone.payout?.autoPay ? "Yes" : "No"}</span></span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/60">No payout info yet.</div>
                  )}
                </div>

                {/* History */}
                <div>
                  <h3 className="text-md font-semibold text-white mb-1 flex items-center gap-2">
                    <HistoryOutlined className="text-client-accent" /> Change Log / History
                  </h3>
                  <p className="text-xs text-white/40 mb-2">{sectionInfo.history}</p>
                  {milestone.history && milestone.history.length > 0 ? (
                    <ul className="divide-y divide-white/10">
                      {milestone.history.map((h, i) => (
                        <li key={i} className="py-2 flex justify-between items-center text-white/80">
                          <span>
                            <span className="font-semibold">{h.action}</span> by {h.by}
                            {h.details && <>: <span className="text-white/60">{h.details}</span></>}
                          </span>
                          <span className="text-xs text-white/50">{h.time}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-white/60">No history yet.</div>
                  )}
                </div>
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
