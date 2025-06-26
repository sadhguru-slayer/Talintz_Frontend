import { useState, useEffect, useMemo } from "react";
import { Card, Button, Input, Select, Modal, Pagination, Tag, Row, Col, Statistic, Progress } from "antd";
import { SearchOutlined, CalendarOutlined, DollarOutlined, RiseOutlined, FallOutlined, LeftOutlined, RightOutlined, BarChartOutlined, StarOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaRegClock, FaChartLine, FaUserCheck, FaExclamationTriangle } from "react-icons/fa";
import '../../../assets/css/BiddingOverview.css';
const { Option } = Select;

const BiddingOverview = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBid, setSelectedBid] = useState(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredBids, setFilteredBids] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const navigate = useNavigate();

  // Enhanced sample data with more relevant fields
  const bids = useMemo(() => [
    { 
      id: 1, 
      projectName: "E-commerce Website Development",
      bidAmount: "₹50000",
      status: "Pending",
      deadline: "2024-12-25",
      clientRating: 4.8,
      projectDuration: "3 months",
      competingBids: 8,
      description: "Modern e-commerce platform with payment integration",
      averageBid: "₹45000",
      bidPosition: 3,
      clientResponseTime: "2 days",
      skills: ["React", "Node.js", "MongoDB"]
    },
    { 
      id: 2, 
      projectName: "Mobile App",
      bidAmount: "₹30000",
      status: "Accepted",
      deadline: "2024-12-15",
      clientRating: 4.5,
      projectDuration: "2 months",
      competingBids: 5,
      description: "Mobile app for food delivery",
      averageBid: "₹35000",
      bidPosition: 2,
      clientResponseTime: "1 day",
      skills: ["React Native", "Flutter", "Java"]
    },
    { 
      id: 3, 
      projectName: "SEO Optimization",
      bidAmount: "₹15000",
      status: "Rejected",
      deadline: "2024-11-30",
      clientRating: 4.2,
      projectDuration: "1 month",
      competingBids: 3,
      description: "SEO optimization for e-commerce website",
      averageBid: "₹12000",
      bidPosition: 1,
      clientResponseTime: "3 days",
      skills: ["SEO", "Google Analytics", "Content Writing"]
    },
    { 
      id: 4, 
      projectName: "UI/UX Design",
      bidAmount: "₹25000",
      status: "Pending",
      deadline: "2024-12-20",
      clientRating: 4.6,
      projectDuration: "2 months",
      competingBids: 6,
      description: "UI/UX design for mobile app",
      averageBid: "₹28000",
      bidPosition: 4,
      clientResponseTime: "2 days",
      skills: ["Figma", "Sketch", "Adobe XD"]
    },
    { 
      id: 5, 
      projectName: "Backend Development",
      bidAmount: "₹40000",
      status: "Accepted",
      deadline: "2024-12-10",
      clientRating: 4.7,
      projectDuration: "3 months",
      competingBids: 7,
      description: "Backend development for e-commerce website",
      averageBid: "₹42000",
      bidPosition: 5,
      clientResponseTime: "1 day",
      skills: ["Node.js", "Express.js", "MongoDB"]
    },
  ], []);

  // Bid Statistics
  const bidStats = {
    totalBids: 25,
    acceptanceRate: 68,
    averageBidAmount: "₹32000",
    pendingBids: 8,
    acceptedBids: 12,
    rejectedBids: 5,
    averageCompetitors: 6,
    successfulProjects: 15,
    totalEarnings: "₹450000",
    recentWinRate: 75
  };

  // Monthly bid trend data
  const monthlyTrend = [
    { month: 'Jan', bids: 5, accepted: 3 },
    { month: 'Feb', bids: 8, accepted: 5 },
    { month: 'Mar', bids: 6, accepted: 4 }
  ];

  // New statistics
  const bidInsights = {
    competitivePosition: {
      averagePosition: 2.8,
      topPositionRate: 45,
      improvement: 12
    },
    bidOptimization: {
      suggestedRange: "₹35000 - ₹45000",
      successRate: 72,
      optimalDuration: "2-3 months"
    },
    marketAnalysis: {
      highDemandSkills: ["React", "Node.js", "AWS"],
      avgResponseTime: "1.5 days",
      competitorCount: 15
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: {
        color: '#1890ff',
        background: 'rgba(24, 144, 255, 0.1)',
        border: '1px solid rgba(24, 144, 255, 0.2)'
      },
      Accepted: {
        color: '#52c41a',
        background: 'rgba(82, 196, 26, 0.1)',
        border: '1px solid rgba(82, 196, 26, 0.2)'
      },
      Rejected: {
        color: '#ff4d4f',
        background: 'rgba(255, 77, 79, 0.1)',
        border: '1px solid rgba(255, 77, 79, 0.2)'
      },
      "In Progress": {
        color: '#faad14',
        background: 'rgba(250, 173, 20, 0.1)',
        border: '1px solid rgba(250, 173, 20, 0.2)'
      }
    };
    return colors[status] || colors["In Progress"];
  };

  useEffect(() => {
    const filtered = bids.filter((bid) => {
      const matchesSearchTerm = bid.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? bid.status.toLowerCase() === statusFilter.toLowerCase() : true;
      return matchesSearchTerm && matchesStatus;
    });
    setFilteredBids(filtered);
  }, [searchTerm, statusFilter, bids]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
  };

  const handlePreview = (bid) => {
    setSelectedBid(bid);
    setShowProposalModal(true);
  };

  const handleViewDetails = (id, project) => {
    navigate(`/freelancer/dashboard/projects/${id}`, { state: { project } });
  };

  const closeModal = () => {
    setShowProposalModal(false);
    setSelectedBid(null);
  };

  const paginatedData = filteredBids.length > 0 ? 
    filteredBids.slice((currentPage - 1) * pageSize, currentPage * pageSize) : 
    bids.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Simplified motion variants
  const motionVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.1
        }
      }
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.23, 1, 0.32, 1]
        }
      }
    }
  };

  // Consistent card styles using Tailwind config values
  const cardStyles = {
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    background: 'white'
  };

  const headerStyles = {
    padding: 24,
    borderBottom: 'none',
    background: 'transparent'
  };

  const bodyStyles = {
    padding: 24,
    backgroundColor: 'transparent'
  };

  const StatCard = ({ title, value, icon, trend, trendValue, color }) => (
    <motion.div
      variants={motionVariants.item}
      className="h-full overflow-hidden relative bg-freelancer-bg-card border border-white/10 hover:border-freelancer-accent/30 shadow-md transition-all duration-300 rounded-xl"
    >
      <div className="p-6">
      <div className="flex items-center justify-between mb-3">
          <span className="text-freelancer-accent text-xl">{icon}</span>
        {trend && (
          <div className={`flex items-center ${
              trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}>
            {trend === 'up' ? <RiseOutlined /> : <FallOutlined />}
            <span className="ml-1 text-sm">{trendValue}%</span>
          </div>
        )}
      </div>
        <h3 className="text-freelancer-text-secondary text-sm font-medium mb-1">{title}</h3>
        <p className={`text-xl font-semibold ${color || 'text-freelancer-text-primary'}`}>{value}</p>
      </div>
    </motion.div>
  );

  const BidProgressCard = ({ title, value, total, color }) => (
    <div className="bg-freelancer-bg-card rounded-xl p-4 border border-white/10">
      <h3 className="text-freelancer-text-secondary text-sm mb-2">{title}</h3>
      <Progress
        percent={Math.round((value / total) * 100)}
        strokeColor={color}
        strokeWidth={8}
        format={(percent) => `${value}/${total}`}
        className="custom-progress"
      />
    </div>
  );

  const RecentBidCard = ({ bid }) => (
    <motion.div
      variants={motionVariants.item}
      className="bg-freelancer-bg-card rounded-xl p-4 border border-white/10 hover:border-freelancer-accent/30 transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-freelancer-text-primary">{bid.projectName}</h3>
          <p className="text-sm text-freelancer-text-secondary mt-1">{bid.description}</p>
        </div>
        <Tag 
          color={getStatusColor(bid.status).color} 
          style={{ 
            background: getStatusColor(bid.status).background, 
            color: '#fff', 
            border: getStatusColor(bid.status).border, 
            borderRadius: '9999px', 
            padding: '0.25rem 1rem'
          }}
        >
          {bid.status}
        </Tag>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
        <div className="text-freelancer-text-secondary">
          <span className="block text-freelancer-accent">Amount</span>
          {bid.bidAmount}
        </div>
        <div className="text-freelancer-text-secondary">
          <span className="block text-freelancer-accent">Position</span>
          {bid.bidPosition} of {bid.competingBids}
        </div>
        <div className="text-freelancer-text-secondary">
          <span className="block text-freelancer-accent">Response</span>
          {bid.clientResponseTime}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 !bg-freelancer-primary min-h-screen">
      <motion.div 
        variants={motionVariants.container}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header Card */}
        <Card
          className="bg-freelancer-bg-card rounded-xl shadow-lg p-8 relative overflow-hidden border border-white/10"
          bodyStyle={{ background: 'transparent' }}
        >
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-accent/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-freelancer-text-primary mb-4 text-center">
                Bidding Overview
              </h1>
              <p className="text-freelancer-text-secondary text-center mb-8">
                Track and analyze your bidding performance
              </p>

            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Total Bids"
              value={bidStats.totalBids}
              icon={<FaChartLine className="text-xl text-freelancer-accent" />}
              trend="up"
              trendValue="12"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Acceptance Rate"
              value={`${bidStats.acceptanceRate}%`}
              icon={<FaUserCheck className="text-xl text-freelancer-accent" />}
              trend="up"
              trendValue="8"
              color="text-status-success"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Average Bid"
              value={bidStats.averageBidAmount}
              icon={<DollarOutlined className="text-xl text-freelancer-accent" />}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Win Rate"
              value={`${bidStats.recentWinRate}%`}
              icon={<FaExclamationTriangle className="text-xl text-freelancer-accent" />}
              trend="down"
              trendValue="5"
              color="text-status-warning"
            />
          </Col>
        </Row>

        {/* Competitive Analysis Card */}
            <Row gutter={[24, 24]}>
          {/* Competitive Analysis - 6 columns */}
          <Col xs={24} lg={12}>
            <div className="bg-freelancer-bg-card/90 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-freelancer-text-primary">Competitive Analysis</h2>
                    <span className="px-2 py-1 bg-freelancer-accent/20 rounded-full text-xs text-freelancer-accent border border-freelancer-accent/30">
                      Market Insights
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Market Position */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-freelancer-accent/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-freelancer-text-primary font-medium">Market Position</h4>
                      <div className="w-8 h-8 rounded-lg bg-freelancer-accent/20 flex items-center justify-center">
                        <BarChartOutlined className="text-freelancer-accent" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-freelancer-accent">
                      {bidInsights.competitivePosition.averagePosition}
                      <span className="text-freelancer-text-secondary text-base ml-1">/ 10</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-freelancer-text-secondary">
                        Top {bidInsights.competitivePosition.topPositionRate}% of bids
                      </span>
                      <span className="text-freelancer-accent text-sm font-medium">
                        ↑{bidInsights.competitivePosition.improvement}%
                      </span>
                    </div>
                  </div>

                  {/* Optimal Bid Range */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-freelancer-accent/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-freelancer-text-primary font-medium">Optimal Bid Range</h4>
                      <div className="w-8 h-8 rounded-lg bg-freelancer-accent/20 flex items-center justify-center">
                        <DollarOutlined className="text-freelancer-accent" />
                      </div>
                    </div>
                    <p className="text-2xl font-semibold text-freelancer-accent">
                    {bidInsights.bidOptimization.suggestedRange}
                  </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-freelancer-text-secondary">
                        {bidInsights.bidOptimization.successRate}% success rate
                      </span>
                    </div>
                  </div>

                  {/* High Demand Skills */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-freelancer-accent/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-freelancer-text-primary font-medium">High Demand Skills</h4>
                      <div className="w-8 h-8 rounded-lg bg-freelancer-accent/20 flex items-center justify-center">
                        <StarOutlined className="text-freelancer-accent" />
                      </div>
                    </div>
                  <div className="flex flex-wrap gap-2">
                    {bidInsights.marketAnalysis.highDemandSkills.map(skill => (
                        <Tag 
                          key={skill} 
                          className="bg-freelancer-accent/10 text-freelancer-accent border border-freelancer-accent/20 rounded-full px-3 py-1"
                        >
                        {skill}
                      </Tag>
                    ))}
                  </div>
                    <p className="text-sm text-freelancer-text-secondary mt-2">
                    {bidInsights.marketAnalysis.competitorCount} active competitors
                  </p>
                  </div>
                </div>
              </div>
                </div>
              </Col>

          {/* Bid Status Distribution - 6 columns */}
          <Col xs={24} lg={12}>
            <div className="bg-freelancer-bg-card/90 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 h-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-freelancer-text-primary">Bid Status Distribution</h2>
                    <span className="px-2 py-1 bg-freelancer-accent/20 rounded-full text-xs text-freelancer-accent border border-freelancer-accent/30">
                      Overview
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Pending Bids */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-freelancer-accent/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-freelancer-text-primary font-medium">Pending Bids</h4>
                      <div className="w-8 h-8 rounded-lg bg-freelancer-accent/20 flex items-center justify-center">
                        <ClockCircleOutlined className="text-freelancer-accent" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-semibold text-freelancer-accent">{bidStats.pendingBids}</span>
                      <span className="text-freelancer-text-secondary">of {bidStats.totalBids}</span>
                    </div>
                    <Progress 
                      percent={Math.round((bidStats.pendingBids / bidStats.totalBids) * 100)} 
                      showInfo={false}
                      strokeColor="var(--freelancer-accent)"
                      trailColor="rgba(255, 255, 255, 0.1)"
                    />
                  </div>

                  {/* Accepted Bids */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-freelancer-accent/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-freelancer-text-primary font-medium">Accepted Bids</h4>
                      <div className="w-8 h-8 rounded-lg bg-freelancer-accent/20 flex items-center justify-center">
                        <CheckCircleOutlined className="text-freelancer-accent" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-semibold text-freelancer-accent">{bidStats.acceptedBids}</span>
                      <span className="text-freelancer-text-secondary">of {bidStats.totalBids}</span>
                    </div>
                    <Progress 
                      percent={Math.round((bidStats.acceptedBids / bidStats.totalBids) * 100)} 
                      showInfo={false}
                      strokeColor="var(--freelancer-accent)"
                      trailColor="rgba(255, 255, 255, 0.1)"
                    />
                  </div>

                  {/* Rejected Bids */}
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:border-freelancer-accent/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-freelancer-text-primary font-medium">Rejected Bids</h4>
                      <div className="w-8 h-8 rounded-lg bg-freelancer-accent/20 flex items-center justify-center">
                        <CloseCircleOutlined className="text-freelancer-accent" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-2xl font-semibold text-freelancer-accent">{bidStats.rejectedBids}</span>
                      <span className="text-freelancer-text-secondary">of {bidStats.totalBids}</span>
                    </div>
                    <Progress 
                      percent={Math.round((bidStats.rejectedBids / bidStats.totalBids) * 100)} 
                      showInfo={false}
                      strokeColor="var(--freelancer-accent)"
                      trailColor="rgba(255, 255, 255, 0.1)"
                    />
                  </div>
                </div>
              </div>
            </div>
              </Col>
            </Row>

        {/* Recent Bids */}
        <Card className="bg-freelancer-bg-card rounded-2xl border border-white/10 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-freelancer-text-primary">Recent Bids</h2>
                <span className="px-2 py-1 bg-freelancer-accent/20 rounded-full text-xs text-freelancer-accent border border-freelancer-accent/30">
                  Latest Activity
                </span>
              </div>
              <div className="flex items-center gap-2">
              <Input
                placeholder="Search bids..."
                  prefix={<SearchOutlined className="text-freelancer-text-secondary" />}
                onChange={handleSearchChange}
                  className="w-48 bg-freelancer-bg-card border-white/10 text-freelancer-text-primary placeholder:text-freelancer-text-secondary hover:border-freelancer-accent/30 focus:border-freelancer-accent"
              />
              <Select
                  defaultValue=""
                  style={{ width: 120 }}
                onChange={handleFilterChange}
                  placeholder="Filter by status"
                  className="custom-select"
              >
                  <Option value="">All Status</Option>
                <Option value="Pending">Pending</Option>
                <Option value="Accepted">Accepted</Option>
                <Option value="Rejected">Rejected</Option>
              </Select>
            </div>
            </div>

            <div className="space-y-4">
              {paginatedData.map(bid => (
                <RecentBidCard key={bid.id} bid={bid} />
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredBids.length || bids.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                className="custom-pagination"
                prevIcon={<LeftOutlined className="text-freelancer-accent" />}
                nextIcon={<RightOutlined className="text-freelancer-accent" />}
              />
            </div>
            </div>
          </Card>
        </motion.div>

        <Modal
          title={
            <div className="flex items-center space-x-2">
            <span className="text-freelancer-text-primary text-lg">Bid Details</span>
              {selectedBid && (
              <Tag
                style={{ 
                  background: getStatusColor(selectedBid.status).color, 
                  color: '#fff', 
                  border: 0, 
                  borderRadius: '9999px', 
                  padding: '0.25rem 1rem'
                }}
              >
                {selectedBid.status}
              </Tag>
              )}
            </div>
          }
          open={showProposalModal}
          onCancel={() => setShowProposalModal(false)}
          width={700}
          footer={null}
        className="freelancer-modal-primary"
        bodyStyle={{ background: 'var(--freelancer-primary)' }}
        >
          {selectedBid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div className="p-4 bg-freelancer-bg-card rounded-md border border-freelancer-border-DEFAULT">
                    <p className="text-sm text-freelancer-primary">Your Bid</p>
                    <p className="text-xl font-semibold text-text-primary">{selectedBid.bidAmount}</p>
                    <p className="text-sm text-text-secondary mt-1">vs. avg {selectedBid.averageBid}</p>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="p-4 bg-freelancer-bg-card rounded-md border border-freelancer-border-DEFAULT">
                    <p className="text-sm text-freelancer-primary">Bid Position</p>
                    <p className="text-xl font-semibold text-text-primary">
                      #{selectedBid.bidPosition} of {selectedBid.competingBids}
                    </p>
                  </div>
                </Col>
              </Row>

              <div className="bg-freelancer-bg-card p-4 rounded-md border border-freelancer-border-DEFAULT">
                <p className="text-sm text-freelancer-primary mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBid.skills.map(skill => (
                    <Tag key={skill} className="bg-freelancer-bg-card text-freelancer-primary border border-freelancer-border-DEFAULT">
                      {skill}
                    </Tag>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-freelancer-primary mb-2">Your Proposal</p>
                <textarea
                  className="w-full p-3 border border-ui-border rounded-md focus:border-freelancer-primary focus:ring focus:ring-freelancer-primary/20"
                  rows="6"
                  placeholder="Detail your approach, timeline, and why you're the best fit..."
                />
              </div>
            </motion.div>
          )}
        </Modal>

      <style jsx global>{`
        .custom-progress .ant-progress-bg {
          background: var(--freelancer-accent) !important;
        }
        
        .custom-progress .ant-progress-text {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-card {
          background: var(--freelancer-bg-card) !important;
        }

        .ant-statistic-title {
          color: var(--freelancer-text-secondary) !important;
        }

        .ant-statistic-content {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-input {
          background: var(--freelancer-bg-card) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: var(--freelancer-text-primary) !important;
        }

        .ant-input::placeholder {
          color: var(--freelancer-text-secondary) !important;
        }

        .ant-select-selector {
          background: var(--freelancer-bg-card) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-select-selection-item {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-select-arrow {
          color: var(--freelancer-text-secondary) !important;
        }

        .ant-pagination-item {
          background: var(--freelancer-bg-card) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-pagination-item a {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-pagination-item-active {
          border-color: var(--freelancer-accent) !important;
        }

        .ant-pagination-item-active a {
          color: var(--freelancer-accent) !important;
        }

        .ant-pagination-prev .ant-pagination-item-link,
        .ant-pagination-next .ant-pagination-item-link {
          background: var(--freelancer-bg-card) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: var(--freelancer-text-primary) !important;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--freelancer-bg-card);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--freelancer-secondary);
          border-radius: 10px;
          border: 2px solid var(--freelancer-bg-card);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--freelancer-secondary);
        }

        /* Input styles */
        .ant-input {
          background: var(--freelancer-bg-card) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: var(--freelancer-text-primary) !important;
        }

        .ant-input:hover,
        .ant-input:focus {
          border-color: var(--freelancer-accent) !important;
          box-shadow: 0 0 0 2px rgba(var(--freelancer-accent-rgb), 0.2) !important;
        }

        .ant-input::placeholder {
          color: var(--freelancer-text-secondary) !important;
        }

        /* Select styles */
        .custom-select .ant-select-selector {
          background: var(--freelancer-bg-card) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: var(--freelancer-text-primary) !important;
        }

        .custom-select:hover .ant-select-selector {
          border-color: var(--freelancer-accent) !important;
        }

        .custom-select .ant-select-selection-item {
          color: var(--freelancer-text-primary) !important;
        }

        .custom-select .ant-select-arrow {
          color: var(--freelancer-text-secondary) !important;
        }

        .ant-select-dropdown {
          background: var(--freelancer-bg-card) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-select-item {
          color: var(--freelancer-text-primary) !important;
        }

        .ant-select-item-option-selected {
          background: rgba(var(--freelancer-accent-rgb), 0.1) !important;
          color: var(--freelancer-accent) !important;
        }

        .ant-select-item-option-active {
          background: rgba(var(--freelancer-accent-rgb), 0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default BiddingOverview;
