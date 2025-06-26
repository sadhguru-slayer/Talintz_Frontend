import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, Col, Row, Statistic, Table, Tooltip, Pagination, Progress, Badge, Timeline, Select, Button, Tag, DatePicker, Spin } from "antd";
import { Chart as ChartJS } from 'chart.js/auto';
import { Line, Doughnut, Bar, Radar } from "react-chartjs-2";
import { 
  SearchOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  DollarOutlined, UserOutlined, ThunderboltOutlined, ExclamationCircleOutlined,
  StarOutlined, TrophyOutlined, DownloadOutlined, ReloadOutlined 
} from "@ant-design/icons";
import { faker } from "@faker-js/faker";
import { motion, AnimatePresence } from "framer-motion";
import '../../../assets/css/FreelancerAnalyticsPage.css';

const FreelancerAnalyticsPage = () => {
  
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState("bids");
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [activityData, setActivityData] = useState([]);
  const lineChartRef = useRef(null);
  const radarChartRef = useRef(null);
  const doughnutChartRef = useRef(null);
  const { RangePicker } = DatePicker;

  // Helper to get CSS variable value
  const getCSSVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;

  // In your component, after mount (useEffect), set the colors:
  const [chartColors, setChartColors] = useState({
    accent: "#00D4AA",      // fallback
    secondary: "#6366F1",   // fallback
    orange: "#F59E0B"       // fallback
  });

  useEffect(() => {
    setChartColors({
      accent: getCSSVar('--freelancer-accent') || "#00D4AA",
      secondary: getCSSVar('--freelancer-secondary') || "#6366F1",
      orange: getCSSVar('--freelancer-orange') || "#F59E0B"
    });
  }, []);

  // Enhanced random data generation with date range support
  const generateRandomData = (range = timeRange) => {
    let data = [];
    const days = range === "week" ? 7 : range === "month" ? 30 : 90;
    
    for (let i = 0; i < days; i++) {
      data.push({
        date: `Day ${i + 1}`,
        bidsPlaced: faker.number.int({ min: 1, max: 15 }),
        bidsAccepted: faker.number.int({ min: 1, max: 10 }),
        bidsRejected: faker.number.int({ min: 0, max: 5 }),
        averageBidAmount: faker.number.int({ min: 15000, max: 50000 }),
        projectsCompleted: faker.number.int({ min: 1, max: 5 }),
        clientRatings: faker.number.float({ min: 4, max: 5, precision: 0.1 }),
        hoursWorked: faker.number.int({ min: 20, max: 50 }),
        earnings: faker.number.int({ min: 25000, max: 75000 }),
        clientSatisfaction: faker.number.int({ min: 70, max: 100 }),
        disputesRaised: faker.number.int({ min: 0, max: 2 })
      });
    }
    return data;
  };

  useEffect(() => {
    setActivityData(generateRandomData());
  }, [timeRange, dateRange]);

  // Enhanced analytics data
  const analyticsData = {
    earnings: {
      total: "₹850,000",
      trend: "+15%",
      breakdown: {
        completed: "₹650,000",
        ongoing: "₹150,000",
        disputed: "₹50,000"
      },
      hourlyRate: "₹2,500",
      pendingPayments: "₹125,000",
      projectedEarnings: "₹500,000"
    },
    projectMetrics: {
      totalProjects: 25,
      completionRate: 92,
      avgRating: 4.8,
      disputeRate: 3,
      activeProjects: 5,
      upcomingDeadlines: 3
    },
    bidding: {
      successRate: 75,
      avgResponseTime: "4.2 hours",
      competitivenessScore: 8.5,
      totalBids: activityData.reduce((sum, day) => sum + day.bidsPlaced, 0),
      acceptanceRate: "68%"
    },
    quality: {
      codeQuality: "95%",
      bugRate: "0.5%",
      testCoverage: "88%",
      documentationScore: "92%"
    },
    disputes: {
      total: 2,
      resolved: 1,
      pending: 1,
      avgResolutionTime: "48 hours",
      resolutionRate: "95%",
      riskLevel: "Low",
      commonReasons: [
        { reason: "Deadline issues", count: 3 },
        { reason: "Scope changes", count: 2 },
        { reason: "Communication gaps", count: 1 }
      ]
    },
    skills: {
      topEarning: ["React", "Node.js", "AWS"],
      performance: {
        technical: 85,
        communication: 90,
        deliveryTime: 78,
        quality: 88,
        problemSolving: 82,
        collaboration: 95
      }
    }
  };

  // Weekly activity data with enhanced styling
  const generateActivityData = () => ({
    labels: activityData.map(item => item.date),
    datasets: [
      {
        label: "Bids Placed",
        data: activityData.map(item => item.bidsPlaced),
        borderColor: chartColors.accent,
        backgroundColor: "rgba(0, 212, 170, 0.2)",
        fill: true,
        tension: 0.4
      },
      {
        label: "Bids Accepted",
        data: activityData.map(item => item.bidsAccepted),
        borderColor: chartColors.secondary,
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        fill: true,
        tension: 0.4
      },
      {
        label: "Client Satisfaction",
        data: activityData.map(item => item.clientSatisfaction),
        borderColor: chartColors.orange,
        backgroundColor: "rgba(245, 158, 11, 0.2)",
        fill: true,
        tension: 0.4
      }
    ]
  });

  // Enhanced skills radar data with violet theme
  const skillsPerformanceData = {
    labels: ["Technical Skills", "Communication", "Delivery Time", "Quality", "Problem Solving", "Collaboration"],
    datasets: [{
      label: "Your Performance",
      data: Object.values(analyticsData.skills.performance),
      backgroundColor: "rgba(0, 212, 170, 0.2)",
      borderColor: chartColors.accent,
      pointBackgroundColor: chartColors.accent,
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: chartColors.accent
    }]
  };

  // Project distribution data with violet theme
  const projectDistributionData = useMemo(() => ({
    labels: ["Completed", "In Progress", "Disputed"],
    datasets: [{
      data: [75, 20, 5],
      backgroundColor: [
        chartColors.accent,
        chartColors.secondary,
        chartColors.orange
      ],
      borderColor: "#18192B", // fallback for var(--freelancer-bg-card)
      borderWidth: 2,
      hoverOffset: 4
    }]
  }), [chartColors]);

  // Dispute timeline
  const disputeTimeline = [
    {
      color: "red",
      children: (
        <div className="flex flex-col">
          <span className="font-medium">Scope Change Dispute</span>
          <span className="text-sm text-gray-500">Client requested additional features</span>
          <span className="text-xs text-red-500">2 days ago - Pending</span>
        </div>
      )
    },
    {
      color: "green",
      children: (
        <div className="flex flex-col">
          <span className="font-medium">Payment Dispute Resolved</span>
          <span className="text-sm text-gray-500">Milestone payment cleared</span>
          <span className="text-xs text-green-500">5 days ago - Resolved</span>
        </div>
      )
    }
  ];

  useEffect(() => {
    return () => {
      if (lineChartRef.current) lineChartRef.current.destroy();
      if (radarChartRef.current) radarChartRef.current.destroy();
      if (doughnutChartRef.current) doughnutChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="p-6 bg-freelancer-primary min-h-screen overflow-y-auto custom-scrollbar">
      {/* Enhanced Header Section */}
      <div className="mb-8">
        <div className="bg-freelancer-bg-card rounded-xl shadow-lg p-8 relative overflow-hidden border border-white/10">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-accent/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
          
          <div className="relative z-10">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-freelancer-text-primary mb-4 text-center">
                Analytics Dashboard
              </h1>
              <p className="text-freelancer-text-secondary text-center mb-8">
                Track your performance and growth metrics
              </p>

              {/* Controls */}
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  className="analytics-datepicker w-full md:w-72"
                />
                <Select
                  value={timeRange}
                  onChange={setTimeRange}
                  className="analytics-select w-full md:w-32"
                  options={[
                    { value: "week", label: "This Week" },
                    { value: "month", label: "This Month" },
                    { value: "quarter", label: "This Quarter" }
                  ]}
                />
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    className="bg-freelancer-accent text-white hover:bg-freelancer-accent/90 
                      border-none shadow-lg w-full md:w-auto"
                  >
                    Export
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setLoading(true);
                      setTimeout(() => setLoading(false), 1000);
                    }}
                    className="bg-freelancer-secondary/20 text-white hover:bg-freelancer-secondary/30 
                      border-white/20 w-full md:w-auto"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Spin spinning={loading}>
        {/* Enhanced Key Metrics Section */}
        <Row gutter={[16, 16]} className="mb-8">
          {/* Enhanced Stat Cards */}
          <Col xs={24} sm={12} lg={6}>
            <div className="h-full">
              <Card 
                className="h-full overflow-hidden relative bg-freelancer-bg-card border border-white/10 shadow-md  transition-all duration-DEFAULT"
                bodyStyle={{ background: "transparent" }}
              >
                <Statistic
                  title={
                    <span className="text-freelancer-text-primary font-medium flex items-center gap-2">
                      <DollarOutlined className="text-freelancer-accent" />
                      Total Earnings
                    </span>
                  }
                  value={analyticsData.earnings.total}
                  valueStyle={{ color: 'var(--freelancer-text-primary)', fontWeight: '600' }}
                  suffix={
                    <Tag color="success" className="ml-2 ">
                      {analyticsData.earnings.trend}
                    </Tag>
                  }
                />
                <p className="text-sm text-freelancer-text-secondary mt-2">
                  Hourly Rate: {analyticsData.earnings.hourlyRate}
                </p>
              </Card>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="h-full">
              <Card 
                className="h-full overflow-hidden relative bg-freelancer-bg-card border border-white/10 shadow-md  transition-all duration-DEFAULT"
                bodyStyle={{ background: "transparent" }}
              >
                <Statistic
                  title={
                    <span className="text-freelancer-text-primary font-medium flex items-center gap-2">
                      <CheckCircleOutlined className="text-freelancer-accent" />
                      Project Success Rate
                    </span>
                  }
                  value={analyticsData.projectMetrics.completionRate}
                  valueStyle={{ color: 'var(--freelancer-text-primary)', fontWeight: '600' }}
                  suffix="%"
                />
                <p className="text-sm text-freelancer-text-secondary mt-2">
                  Active Projects: {analyticsData.projectMetrics.activeProjects}
                </p>
              </Card>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="h-full">
              <Card 
                className="h-full overflow-hidden relative bg-freelancer-bg-card border border-white/10 shadow-md  transition-all duration-DEFAULT"
                bodyStyle={{ background: "transparent" }}
              >
                <Statistic
                  title={
                    <span className="text-freelancer-text-primary font-medium flex items-center gap-2">
                      <ThunderboltOutlined className="text-freelancer-accent" />
                      Bid Success Rate
                    </span>
                  }
                  value={analyticsData.bidding.successRate}
                  valueStyle={{ color: 'var(--freelancer-text-primary)', fontWeight: '600' }}
                  suffix="%"
                />
                <p className="text-sm text-freelancer-text-secondary mt-2">
                  Response Time: {analyticsData.bidding.avgResponseTime}
                </p>
              </Card>
            </div>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <div className="h-full">
              <Card 
                className="h-full overflow-hidden relative bg-freelancer-bg-card border border-white/10 shadow-md  transition-all duration-DEFAULT"
                bodyStyle={{ background: "transparent" }}
              >
                <Statistic
                  title={
                    <span className="text-freelancer-text-primary font-medium flex items-center gap-2">
                      <WarningOutlined className="text-freelancer-accent" />
                      Dispute Rate
                    </span>
                  }
                  value={analyticsData.projectMetrics.disputeRate}
                  valueStyle={{ color: 'var(--freelancer-text-primary)', fontWeight: '600' }}
                  suffix="%"
                />
                <p className="text-sm text-freelancer-text-secondary mt-2">
                  Resolution Rate: {analyticsData.disputes.resolutionRate}
                </p>
              </Card>
            </div>
          </Col>
        </Row>

        {/* Enhanced Charts Section */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={16}>
            <Card 
              title={
                <div className="flex items-center justify-between">
                  <span className="text-freelancer-text-primary font-semibold">Performance Trends</span>
                  <Select
                    defaultValue="bids"
                    className="w-40"
                    options={[
                      { value: "bids", label: "Bidding Activity" },
                      { value: "earnings", label: "Earnings" },
                      { value: "satisfaction", label: "Client Satisfaction" }
                    ]}
                    onChange={(value) => setSelectedMetric(value)}
                  />
                </div>
              }
              className="bg-freelancer-bg-card/90 border border-white/10 shadow-md transition-shadow duration-DEFAULT"
              bodyStyle={{ background: "transparent" }}
            >
              <div className="h-80">
                <Line
                  ref={lineChartRef}
                  data={generateActivityData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 0
                    },
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          color: "grey",
                          usePointStyle: true,
                          font: { family: "'Inter', sans-serif" }
                        }
                      },
                      tooltip: {
                        backgroundColor: "var(--freelancer-bg-card)",
                        titleColor: "var(--freelancer-text-primary)",
                        bodyColor: "var(--freelancer-text-secondary)",
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: "rgba(255,255,255,0.08)" },
                        ticks: { color: "grey" }
                      },
                      x: {
                        grid: { color: "rgba(255,255,255,0.08)" },
                        ticks: { color: "grey" }
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title={<span className="text-freelancer-text-primary">Skills Performance</span>} className="h-full bg-freelancer-bg-card border border-white/10 shadow-md " bodyStyle={{ background: "transparent" }}>
              <div className="h-80">
                <Radar
                  ref={radarChartRef}
                  id="skillsPerformanceChart"
                  data={skillsPerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 0
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: "grey",
                          font: { family: "'Inter', sans-serif" }
                        }
                      }
                    },
                    scales: {
                      r: {
                        pointLabels: { color: "grey" },
                        angleLines: { color: "rgba(255,255,255,0.08)" },
                        grid: { color: "rgba(255,255,255,0.08)" },
                        ticks: { color: "var(--freelancer-text-secondary)" }
                      }
                    }
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Project Distribution and Quality Metrics */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card title={<span className="text-freelancer-text-primary">Project Distribution</span>} className="h-full bg-freelancer-bg-card border border-white/10 shadow-md " bodyStyle={{ background: "transparent" }}>
              <div className="h-80">
                <Doughnut
                  ref={doughnutChartRef}
                  id="projectDistribution"
                  data={projectDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                      duration: 0
                    },
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          color: "grey",
                          font: {
                            family: "'Inter', sans-serif"
                          },
                          padding: 20
                        }
                      }
                    },
                    cutout: '60%'
                  }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title={<span className="text-freelancer-text-primary">Quality Metrics</span>} className="h-full bg-freelancer-bg-card border border-white/10 shadow-md " bodyStyle={{ background: "transparent" }}>
              {Object.entries(analyticsData.quality).map(([key, value]) => (
                <div key={key} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1">
                    <span className="text-freelancer-text-primary capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-green-600">{value}</span>
                  </div>
                  <Progress
                    percent={parseInt(value)}
                    strokeColor="var(--freelancer-accent)"
                    trailColor="rgba(255, 255, 255, 0.1)"
                    showInfo={false}
                  />
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        {/* Enhanced Dispute Management Section */}
        <Row gutter={[16, 16]} className="mb-8">
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <WarningOutlined className="text-status-error" />
                  <span className="text-freelancer-text-primary font-semibold">Dispute Management</span>
                </div>
              }
              className="bg-freelancer-bg-card/90 border border-white/10 shadow-md transition-shadow duration-DEFAULT"
              bodyStyle={{ background: "transparent" }}
            >
              <Timeline
                items={disputeTimeline.map(item => ({
                  ...item,
                  children: (
                    <div className="flex flex-col">
                      <span className="font-medium text-freelancer-text-primary">{item.children.props.children[0].props.children}</span>
                      <span className="text-sm text-freelancer-text-secondary">{item.children.props.children[1].props.children}</span>
                      <span className={`text-xs ${item.color === "red" ? "text-status-error" : "text-status-success"}`}>
                        {item.children.props.children[2].props.children}
                      </span>
                    </div>
                  )
                }))}
              />
              <div className="mt-4">
                <h4 className="font-medium mb-2 text-text-muted">Common Dispute Reasons</h4>
                {analyticsData.disputes.commonReasons.map((reason, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between text-sm text-text-secondary">
                      <span>{reason.reason}</span>
                      <span className="">{reason.count} cases</span>
                    </div>
                    <Progress 
                      percent={reason.count * 20} 
                      showInfo={false}
                      strokeColor="var(--freelancer-accent)"
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <ThunderboltOutlined className="text-freelancer-accent" />
                  <span className="text-freelancer-text-primary font-semibold">Risk Analysis & Recommendations</span>
                </div>
              }
              className="bg-freelancer-bg-card/90 border border-white/10 shadow-md transition-shadow duration-DEFAULT"
              bodyStyle={{ background: "transparent" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="p-4 bg-freelancer-bg-card rounded-xl">
                    <h4 className="text-freelancer-text-primary font-medium mb-2">Risk Level</h4>
                    <Progress
                      type="circle"
                      percent={75}
                      format={() => (
                        <span className="text-freelancer-text-secondary">
                          {analyticsData.disputes.riskLevel}
                        </span>
                      )}
                      strokeColor={{
                        "0%": "var(--freelancer-accent)",
                        "100%": "var(--freelancer-accent)"
                      }}
                    />
                  </div>
                </Col>
                <Col xs={24} md={16}>
                  <div className="space-y-4">
                    <div className="p-4 bg-freelancer-bg-card rounded-xl">
                      <h4 className="text-freelancer-text-primary font-medium mb-2">Recommendations</h4>
                      <ul className="list-disc list-inside text-freelancer-text-secondary">
                        <li>Maintain response time below industry average</li>
                        <li>Document project milestones clearly</li>
                        <li>Regular progress updates to prevent disputes</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-freelancer-bg-card rounded-xl">
                      <h4 className="text-freelancer-text-primary font-medium mb-2">Top Earning Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {analyticsData.skills.topEarning.map(skill => (
                          <Tag key={skill} color="var(--freelancer-accent)">{skill}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default FreelancerAnalyticsPage;

<style jsx global>{`
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
`}</style>
