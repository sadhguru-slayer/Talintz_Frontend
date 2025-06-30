import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import './profile/css/EditProfile.css';
import { useRazorpayWallet } from '../../hooks/useRazorpayWallet';
import { 
  FaWallet, 
  FaHistory, 
  FaLock, 
  FaProjectDiagram,
  FaAward,
  FaUserPlus,
  FaBriefcase,
  FaMoneyBillWave,
  FaExchangeAlt
} from 'react-icons/fa';
import { 
  Spin, 
  Tooltip, 
  Empty, 
  Tabs,
  Modal,
  Button,
  Alert,
  notification
} from 'antd';
import { 
  BarChartOutlined,
  LockOutlined,
  HistoryOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Cookies from 'js-cookie';
import FSider from '../../components/freelancer/FSider';
import FHeader from '../../components/freelancer/FHeader';
import axios from 'axios';
import {getBaseURL} from '../../config/axios';
const FWallet = ({ userId, role,isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const { startWalletDeposit } = useRazorpayWallet();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [addMoneyLoading, setAddMoneyLoading] = useState(false);
  const [addMoneyError, setAddMoneyError] = useState('');
  const formatCurrency = useMemo(() => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }), []);
  const formatDate = useMemo(() => new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), []);

  const safeFormatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj.getTime())) return 'N/A';
    return formatDate.format(dateObj);
  };

  const handleAddMoney = () => {
    setAddMoneyError('');
    setAddAmount('');
    setShowAddMoneyModal(true);
  };
  useEffect(() => {
    setLoading(true);
    axios.get(`${getBaseURL()}/api/finance/wallet/freelancer-details/`, {
      headers: {
        'Authorization': `Bearer ${Cookies.get('accessToken')}`
      }
    })
      .then(res => {
        setWalletData(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Error fetching freelancer wallet details');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Spin size="large" /></div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
  }
  if (!walletData) {
    return null;
  }

  // Header info
  const { header, holds, earnings, transactions } = walletData;
  console.log(header)
  const projectHolds = holds.filter(h => h.hold_type === 'project_milestone');
  const packHolds = holds.filter(h => h.hold_type === 'obsp_stake' || h.hold_type === 'obsp_purchase');
  // Earnings
  const earningsHistory = earnings.map(e => ({
    id: e.id,
    category: e.type === 'project' ? 'Project' : e.type === 'milestone' ? 'Milestone' : e.type === 'task' ? 'Task' : 'Other',
    description: e.description,
    amount: e.amount,
    date: e.timestamp,
  }));

  // Transactions
  const allTransactions = [
    ...transactions.platform,
    ...transactions.wallet,
    // Optionally, add subscriptions as a separate section/tab
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-freelancer-primary via-freelancer-secondary/10 to-freelancer-bg-dark">
      <FSider userId={userId} role={role} dropdown={true} collapsed={true} />
      <div className={`${isMobile ? 'ml-0' : 'ml-14'} flex-1 flex flex-col overflow-hidden`}>
        <FHeader userId={userId}
        isAuthenticated = {isAuthenticated}
        isEditable = {isEditable}
        role={role}
        
        />
        <div className={` flex-1 overflow-auto p-4 md:p-6`}>
          <div className="max-w-7xl mx-auto space-y-6">
          {/* Wallet Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
              className="relative overflow-hidden rounded-xl shadow-lg bg-freelancer-bg-card border border-white/10"
            >
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-accent/10 rounded-full -ml-32 -mb-32 blur-xl"></div>

            <div className="relative z-10 p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-wide text-text-light mb-2 cred-font">Freelancer Wallet</h1>
                  <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-white/10 backdrop-blur-sm text-text-light text-lg px-5 py-2 rounded-full border border-white/20 font-bold cred-balance-shadow">
                      {formatCurrency.format(header.balance)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cred-btn-secondary !bg-white flex items-center gap-2 px-6 py-2 rounded-full font-semibold shadow-lg !text-client-bg-dark"
                    onClick={handleAddMoney}
                  >
                    <FaMoneyBillWave /> Add Money
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                    className="cred-btn-accent flex items-center gap-2 px-6 py-2 rounded-full font-semibold shadow-lg"
                  >
                      <FaExchangeAlt /> Withdraw
                  </motion.button>
                </div>
              </div>
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                {[
                    { icon: <FaWallet />, label: "Available", value: formatCurrency.format(header.balance), color: 'var(--freelancer-accent)' },
                    { icon: <FaLock />, label: "On Hold", value: formatCurrency.format(header.hold_balance), color: 'var(--freelancer-primary)' },
                    { icon: <FaProjectDiagram />, label: "Active Holds", value: holds.length, color: 'var(--status-success)' },
                    { icon: <FaHistory />, label: "Transactions", value: allTransactions.length, color: 'var(--freelancer-accent)' }
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 shadow-md"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                      {React.cloneElement(stat.icon, { style: { color: stat.color, fontSize: 22 } })}
                    </div>
                    <div>
                        <p className="text-text-muted text-base font-medium">{stat.label}</p>
                        <p className="text-text-light font-bold text-xl">{stat.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content with Modern Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl border border-white/10 bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 backdrop-blur-xl shadow-xl"
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
                {/* Overview Tab */}
                <Tabs.TabPane tab={<span className="flex items-center gap-2 text-text-light"><BarChartOutlined />Overview</span>} key="overview">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Transactions Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 shadow-md">
                          <h3 className="text-xl font-bold text-text-light mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                          {allTransactions.slice(0, 5).map((transaction) => (
                            <motion.div key={transaction.id} whileHover={{ x: 4 }}
                                className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
                            >
                              <div>
                                  <p className="font-semibold text-text-secondary">{transaction.description}</p>
                                  <p className="text-sm text-text-muted">{safeFormatDate(transaction.timestamp)}</p>
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
                        <div className="bg-white/5 rounded-xl border border-white/10 p-4 shadow-md">
                          <h3 className="text-xl font-bold text-text-light mb-4">Active Holds</h3>
                        <div className="space-y-4">
                          {holds.length > 0 ? (
                            holds.map((hold) => (
                              <motion.div key={hold.id} whileHover={{ x: 4 }}
                                className="p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-300"
                              >
                                <h4 className="font-semibold text-text-secondary">
                                  {hold.title || hold.project_title || hold.description}
                                </h4>
                                <div className="flex justify-between items-center mt-2 text-sm">
                                  <span className="text-text-muted">
                                    {hold.hold_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    {hold.milestone_title ? ` • Milestone: ${hold.milestone_title}` : ''}
                                  </span>
                                  <span className="font-semibold text-freelancer-accent">
                                    {formatCurrency.format(hold.amount)}
                                  </span>
                                </div>
                                <div className="text-xs text-text-muted">
                                  Since {safeFormatDate(hold.created_at)}
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="text-center text-text-muted py-8">No active holds</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.TabPane>

                {/* Holds Tab */}
                <Tabs.TabPane tab={<span className="flex items-center gap-2 text-text-light"><LockOutlined />Holds</span>} key="holds">
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Project Holds */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-xl bg-white/5 border border-white/10 shadow-md overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <FaProjectDiagram className="text-freelancer-accent" />
                            <h3 className="font-semibold text-text-light">Project Holds</h3>
                          </div>
                      </div>
                      <div className="p-4">
                        {projectHolds.length > 0 ? (
                          <div className="divide-y divide-white/10">
                            {projectHolds.map((hold) => (
                              <motion.div key={hold.id} whileHover={{ x: 4 }} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                      <p className="font-semibold text-text-secondary">{hold.project_title}</p>
                                      <p className="text-sm text-text-muted">Milestone: {hold.milestone_title}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-semibold text-freelancer-accent">{formatCurrency.format(hold.amount)}</p>
                                      <p className="text-xs text-text-muted">Since {safeFormatDate(hold.created_at)}</p>
                                    </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                            <div className="text-center text-text-muted py-8">No project holds</div>
                        )}
                      </div>
                    </motion.div>
                    {/* Pack Holds */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="rounded-xl bg-white/5 border border-white/10 shadow-md overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <FaAward className="text-freelancer-secondary" />
                            <h3 className="font-semibold text-text-light">Pack Holds</h3>
                          </div>
                      </div>
                      <div className="p-4">
                        {packHolds.length > 0 ? (
                          <div className="divide-y divide-white/10">
                            {packHolds.map((hold) => (
                              <motion.div key={hold.id} whileHover={{ x: 4 }} className="py-3 first:pt-0 last:pb-0">
                                <div className="flex items-center justify-between">
                                  <div>
                                      <p className="font-semibold text-text-secondary">{hold.pack_name}</p>
                                      <p className="text-sm text-text-muted">{hold.description}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="font-semibold text-freelancer-secondary">{formatCurrency.format(hold.amount)}</p>
                                      <p className="text-xs text-text-muted">Until {safeFormatDate(hold.valid_until)}</p>
                                    </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                            <div className="text-center text-text-muted py-8">No pack holds</div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Tabs.TabPane>

                {/* Earnings Tab */}
                <Tabs.TabPane 
                  tab={<span className="flex items-center gap-2 text-text-light"><TrophyOutlined />Earnings</span>} 
                  key="earnings"
                >
                  <div className="p-6">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-6 shadow-md">
                      <h3 className="text-xl font-bold text-text-light mb-4">Earnings History</h3>
                      <div className="space-y-4">
                        {earningsHistory.length > 0 ? (
                          earningsHistory.map((earning) => (
                            <div
                              key={earning.id}
                              className="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-xl border border-white/10 bg-white/10 hover:bg-white/20 transition-all duration-300"
                            >
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs px-2 py-1 rounded-full font-semibold"
                                    style={{
                                      background:
                                        earning.category === "OBSP"
                                          ? "var(--freelancer-accent)"
                                          : earning.category === "Bonus"
                                          ? "var(--status-success)"
                                          : earning.category === "Referral"
                                          ? "var(--freelancer-secondary)"
                                          : earning.category === "Project"
                                          ? "var(--status-info)"
                                          : earning.category === "Employment"
                                          ? "var(--status-warning)"
                                          : "var(--text-muted)",
                                      color: "#fff",
                                    }}
                                  >
                                    {earning.category}
                                  </span>
                                  <span className="text-text-secondary font-semibold">{earning.description}</span>
                                </div>
                                <div className="text-xs text-text-muted">
                                  {safeFormatDate(earning.date)}
                                </div>
                              </div>
                              <div className="mt-2 md:mt-0 text-xl font-bold text-text-light">
                                +{formatCurrency.format(earning.amount)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-text-muted py-8">No earnings yet</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>

                {/* Transactions Tab */}
                <Tabs.TabPane 
                  tab={<span className="flex items-center gap-2 text-text-light"><HistoryOutlined />All Transactions</span>} 
                  key="transactions"
                >
                <div className="p-6">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-4 shadow-md">
                      <h3 className="text-xl font-bold text-text-light mb-4">Transaction History</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-text-light">
                        <thead>
                          <tr>
                              <th className="px-4 py-2 text-left font-medium text-text-muted">Date</th>
                              <th className="px-4 py-2 text-left font-medium text-text-muted">Description</th>
                              <th className="px-4 py-2 text-left font-medium text-text-muted">Type</th>
                              <th className="px-4 py-2 text-left font-medium text-text-muted">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allTransactions.length > 0 ? (
                            allTransactions.map((transaction) => (
                              <tr key={transaction.id} className="border-b border-white/10 hover:bg-white/10 transition">
                                  <td className="px-4 py-2 text-text-muted">{safeFormatDate(transaction.timestamp)}</td>
                                  <td className="px-4 py-2 text-text-secondary">{transaction.description}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                      ${transaction.type === 'credit' 
                                        ? 'bg-status-success/20 text-status-success' 
                                        : 'bg-status-error/20 text-status-error'}`}>
                                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                  </span>
                                </td>
                                  <td className="px-4 py-2 font-semibold text-text-light">
                                  {transaction.type === 'credit' ? '+' : '-'}
                                  {formatCurrency.format(transaction.amount)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-text-muted">
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
      </div>
      <Modal
        title={null}
        open={showAddMoneyModal}
        onCancel={() => setShowAddMoneyModal(false)}
        footer={null}
        centered
        className="custom-modal"
      >
        <div className="p-6 rounded-2xl bg-gradient-to-br from-freelancer-secondary/40 to-freelancer-bg-dark/30 border border-white/10 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-freelancer-accent/10 flex items-center justify-center">
              <FaMoneyBillWave className="text-freelancer-accent text-2xl" />
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
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:bg-white/10 focus:border-freelancer-accent/50 focus:ring-2 focus:ring-freelancer-accent/20 transition-all duration-300 text-text-light placeholder-text-muted backdrop-blur-sm text-lg"
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
            className="enhanced-button !bg-freelancer-accent primary w-full mb-2"
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
                    // Optionally refresh wallet data here
                    window.location.reload();
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
      <style jsx global>{`
        .cred-font {
          font-family: 'Montserrat', 'Inter', 'Segoe UI', Arial, sans-serif;
          letter-spacing: 0.02em;
        }
        .cred-balance-shadow {
          box-shadow: 0 4px 32px 0 rgba(0,0,0,0.18), 0 1.5px 4px 0 rgba(0,0,0,0.10);
        }
        .cred-btn-secondary {
          background: var(--freelancer-secondary);
          color: #fff;
          border: none;
          border-radius: 9999px;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
          transition: all 0.3s ease;
        }
        .cred-btn-secondary:hover {
          background: var(--freelancer-secondary-dark);
          box-shadow: 0 8px 32px 0 rgba(0,0,0,0.15);
          transform: translateY(-2px) scale(1.03);
        }
        .cred-btn-accent {
          background: var(--freelancer-accent);
          color: #fff;
          border: none;
          border-radius: 9999px;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
          transition: all 0.3s ease;
        }
        .cred-btn-accent:hover {
          background: var(--freelancer-accent-dark);
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
          background: var(--freelancer-secondary) !important;
          color: #fff !important;
          border-color: var(--freelancer-accent) !important;
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.10);
        }
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--freelancer-accent) !important;
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
        }
          /* Form Controls - Updated with Glassmorphism */
.ant-input, 
.ant-input-textarea, 
.ant-select-selector,
.ant-picker {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 12px 16px !important;
  transition: all 0.3s ease !important;
  background: rgba(26, 27, 46, 0.4) !important; /* client-primary with opacity */
  backdrop-filter: blur(12px) !important;
  color: var(--text-light) !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1) !important;
}

/* Input hover state */
.ant-input:hover, 
.ant-input-textarea:hover,
.ant-select-selector:hover,
.ant-picker:hover {
  border-color: rgba(0, 212, 170, 0.5) !important; /* client-accent with opacity */
  background: rgba(26, 27, 46, 0.6) !important;
  box-shadow: 0 4px 12px rgba(0, 212, 170, 0.1) !important;
}

/* Input focus state */
.ant-input:focus,
.ant-input-textarea:focus,
.ant-select-focused .ant-select-selector,
.ant-picker-focused {
  border-color: var(--client-accent) !important;
  background: rgba(26, 27, 46, 0.8) !important;
  box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2) !important;
}

/* Select Dropdown - Glassmorphism */
.ant-select-dropdown {
  background: rgba(26, 27, 46, 0.95) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
}

.ant-select-item {
  color: var(--text-light) !important;
  transition: all 0.2s ease !important;
}

.ant-select-item-option-selected {
  background: rgba(0, 212, 170, 0.1) !important;
  color: var(--client-accent) !important;
}

.ant-select-item-option-active {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* Date Picker - Glassmorphism */
.ant-picker-dropdown {
  background: rgba(26, 27, 46, 0.95) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
}

.ant-picker-cell {
  color: var(--text-light) !important;
}

.ant-picker-cell-selected .ant-picker-cell-inner {
  background: var(--client-accent) !important;
}

/* Form Labels */
.ant-form-item-label > label {
  color: var(--text-light) !important;
  font-weight: 500 !important;
  font-size: 0.95rem !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

/* Input Number - Glassmorphism */
.ant-input-number {
  background: rgba(26, 27, 46, 0.4) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: var(--text-light) !important;
  border-radius: 12px !important;
}

.ant-input-number:hover {
  border-color: rgba(0, 212, 170, 0.5) !important;
  background: rgba(26, 27, 46, 0.6) !important;
}

.ant-input-number-focused {
  border-color: var(--client-accent) !important;
  background: rgba(26, 27, 46, 0.8) !important;
  box-shadow: 0 0 0 2px rgba(0, 212, 170, 0.2) !important;
}

/* Switch - Updated with Glassmorphism */
.ant-switch {
  background: rgba(26, 27, 46, 0.4) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.ant-switch-checked {
  background: var(--client-accent) !important;
}

/* Card - Glassmorphism */
.ant-card {
  background: rgba(26, 27, 46, 0.4) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.ant-card-head {
  color: var(--text-light) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Tabs - Glassmorphism */
.custom-tabs .ant-tabs-tab {
  background: rgba(26, 27, 46, 0.4) !important;
  backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: var(--text-light) !important;
  border-radius: 12px 12px 0 0 !important;
  margin: 0 4px !important;
  padding: 12px 20px !important;
}

.custom-tabs .ant-tabs-tab.ant-tabs-tab-active {
  background: rgba(0, 212, 170, 0.1) !important;
  border-color: var(--client-accent) !important;
}

.custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
  color: var(--client-accent) !important;
}

/* Disabled Input States */
.ant-input[disabled],
.ant-input-textarea[disabled],
.ant-select-disabled .ant-select-selector {
  background: rgba(26, 27, 46, 0.2) !important;
  color: rgba(255, 255, 255, 0.4) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(8px) !important;
}

/* Error States */
.ant-form-item-has-error .ant-input,
.ant-form-item-has-error .ant-input-textarea,
.ant-form-item-has-error .ant-select-selector {
  border-color: var(--status-error) !important;
  background: rgba(26, 27, 46, 0.4) !important;
  box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.2) !important;
}

.ant-form-item-explain-error {
  color: var(--status-error) !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
}

/* Alert - Glassmorphism */
.ant-alert {
  border-radius: 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  background: rgba(26, 27, 46, 0.4) !important;
  backdrop-filter: blur(12px) !important;
}

.ant-alert-info {
  border-color: var(--client-accent) !important;
  background: rgba(0, 212, 170, 0.1) !important;
}

.ant-alert-success {
  border-color: var(--status-success) !important;
  background: rgba(56, 161, 105, 0.1) !important;
}
      `}</style>
    </div>
  );
};

export default FWallet;

