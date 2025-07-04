import React from 'react';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  BellOutlined,
  MessageOutlined,
  DollarOutlined,
} from '@ant-design/icons';

// Example notification data
const notifications = [
  {
    id: 1,
    type: 'milestone_submitted',
    icon: <CheckCircleOutlined className="text-blue-400" />,
    text: "Milestone 'Design Preview' submitted.",
    cta: "Review",
    time: "5 mins ago",
    actionable: true,
  },
  {
    id: 2,
    type: 'revision_raised',
    icon: <SyncOutlined className="text-yellow-400" />,
    text: "Revision raised on 'Final Delivery'.",
    cta: "View",
    time: "12 mins ago",
    actionable: true,
  },
  {
    id: 3,
    type: 'auto_release',
    icon: <ClockCircleOutlined className="text-orange-400" />,
    text: "Auto-approval in 24h for 'Design Preview'.",
    cta: "Review",
    time: "1 hour ago",
    actionable: true,
  },
  {
    id: 4,
    type: 'payment_released',
    icon: <DollarOutlined className="text-green-400" />,
    text: "₹12,000 released for 'Design Preview'.",
    time: "2 hours ago",
    actionable: false,
  },
  {
    id: 5,
    type: 'dispute_alert',
    icon: <ExclamationCircleOutlined className="text-red-400" />,
    text: "Dispute raised on 'QA Milestone'.",
    cta: "Go to Dispute",
    time: "3 hours ago",
    actionable: true,
  },
  {
    id: 6,
    type: 'project_approved',
    icon: <CheckCircleOutlined className="text-green-400" />,
    text: "Project closed successfully. 🎉",
    time: "Yesterday",
    actionable: false,
  },
  {
    id: 7,
    type: 'new_message',
    icon: <MessageOutlined className="text-freelancer-accent" />,
    text: "@You in milestone thread: 'Check image size'",
    cta: "Reply",
    time: "2 days ago",
    actionable: true,
  },
];

const NotificationsPanel = ({ isPanelMaximized }) => {
  // Dynamic text size
  const textSize = isPanelMaximized ? 'text-base' : 'text-xs';

  return (
    <div className={`flex flex-col h-full bg-freelancer-bg-grey border border-freelancer-border shadow-card p-0`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-freelancer-border bg-freelancer-primary/40`}>
        <span className={`font-semibold text-white flex items-center gap-2 ${textSize}`}>
          <BellOutlined className="text-freelancer-accent" /> Notifications
        </span>
        <span className="relative">
          <BellOutlined className="text-white/60 text-xl" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-freelancer-secondary"></span>
        </span>
      </div>
      {/* Notifications List */}
      <div className={`flex-1 overflow-y-auto px-4 py-3 space-y-2 ${textSize}`}>
        {notifications.length === 0 && (
          <div className="text-white/60 text-center py-8">No notifications yet.</div>
        )}
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-3 bg-freelancer-primary/40 border border-freelancer-border rounded-lg p-3 shadow hover:bg-freelancer-primary/60 transition group`}
          >
            <div className="mt-1">{n.icon}</div>
            <div className="flex-1">
              <div className={`text-white/90 font-medium flex items-center gap-2 ${textSize}`}>
                {n.text}
                {n.actionable && n.cta && (
                  <button
                    className={`ml-2 px-2 py-0.5 rounded bg-freelancer-accent text-white ${textSize} font-semibold shadow hover:bg-freelancer-accent/80 transition`}
                  >
                    {n.cta}
                  </button>
                )}
              </div>
              <div className={`mt-1 text-white/50 ${textSize}`}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPanel;