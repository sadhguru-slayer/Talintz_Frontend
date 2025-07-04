import React, { useState } from 'react';

const RevisionPanel = ({ isMinimized, isPanelMaximized }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [scope, setScope] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle submission logic here
    setIsSubmitted(true);
  };

  // Determine text size based on panel state
  const text = isPanelMaximized ? 'text-sm' : 'text-xs';

  return (
    <div className={`space-y-8 p-4 ${text}`}>
      {/* Raise Revision Section */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl shadow-card p-6">
        <h3 className={`text-lg font-bold text-white mb-4 ${text}`}>Raise a Revision Request</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className={`w-full bg-client-secondary/60 border border-client-border rounded-lg p-3 text-white resize-none ${text}`}
            rows={4}
            placeholder="Explain what needs improvement"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitted}
          />
          <input
            type="file"
            className={`w-full bg-client-secondary/60 border border-client-border rounded-lg p-3 text-white ${text}`}
            onChange={(e) => setFile(e.target.files[0])}
            disabled={isSubmitted}
          />
          <select
            className={`w-full bg-client-secondary/60 border border-client-border rounded-lg p-3 text-white ${text}`}
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            disabled={isSubmitted}
          >
            <option value="">Select Scope Category (optional)</option>
            <option value="UI">UI</option>
            <option value="Copy">Copy</option>
            <option value="Bugs">Bugs</option>
          </select>
          <button
            type="submit"
            className={`w-full px-4 py-2 bg-client-accent text-white rounded-lg font-semibold ${text}`}
            disabled={isSubmitted}
          >
            Submit Request
          </button>
        </form>
        {isSubmitted && (
          <p className={`text-white mt-2 ${text}`}>You get one guaranteed revision per milestone.</p>
        )}
      </div>

      {/* Next Scheduled Revision */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl shadow-card p-6 flex flex-col gap-3">
        <h3 className={`text-lg font-bold text-white mb-2 flex items-center gap-2 ${text}`}>
          <span className="inline-block bg-yellow-400/20 text-yellow-400 rounded-full px-2 py-0.5 text-xs font-semibold">⏰</span>
          Next Scheduled Revision
        </h3>
        <div className={`text-white ${text} space-y-1`}>  
          <div className="flex items-center gap-2">
            <span className="font-semibold text-client-accent">Current Milestone:</span>
            <span className="bg-client-primary/60 rounded px-2 py-0.5 text-xs">Final Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-client-accent">Opens On:</span>
            <span className="bg-blue-500/20 text-blue-300 rounded px-2 py-0.5 text-xs">July 2, 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-client-accent">Status:</span>
            <span className="bg-green-500/20 text-green-400 rounded px-2 py-0.5 text-xs">Revision Window Open</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-client-accent">Auto-close:</span>
            <span className="bg-yellow-500/20 text-yellow-400 rounded px-2 py-0.5 text-xs flex items-center gap-1">⏳ 1 day left to raise revision</span>
          </div>
        </div>
      </div>

      {/* Revision History */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl shadow-card p-6">
        <h3 className={`text-lg font-bold text-white mb-2 flex items-center gap-2 ${text}`}>
          <span className="inline-block bg-client-accent/20 text-client-accent rounded-full px-2 py-0.5 text-xs font-semibold">📝</span>
          Revision History
        </h3>
        <div className={`text-white ${text}`}>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1">
              <thead>
                <tr className="bg-client-primary/60 text-white/80">
                  <th className="rounded-tl-lg px-3 py-2 text-left font-semibold">Milestone</th>
                  <th className="px-3 py-2 text-left font-semibold">Action</th>
                  <th className="px-3 py-2 text-left font-semibold">Date</th>
                  <th className="rounded-tr-lg px-3 py-2 text-left font-semibold">Notes/Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-client-primary/40 hover:bg-client-primary/60 transition">
                  <td className="px-3 py-2 rounded-l-lg">First Preview</td>
                  <td className="px-3 py-2"><span className="bg-yellow-500/20 text-yellow-400 rounded px-2 py-0.5 text-xs">Revision Raised</span></td>
                  <td className="px-3 py-2">June 20</td>
                  <td className="px-3 py-2 rounded-r-lg flex items-center gap-2">“Header spacing issue” <span className="text-green-400">✅ Done</span></td>
                </tr>
                <tr className="bg-client-primary/30 hover:bg-client-primary/50 transition">
                  <td className="px-3 py-2 rounded-l-lg">Final Delivery</td>
                  <td className="px-3 py-2"><span className="bg-gray-500/20 text-gray-300 rounded px-2 py-0.5 text-xs">No Revision Yet</span></td>
                  <td className="px-3 py-2">Pending</td>
                  <td className="px-3 py-2 rounded-r-lg">—</td>
                </tr>
                <tr className="bg-client-primary/40 hover:bg-client-primary/60 transition">
                  <td className="px-3 py-2 rounded-l-lg">QA & Closure</td>
                  <td className="px-3 py-2"><span className="bg-blue-500/20 text-blue-300 rounded px-2 py-0.5 text-xs">Scheduled</span></td>
                  <td className="px-3 py-2">July 5</td>
                  <td className="px-3 py-2 rounded-r-lg">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionPanel;