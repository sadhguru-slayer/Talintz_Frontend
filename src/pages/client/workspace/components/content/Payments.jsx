import React from 'react';
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
import overviewData from '../../utils/data';

const statusColor = status => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'released':
      return 'text-green-400';
    case 'locked':
      return 'text-yellow-400';
    case 'disputed':
      return 'text-red-400';
    default:
      return 'text-white/60';
  }
};

const Payments = () => {
  const { summary, milestonePayments, transactions } = overviewData.payments;

  return (
    <div className="space-y-8">
      {/* Payment Overview Box */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-6">
          <DollarOutlined className="text-client-accent text-xl" />
          <h2 className="text-xl font-bold text-white">Payment Overview</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Value */}
          <div className="bg-client-secondary/60 rounded-lg p-4 border border-client-border">
            <span className="text-white/60 text-sm">Total Pack Value</span>
            <div className="text-2xl font-bold text-client-accent mt-1">
              ₹{summary.totalValue.toLocaleString()}
            </div>
          </div>

          {/* Released Amount */}
          <div className="bg-client-secondary/60 rounded-lg p-4 border border-client-border">
            <span className="text-white/60 text-sm">Released to Freelancer</span>
            <div className="text-2xl font-bold text-green-400 mt-1">
              ₹{summary.releasedToFreelancer.toLocaleString()}
              <span className="text-sm text-white/40 ml-1">
                ({((summary.releasedToFreelancer / summary.totalValue) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Locked Amount */}
          <div className="bg-client-secondary/60 rounded-lg p-4 border border-client-border">
            <span className="text-white/60 text-sm">Remaining Locked</span>
            <div className="text-2xl font-bold text-yellow-400 mt-1">
              ₹{summary.remainingLocked.toLocaleString()}
              <span className="text-sm text-white/40 ml-1">
                ({((summary.remainingLocked / summary.totalValue) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white/80">
          <div className="flex items-center gap-2">
            <ClockCircleOutlined className="text-client-accent" />
            <span>Pending Milestones: {summary.pendingMilestones}</span>
          </div>
          <div className="flex items-center gap-2">
            <LockOutlined className="text-yellow-400" />
            <span>QA Locked: ₹{summary.supportQALocked.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-red-400" />
            <span>Active Disputes: {summary.currentDisputes}</span>
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
            <Tooltip title={`Automatically release payment ${summary.autopayDays} days after milestone completion`}>
              <Switch 
                size="small" 
                checked={summary.autopayEnabled}
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
                <th className="pb-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {milestonePayments.map(milestone => (
                <tr key={milestone.id} className="text-white/90">
                  <td className="py-4">
                    <div className="font-medium">{milestone.title}</div>
                    <div className="text-xs text-white/50 flex items-center gap-1 mt-1">
                      <CalendarOutlined /> {milestone.date}
                    </div>
                  </td>
                  <td className="py-4 text-right font-medium">
                    {milestone.value > 0 ? `₹${milestone.value.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-4 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(milestone.status)}`}>
                      {milestone.status}
                    </span>
                  </td>
                  <td className="py-4 text-sm text-white/60">
                    {milestone.action}
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
                  <td className="py-4 text-sm">{tx.date}</td>
                  <td className="py-4">{tx.action}</td>
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
