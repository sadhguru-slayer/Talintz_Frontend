import React, { useEffect, useState } from "react";
import { 
  UserOutlined, 
  CalendarOutlined, 
  FileOutlined, 
  CheckCircleOutlined, 
  MessageOutlined, 
  DownloadOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import Cookies from "js-cookie";
import { getBaseURL } from "../../../../../config/axios";
import { useParams } from "react-router-dom";

const statusBadge = (statusRaw) => {
  if (!statusRaw) return null;
  // Normalize status: lowercase, replace underscores with spaces
  const status = statusRaw.replace(/_/g, " ").toLowerCase();
  // Capitalize each word for display
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
    "changes requested": { color: "bg-orange-100 text-orange-800", icon: "✏️" },
    "disputed":        { color: "bg-red-100 text-red-800", icon: "⚠️" },
    "qa phase":        { color: "bg-purple-100 text-purple-800", icon: "🧪" },
    // Add more as needed
  };

  const config = statusConfig[status] || statusConfig["pending"];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.color} font-semibold text-xs border border-gray-200`}
    >
      {config.icon} {prettyStatus}
    </span>
  );
};

const OverviewContent = () => {
  const [overview, setOverview] = useState(null);
  const params = useParams();
  const workspace_id = params.workspaceId;

  useEffect(() => {
    const fetchOverview = async () => {
      const accessToken = Cookies.get('accessToken');
      const response = await fetch(`${getBaseURL()}/api/workspace/freelancer/overview/${parseInt(workspace_id)}/`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const data = await response.json();
      setOverview(data);
    };
    fetchOverview();
  }, [workspace_id]);

  if (!overview) {
    return (
      <div className="text-white text-center py-10">Loading overview...</div>
    );
  }

  // Destructure the data for easier access
  const { project, team, payments } = overview;

  return (
    <div className="space-y-10 p-4 max-w-4xl mx-auto">
      {/* === Project Title & Status === */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              {project?.title}
              {overview.type === "obsp" && (
                <span className="text-xs px-2 py-1 bg-freelancer-accent/20 text-freelancer-accent rounded font-semibold tracking-wide">
                  OBSP
                </span>
              )}
            </h1>
            <div className="mt-3">{statusBadge(project?.status)}</div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-freelancer-accent hover:bg-freelancer-accent/90 text-white rounded-lg text-sm font-medium shadow">
            <DownloadOutlined /> Download Scope PDF
          </button>
        </div>
      </section>

      <hr className="border-white/10" />

      {/* === Scope Summary === */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">Scope Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <div className="text-sm text-white/60 mb-1">Level</div>
            <div className="text-base text-white font-medium">{project?.complexity_level}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Industry</div>
            <div className="text-base text-white font-medium">{project?.category_name}</div>
          </div>
        </div>
        <div>
          <div className="text-sm text-white/60 mb-1">Key Deliverables</div>
          <ul className="list-disc list-inside text-white/90 space-y-1 ml-4">
            {(project?.deliverables || []).map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      </section>

      <hr className="border-white/10" />

      {/* === Project Timeline & Milestones === */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">Project Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="text-sm text-white/60 mb-1">Project Start</div>
            <div className="text-base text-white flex items-center gap-1 font-medium">
              <CalendarOutlined /> {project?.start_date ? new Date(project.start_date).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Current Phase</div>
            <div className="text-base text-white font-medium">
              {project?.milestones?.find(m => m.status === "in_progress")?.title || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Final Deadline</div>
            <div className="text-base text-white flex items-center gap-1 font-medium">
              <CalendarOutlined /> {project?.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-white/90 border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs text-white/60">
                <th className="text-left py-2">Milestone</th>
                <th className="text-center py-2">Status</th>
                <th className="text-right py-2">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {(project?.milestones || []).map((milestone) => (
                <tr key={milestone.id} className="bg-freelancer-bg-grey rounded">
                  <td className="py-2 px-2 rounded-l">{milestone.title}</td>
                  <td className="py-2 text-center">
                    {statusBadge(milestone.status)}
                  </td>
                  <td className="py-2 px-2 text-right rounded-r">
                    {milestone.deadline ? new Date(milestone.deadline).toLocaleDateString() : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <hr className="border-white/10" />

      {/* === Client Info & Actions === */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">Client Info</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-freelancer-bg-grey rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-freelancer-accent/20 flex items-center justify-center text-xl">
              <UserOutlined className="text-freelancer-accent" />
            </div>
            <div>
              <div className="text-white font-medium text-lg">{team?.[0]?.name || "Client"}</div>
            </div>
          </div>
          <div className="flex gap-3 mt-2 sm:mt-0">
            <button className="flex items-center gap-2 px-4 py-2 bg-freelancer-accent hover:bg-freelancer-accent/90 text-white rounded-lg text-sm font-medium">
              <MessageOutlined /> Chat
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:bg-white/10 text-white rounded-lg text-sm font-medium">
              View History
            </button>
          </div>
        </div>
      </section>

      {/* === Freelancer Tips === */}
      <section>
        <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 flex items-start gap-3 mt-8">
          <InfoCircleOutlined className="text-blue-400 mt-1 text-lg" />
          <div>
            <div className="text-white font-semibold mb-1">Freelancer Tip</div>
            <div className="text-white/90">
              You're in the QA Phase — be ready for feedback. Don't forget to prepare final documentation 
              including all source files and style guides.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewContent;