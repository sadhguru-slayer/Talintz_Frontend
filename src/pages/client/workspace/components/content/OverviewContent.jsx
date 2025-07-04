import React from "react";
import { UserOutlined, CalendarOutlined, FileOutlined, CheckCircleOutlined, TeamOutlined, MessageOutlined, CreditCardOutlined } from '@ant-design/icons';
import overviewData from "../../utils/data";

const statusColor = status =>
  status === "Completed"
    ? "bg-green-500 text-white"
    : status === "In Progress"
    ? "bg-yellow-400 text-gray-900"
    : "bg-gray-400 text-white";

const OverviewContent = () => {
  const { project, team, recentMessages, files, payments } = overviewData;

  return (
    <div className="space-y-8 p-4">
      {/* Project Summary */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-client-accent text-xl" />
            <h2 className="text-xl font-bold text-white tracking-tight">{project.name}</h2>
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-client-accent/10 text-client-accent font-semibold text-xs">
            {project.status}
          </span>
        </div>
        <div className="flex flex-wrap gap-8 text-white/80 text-base">
          <div>
            <span className="block text-xs text-white/50">Deadline</span>
            <span className="flex items-center gap-1 font-medium">
              <CalendarOutlined /> {project.deadline}
            </span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Budget</span>
            <span className="font-semibold text-lg text-client-accent">₹{project.budget}</span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Spent</span>
            <span className="font-semibold text-lg text-yellow-400">₹{project.spent}</span>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircleOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Milestones</h3>
        </div>
        <ul className="divide-y divide-white/10">
          {project.milestones.map(m => (
            <li key={m.id} className="flex items-center justify-between py-2">
              <span className="text-white/90">{m.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(m.status)}`}>
                {m.status}
              </span>
              <span className="text-xs text-white/50 flex items-center gap-1">
                <CalendarOutlined /> {m.due}
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
          {team.map(member => (
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
              <span className={`text-xs mt-1 font-semibold ${member.online ? "text-green-400" : "text-gray-400"}`}>
                {member.online ? "Online" : "Offline"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Messages */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <MessageOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Recent Messages</h3>
        </div>
        <ul className="divide-y divide-white/10">
          {recentMessages.map(msg => (
            <li key={msg.id} className="flex justify-between items-center py-2">
              <span>
                <span className="font-semibold text-client-accent">{msg.sender}:</span>{" "}
                <span className="text-white/80">{msg.text}</span>
              </span>
              <span className="text-xs text-white/50">{msg.time}</span>
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
          {files.map(file => (
            <li key={file.id} className="flex justify-between items-center py-2">
              <span className="flex items-center gap-2">
                <FileOutlined className="text-white/40" />
                <span className="text-white/90">{file.name}</span>
              </span>
              <span className="text-xs text-white/50">by {file.uploadedBy} on {file.date}</span>
            </li>
          ))}
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
            <span className="block text-xs text-white/50">Total</span>
            <span className="font-semibold text-lg text-client-accent">₹{payments.total}</span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Paid</span>
            <span className="font-semibold text-lg text-green-400">₹{payments.paid}</span>
          </div>
          <div>
            <span className="block text-xs text-white/50">Next Due</span>
            <span className="font-medium">{payments.nextDue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
