import React from "react";
import { 
  UserOutlined, 
  CalendarOutlined, 
  FileOutlined, 
  CheckCircleOutlined, 
  MessageOutlined, 
  DownloadOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import overviewData from "../../utils/data";

const statusBadge = (status) => {
  const statusConfig = {
    "In Progress": { color: "bg-yellow-400 text-gray-900", icon: "🔄" },
    "Pending Client": { color: "bg-blue-400 text-white", icon: "⏳" },
    "Awaiting Revision": { color: "bg-orange-400 text-white", icon: "✏️" },
    "QA Phase": { color: "bg-purple-400 text-white", icon: "🔍" },
    "Closed": { color: "bg-green-500 text-white", icon: "✅" }
  };
  const config = statusConfig[status] || statusConfig["In Progress"];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.color} font-semibold text-xs`}>
      {config.icon} {status}
    </span>
  );
};

const OverviewContent = () => {
  const { project, team, payments } = overviewData;

  return (
    <div className="space-y-10 p-4 max-w-4xl mx-auto">
      {/* === Project Title & Status === */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              {project.name}
              <span className="text-xs px-2 py-1 bg-freelancer-accent/20 text-freelancer-accent rounded font-semibold tracking-wide">
                OBSP
              </span>
            </h1>
            <div className="mt-3">{statusBadge(project.status)}</div>
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
            <div className="text-base text-white font-medium">Mid-Level OBSP</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Industry</div>
            <div className="text-base text-white font-medium">Tech / Creativity</div>
          </div>
        </div>
        <div>
          <div className="text-sm text-white/60 mb-1">Key Deliverables</div>
          <ul className="list-disc list-inside text-white/90 space-y-1 ml-4">
            <li>E-commerce website design</li>
            <li>Product page templates (3 variants)</li>
            <li>Checkout flow optimization</li>
            <li>Mobile-responsive implementation</li>
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
              <CalendarOutlined /> June 15, 2025
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Current Phase</div>
            <div className="text-base text-white font-medium">Design Preview</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Final Deadline</div>
            <div className="text-base text-white flex items-center gap-1 font-medium">
              <CalendarOutlined /> July 15, 2025
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
              {payments.milestonePayments.map((milestone) => (
                <tr key={milestone.id} className="bg-freelancer-bg-grey rounded">
                  <td className="py-2 px-2 rounded-l">{milestone.title}</td>
                  <td className="py-2 text-center">
                    {milestone.status === "Done" && <span className="text-green-400 font-semibold">✅ Approved</span>}
                    {milestone.status === "Released" && <span className="text-yellow-300 font-semibold">🔄 Ongoing</span>}
                    {milestone.status === "Locked" && <span className="text-blue-300 font-semibold">⏳ Pending</span>}
                  </td>
                  <td className="py-2 px-2 text-right rounded-r">{milestone.date}</td>
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
              <div className="text-white font-medium text-lg">Bob Smith</div>
              <div className="text-white/70 text-sm">Acme Corp</div>
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