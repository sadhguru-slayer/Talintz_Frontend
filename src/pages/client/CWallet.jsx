import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRazorpayWallet } from '../../hooks/useRazorpayWallet';
import { 
  FaWallet, 
  FaHistory, 
  FaLock, 
  FaProjectDiagram,
  FaBox,
  FaMoneyBillWave,
  FaExchangeAlt
} from 'react-icons/fa';
import { 
  Spin, 
  Tooltip, 
  Empty, 
  Tabs,
  Card,
  Button,
  notification,
  Alert,
  Modal
} from 'antd';
import { 
  HomeOutlined, 
  ProjectOutlined,
  BarChartOutlined,
  LockOutlined,
  HistoryOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import api from '../../config/axios';
import Cookies from 'js-cookie';
import CSider from '../../components/client/CSider';
import CHeader from '../../components/client/CHeader';
import { useWalletDetails } from '../../hooks/useWalletDetails';

const DUMMY_TRANSACTIONS = [
  { id: 1, description: "CRED Coins Redeemed", type: "credit", amount: 500, timestamp: new Date() },
  { id: 2, description: "Credit Card Bill Paid", type: "debit", amount: 2000, timestamp: new Date() },
  { id: 3, description: "Reward Cashback", type: "credit", amount: 150, timestamp: new Date() },
  { id: 4, description: "Referral Bonus", type: "credit", amount: 250, timestamp: new Date() },
  { id: 5, description: "Late Fee", type: "debit", amount: 100, timestamp: new Date() },
];

const DUMMY_PROJECT_HOLDS = [
  { id: 1, project_title: "UI/UX Redesign", milestone_title: "Final Payment", amount: 1200, created_at: new Date() },
  { id: 2, project_title: "Mobile App", milestone_title: "Phase 1", amount: 800, created_at: new Date() },
];

const DUMMY_PACK_HOLDS = [
  { id: 1, pack_name: "Premium Subscription", description: "Annual Plan", amount: 999, valid_until: new Date(Date.now() + 1000*60*60*24*365) },
];

const CWallet = ({ userId, role }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { walletData, loading, error, refreshWallet } = useWalletDetails();
  const { startWalletDeposit } = useRazorpayWallet();
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMoneyLoading, setAddMoneyLoading] = useState(false);
  const [addMoneyError, setAddMoneyError] = useState('');

  // Move all useMemo hooks here, before any conditional returns
  const formatCurrency = useMemo(() => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }), []);
  const formatDate = useMemo(() => new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), []);

  // Validate role
  useEffect(() => {
    if (walletData && walletData.user_role !== 'client') {
      navigate('/unauthorized');
    }
  }, [walletData, navigate]);

  const handleAddMoney = () => {
    setAddMoneyError('');
    setAddAmount('');
    setShowAddMoneyModal(true);
  };

  // Now handle loading and error states
  if (loading) return <Spin size="large" />;
  if (error) return <Alert type="error" message={error} />;
  if (!walletData) return null;

  const {
    basic_info = {},
    transaction_stats = {},
    role_specific_data = {},
    recent_transactions = [],
    holds = {}
  } = walletData;

  const project_holds = role_specific_data.project_holds || [];
  const obsp_purchases = role_specific_data.obsp_purchases || [];

  // Group project milestone holds by project
  const projectMilestoneHolds = (walletData.holds.active_holds || []).filter(
    (hold) => hold.hold_type === 'project_milestone'
  );

  const holdsByProject = projectMilestoneHolds.reduce((acc, hold) => {
    const projectId = hold.project_id || 'unknown';
    if (!acc[projectId]) {
      acc[projectId] = {
        project_title: hold.project_title || 'Unknown Project',
        holds: [],
      };
    }
    acc[projectId].holds.push(hold);
    return acc;
  }, {});

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return formatDate.format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-client-primary via-client-secondary/10 to-client-bg-dark">
      <CSider userId={userId} role={role} dropdown={true} collapsed={true} />
      <div className={`flex-1 flex flex-col overflow-hidden`}>
        <CHeader userId={userId} />
        <div className={` ${isMobile ? 'ml-0' : 'ml-14'} flex-1 overflow-auto p-4 md:p-6`}>
          
          {/* Wallet Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl mb-6 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-client-primary via-client-primary/80 to-client-bg-dark"></div>
            <div className="absolute inset-0 bg-client-gradient-soft opacity-30"></div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-client-accent/10 rounded-full blur-3xl -mr-24 -mt-24 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-accent/8 rounded-full blur-2xl -ml-20 -mb-20 animate-float-delayed"></div>
            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-wide text-white mb-2 cred-font">Your Wallet</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="bg-white/10 backdrop-blur-sm text-white text-lg px-5 py-2 rounded-full border border-white/20 font-bold cred-balance-shadow">
                      {formatCurrency.format(basic_info.balance)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/50 flex items-center gap-2 px-6 py-2 rounded-full font-semibold shadow-lg"
                    onClick={handleAddMoney}
                  >
                    <FaMoneyBillWave /> Add Money
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                    className="cred-btn-accent flex items-center gap-2 px-6 py-2 rounded-full font-semibold shadow-lg"
                  >
                    <FaExchangeAlt /> Transfer
                  </motion.button>
                </div>
              </div>
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                {[
                  { icon: <FaWallet />, label: "Available", value: formatCurrency.format(basic_info.balance), color: 'var(--client-accent)' },
                  { icon: <FaLock />, label: "On Hold", value: formatCurrency.format(basic_info.hold_balance), color: 'var(--client-primary)' },
                  { icon: <FaHistory />, label: "Transactions", value: recent_transactions.length, color: 'var(--client-secondary)' }
                ]?.map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
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

          {/* Main Content with Modern Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl shadow-xl"
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="custom-tabs"
              tabBarStyle={{
                margin: 0,
                padding: isMobile ? '12px 16px 0' : '16px 24px 0',
                background: 'transparent',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <Tabs.TabPane tab={<span className="flex items-center gap-2 cred-tab-label text-text-light"><BarChartOutlined />Overview</span>} key="overview">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Transactions Card */}
                    <div className="lg:col-span-2">
                      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-md">
                        <h3 className="text-xl font-bold text-white mb-4 cred-font">Recent Activity</h3>
                        <div className="space-y-4">
                          {recent_transactions.slice(0, 5).map((transaction) => (
                            <motion.div key={transaction.id} whileHover={{ x: 4 }}
                              className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between cred-activity-row"
                            >
                              <div>
                                <p className="font-semibold text-white cred-font">{transaction.description}</p>
                                <p className="text-sm text-white/60">{formatTimestamp(transaction.timestamp)}</p>
                              </div>
                              <span className={`cred-pill ${transaction.type === 'credit' ? 'cred-pill-credit' : 'cred-pill-debit'}`}>
                                {transaction.type === 'credit' ? '+' : '-'}{formatCurrency.format(transaction.amount)}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Active Holds Card */}
                    <div>
                      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-md">
                        <h3 className="text-xl font-bold text-white mb-4 cred-font">Active Holds</h3>
                        <div className="space-y-4">
                          {walletData.holds.active_holds.map((hold) => (
                            <motion.div key={hold.id} whileHover={{ x: 4 }}
                              className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white cred-font">{hold.title}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  hold.hold_type === 'project_milestone' ? 'bg-blue-500/20 text-blue-400' :
                                  hold.hold_type === 'obsp_purchase' ? 'bg-purple-500/20 text-purple-400' :
                                  hold.hold_type === 'auto_pay_commitment' ? 'bg-green-500/20 text-green-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {hold.hold_type.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                              
                              <p className="text-sm text-white/60 mb-2">{hold.description}</p>
                              
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-white/60">
                                  {hold.hold_type === 'project_milestone' && hold.project_title && (
                                    <>Project: {hold.project_title}</>
                                  )}
                                  {hold.hold_type === 'obsp_purchase' && hold.obsp_title && (
                                    <>OBSP: {hold.obsp_title}</>
                                  )}
                                </span>
                                <span className="font-semibold text-client-accent">
                                  {formatCurrency.format(hold.amount)}
                                </span>
                              </div>
                              
                              {hold.expires_at && (
                                <div className="mt-2 text-xs text-white/40">
                                  Expires: {formatDate.format(new Date(hold.expires_at))}
                                  {hold.days_remaining !== null && (
                                    <span className="ml-2">({hold.days_remaining} days left)</span>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab={<span className="flex items-center gap-2 cred-tab-label text-text-light"><LockOutlined />Holds</span>} key="holds">
                <div className="p-6">
                  <div className="space-y-6">
                    {Object.keys(holdsByProject).length > 0 ? (
                      Object.values(holdsByProject).map((project, idx) => (
                        <motion.div
                          key={project.project_title + idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl border border-white/10 shadow-md overflow-hidden"
                        >
                          <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-2">
                              <FaProjectDiagram className="text-client-accent" />
                              <h3 className="font-semibold text-white cred-font">{project.project_title}</h3>
                            </div>
                          </div>
                          <div className="p-4">
                            {project.holds.length > 0 ? (
                              <div className="divide-y divide-white/10">
                                {project.holds.map((hold) => (
                                  <motion.div key={hold.id} whileHover={{ x: 4 }} className="py-3 first:pt-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-semibold text-white cred-font">Milestone: {hold.milestone_title}</p>
                                        <p className="text-sm text-white/60">{hold.description}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-client-accent">{formatCurrency.format(hold.amount)}</p>
                                        <p className="text-xs text-white/40">Since {formatTimestamp(hold.created_at)}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center text-white/60 py-8 cred-font">No holds for this project</div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center text-white/60 py-8 cred-font">No project holds</div>
                    )}
                  </div>
                </div>
              </Tabs.TabPane>

              <Tabs.TabPane tab={<span className="flex items-center gap-2 cred-tab-label text-text-light"><FaHistory />All Transactions</span>} key="transactions">
                <div className="p-6">
                  <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl border border-white/10 p-4 shadow-md">
                    <h3 className="text-xl font-bold text-white mb-4 cred-font">Transaction History</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-white/90">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-white/60">Date</th>
                            <th className="px-4 py-2 text-left font-medium text-white/60">Description</th>
                            <th className="px-4 py-2 text-left font-medium text-white/60">Type</th>
                            <th className="px-4 py-2 text-left font-medium text-white/60">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recent_transactions.length > 0 ? (
                            recent_transactions.map((transaction) => (
                              <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/10 transition">
                                <td className="px-4 py-2">{formatTimestamp(transaction.timestamp)}</td>
                                <td className="px-4 py-2">{transaction.description}</td>
                                <td className="px-4 py-2">
                                  <span className={`cred-pill ${transaction.type === 'credit' ? 'cred-pill-credit' : 'cred-pill-debit'}`}>
                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                  </span>
                                </td>
                                <td className="px-4 py-2 font-semibold">
                                  {transaction.type === 'credit' ? '+' : '-'}
                                  {formatCurrency.format(transaction.amount)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-white/60 cred-font">
                                <FaHistory className="inline-block text-2xl mb-2" />
                                <div>No transactions found</div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Tabs.TabPane>
            </Tabs>
          </motion.div>
        </div>
      </div>
      <style jsx global>{`
        .cred-font {
          font-family: 'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif;
          letter-spacing: 0.02em;
        }
        .cred-balance-shadow {
          box-shadow: 0 4px 32px 0 rgba(0,0,0,0.18), 0 1.5px 4px 0 rgba(0,0,0,0.10);
        }
        .cred-btn-secondary {
          background: var(--client-secondary);
          color: #fff;
          border: none;
          border-radius: 9999px;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
          transition: all 0.3s ease;
        }
        .cred-btn-secondary:hover {
          background: var(--client-secondary-dark);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.15);
          transform: translateY(-2px) scale(1.03);
        }
        .cred-btn-accent {
          background: var(--client-accent);
          color: #fff;
          border: none;
          border-radius: 9999px;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
          transition: all 0.3s ease;
        }
        .cred-btn-accent:hover {
          background: var(--client-accent-dark);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.15);
          transform: translateY(-2px) scale(1.03);
        }
        .cred-pill {
          display: inline-block;
          padding: 0.5em 1.2em;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.03em;
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
        }
        .cred-pill-credit {
          background: var(--status-success);
          color: #fff;
        }
        .cred-pill-debit {
          background: var(--status-error);
          color: #fff;
        }
        .cred-tab-label {
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--text-light);
        }
        .custom-tabs .ant-tabs-nav {
          margin: 0 !important;
          padding: ${isMobile ? '12px 16px 0' : '16px 24px 0'} !important;
          background: transparent !important;
        }
        .custom-tabs .ant-tabs-tab {
          margin: 0 ${isMobile ? '4px' : '8px'} 0 0 !important;
          padding: ${isMobile ? '10px 20px' : '14px 32px'} !important;
          background: rgba(255, 255, 255, 0.08) !important;
          border: 1.5px solid rgba(255, 255, 255, 0.13) !important;
          border-radius: 18px 18px 0 0 !important;
          transition: all 0.3s cubic-bezier(.4,2,.6,1) !important;
          color: var(--text-light) !important;
          font-weight: 600 !important;
        }
        .custom-tabs .ant-tabs-tab-active {
          background: var(--client-secondary) !important;
          color: #fff !important;
          border-color: var(--client-accent) !important;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
        }
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--client-accent) !important;
          height: 4px !important;
          border-radius: 2px !important;
        }
        .ant-card, .ant-card-body {
          background: transparent !important;
          border: none !important;
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

        .ant-tabs-nav-list{
          flex-wrap:wrap !important;
          gap:0.25rem;
          
      `}</style>
      <Modal
        title={null}
        open={showAddMoneyModal}
        onCancel={() => setShowAddMoneyModal(false)}
        footer={null}
        centered
        className="custom-modal"
      >
        <div className="p-6 rounded-2xl bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-client-accent/10 flex items-center justify-center">
              <FaMoneyBillWave className="text-client-accent text-2xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-light mb-1">Add Money to Wallet</h2>
              <p className="text-sm text-text-muted">
                Instantly fund your wallet for project payments, milestone auto-pay, and more.
              </p>
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold text-text-light mb-2">Amount (INR)</label>
            <input
              type="number"
              min={1}
              step={1}
              value={addAmount}
              onChange={e => setAddAmount(e.target.value.replace(/^0+/, ''))}
              placeholder="Enter amount to add"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-client-accent/50 focus:ring-2 focus:ring-client-accent/20 transition-all duration-300 text-text-light placeholder-text-muted backdrop-blur-sm text-lg"
              disabled={addMoneyLoading}
            />
            {addMoneyError && (
              <Alert type="error" message={addMoneyError} showIcon style={{ marginTop: 8 }} />
            )}
          </div>
          <Button
            type="primary"
            block
            size="large"
            loading={addMoneyLoading}
            disabled={!addAmount || isNaN(addAmount) || Number(addAmount) <= 0}
            className="enhanced-button !bg-client-accent primary w-full mb-2"
            onClick={async () => {
              setAddMoneyError('');
              if (!addAmount || isNaN(addAmount) || Number(addAmount) <= 0) {
                setAddMoneyError('Please enter a valid amount.');
                return;
              }
              setAddMoneyLoading(true);
              try {
                await startWalletDeposit(
                  Number(addAmount),
                  () => {
                    notification.success({ message: "Wallet funded successfully!" });
                    setShowAddMoneyModal(false);
                    setAddAmount('');
                    refreshWallet && refreshWallet();
                  },
                  (errMsg) => setAddMoneyError(errMsg)
                );
              } finally {
                setAddMoneyLoading(false);
              }
            }}
          >
            Add Money
          </Button>
          <div className="mt-4 text-sm text-text-secondary">
            <ul className="list-disc pl-5 space-y-1">
              <li>Funds are instantly credited after successful payment.</li>
              <li>Minimum amount: ₹1</li>
              <li>All transactions are secured via Razorpay.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CWallet;

