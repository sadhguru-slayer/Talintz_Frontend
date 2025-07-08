import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { getBaseURL } from "../../../../../config/axios";

const RevisionPanel = ({ isMinimized, isPanelMaximized }) => {
  const { workspaceId } = useParams();
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextRevision, setNextRevision] = useState(null);

  // Determine text size based on panel state
  const text = isPanelMaximized ? 'text-sm' : 'text-xs';

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = Cookies.get("accessToken");
        const response = await fetch(
          `${getBaseURL()}/api/workspace/freelancer/revisions/${workspaceId}/`,
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
        {loading ? (
          <div className="text-white/60">Loading...</div>
        ) : !nextRevision ? (
          <div className="text-white/60">No upcoming revision.</div>
        ) : (
          <div className={`grid grid-cols-2 gap-4 text-white ${text}`}>
            <div>
              <p className="text-white/60">Milestone</p>
              <p className="font-semibold">{nextRevision.milestone?.title || "N/A"}</p>
            </div>
            <div>
              <p className="text-white/60">Status</p>
              <p className="flex items-center gap-1">
                <span className="bg-green-500/20 text-green-400 rounded px-2 py-0.5 text-xs">
                  {nextRevision.status}
                </span>
              </p>
            </div>
            <div>
              <p className="text-white/60">Opens On</p>
              <p className="font-semibold">{nextRevision.created_at ? new Date(nextRevision.created_at).toLocaleDateString() : "N/A"}</p>
            </div>
            <div>
              <p className="text-white/60">Deadline</p>
              <p className="flex items-center gap-1">
                <span className="bg-red-500/20 text-red-400 rounded px-2 py-0.5 text-xs">
                  {nextRevision.addressed_at ? new Date(nextRevision.addressed_at).toLocaleDateString() : "N/A"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Revision History */}
      <div className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl shadow-card p-6">
        <h3 className={`text-lg font-bold text-white mb-4 flex items-center gap-2 ${text}`}>
          <span className="inline-block bg-freelancer-accent/20 text-freelancer-accent rounded-full px-2 py-0.5 text-xs font-semibold">📝</span>
          Revision History
        </h3>
        {loading ? (
          <div className="text-white/60">Loading revisions...</div>
        ) : error ? (
          <div className="text-red-400">Error: {error}</div>
        ) : revisions.length === 0 ? (
          <div className="text-white/60">No revisions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-freelancer-primary/60 text-white/80">
                  <th className="rounded-tl-lg px-3 py-2 text-left font-semibold">Milestone</th>
                  <th className="px-3 py-2 text-left font-semibold">Description</th>
                  <th className="px-3 py-2 text-left font-semibold">Status</th>
                  <th className="rounded-tr-lg px-3 py-2 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {revisions.map((rev) => (
                  <tr key={rev.id} className="bg-freelancer-primary/40 hover:bg-freelancer-primary/60 transition">
                    <td className="px-3 text-freelancer-text-secondary py-2 rounded-l-lg">
                      {rev.milestone ? rev.milestone.title : "N/A"}
                    </td>
                    <td className="px-3 text-freelancer-text-secondary py-2">
                      {rev.description}
                    </td>
                    <td className="px-3 py-2">
                      <span className={
                        rev.status === "open"
                          ? "bg-yellow-500/20 text-yellow-400 rounded px-2 py-0.5 text-xs"
                          : rev.status === "addressed"
                          ? "bg-green-500/20 text-green-400 rounded px-2 py-0.5 text-xs"
                          : "bg-gray-500/20 text-gray-400 rounded px-2 py-0.5 text-xs"
                      }>
                        {rev.status.charAt(0).toUpperCase() + rev.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 rounded-r-lg">
                      <button className="text-freelancer-accent hover:underline text-xs">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevisionPanel;