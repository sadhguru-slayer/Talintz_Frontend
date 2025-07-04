import React, { useState } from 'react';
import { Switch, Divider, Button, Popconfirm, message } from 'antd';
import {
  BellOutlined,
  FileOutlined,
  CommentOutlined,
  SafetyOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const Settings = ({ project = {} }) => {
  // State for toggle preferences
  const [notifications, setNotifications] = useState({
    clientComments: true,
    milestoneStatus: true,
    dailySummary: false,
    pushNotifications: false,
  });

  const [fileSettings, setFileSettings] = useState({
    autoSaveDrafts: true,
    keepBackups: false,
    compressFiles: false,
  });

  const [chatSettings, setChatSettings] = useState({
    mentionNotifications: true,
    readOnlyChat: false,
  });

  const [workProtection, setWorkProtection] = useState({
    allowQaReview: true,
  });

  // Safely check project properties with defaults
  const isLeavingAllowed = 
    (project.currentMilestone || "first") === "first" && 
    !(project.hasPendingPayments || false);

  const handleLeaveProject = () => {
    if (!isLeavingAllowed) {
      message.error("You can only leave during the first milestone with no pending payments.");
      return;
    }
    message.warning('Leaving a project is irreversible. Are you sure?');
  };

  const handleMediationRequest = () => {
    message.info('Talintz will review your request within 24 hours.');
  };

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Notification Preferences */}
      <section className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <BellOutlined className="text-freelancer-accent" /> Notification Preferences
        </h2>
        <Divider className="border-white/10 my-2" />
        <div className="space-y-4">
          {[
            { label: 'Notify me when client comments', key: 'clientComments' },
            { label: 'Notify me when milestone status changes', key: 'milestoneStatus' },
            { label: 'Daily project update summary (email)', key: 'dailySummary' },
            { label: 'In-app / mobile push notifications', key: 'pushNotifications' },
          ].map((item) => (
            <div key={item.key} className="flex justify-between items-center">
              <span className="text-white/90">{item.label}</span>
              <Switch
                checked={notifications[item.key]}
                onChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                className="bg-white/10 hover:bg-white/20"
              />
            </div>
          ))}
        </div>
      </section>

      {/* File & Delivery Settings */}
      <section className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <FileOutlined className="text-freelancer-accent" /> File & Delivery Settings
        </h2>
        <Divider className="border-white/10 my-2" />
        <div className="space-y-4">
          {[
            { label: 'Auto-save drafts before milestone submit', key: 'autoSaveDrafts' },
            { label: 'Keep a backup of each file submitted', key: 'keepBackups' },
            { label: 'Compress files before uploading', key: 'compressFiles' },
          ].map((item) => (
            <div key={item.key} className="flex justify-between items-center">
              <span className="text-white/90">{item.label}</span>
              <Switch
                checked={fileSettings[item.key]}
                onChange={(checked) => setFileSettings({ ...fileSettings, [item.key]: checked })}
                className="bg-white/10 hover:bg-white/20"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Chat & Mention Settings */}
      <section className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <CommentOutlined className="text-freelancer-accent" /> Chat & Mention Settings
        </h2>
        <Divider className="border-white/10 my-2" />
        <div className="space-y-4">
          {[
            { label: 'Enable @mention notifications', key: 'mentionNotifications' },
            { label: 'Allow read-only collaborators to chat', key: 'readOnlyChat' },
          ].map((item) => (
            <div key={item.key} className="flex justify-between items-center">
              <span className="text-white/90">{item.label}</span>
              <Switch
                checked={chatSettings[item.key]}
                onChange={(checked) => setChatSettings({ ...chatSettings, [item.key]: checked })}
                className="bg-white/10 hover:bg-white/20"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Work Protection & Transparency */}
      <section className="bg-freelancer-bg-grey border border-freelancer-border rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
          <SafetyOutlined className="text-freelancer-accent" /> Work Protection & Transparency
        </h2>
        <Divider className="border-white/10 my-2" />
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white/90">Show timestamp of all submissions</span>
            <span className="text-white/50">Always on</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/90">Allow Talintz to review submitted work (QA aid)</span>
            <Switch
              checked={workProtection.allowQaReview}
              onChange={(checked) => setWorkProtection({ ...workProtection, allowQaReview: checked })}
              className="bg-white/10 hover:bg-white/20"
            />
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-red-900/20 border border-red-500 rounded-xl p-6 shadow-card">
        <h2 className="text-xl font-semibold text-red-300 flex items-center gap-2 mb-4">
          <ExclamationCircleOutlined /> Danger Zone
        </h2>
        <Divider className="border-red-500/30 my-2" />
        <div className="space-y-4">
          {isLeavingAllowed ? (
            <Popconfirm
              title="Are you sure you want to leave this project?"
              onConfirm={handleLeaveProject}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<ExclamationCircleOutlined />}>
                Leave project
              </Button>
            </Popconfirm>
          ) : (
            <Button 
              danger 
              icon={<ExclamationCircleOutlined />} 
              disabled
              onClick={() => message.error("Leaving is only allowed during the first milestone with no pending payments.")}
            >
              Leave project (disabled)
            </Button>
          )}
          <Popconfirm
            title="Request Talintz to mediate communication?"
            onConfirm={handleMediationRequest}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<ExclamationCircleOutlined />}>
              Request Talintz mediation
            </Button>
          </Popconfirm>
        </div>
      </section>
    </div>
  );
};

// Add prop validation (optional but recommended)
Settings.propTypes = {
  project: PropTypes.shape({
    currentMilestone: PropTypes.string,
    hasPendingPayments: PropTypes.bool,
  }),
};

// Default props (optional)
Settings.defaultProps = {
  project: {
    currentMilestone: "first",  // Default to "first" if not provided
    hasPendingPayments: false,  // Default to false if not provided
  },
};

export default Settings;
