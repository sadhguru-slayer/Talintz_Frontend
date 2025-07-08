import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { getBaseURL } from "../../../../../config/axios";
import { MdRateReview } from "react-icons/md";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const RevisionPanel = ({ isMinimized, isPanelMaximized }) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [scope, setScope] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { workspaceId } = useParams();
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextRevision, setNextRevision] = useState(null);
  const [maxRevisions, setMaxRevisions] = useState(1);
  const [usedRevisions, setUsedRevisions] = useState(0);
  const [remainingRevisions, setRemainingRevisions] = useState(1);
  const [canCreate, setCanCreate] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nextRevision?.milestone?.id) {
      setError("No milestone selected for revision.");
      return;
    }
    setIsSubmitted(true);
    try {
      const token = Cookies.get("accessToken");
      const formData = new FormData();
      formData.append("description", description);
      formData.append("milestone_id", nextRevision?.milestone?.id);

      if (file) {
        formData.append("file", file);
      }


      const response = await fetch(
        `${getBaseURL()}/api/workspace/client/revisions/${workspaceId}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error("Failed to submit revision");
      }
      const newRevision = await response.json();
      setRevisions(prev => [newRevision, ...prev]);
      fetchRevisions();
      setDescription("");
      setFile(null);
      setScope("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitted(false);
    }
  };
  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = Cookies.get("accessToken");
        const response = await fetch(
          `${getBaseURL()}/api/workspace/client/revisions/${workspaceId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch revision data");
        }
        const data = await response.json();
        setRevisions(data.results || []);
        setNextRevision(data.next_revision || null);
        setMaxRevisions(data.max_revisions || 1);
        setUsedRevisions(data.used_revisions || 0);
        setRemainingRevisions(data.remaining_revisions);
        setCanCreate(data.can_create !== false);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchRevisions();
    }
  }, [workspaceId]);


  // Determine text size based on panel state
  const text = isPanelMaximized ? 'text-sm' : 'text-xs';

  return (
    <div className={` ${text}`}>
      {/* Raise Revision Section */}

      <div className={`flex items-center justify-between px-4 py-3 border-b border-client-border bg-client-primary/40`}>
        <span className={`font-semibold text-white flex items-center gap-2 text-sm`}>
          <MdRateReview  className="text-client-accent" /> Revisions
        </span>
      </div>
      <div className="bg-client-secondary/90 border border-client-border   p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="inline-block bg-client-accent/20 text-client-accent rounded-full px-2 py-0.5 text-xs font-semibold">📝</span>
            Raise a Revision Request
          </h3>
          <span className={`text-xs px-2 py-1 rounded font-semibold ${remainingRevisions > 0 ? "bg-green-700/20 text-green-400" : "bg-red-700/20 text-red-400"}`}>
            {remainingRevisions > 0
              ? `${remainingRevisions} of ${maxRevisions} left`
              : "No revisions left"}
          </span>
        </div>
        <p className="text-white/60 text-xs mb-4">
          Please describe clearly what needs to be improved. You can also attach a file (e.g. screenshot, doc, etc).
        </p>
        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div>
            <textarea
              className={`w-full bg-client-primary/60 border border-client-border rounded-xl p-4 text-white resize-none focus:ring-2 focus:ring-client-accent/40 transition ${text}`}
              rows={5}
              placeholder="Describe what needs improvement (be as specific as possible)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitted || !canCreate || remainingRevisions === 0}
              required
            />
          </div>
          <div>
            <label className="block text-white/70 text-xs mb-1 font-medium" htmlFor="file-upload">
              Attachment (optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={isSubmitted || !canCreate || remainingRevisions === 0}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer px-3 py-1.5 rounded-lg border border-client-accent bg-client-accent/10 text-client-accent text-xs font-semibold hover:bg-client-accent/20 transition`}
              >
                {file ? "Change File" : "Choose File"}
              </label>
              {file && (
                <span className="text-white/80 text-xs truncate max-w-xs">{file.name}</span>
              )}
            </div>
          </div>
          <button
            type="submit"
            className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-client-accent hover:bg-client-accent/90 text-white rounded-xl font-semibold shadow transition disabled:opacity-60 disabled:cursor-not-allowed ${text}`}
            disabled={isSubmitted || !canCreate || remainingRevisions === 0}
          >
            {isSubmitted && (
              <svg className="animate-spin h-4 w-4 mr-2 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            Submit Request
          </button>
          {(error || (!canCreate || remainingRevisions === 0)) && (
            <div className={`mt-2 text-xs rounded px-3 py-2 ${error ? "bg-red-700/20 text-red-400" : "bg-yellow-700/20 text-yellow-400"}`}>
              {error || "You have used all allowed revisions for this milestone."}
            </div>
          )}
        </form>
      </div>

      {/* Next Scheduled Revision */}
      {nextRevision && (
        <div className="bg-client-secondary/80 border border-client-border   p-6 flex flex-col gap-3">
          <h3 className={`text-lg font-bold text-white mb-2 flex items-center gap-2 ${text}`}>
            <span className="inline-block bg-yellow-400/20 text-yellow-400 rounded-full px-2 py-0.5 text-xs font-semibold">⏰</span>
            Next Scheduled Revision
          </h3>
          <div className={`text-white ${text} space-y-1`}>  
            <div className="flex items-center gap-2">
              <span className="font-semibold text-client-accent">Current Milestone:</span>
              <span className="bg-client-primary/60 rounded px-2 py-0.5 text-xs">{nextRevision.milestone?.title || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-client-accent">Requested By:</span>
              <span className="bg-blue-500/20 text-blue-300 rounded px-2 py-0.5 text-xs">{nextRevision.requested_by?.username || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-client-accent">Opened On:</span>
              <span className="bg-blue-500/20 text-blue-300 rounded px-2 py-0.5 text-xs">{formatDate(nextRevision.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-client-accent">Status:</span>
              <span className={`rounded px-2 py-0.5 text-xs ${
                nextRevision.status === "open"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-gray-500/20 text-gray-300"
              }`}>
                {nextRevision.status === "open" ? "Revision Window Open" : "Closed"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-client-accent">Description:</span>
              <span className="bg-yellow-500/20 text-yellow-400 rounded px-2 py-0.5 text-xs">{nextRevision.description || "—"}</span>
            </div>
          </div>
        </div>
      )}

      {/* Revision History */}
      <div className="bg-client-secondary/80 border border-client-border   p-6">
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
                {revisions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-white/60 py-4">No revision history yet.</td>
                  </tr>
                ) : (
                  revisions.map((rev, idx) => (
                    <tr key={rev.id || idx} className="bg-client-primary/40 hover:bg-client-primary/60 transition">
                      <td className="px-3 py-2 rounded-l-lg">{rev.milestone?.title || "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded px-2 py-0.5 text-xs ${
                          rev.status === "open"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : rev.status === "closed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-300"
                        }`}>
                          {rev.status === "open"
                            ? "Revision Raised"
                            : rev.status === "closed"
                            ? "Revision Closed"
                            : rev.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{formatDate(rev.created_at)}</td>
                      <td className="px-3 py-2 rounded-r-lg flex items-center gap-2">
                        {rev.description || "—"}
                        {rev.status === "closed" && <span className="text-green-400">✅ Done</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionPanel;