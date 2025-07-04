import React from "react";
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
import overviewData from "../../utils/data";

const Payments = () => {
  const { payments } = overviewData;

  return (
    <div className="space-y-10 p-4 max-w-4xl mx-auto">
      {/* Page Title */}
      <section>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <DollarOutlined className="text-freelancer-accent" />
          Payments & Payouts
        </h1>
        <div className="text-white/70 mb-6">
          Track your earnings, see what's released, and what's still locked for this project.
        </div>
      </section>

      {/* Payment Summary */}
      <section className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FileTextOutlined className="text-freelancer-accent" /> Payment Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <div>
            <div className="text-sm text-white/60 mb-1">Total Project Value</div>
            <div className="text-lg text-freelancer-accent font-bold">₹{payments.summary.totalValue}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Paid Upfront</div>
            <div className="text-lg text-green-400 font-bold">₹{payments.summary.paidUpfront}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Released to You</div>
            <div className="text-lg text-green-300 font-bold">₹{payments.summary.releasedToFreelancer}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-white/60 mb-1">Locked (Pending)</div>
            <div className="text-lg text-yellow-400 font-bold">₹{payments.summary.remainingLocked}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Pending Milestones</div>
            <div className="text-lg text-white font-bold">{payments.summary.pendingMilestones}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Support/QA Locked</div>
            <div className="text-lg text-blue-300 font-bold">₹{payments.summary.supportQALocked}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 items-center">
          <span className="text-white/60 text-sm">
            <InfoCircleOutlined className="mr-1" />
            {payments.summary.autopayEnabled
              ? `Auto-pay enabled: Milestones auto-release after ${payments.summary.autopayDays} days.`
              : "Auto-pay is not enabled for this project."}
          </span>
          {payments.summary.currentDisputes > 0 && (
            <span className="text-red-400 text-sm font-semibold flex items-center gap-1">
              <ExclamationCircleOutlined /> {payments.summary.currentDisputes} Dispute(s) Open
            </span>
          )}
        </div>
      </section>

      {/* Milestone Payments Table */}
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
              {payments.milestonePayments.map((m) => (
                <tr key={m.id} className="bg-freelancer-bg-grey rounded">
                  <td className="py-2 px-2 rounded-l">{m.title}</td>
                  <td className="py-2 text-center font-semibold text-freelancer-accent">
                    ₹{m.value}
                  </td>
                  <td className="py-2 text-center">
                    {m.status === "Done" && (
                      <span className="text-green-400 font-semibold flex items-center gap-1 justify-center">
                        <CheckCircleOutlined /> Released
                      </span>
                    )}
                    {m.status === "Released" && (
                      <span className="text-yellow-300 font-semibold flex items-center gap-1 justify-center">
                        <ClockCircleOutlined /> Pending Release
                      </span>
                    )}
                    {m.status === "Locked" && (
                      <span className="text-blue-300 font-semibold flex items-center gap-1 justify-center">
                        <LockOutlined /> Locked
                      </span>
                    )}
                  </td>
                  <td className="py-2 text-center">{m.date}</td>
                  <td className="py-2 text-center rounded-r">
                    {m.status === "Done" && (
                      <span className="text-green-400 font-semibold">Paid</span>
                    )}
                    {m.status === "Released" && (
                      <button className="px-3 py-1 rounded bg-freelancer-accent text-white font-medium text-xs hover:bg-freelancer-accent/90">
                        View Details
                      </button>
                    )}
                    {m.status === "Locked" && (
                      <span className="text-white/60">Awaiting Approval</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transaction History */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <HistoryOutlined className="text-freelancer-accent" /> Transaction History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-white/90 border-separate border-spacing-y-2">
            <thead>
              <tr className="text-xs text-white/60">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Action</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-center py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.transactions.map((t, idx) => (
                <tr key={idx} className="bg-freelancer-bg-grey rounded">
                  <td className="py-2 px-2 rounded-l">{t.date}</td>
                  <td className="py-2">{t.action}</td>
                  <td className="py-2 text-right font-semibold text-freelancer-accent">
                    ₹{t.amount}
                  </td>
                  <td className="py-2 text-center rounded-r">
                    {t.status === "Paid" && (
                      <span className="text-green-400 font-semibold">Paid</span>
                    )}
                    {t.status === "Released" && (
                      <span className="text-yellow-300 font-semibold">Released</span>
                    )}
                    {t.status === "Locked" && (
                      <span className="text-blue-300 font-semibold">Locked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Payments