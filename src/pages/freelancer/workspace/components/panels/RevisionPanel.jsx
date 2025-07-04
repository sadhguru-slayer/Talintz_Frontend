import React from 'react';

const RevisionPanel = ({ isMinimized, isPanelMaximized }) => {
  // Determine text size based on panel state
  const text = isPanelMaximized ? 'text-sm' : 'text-xs';

  return (
    <div className={`space-y-8 p-4 ${text}`}>
      {/* Revision Guidelines */}
      <div className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl shadow-card p-6">
        <h3 className={`text-lg font-bold text-white mb-4 ${text}`}>
          <span className="inline-block bg-purple-500/20 text-purple-400 rounded-full px-2 py-0.5 text-xs font-semibold mr-2">ℹ️</span>
          Revision Guidelines
        </h3>
        <ul className={`text-white/80 space-y-3 ${text}`}>
          <li className="flex items-start gap-2">
            <span className="text-freelancer-accent">•</span>
            <span>You are entitled to <strong>one free revision per milestone</strong>.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-freelancer-accent">•</span>
            <span>Clients must provide clear feedback within <strong>48 hours</strong> of submission.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-freelancer-accent">•</span>
            <span>Disputes can be raised via <strong>Talintz mediation</strong> if revisions are unfair.</span>
          </li>
        </ul>
      </div>

      {/* Next Scheduled Revision */}
      <div className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl shadow-card p-6">
        <h3 className={`text-lg font-bold text-white mb-4 flex items-center gap-2 ${text}`}>
          <span className="inline-block bg-yellow-400/20 text-yellow-400 rounded-full px-2 py-0.5 text-xs font-semibold">⏰</span>
          Next Scheduled Revision
        </h3>
        <div className={`grid grid-cols-2 gap-4 text-white ${text}`}>
          <div>
            <p className="text-white/60">Current Milestone</p>
            <p className="font-semibold">Final Delivery</p>
          </div>
          <div>
            <p className="text-white/60">Status</p>
            <p className="flex items-center gap-1">
              <span className="bg-green-500/20 text-green-400 rounded px-2 py-0.5 text-xs">Active</span>
            </p>
          </div>
          <div>
            <p className="text-white/60">Opens On</p>
            <p className="font-semibold">July 2, 2025</p>
          </div>
          <div>
            <p className="text-white/60">Deadline</p>
            <p className="flex items-center gap-1">
              <span className="bg-red-500/20 text-red-400 rounded px-2 py-0.5 text-xs">July 5, 2025</span>
            </p>
          </div>
        </div>
      </div>

      {/* Revision History */}
      <div className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl shadow-card p-6">
        <h3 className={`text-lg font-bold text-white mb-4 flex items-center gap-2 ${text}`}>
          <span className="inline-block bg-freelancer-accent/20 text-freelancer-accent rounded-full px-2 py-0.5 text-xs font-semibold">📝</span>
          Revision History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="bg-freelancer-primary/60 text-white/80">
                <th className="rounded-tl-lg px-3 py-2 text-left font-semibold">Milestone</th>
                <th className="px-3 py-2 text-left font-semibold">Client Feedback</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="rounded-tr-lg px-3 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-freelancer-primary/40 hover:bg-freelancer-primary/60 transition">
                <td className="px-3 text-freelancer-text-secondary py-2 rounded-l-lg">First Preview</td>
                <td className="px-3 text-freelancer-text-secondary py-2">"Adjust header spacing"</td>
                <td className="px-3 py-2">
                  <span className="bg-green-500/20 text-green-400 rounded px-2 py-0.5 text-xs">Completed</span>
                </td>
                <td className="px-3 py-2 rounded-r-lg">
                  <button className="text-freelancer-accent hover:underline text-xs">View Details</button>
                </td>
              </tr>
              <tr className="bg-freelancer-primary/30 hover:bg-freelancer-primary/50 transition">
                <td className="px-3 text-freelancer-text-secondary py-2 rounded-l-lg">Final Delivery</td>
                <td className="px-3 text-freelancer-text-secondary py-2">"Pending client review"</td>
                <td className="px-3 py-2">
                  <span className="bg-yellow-500/20 text-yellow-400 rounded px-2 py-0.5 text-xs">Awaiting Feedback</span>
                </td>
                <td className="px-3 py-2 rounded-r-lg">
                  <button className="text-freelancer-accent hover:underline text-xs">Remind Client</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RevisionPanel;