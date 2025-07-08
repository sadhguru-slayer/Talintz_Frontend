import React, { useState, useEffect } from "react";
import {
  DollarOutlined,
  CheckCircleOutlined,
  LockOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { getBaseURL } from "../../../../../config/axios";

const Payments = () => {
  const { workspaceId } = useParams();
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("accessToken");
        const response = await fetch(
          `${getBaseURL()}/api/workspace/freelancer/payments/${workspaceId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch payment data");
        }

        const data = await response.json();
        setPayments(data);
        // console.log(data)
      } catch (err) {
        setError(err.message);
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

      fetchPayments();
    
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!payments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">No payment data available</div>
      </div>
    );
  }

  const { type, summary, milestone_payments, transactions } = payments;

  return (
    <div className="space-y-10 p-4 max-w-4xl mx-auto">
      {/* Page Title */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarOutlined className="text-freelancer-accent" />
          Payments & Payouts
        </h1>
        <div className="text-white/70 mb-6">
          Track your earnings, see what's released, and what's still locked for this {type}.
        </div>
      </section>

      {/* Payment Summary */}
      <section className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileTextOutlined className="text-freelancer-accent" /> Payment Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <div className="text-sm text-white/60 mb-1">Total {type === 'obsp' ? 'OBSP' : 'Project'} Value</div>
            <div className="text-lg text-freelancer-accent font-bold">₹{summary.total_due}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Total Paid</div>
            <div className="text-lg text-green-400 font-bold">₹{summary.total_paid}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Remaining</div>
            <div className="text-lg text-yellow-400 font-bold">₹{summary.remaining}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-white/60 mb-1">Transactions</div>
            <div className="text-lg text-white font-bold">{summary.transactions_count || 0}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Last Payment</div>
            <div className="text-lg text-blue-300 font-bold">
              {summary.last_payment ? new Date(summary.last_payment).toLocaleDateString() : 'None'}
            </div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Type</div>
            <div className="text-lg text-purple-300 font-bold capitalize">{type}</div>
          </div>
        </div>
      </section>

      {/* Milestone Payments Table */}
      {milestone_payments && milestone_payments.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircleOutlined className="text-freelancer-accent" /> Milestone Payouts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white/90 border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs text-white/60">
                  <th className="text-left py-2">Milestone</th>
                  <th className="text-center py-2">Value</th>
                  <th className="text-center py-2">Status</th>
                  <th className="text-center py-2">Date</th>
                  <th className="text-center py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {milestone_payments.map((m) => (
                  <tr key={m.id} className="bg-freelancer-bg-grey rounded">
                    <td className="py-2 px-2 rounded-l">{m.title}</td>
                    <td className="py-2 text-center font-semibold text-freelancer-accent">
                      ₹{m.amount}
                    </td>
                    <td className="py-2 text-center">
                      {m.status === "paid" && (
                        <span className="text-green-400 font-semibold flex items-center gap-1 justify-center">
                          <CheckCircleOutlined /> Paid
                        </span>
                      )}
                      {m.status === "pending" && (
                        <span className="text-yellow-300 font-semibold flex items-center gap-1 justify-center">
                          <ClockCircleOutlined /> Pending
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-center">
                      {m.paid_at ? new Date(m.paid_at).toLocaleDateString() : 'Not paid'}
                    </td>
                    <td className="py-2 text-center rounded-r">
                      {m.status === "paid" && (
                        <span className="text-green-400 font-semibold">Completed</span>
                      )}
                      {m.status === "pending" && (
                        <span className="text-white/60">Awaiting Completion</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <HistoryOutlined className="text-freelancer-accent" /> Transaction History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-white/90 border-separate border-spacing-y-2">
              <thead>
                <tr className="text-xs text-white/60">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => (
                  <tr key={idx} className="bg-freelancer-bg-grey rounded">
                    <td className="py-2 px-2 rounded-l">
                      {t.completed_at ? new Date(t.completed_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-2">{t.description}</td>
                    <td className="py-2 text-right font-semibold text-freelancer-accent">
                      ₹{t.amount}
                    </td>
                    <td className="py-2 text-center rounded-r">
                      {t.status === "completed" && (
                        <span className="text-green-400 font-semibold">Completed</span>
                      )}
                      {t.status === "pending" && (
                        <span className="text-yellow-300 font-semibold">Pending</span>
                      )}
                      {t.status === "failed" && (
                        <span className="text-red-400 font-semibold">Failed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default Payments;