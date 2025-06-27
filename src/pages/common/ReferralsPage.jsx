import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CopyOutlined, 
  ShareAltOutlined, 
  GiftOutlined, 
  UserOutlined, 
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import { message, Table, Tag, Spin } from "antd";
import { useMediaQuery } from "react-responsive";
import CHeader from "../../components/client/CHeader";
import CSider from "../../components/client/CSider";
import FHeader from "../../components/freelancer/FHeader";
import FSider from "../../components/freelancer/FSider";
import axios from 'axios';
import Cookies from 'js-cookie';

const ReferralsPage = ({ role, userId, isAuthenticated, isEditable }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    totalEarnings: 0,
    referralCode: "TALINTZ123",
    pendingReferrals: 0
  });
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Determine colors based on role
  const isClient = role === "client";
  const colors = {
    primary: isClient ? "client-primary" : "freelancer-primary",
    secondary: isClient ? "client-secondary" : "freelancer-secondary",
    accent: isClient ? "client-accent" : "freelancer-accent",
    bg: isClient ? "client-bg-dark" : "freelancer-bg-dark",
    text: isClient ? "text-client-text-primary" : "text-freelancer-text-primary"
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      const response = await axios.get(
        "https://talintzbackend-production.up.railway.app/api/referrals/user-data/",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      const data = response.data;
      
      // Update stats
      setReferralStats({
        totalReferrals: data.stats.total_referrals,
        successfulReferrals: data.stats.successful_referrals,
        totalEarnings: data.stats.total_earned,
        referralCode: data.user.referral_code || "No Code",
        pendingReferrals: data.stats.pending_referrals
      });
      
      // Update referral history
      const historyData = data.referral_history.map(ref => ({
        id: ref.id,
        friendName: ref.referred_user_name || ref.referred_email,
        status: ref.accepted ? "completed" : "pending",
        earnings: ref.reward_amount,
        date: ref.created_at,
        scenario: ref.scenario
      }));
      
      setReferralHistory(historyData);
      setLoading(false);
      
      // Console log the data
      console.log("=== FRONTEND REFERRAL DATA ===");
      console.log("User:", data.user);
      console.log("Stats:", data.stats);
      console.log("Referral History:", data.referral_history);
      console.log("Rewards:", data.rewards);
      console.log("=== END FRONTEND DATA ===");
      
    } catch (error) {
      console.error('Error fetching referral data:', error);
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralStats.referralCode);
      message.success('Referral code copied!');
    } catch (err) {
      message.error('Failed to copy code');
    }
  };

  const handleShare = async () => {
    const shareText = `Join me on Talintz! Use my referral code: ${referralStats.referralCode}`;
    const shareUrl = `${window.location.origin}/register?ref=${referralStats.referralCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Talintz',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // Share cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        message.success('Share link copied to clipboard!');
      } catch (err) {
        message.error('Failed to copy share link');
      }
    }
  };

  const columns = [
    {
      title: 'Friend',
      dataIndex: 'friendName',
      key: 'friendName',
      render: (text) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <UserOutlined className="text-text-light" />
          </div>
          <span className="text-text-light font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { 
            color: 'bg-status-warning/20 text-status-warning border-status-warning/30',
            icon: <ClockCircleOutlined />,
            text: 'Pending' 
          },
          completed: { 
            color: 'bg-status-success/20 text-status-success border-status-success/30',
            icon: <CheckCircleOutlined />,
            text: 'Completed' 
          },
          failed: { 
            color: 'bg-status-error/20 text-status-error border-status-error/30',
            icon: <InfoCircleOutlined />,
            text: 'Failed' 
          }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag className={`${config.color} border px-3 py-1 rounded-full flex items-center gap-1`}>
            {config.icon} {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Earnings',
      dataIndex: 'earnings',
      key: 'earnings',
      render: (earnings) => (
        <span className="font-bold text-status-success text-lg">
          ₹{earnings || 0}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <span className="text-text-muted">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className={`flex h-screen bg-gradient-to-br from-${colors.primary} via-${colors.secondary}/10 to-${colors.bg}`}>
        <div className="flex-1 flex items-center justify-center">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-gradient-to-br from-${colors.primary} via-${colors.secondary}/10 to-${colors.bg}`}>
      {/* Sider */}
      {isClient ? (
        <CSider userId={userId} role={role} dropdown={true} collapsed={true} />
      ) : (
        <FSider userId={userId} role={role} dropdown={true} collapsed={true} />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {isClient ? (
          <CHeader userId={userId} />
        ) : (
          <FHeader userId={userId} isAuthenticated={isAuthenticated} isEditable={isEditable} role={role} />
        )}
        <div className={`${isMobile ? 'ml-0' : 'ml-14'} flex-1 overflow-auto p-4 md:p-6`}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl mb-6 shadow-xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${colors.primary} via-${colors.primary}/80 to-${colors.bg}`}></div>
              <div className={`absolute inset-0 bg-${colors.accent}/10 opacity-30`}></div>
              <div className={`absolute top-0 right-0 w-48 h-48 bg-${colors.accent}/10 rounded-full blur-3xl -mr-24 -mt-24 animate-float`}></div>
              <div className={`absolute bottom-0 left-0 w-40 h-40 bg-brand-accent/8 rounded-full blur-2xl -ml-20 -mb-20 animate-float-delayed`}></div>
              <div className="relative z-10 p-6 sm:p-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-wide text-white mb-2 cred-font">Refer & Earn</h1>
                    <p className="text-white/70 text-lg">
                      Share Talintz with friends and earn rewards for every successful referral
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-white/50 flex items-center gap-2 px-6 py-2 rounded-full font-semibold shadow-lg"
                      onClick={handleCopyCode}
                    >
                      <CopyOutlined /> Copy Code
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      className={`bg-${colors.accent} flex items-center gap-2 px-6 py-2 rounded-full font-semibold shadow-lg`}
                      onClick={handleShare}
                    >
                      <ShareAltOutlined /> Share
                    </motion.button>
                  </div>
                </div>
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                  {[
                    { 
                      icon: <UserOutlined />, 
                      label: "Total Referrals", 
                      value: referralStats.totalReferrals, 
                      color: `var(--${colors.accent})` 
                    },
                    { 
                      icon: <GiftOutlined />, 
                      label: "Successful", 
                      value: referralStats.successfulReferrals, 
                      color: 'var(--status-success)' 
                    },
                    { 
                      icon: <DollarOutlined />, 
                      label: "Total Earnings", 
                      value: `₹${referralStats.totalEarnings}`, 
                      color: 'var(--status-success)' 
                    },
                    { 
                      icon: <ClockCircleOutlined />, 
                      label: "Pending", 
                      value: referralStats.pendingReferrals, 
                      color: 'var(--status-warning)' 
                    }
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-md"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                        {React.cloneElement(stat.icon, { style: { color: stat.color, fontSize: 22 } })}
                      </div>
                      <div>
                        <p className="text-white/70 text-base font-medium">{stat.label}</p>
                        <p className="text-white font-bold text-xl">{stat.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            {/* Main Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl shadow-xl"
            >
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Referral Code Section */}
                  <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-6 shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4 cred-font">Your Referral Code</h3>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <code className="text-2xl font-mono font-bold text-white">
                        {referralStats.referralCode}
                      </code>
                      <div className="text-sm text-white/60">
                        Share this code with friends
                      </div>
                    </div>
                  </div>
                  {/* How It Works */}
                  <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-6 shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4 cred-font">How It Works</h3>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: "Share Your Code", desc: "Share your unique referral code with friends and family" },
                        { step: 2, title: "They Join", desc: "Your friends sign up using your code and complete verification" },
                        { step: 3, title: "You Earn", desc: "Earn rewards when they complete their first project or payment" }
                      ].map((item, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-4 p-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                        >
                          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10">
                            <span className="text-white font-bold">{item.step}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{item.title}</h4>
                            <p className="text-sm text-white/60">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Rewards & Rules */}
                <div className="mt-6 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-6 shadow-md">
                  <h3 className="text-xl font-bold text-white mb-4 cred-font">Rewards & Rules</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-status-success/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircleOutlined className="text-status-success text-xs" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Earn ₹500 for each successful referral</h4>
                          <p className="text-white/60 text-sm">
                            When your friend completes their first project or makes their first payment
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-status-info/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <InfoCircleOutlined className="text-status-info text-xs" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">No limit on referrals</h4>
                          <p className="text-white/60 text-sm">
                            Refer as many friends as you want and earn unlimited rewards
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-status-warning/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <ClockCircleOutlined className="text-status-warning text-xs" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">Terms & Conditions</h4>
                          <p className="text-white/60 text-sm">
                            Referrals must be new users who haven't signed up before. Rewards are paid after 30 days of successful activity.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Referral History */}
                <div className="mt-6 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-xl border border-white/10 p-6 shadow-md">
                  <h3 className="text-xl font-bold text-white mb-4 cred-font">Referral History</h3>
                  <div className="overflow-x-auto">
                    {isMobile ? (
                      <div className="space-y-4">
                        {referralHistory.length === 0 ? (
                          <div className="text-center text-text-muted py-8">No referrals yet</div>
                        ) : (
                          referralHistory.map((ref) => (
                            <div
                              key={ref.id}
                              className="bg-white/5 rounded-xl border border-white/10 p-4 flex flex-col gap-2 shadow hover:bg-white/10 transition"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                  <UserOutlined className="text-text-light" />
                                </div>
                                <span className="text-text-light font-semibold text-lg">{ref.friendName}</span>
                                <Tag
                                  className={`
                                    ${ref.status === "completed"
                                      ? "bg-status-success/20 text-status-success border-status-success/30"
                                      : ref.status === "pending"
                                      ? "bg-status-warning/20 text-status-warning border-status-warning/30"
                                      : "bg-status-error/20 text-status-error border-status-error/30"
                                  } border px-3 py-1 rounded-full ml-auto`}
                                >
                                  {ref.status === "completed" ? <CheckCircleOutlined /> : ref.status === "pending" ? <ClockCircleOutlined /> : <InfoCircleOutlined />}
                                  {ref.status.charAt(0).toUpperCase() + ref.status.slice(1)}
                                </Tag>
                              </div>
                              <div className="flex justify-between items-center text-sm mt-2">
                                <div>
                                  <span className="text-text-secondary">Earnings: </span>
                                  <span className="font-bold text-status-success">₹{ref.earnings || 0}</span>
                                </div>
                                <div>
                                  <span className="text-text-secondary">Date: </span>
                                  <span className="text-text-muted">{new Date(ref.date).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <Table
                        columns={columns}
                        dataSource={referralHistory}
                        rowKey="id"
                        pagination={{
                          pageSize: 10,
                          showSizeChanger: true,
                          showQuickJumper: true,
                        }}
                        className="custom-referral-table"
                        rowClassName="hover:bg-white/10 transition-all duration-200"
                      />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .cred-font {
          font-family: 'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif;
          letter-spacing: 0.02em;
        }
        
        /* Custom Table Styles */
        .custom-referral-table .ant-table {
          background: transparent !important;
          color: var(--text-light) !important;
        }
        
        .custom-referral-table .ant-table-thead > tr > th {
          background: rgba(255, 255, 255, 0.05) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-light) !important;
          font-weight: 600 !important;
          padding: 16px !important;
        }
        
        .custom-referral-table .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: var(--text-light) !important;
          padding: 16px !important;
        }
        
        .custom-referral-table .ant-table-tbody > tr:hover > td {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .custom-referral-table .ant-table-tbody > tr {
          transition: all 0.2s ease !important;
        }
        
        .custom-referral-table .ant-pagination {
          color: var(--text-light) !important;
        }
        
        .custom-referral-table .ant-pagination-item {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-light) !important;
        }
        
        .custom-referral-table .ant-pagination-item:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        .custom-referral-table .ant-pagination-item-active {
          background: var(--client-accent) !important;
          border-color: var(--client-accent) !important;
          color: white !important;
        }
        
        .custom-referral-table .ant-pagination-prev,
        .custom-referral-table .ant-pagination-next {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-light) !important;
        }
        
        .custom-referral-table .ant-pagination-prev:hover,
        .custom-referral-table .ant-pagination-next:hover {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        
        .custom-referral-table .ant-select {
          color: var(--text-light) !important;
        }
        
        .custom-referral-table .ant-select-selector {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: var(--text-light) !important;
        }
        
        .custom-referral-table .ant-select-dropdown {
          background: rgba(26, 27, 46, 0.95) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .custom-referral-table .ant-select-item {
          color: var(--text-light) !important;
        }
        
        .custom-referral-table .ant-select-item-option-selected {
          background: rgba(0, 212, 170, 0.1) !important;
          color: var(--client-accent) !important;
        }
        
        .custom-referral-table .ant-select-item-option-active {
          background: rgba(255, 255, 255, 0.05) !important;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes float-delayed {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ReferralsPage;
