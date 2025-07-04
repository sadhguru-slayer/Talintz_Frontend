import React from "react";
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
} from "@ant-design/icons";
import overviewData from "../../utils/data";

// Status badge with icon and color
const statusBadge = (status) => {
  const statusConfig = {
    Pending: { color: "bg-yellow-400 text-gray-900", icon: "⏳" },
    "Under Review": { color: "bg-blue-400 text-white", icon: "🔍" },
    Approved: { color: "bg-green-500 text-white", icon: "✅" },
    "Changes Requested": { color: "bg-orange-400 text-white", icon: "✏️" },
    Disputed: { color: "bg-red-500 text-white", icon: "⚠️" },
    "QA Phase": { color: "bg-purple-400 text-white", icon: "🧪" },
    Submitted: { color: "bg-blue-500 text-white", icon: "📤" },
  };
  const config = statusConfig[status] || statusConfig["Pending"];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.color} font-semibold text-xs`}>
      {config.icon} {status}
    </span>
  );
};

// Dummy countdown logic (replace with real date logic)
const getCountdown = (due) => {
  // For demo: always "Due in 2 days"
  return <span className="text-xs text-white/60 ml-2">(Due in 2 days)</span>;
};

const Milestones = () => {
  const { project } = overviewData;

  return (
    <div className="space-y-10 p-4 max-w-4xl mx-auto">
      {/* Page Title */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <CheckCircleOutlined className="text-freelancer-accent" />
          Project Milestones
        </h1>
        <div className="text-white/70 mb-6">
          Track your progress, upload work, and respond to client feedback for each milestone.
        </div>
      </section>

      {/* Milestone Cards */}
      {project.milestones.map((m) => (
        <section
          key={m.id}
          className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl p-6 shadow-card space-y-8"
        >
          {/* Milestone Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <CheckCircleOutlined className="text-freelancer-accent" />
                {m.title}
              </h2>
              <div className="mt-2">{statusBadge(m.status)}</div>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <CalendarOutlined className="text-white/60" />
              <span className="text-white font-medium">{m.due}</span>
              {getCountdown(m.due)}
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Section: Client Feedback */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <InfoCircleOutlined className="text-freelancer-accent" /> Client Feedback
            </h3>
            {m.comments && m.comments.length > 0 ? (
              <ul className="space-y-1">
                {m.comments.map((c) => (
                  <li key={c.id} className="text-white/90">
                    <span className="font-semibold text-freelancer-accent">{c.author}:</span>{" "}
                    <span>{c.text}</span>
                    <span className="text-xs text-white/50 ml-2">{c.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-white/60">No feedback from client yet.</div>
            )}
          </div>

          {/* Section: Discussion Thread */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <MessageOutlined className="text-freelancer-accent" /> Discussion Thread
            </h3>
            <div className="bg-white/5 rounded p-3 text-white/80 text-sm">
              {/* Replace with real chat/messages */}
              <div>No messages yet. Use the chat to discuss this milestone.</div>
            </div>
          </div>

          {/* Section: Upload/Submit Actions */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <UploadOutlined className="text-freelancer-accent" /> Your Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {(m.status === "Pending" || m.status === "QA Phase") && (
                <button className="flex items-center gap-2 px-4 py-2 bg-freelancer-accent hover:bg-freelancer-accent/90 text-white rounded-lg text-sm font-medium">
                  <UploadOutlined /> Upload & Submit Work
                </button>
              )}
              {m.status === "Changes Requested" && (
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">
                  <ReloadOutlined /> Submit Revised Work
                </button>
              )}
              {m.status === "Approved" && (
                <button className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:bg-white/10 text-white rounded-lg text-sm font-medium">
                  <FileOutlined /> View Submission
                </button>
              )}
              {m.status === "Disputed" && (
                <div className="flex items-center gap-2 bg-red-100/10 border border-red-500 text-red-300 px-4 py-2 rounded-lg">
                  <ExclamationCircleOutlined /> Dispute raised by client. Please contact support.
                </div>
              )}
              {/* See Past Submissions always available */}
              <button className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:bg-white/10 text-white rounded-lg text-sm font-medium">
                <HistoryOutlined /> See Past Submissions
              </button>
            </div>
          </div>

          {/* Section: Past Submissions/History */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <HistoryOutlined className="text-freelancer-accent" /> Status Change Log
            </h3>
            {m.history && m.history.length > 0 ? (
              <ul className="space-y-1">
                {m.history.map((h, idx) => (
                  <li key={idx} className="text-white/80 text-sm">
                    <span className="font-semibold">{h.action}</span>
                    {h.by && <> by <span className="text-freelancer-accent">{h.by}</span></>}
                    {h.details && <> — <span>{h.details}</span></>}
                    <span className="text-xs text-white/50 ml-2">{h.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-white/60">No history yet.</div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
};

export default Milestones;