import React, { useState, useEffect } from 'react';
import { 
  DollarOutlined, 
  LockOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  CalendarOutlined,
  
} from '@ant-design/icons';
import { Switch, Tooltip } from 'antd';
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { getBaseURL } from "../../../../../config/axios";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const statusColor = status => {
  if (!status) return 'text-white/60';
  switch (status.toLowerCase()) {
    case 'paid':
    case 'released':
      return 'text-green-400';
    case 'locked':
    case 'pending':
      return 'text-yellow-400';
    case 'disputed':
      return 'text-red-400';
    default:
      return 'text-white/60';
  }
};

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
          `${getBaseURL()}/api/workspace/client/payments/${workspaceId}/`,
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
        console.log(data)
      } catch (err) {
        setError(err.message);
        console.error("Error fetching payments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [workspaceId]);

  if (loading) return <div className="text-white/80 p-4">Loading payments...</div>;
  if (error) return <div className="text-red-400 p-4">Error: {error}</div>;
  if (!payments) return <div className="text-white/60 p-4">No payment data found.</div>;

  const { summary, milestone_payments = [], transactions = [], type } = payments;

  return (
    <div className="space-y-8 p-4">
      {/* Payment Overview Box */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <DollarOutlined className="text-client-accent text-xl" />
          <h2 className="text-xl font-bold text-white">
            {type === 'obsp' ? "Pack Payments" : "Project Payments"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Value */}
          <div className="bg-client-secondary/60 rounded-lg p-4 border border-client-border">
            <span className="text-white/60 text-sm">Total Value</span>
            <div className="text-2xl font-bold text-client-accent mt-1">
              ₹{summary?.total_due?.toLocaleString() || 0}
            </div>
          </div>
          {/* Remaining */}
          <div className="bg-client-secondary/60 rounded-lg p-4 border border-client-border">
            <span className="text-white/60 text-sm">Remaining</span>
            <div className="text-2xl font-bold text-yellow-400 mt-1">
              ₹{summary?.remaining?.toLocaleString() || 0}
              <span className="text-sm text-white/40 ml-1">
                ({summary && summary.total_due ? ((summary.remaining / summary.total_due) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
          {/* Total Paid */}
          <div className="bg-client-secondary/60 rounded-lg p-4 border border-client-border">
            <span className="text-white/60 text-sm">Total Paid</span>
            <div className="text-2xl font-bold text-green-400 mt-1">
              ₹{summary?.total_paid?.toLocaleString() || 0}
              <span className="text-sm text-white/40 ml-1">
                ({summary && summary.total_due ? ((summary.total_paid / summary.total_due) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-white/80">
          <div>
            <span className="text-white/60 text-sm">Transactions</span>
            <div className="font-bold">{summary?.transactions_count || 0}</div>
          </div>
          <div>
            <span className="text-white/60 text-sm">Last Payment</span>
            <div className="font-bold">{summary?.last_payment ? new Date(summary.last_payment).toLocaleDateString() : "—"}</div>
          </div>
        </div>
      </div>

      {/* Milestone Payments Table */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-client-accent text-xl" />
            <h2 className="text-xl font-bold text-white">Milestone Payments</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">Auto-release</span>
            <Tooltip title={`Automatically release payment ${summary?.autopay_days || 0} days after milestone completion`}>
              <Switch 
                size="small" 
                checked={summary?.autopay_enabled}
                className="bg-white/20"
              />
            </Tooltip>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-white/60 text-sm border-b border-white/10">
                <th className="pb-2 text-left">Milestone</th>
                <th className="pb-2 text-right">Value</th>
                <th className="pb-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {milestone_payments.map(milestone => (
                <tr key={milestone.id} className="text-white/90">
                  <td className="py-4">
                    <div className="font-medium">{milestone.title}</div>
                    {milestone.status.toLowerCase() === "paid" && milestone.paid_at && (
                      <div className="text-xs text-green-400 flex items-center gap-1 mt-1">
                        <CheckCircleOutlined /> Paid on {formatDateTime(milestone.paid_at)}
                      </div>
                    )}
                  </td>
                  <td className="py-4 text-right font-medium">
                    {milestone.amount > 0 ? `₹${milestone.amount.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <HistoryOutlined className="text-client-accent text-xl" />
          <h2 className="text-xl font-bold text-white">Transaction History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-white/60 text-sm border-b border-white/10">
                <th className="pb-2 text-left">Date</th>
                <th className="pb-2 text-left">Action</th>
                <th className="pb-2 text-right">Amount</th>
                <th className="pb-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {transactions.map((tx, idx) => (
                <tr key={idx} className="text-white/90">
                  <td className="py-4 text-sm">{tx.created_at ? new Date(tx.created_at).toLocaleDateString() : ''}</td>
                  <td className="py-4">
                    {tx.description || tx.payment_type || tx.status}
                    {tx.milestone_title && (
                      <span className="ml-2 text-xs text-white/50">({tx.milestone_title})</span>
                    )}
                  </td>
                  <td className="py-4 text-right font-medium">
                    ₹{tx.amount.toLocaleString()}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
