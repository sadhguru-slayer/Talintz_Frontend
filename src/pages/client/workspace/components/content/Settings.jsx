import React, { useState } from 'react';
import { Switch, InputNumber, Modal, Button } from 'antd';
import { ExclamationCircleOutlined, SettingOutlined, BellOutlined, DollarOutlined, EditOutlined, WarningOutlined } from '@ant-design/icons';

const Settings = () => {
  // Notification Preferences
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [chatMentions, setChatMentions] = useState(true);
  const [mobilePush, setMobilePush] = useState(false);
  const [dailySummary, setDailySummary] = useState(true);

  // Payment Auto-Approval
  const [autoApprove, setAutoApprove] = useState(false);
  const [autoApproveDays, setAutoApproveDays] = useState(3);
  const [manualPayout, setManualPayout] = useState(true);

  // Revision Settings
  const [autoCloseDays, setAutoCloseDays] = useState(3);
  const [allowExtraRevisions, setAllowExtraRevisions] = useState(false);

  // Danger Zone
  const [dangerAction, setDangerAction] = useState(null);

  const handleDanger = (action) => {
    setDangerAction(action);
    Modal.confirm({
      title: 'Are you sure?',
      icon: <ExclamationCircleOutlined />,
      content: {
        'end': 'This will end the project early. Are you sure you want to proceed?',
        'support': 'A support agent will be notified to intervene. Continue?',
        'cancel': 'This will cancel the project. This action cannot be undone. Are you sure?',
      }[action],
      okText: action === 'cancel' ? 'Yes, Cancel Project' : 'Yes',
      okType: action === 'cancel' ? 'danger' : 'primary',
      cancelText: 'No',
      onOk() {
        // Handle the action here
        setDangerAction(null);
      },
      onCancel() {
        setDangerAction(null);
      },
    });
  };

  return (
    <div className="space-y-8 p-4">
      {/* Notification Preferences */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <BellOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/90">Email updates on milestones</span>
            <Switch checked={emailUpdates} onChange={setEmailUpdates} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Chat @mentions notification</span>
            <Switch checked={chatMentions} onChange={setChatMentions} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Mobile/app push (if applicable)</span>
            <Switch checked={mobilePush} onChange={setMobilePush} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Daily summary mail</span>
            <Switch checked={dailySummary} onChange={setDailySummary} />
          </div>
        </div>
      </div>

      {/* Payment Auto-Approval Settings */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <DollarOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Payment Auto-Approval</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/90 flex items-center gap-2">
              Auto-approve milestone after
              <InputNumber
                min={1}
                max={7}
                value={autoApproveDays}
                onChange={setAutoApproveDays}
                disabled={!autoApprove}
                className="mx-2"
                size="small"
              />
              days
            </span>
            <Switch checked={autoApprove} onChange={setAutoApprove} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Require manual confirmation on payout</span>
            <Switch checked={manualPayout} onChange={setManualPayout} />
          </div>
        </div>
      </div>

      {/* Revision Behavior Settings */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <EditOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Revision Behavior</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/90 flex items-center gap-2">
              Auto-close revisions after
              <InputNumber
                min={1}
                max={5}
                value={autoCloseDays}
                onChange={setAutoCloseDays}
                className="mx-2"
                size="small"
              />
              days
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/90">Allow extra revisions (at cost)</span>
            <Switch checked={allowExtraRevisions} onChange={setAllowExtraRevisions} />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-900/20 border border-red-500 rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <WarningOutlined className="text-red-400 text-lg" />
          <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
        </div>
        <div className="space-y-3">
          <Button danger block onClick={() => handleDanger('end')}>
            End project early
          </Button>
          <Button type="primary" block onClick={() => handleDanger('support')}>
            Request support intervention
          </Button>
          <Button danger block onClick={() => handleDanger('cancel')}>
            Cancel project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
