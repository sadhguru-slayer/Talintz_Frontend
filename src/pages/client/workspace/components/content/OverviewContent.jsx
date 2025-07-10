import React, { useEffect, useState } from "react";
import { UserOutlined, CalendarOutlined, FileOutlined, CheckCircleOutlined, TeamOutlined, MessageOutlined, CreditCardOutlined } from '@ant-design/icons';
import overviewData from "../../utils/data";
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

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const ClientWorkspaceOverview = () => {
  const params = useParams();
  const workspace_id = params.workspaceId;
  const { project, team, recentMessages, files, payments } = overviewData;
  const [projectdata, setProjectdata] = useState(null);
  const [filesSubmissions,setFilesSubmissions] = useState(null);
  const [paymentOverview,setPaymentOverview] = useState(null);
  const [milestones, setMilestones] = useState(null);
  const [participants,setParticipants] = useState(null);
  const [type, setType] = useState("");

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        const res = await fetch(
          `${getBaseURL()}/api/workspace/client/overview/${workspace_id}/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        const data = await res.json();
        console.log("Client Workspace Overview:", data);
        setProjectdata(data.project);
        setFilesSubmissions(data.files);
        setPaymentOverview(data.payments);
        setMilestones(data.project.milestones);
        setParticipants(data.team);
        setType(data.type);
      } catch (err) {
        console.error("Failed to fetch client overview", err);
      }
    };
    fetchOverview();
  }, [workspace_id]);

  return (
    <div className="space-y-8 p-4">
      {/* Project Summary */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-client-accent text-xl" />
            <h2 className="text-xl font-bold text-white tracking-tight">{projectdata?.title}</h2>
          </div>
          <span className="inline-block px-3 py-1 capitalize rounded-full bg-client-accent/10 text-client-accent font-semibold text-xs">
            {projectdata?.complexity_level}
          </span>
        </div>
        <div className="flex flex-wrap gap-8 text-white/80 text-base mb-4">
          <div>
            <span className="block text-xs text-white/50">Category</span>
            <span className="font-medium">{projectdata?.category_name || "N/A"}</span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Start Date</span>
            <span className="flex items-center gap-1 font-medium">
              <CalendarOutlined /> {formatDate(projectdata?.start_date)}
            </span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Deadline</span>
            <span className="flex items-center gap-1 font-medium">
              <CalendarOutlined /> {formatDate(projectdata?.deadline)}
            </span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Budget</span>
            <span className="font-semibold text-lg text-client-accent">₹{projectdata?.budget}</span>
          </div>
        </div>
        <div className="mb-3">
          <span className="block text-xs text-white/50 mb-1">Description</span>
          <span className="text-white/90">{projectdata?.description}</span>
        </div>
        { type === 'obsp' && (
        <div className="flex flex-wrap gap-8 mb-3">
          <div>
            <span className="block text-xs text-white/50 mb-1">Deliverables</span>
            <ul className="list-disc list-inside text-white/80 text-sm">
              {projectdata?.deliverables?.length
                ? projectdata.deliverables.map((d, i) => <li key={i}>{d}</li>)
                : <li>No deliverables listed</li>}
            </ul>
          </div>
          <div>
            <span className="block text-xs text-white/50 mb-1">Features</span>
            <ul className="list-disc list-inside text-white/80 text-sm">
              {projectdata?.features?.length
                ? projectdata.features.map((f, i) => <li key={i}>{f}</li>)
                : <li>No features listed</li>}
            </ul>
          </div>
        </div>
              )}
        <div>
            <span className="block text-xs text-white/50 mb-1">Skills Required</span>
            <ul className="list-disc list-inside text-white/80 text-sm">
              {projectdata?.skills_required?.required_skills?.length
                ? projectdata.skills_required.required_skills.map((s, i) => <li key={i}>{s}</li>)
                : <li>No required skills</li>}
              {projectdata?.skills_required?.core_skills?.length
                ? projectdata.skills_required.core_skills.map((s, i) => <li key={i}>Core: {s}</li>)
                : null}
              {projectdata?.skills_required?.optional_skills?.length
                ? projectdata.skills_required.optional_skills.map((s, i) => <li key={i}>Optional: {s}</li>)
                : null}
            </ul>
          </div>
      </div>

      {/* Milestones */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircleOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Milestones</h3>
        </div>
        <ul className="divide-y divide-white/10">
          {milestones?.map(m => (
            <li key={m.id} className="flex items-center justify-between py-2">
              <span className="text-white/90">{m.title}</span>
                {statusBadge(m.status)}
              
              <span className="text-xs text-white/50 flex items-center gap-1">
                <CalendarOutlined /> {formatDate(m.deadline)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Team */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <TeamOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Team</h3>
        </div>
        <ul className="flex gap-6">
          {participants?.map(member => (
            <li key={member.id} className="flex flex-col items-center">
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover border-2 border-client-accent" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-bold border-2 border-client-accent">
                  {member.name[0]}
                </div>
              )}
              <span className="text-white/90 text-base font-medium mt-2">{member.name}</span>
              <span className="text-white/50 text-xs">{member.role}</span>
              
            </li>
          ))}
        </ul>
      </div>



      {/* Files */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <FileOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Recent Files</h3>
        </div>
        <ul className="divide-y divide-white/10">
          {filesSubmissions?.map(file => {
            // Extract filename after 'attachments/' or use the last part of the path
            let displayName = file.name;
            if (file.name && file.name.includes("attachments/")) {
              displayName = file.name.split("attachments/").pop();
            } else if (file.name && file.name.includes("/")) {
              displayName = file.name.split("/").pop();
            }
            return (
              <li key={file.id} className="flex justify-between items-center py-2">
                <span className="flex items-center gap-2">
                  <FileOutlined className="text-white/40" />
                  {/* Clickable filename */}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-client-accent hover:underline font-medium"
                    title={displayName}
                  >
                    {displayName}
                  </a>
                </span>
                <span className="text-xs text-white/50">
                  by {file.uploaded_by} on {formatDate(file.uploaded_at)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Payments */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <CreditCardOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Payments</h3>
          </div>
          <div className="flex flex-wrap gap-8 text-white/80 text-base">
          <div>
            <span className="block text-xs text-white/50">Transactions</span>
            <span className="font-medium text-indigo-400">{paymentOverview?.transactions_count}</span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Total</span>
            <span className="font-semibold text-lg text-client-accent">₹{paymentOverview?.total_due}</span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Paid</span>
            <span className="font-semibold text-lg text-green-400">₹{paymentOverview?.total_paid}</span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Remaining</span>
            <span className="font-medium text-indigo-400">₹{paymentOverview?.remaining}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWorkspaceOverview;
