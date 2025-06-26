import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Tabs, Form, Input, Button, Switch, Select, Divider, message, Upload, Avatar } from "antd";
import { 
  SettingOutlined,
  SecurityScanOutlined, 
  BellOutlined, 
  GlobalOutlined, 
  UserOutlined 
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
  const { userId, isEditable } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("notifications");
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  
  // Dummy data for settings
  const [settingsData, setSettingsData] = useState({
    profile: {
      firstName: "Alex",
      lastName: "Johnson",
      email: "alex.johnson@example.com",
      phone: "+1 (555) 123-4567",
      title: "Full Stack Developer",
      bio: "Experienced full stack developer with 5+ years of experience in React, Node.js, and Python.",
      location: "San Francisco, CA",
      website: "https://alexjohnson.dev",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      hourlyRate: 45,
      availability: "Part-time",
      languages: ["English", "Spanish"]
    },
    security: {
      twoFactorEnabled: true,
      lastPasswordChange: "2023-09-15",
      loginNotifications: true,
      sessionTimeout: 30
    },
    notifications: {
      email: {
        projectMessages: true,
        projectUpdates: true,
        newProjects: true,
        marketingEmails: false
      },
      push: {
        projectMessages: true,
        projectUpdates: true,
        newProjects: false,
        marketingNotifications: false
      }
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/Los_Angeles",
      currency: "USD",
      projectVisibility: "public"
    }
  });

  useEffect(() => {
    // In a real app, you would fetch the settings data here
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Set form values
      profileForm.setFieldsValue({
        firstName: settingsData.profile.firstName,
        lastName: settingsData.profile.lastName,
        email: settingsData.profile.email,
        phone: settingsData.profile.phone,
        title: settingsData.profile.title,
        bio: settingsData.profile.bio,
        location: settingsData.profile.location,
        website: settingsData.profile.website,
        hourlyRate: settingsData.profile.hourlyRate,
        availability: settingsData.profile.availability,
        languages: settingsData.profile.languages
      });
      
      securityForm.setFieldsValue({
        twoFactorEnabled: settingsData.security.twoFactorEnabled,
        loginNotifications: settingsData.security.loginNotifications,
        sessionTimeout: settingsData.security.sessionTimeout
      });
      
      notificationForm.setFieldsValue({
        emailProjectMessages: settingsData.notifications.email.projectMessages,
        emailProjectUpdates: settingsData.notifications.email.projectUpdates,
        emailNewProjects: settingsData.notifications.email.newProjects,
        emailMarketingEmails: settingsData.notifications.email.marketingEmails,
        pushProjectMessages: settingsData.notifications.push.projectMessages,
        pushProjectUpdates: settingsData.notifications.push.projectUpdates,
        pushNewProjects: settingsData.notifications.push.newProjects,
        pushMarketingNotifications: settingsData.notifications.push.marketingNotifications
      });
      
      preferencesForm.setFieldsValue({
        theme: settingsData.preferences.theme,
        language: settingsData.preferences.language,
        timezone: settingsData.preferences.timezone,
        currency: settingsData.preferences.currency,
        projectVisibility: settingsData.preferences.projectVisibility
      });
    }, 1000);
  }, [userId, profileForm, securityForm, notificationForm, preferencesForm, settingsData]);

  const handleProfileSubmit = (values) => {
    console.log("Profile values:", values);
    message.success("Profile settings updated successfully!");
  };

  const handleSecuritySubmit = (values) => {
    console.log("Security values:", values);
    message.success("Security settings updated successfully!");
  };

  const handleNotificationSubmit = (values) => {
    console.log("Notification values:", values);
    message.success("Notification preferences updated successfully!");
  };

  const handlePreferencesSubmit = (values) => {
    console.log("Preferences values:", values);
    message.success("Preferences updated successfully!");
  };

  const handlePasswordChange = (values) => {
    console.log("Password change:", values);
    message.success("Password changed successfully!");
    securityForm.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
  };

  return (
    <div className="min-h-fit w-full bg-freelancer-primary">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-freelancer-accent/2 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-brand-accent/1 rounded-full blur-xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-freelancer-primary via-freelancer-primary/95 to-freelancer-bg-dark"></div>
          <div className="absolute inset-0 bg-freelancer-gradient-soft opacity-30"></div>
          
          <div className="relative px-6 sm:px-8 py-6 sm:py-8">
            <div className="flex items-center">
              <div className="bg-white/10 p-4 rounded-xl mr-4">
                <SettingOutlined className="text-freelancer-accent text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Account Settings</h1>
                <p className="text-white/80">Manage your account preferences and security settings</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10"
        >
          <div className="p-4 sm:p-6">
            <Tabs 
              activeKey={activeTab} 
              onChange={setActiveTab}
              tabBarGutter={32}
              tabBarStyle={{ fontWeight: 600, fontSize: 16 }}
              className="custom-tabs"
            >
              <TabPane 
                tab={
                  <span className="flex items-center gap-2">
                    <BellOutlined />
                    Notifications
                  </span>
                } 
                key="notifications"
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <Form
                    form={notificationForm}
                    layout="vertical"
                    onFinish={handleNotificationSubmit}
                    disabled={!isEditable}
                  >
                    <h2 className="text-lg font-medium mb-4 text-text-light">Email Notifications</h2>
                    
                    <Form.Item
                      name="emailProjectMessages"
                      valuePropName="checked"
                      label="Project Messages"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      name="emailProjectUpdates"
                      valuePropName="checked"
                      label="Project Updates"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      name="emailNewProjects"
                      valuePropName="checked"
                      label="New Project Matches"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      name="emailMarketingEmails"
                      valuePropName="checked"
                      label="Marketing Emails"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Divider />
                    
                    <h2 className="text-lg font-medium mb-4 text-text-light">Push Notifications</h2>
                    
                    <Form.Item
                      name="pushProjectMessages"
                      valuePropName="checked"
                      label="Project Messages"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      name="pushProjectUpdates"
                      valuePropName="checked"
                      label="Project Updates"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      name="pushNewProjects"
                      valuePropName="checked"
                      label="New Project Matches"
                    >
                      <Switch />
                    </Form.Item>
                    
                    <Form.Item
                      name="pushMarketingNotifications"
                      valuePropName="checked"
                      label="Marketing Notifications"
                    >
                      <Switch />
                    </Form.Item>
                    
                    {isEditable && (
                      <div className="flex justify-end mt-4">
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          className="bg-violet-600 hover:bg-violet-700 border-none"
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </Form>
                </Card>
              </TabPane>

              <TabPane 
                tab={
                  <span className="flex items-center gap-2">
                    <SecurityScanOutlined />
                    Security
                  </span>
                } 
                key="security"
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <h2 className="text-lg font-medium mb-4">Change Password</h2>
                  <Form
                    layout="vertical"
                    onFinish={handlePasswordChange}
                    disabled={!isEditable}
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[{ required: true, message: 'Please enter your current password' }]}
                    >
                      <Input.Password placeholder="Current Password" />
                    </Form.Item>
                    
                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        { required: true, message: 'Please enter your new password' },
                        { min: 8, message: 'Password must be at least 8 characters' }
                      ]}
                    >
                      <Input.Password placeholder="New Password" />
                    </Form.Item>
                    
                    <Form.Item
                      name="confirmPassword"
                      label="Confirm New Password"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password placeholder="Confirm New Password" />
                    </Form.Item>
                    
                    {isEditable && (
                      <div className="flex justify-end mt-4">
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          className="bg-violet-600 hover:bg-violet-700 border-none"
                        >
                          Update Password
                        </Button>
                      </div>
                    )}
                  </Form>
                </Card>
              </TabPane>

              <TabPane 
                tab={
                  <span className="flex items-center gap-2">
                    <GlobalOutlined />
                    Preferences
                  </span>
                } 
                key="preferences"
              >
                <Card className="bg-white/5 backdrop-blur-xl border border-white/10">
                  <Form
                    form={preferencesForm}
                    layout="vertical"
                    onFinish={handlePreferencesSubmit}
                    disabled={!isEditable}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="theme"
                        label="Theme"
                      >
                        <Select>
                          <Option value="light">Light</Option>
                          <Option value="dark">Dark</Option>
                          <Option value="system">System Default</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="language"
                        label="Language"
                      >
                        <Select>
                          <Option value="en">English</Option>
                          <Option value="es">Spanish</Option>
                          <Option value="fr">French</Option>
                          <Option value="de">German</Option>
                          <Option value="zh">Chinese</Option>
                        </Select>
                      </Form.Item>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Form.Item
                        name="timezone"
                        label="Timezone"
                      >
                        <Select>
                          <Option value="America/Los_Angeles">Pacific Time (US & Canada)</Option>
                          <Option value="America/Denver">Mountain Time (US & Canada)</Option>
                          <Option value="America/Chicago">Central Time (US & Canada)</Option>
                          <Option value="America/New_York">Eastern Time (US & Canada)</Option>
                          <Option value="Europe/London">London</Option>
                          <Option value="Europe/Paris">Paris</Option>
                          <Option value="Asia/Tokyo">Tokyo</Option>
                        </Select>
                      </Form.Item>
                      
                      <Form.Item
                        name="currency"
                        label="Currency"
                      >
                        <Select>
                          <Option value="USD">USD ($)</Option>
                          <Option value="EUR">EUR (€)</Option>
                          <Option value="GBP">GBP (£)</Option>
                          <Option value="JPY">JPY (¥)</Option>
                          <Option value="CAD">CAD ($)</Option>
                          <Option value="AUD">AUD ($)</Option>
                        </Select>
                      </Form.Item>
                    </div>
                    
                    <Form.Item
                      name="projectVisibility"
                      label="Project Visibility"
                    >
                      <Select>
                        <Option value="public">Public (Visible to everyone)</Option>
                        <Option value="private">Private (Visible only to clients you work with)</Option>
                        <Option value="hidden">Hidden (Visible only to you)</Option>
                      </Select>
                    </Form.Item>
                    
                    {isEditable && (
                      <div className="flex justify-end mt-4">
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          className="bg-violet-600 hover:bg-violet-700 border-none"
                        >
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </Form>
                </Card>
              </TabPane>
            </Tabs>
          </div>
        </motion.div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--freelancer-accent);
        }
        
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--freelancer-accent);
        }

        .ant-tabs-tab {
          color: rgba(255, 255, 255, 0.6);
        }

        .ant-tabs-tab:hover {
          color: var(--freelancer-accent);
        }

        /* Form Controls */
        .ant-form-item-label > label {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-input,
        .ant-input-affix-wrapper,
        .ant-select-selector {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }

        .ant-input::placeholder,
        .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        .ant-select-dropdown {
          background: var(--freelancer-tertiary) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-select-item {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background: var(--freelancer-accent) !important;
          color: white !important;
        }
          /* Additional fixes for the input wrapper */
        .ant-input-affix-wrapper > input.ant-input {
          background: transparent !important;
          border:none !important
        }

        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        /* Switch Styling */
        .ant-switch {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-switch-checked {
          background: var(--freelancer-accent) !important;
        }

        /* Button Styling */
        .ant-btn-primary {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
        }

        .ant-btn-primary:hover {
          background: var(--freelancer-accent-hover) !important;
          border-color: var(--freelancer-accent-hover) !important;
        }

        /* Card Styling */
        .ant-card {
          background: transparent !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-card-head-title {
          color: white !important;
        }

        /* Responsive styles */
        @media (max-width: 640px) {
          .ant-tabs-tab {
            padding: 8px 12px;
            font-size: 14px;
          }

          .ant-tabs-tab + .ant-tabs-tab {
            margin-left: 8px;
          }

          .ant-tabs-content {
            padding: 12px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
