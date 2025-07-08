import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { getBaseURL } from "../../../../../config/axios";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  BellOutlined,
  MessageOutlined,
  DollarOutlined,
  CheckOutlined,
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
    icon: <MessageOutlined className="text-client-accent" />,
    text: "@You in milestone thread: 'Check image size'",
    cta: "Reply",
    time: "2 days ago",
    actionable: true,
  },
];

const iconMap = {
  milestone_submitted: <CheckCircleOutlined className="text-blue-400" />,
  revision_raised: <SyncOutlined className="text-yellow-400" />,
  auto_release: <ClockCircleOutlined className="text-orange-400" />,
  payment_released: <DollarOutlined className="text-green-400" />,
  dispute_alert: <ExclamationCircleOutlined className="text-red-400" />,
  project_approved: <CheckCircleOutlined className="text-green-400" />,
  new_message: <MessageOutlined className="text-client-accent" />,
  default: <BellOutlined className="text-client-accent" />,
};

const NotificationPanel = ({ isPanelMaximized }) => {
  const { workspaceId } = useParams();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const textSize = isPanelMaximized ? 'text-base' : 'text-xs';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = Cookies.get("accessToken");
        const response = await fetch(
          `${getBaseURL()}/api/workspace/client/notifications/${workspaceId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        setNotifications(data.results || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) fetchNotifications();
  }, [workspaceId]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = Cookies.get("accessToken");
      const response = await fetch(
        `${getBaseURL()}/api/workspace/client/notifications/${workspaceId}/${notificationId}/read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to mark as read");
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (err) {
      alert("Could not mark notification as read.");
    }
  };

  return (
    <div className={`flex flex-col h-full bg-client-secondary/80 border border-client-border rounded-xl shadow-card p-0`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-client-border bg-client-primary/40`}>
        <span className={`font-semibold text-white flex items-center gap-2 ${textSize}`}>
          <BellOutlined className="text-client-accent" /> Notifications
        </span>
        <span className="relative">
          <BellOutlined className="text-white/60 text-xl" />
          {notifications.some(n => !n.is_read) && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-client-secondary"></span>
          )}
        </span>
      </div>
      {/* Notifications List */}
      <div className={`flex-1 overflow-y-auto px-4 py-3 space-y-2 ${textSize}`}>
        {loading ? (
          <div className="text-white/60 text-center py-8">Loading notifications...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-white/60 text-center py-8">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 bg-client-primary/40 border border-client-border rounded-lg p-3 shadow hover:bg-client-primary/60 transition group`}
            >
              <div className="mt-1">
                {iconMap[n.subtype] || iconMap[n.type] || iconMap.default}
              </div>
              <div className="flex-1">
                <div className={`text-white/90 font-medium flex items-center gap-2 ${textSize}`}>
                  <span style={{ flex: 1, minWidth: 0 }}>{n.title || n.notification_text}</span>
                  {!n.is_read && (
                    <button
                      className="flex items-center justify-center ml-1 w-7 h-7 rounded-full bg-white/10 hover:bg-client-accent/80 text-client-accent hover:text-white transition shadow border border-client-accent/30"
                      onClick={() => handleMarkAsRead(n.id)}
                      title="Mark as read"
                      style={{
                        lineHeight: 0,
                        minWidth: 0,
                        minHeight: 0,
                        boxShadow: '0 1px 4px 0 rgba(0,0,0,0.08)',
                      }}
                    >
                      <CheckOutlined style={{ fontSize: '1.15em', verticalAlign: 'middle' }} />
                    </button>
                  )}
                </div>
                <div className={`mt-1 text-white/50 ${textSize}`}>
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;