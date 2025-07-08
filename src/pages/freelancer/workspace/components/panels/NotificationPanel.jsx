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

const iconMap = {
  milestone_submitted: <CheckCircleOutlined className="text-blue-400" />,
  revision_raised: <SyncOutlined className="text-yellow-400" />,
  auto_release: <ClockCircleOutlined className="text-orange-400" />,
  payment_released: <DollarOutlined className="text-green-400" />,
  dispute_alert: <ExclamationCircleOutlined className="text-red-400" />,
  project_approved: <CheckCircleOutlined className="text-green-400" />,
  new_message: <MessageOutlined className="text-freelancer-accent" />,
  default: <BellOutlined className="text-freelancer-accent" />,
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
          `${getBaseURL()}/api/workspace/freelancer/notifications/${workspaceId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch notifications");
        const data = await response.json();
        // console.log(data)
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
        `${getBaseURL()}/api/workspace/freelancer/notifications/${workspaceId}/${notificationId}/read/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to mark as read");
      // Update local state
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
    <div className={`flex flex-col h-full bg-freelancer-bg-grey border border-freelancer-border shadow-card p-0`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-freelancer-border bg-freelancer-primary/40`}>
        <span className={`font-semibold text-white flex items-center gap-2 ${textSize}`}>
          <BellOutlined className="text-freelancer-accent" /> Notifications
        </span>
        <span className="relative">
          <BellOutlined className="text-white/60 text-xl" />
          {notifications.some(n => !n.is_read) && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-freelancer-secondary"></span>
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
              className={`flex items-start gap-3 bg-freelancer-primary/40 border border-freelancer-border rounded-lg p-3 shadow hover:bg-freelancer-primary/60 transition group`}
            >
              <div className="mt-1">
                {iconMap[n.subtype] || iconMap[n.type] || iconMap.default}
              </div>
              <div className="flex-1">
                <div className={`text-white/90 font-medium flex items-center gap-2 ${textSize}`}>
                  <span style={{ flex: 1, minWidth: 0 }}>{n.title || n.notification_text}</span>
                  {!n.is_read && (
                    <button
                      className="flex items-center justify-center ml-1 w-7 h-7 rounded-full bg-white/10 hover:bg-freelancer-accent/80 text-freelancer-accent hover:text-white transition shadow border border-freelancer-accent/30"
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