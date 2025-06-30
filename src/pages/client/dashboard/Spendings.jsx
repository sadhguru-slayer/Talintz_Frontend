import React, { useEffect, useState, useCallback } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import { Card, Tag, Tabs, Button } from 'antd';
import { 
  DollarCircleOutlined, 
  ArrowUpOutlined, 
  CalendarOutlined,
  WalletOutlined,
  BarChartOutlined,
  ProjectOutlined,
  HomeOutlined,
  MoreOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import Cookies from 'js-cookie';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {getBaseURL} from '../../../config/axios';


// Register Chart.js components properly
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SpendingsInternal = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [activeTab, setActiveTab] = useState('overview');
  
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Spend Over Time',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        fill: false,
      },
    ],
  });

  const [spentOnProjects,setSpentOnProjects] = useState([]);
  const [pieChartData, setPieChartData] = useState(null);

  const [timeFrame, setTimeFrame] = useState('monthly'); 
  const fetchSpendingData = async (timeFrame) => {
    try {
      const accessToken = Cookies.get('accessToken');
      const csrftoken = Cookies.get('csrftoken');
      
      const response = await axios.get(`${getBaseURL()}/api/client/spending_data/`, {
        params: { time_frame: timeFrame },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-CSRFToken': csrftoken,
        },
      });
      
      setChartData(response.data);
      
    } catch (error) {
      console.error('Error fetching spending data:', error);
    }
  };
  
  useEffect(() => {
    fetchSpendingData(timeFrame); // Fetch data based on the current time frame
  }, [timeFrame]);

  useEffect(() => {
    const fetchSpendingDistributionByProject = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const csrftoken = Cookies.get('csrftoken');
        const response = await axios.get(`${getBaseURL()}/api/client/spending_distribution_by_project/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-CSRFToken': csrftoken,
          },
        });
        setSpentOnProjects(response.data);

        const paymentMethods = [];
        const paymentAmount = [];

        // Process the fetched data to calculate totals by payment method
        response.data.forEach((project) => {
          const method = project.payment_method;
          const amount = parseFloat(project.amount);

          if (paymentMethods.includes(method)) {
            const index = paymentMethods.indexOf(method);
            paymentAmount[index] += amount;
          } else {
            paymentMethods.push(method);
            paymentAmount.push(amount);
          }
        });

        setPieChartData({
          labels: paymentMethods,
          datasets: [
            {
              label: 'Payments by Method',
              data: paymentAmount,
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)', 
                'rgba(54, 162, 235, 0.6)', 
                'rgba(255, 206, 86, 0.6)', 
                'rgba(75, 192, 192, 0.6)', 
                'rgba(153, 102, 255, 0.6)',
              ].slice(0, paymentMethods.length),
              borderColor: 'rgba(255, 255, 255, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchSpendingDistributionByProject();
  }, []);
  
  const handleTimeFrameChange = useCallback((newTimeFrame) => {
    setTimeFrame(newTimeFrame);
  }, []);

  const format_timeStamp = useCallback((date)=>{
    const dateObject = new Date(date);
    return dateObject.toLocaleString();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const indexOfLastProject = currentPage * itemsPerPage;
  const indexOfFirstProject = indexOfLastProject - itemsPerPage;
  const currentProjects = spentOnProjects.slice(indexOfFirstProject, indexOfLastProject);
  
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
  }, []);
  
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(spentOnProjects.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }
  
  // Add new states for summary statistics
  const [spendingSummary, setSpendingSummary] = useState({
    totalSpent: 0,
    averageSpending: 0,
    highestSpending: 0,
    mostUsedPaymentMethod: '',
  });
  

  // Calculate summary when spentOnProjects changes
  useEffect(() => {
    if (spentOnProjects.length > 0) {
      const total = spentOnProjects.reduce((sum, project) => sum + parseFloat(project.amount), 0);
      const average = total / spentOnProjects.length;
      const highest = Math.max(...spentOnProjects.map(project => project.amount));
      
      // Calculate most used payment method
      const methodCounts = spentOnProjects.reduce((acc, project) => {
        acc[project.payment_method] = (acc[project.payment_method] || 0) + 1;
        return acc;
      }, {});
      const mostUsed = Object.entries(methodCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

      setSpendingSummary({
        totalSpent: total,
        averageSpending: average,
        highestSpending: highest,
        mostUsedPaymentMethod: mostUsed,
      });
    }
  }, [spentOnProjects]);

  const [loading, setLoading] = useState(false);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 bg-client-bg">
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mb-6 lg:mb-8 relative overflow-hidden"
      >
        {/* Premium Background with Multiple Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 rounded-xl lg:rounded-2xl"></div>
        <div className="absolute inset-0 bg-client-gradient-soft opacity-50 rounded-xl lg:rounded-2xl"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-client-accent/8 rounded-full blur-3xl -mr-24 lg:-mr-48 -mt-24 lg:-mt-48 animate-float"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-brand-accent/6 rounded-full blur-2xl -ml-20 lg:-ml-40 -mb-20 lg:-mb-40 animate-float-delayed"></div>
        
        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-client-accent/20 backdrop-blur-sm border border-client-accent/30 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6"
              >
                <span className="text-client-accent text-xs lg:text-sm font-semibold">Financial Analytics</span>
              </motion.div>

              <h1 className="text-2xl font-bold text-white mb-2">
                Spending Overview
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                  {`₹${spendingSummary.totalSpent.toLocaleString('en-IN')} Total Spent`}
                </span>
                <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                  {`${spentOnProjects.length} Transactions`}
                </span>
              </div>
            </div>

            {/* Time Frame Selector */}
            <div className="flex gap-2">
              {['weekly', 'monthly', 'yearly'].map((period) => (
                <Button
                  key={period}
                  size="small"
                  onClick={() => handleTimeFrameChange(period)}
                  className={`
                    ${timeFrame === period 
                      ? 'bg-client-accent text-white border-0' 
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'}
                  `}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
            {[
              { 
                icon: <DollarCircleOutlined />, 
                label: "Total Spent", 
                value: `₹${spendingSummary.totalSpent.toLocaleString('en-IN')}` 
              },
              { 
                icon: <WalletOutlined />, 
                label: "Average/Project", 
                value: `₹${spendingSummary.averageSpending.toLocaleString('en-IN')}` 
              },
              { 
                icon: <ArrowUpOutlined />, 
                label: "Highest Payment", 
                value: `₹${spendingSummary.highestSpending.toLocaleString('en-IN')}` 
              },
              { 
                icon: <ProjectOutlined />, 
                label: "Payment Method", 
                value: spendingSummary.mostUsedPaymentMethod 
              }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 + (i * 0.1) }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                  <p className="text-white font-semibold">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Spending Trends Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="col-span-12 lg:col-span-8"
        >
          <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Spending Trends</h3>
              <Button 
                type="text" 
                size="small"
                className="text-white/60 hover:text-white"
                icon={<MoreOutlined />}
              />
            </div>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="w-32 h-6 rounded-full bg-white/10 animate-pulse mb-4" />
                <div className="w-full h-2 rounded-full bg-white/10 animate-pulse" />
              </div>
            ) : (
              <div className="h-[300px] relative">
                <Line
                  data={{
                    ...chartData,
                    datasets: chartData.datasets.map(ds => ({
                      ...ds,
                      borderWidth: 3,
                      pointRadius: 5,
                      pointHoverRadius: 8,
                      pointBackgroundColor: 'rgba(49,130,206,1)', // client-accent
                      pointBorderColor: 'rgba(255,255,255,0.8)',
                      pointBorderWidth: 2,
                      fill: true,
                      backgroundColor: (ctx) => {
                        const chart = ctx.chart;
                        const {ctx: canvas, chartArea} = chart;
                        if (!chartArea) return null;
                        const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(49,130,206,0.25)'); // client-accent
                        gradient.addColorStop(1, 'rgba(49,130,206,0.02)');
                        return gradient;
                      },
                      borderColor: (ctx) => {
                        const chart = ctx.chart;
                        const {ctx: canvas, chartArea} = chart;
                        if (!chartArea) return 'rgba(49,130,206,1)';
                        const gradient = canvas.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                        gradient.addColorStop(0, 'rgba(49,130,206,1)');
                        gradient.addColorStop(1, 'rgba(26,54,93,1)');
                        return gradient;
                      },
                      tension: 0.45, // smooth curve
                    }))
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        backgroundColor: 'rgba(30,41,59,0.85)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        borderWidth: 1,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        boxPadding: 6,
                        cornerRadius: 8,
                        callbacks: {
                          label: (context) => {
                            const value = context.parsed.y;
                            return `₹${value?.toLocaleString('en-IN')}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(255,255,255,0.08)',
                          borderDash: [4, 4]
                        },
                        ticks: {
                          color: 'rgba(255,255,255,0.7)',
                          font: { size: 13 }
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: 'rgba(255,255,255,0.7)',
                          font: { size: 13 }
                        }
                      }
                    },
                    animation: {
                      duration: 1200,
                      easing: 'easeOutQuart'
                    }
                  }}
                />
                {/* Optional: Add a floating accent orb for extra premium feel */}
                <div className="absolute top-8 right-8 w-12 h-12 bg-client-accent/20 rounded-full blur-2xl pointer-events-none" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Methods Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="col-span-12 lg:col-span-4"
        >
          <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10 min-h-[340px] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Payment Methods</h3>
              <Button 
                type="text" 
                size="small"
                className="text-white/60 hover:text-white"
                icon={<MoreOutlined />}
              />
            </div>
            <div className="flex-1 flex items-center justify-center">
              {pieChartData && pieChartData.labels.length > 0 ? (
                <Pie 
                  data={{
                    ...pieChartData,
                    datasets: [{
                      ...pieChartData.datasets[0],
                      backgroundColor: [
                        'rgba(26, 54, 93, 0.8)',  // client-primary
                        'rgba(44, 82, 130, 0.8)', // client-secondary
                        'rgba(49, 130, 206, 0.8)', // client-accent
                        'rgba(56, 161, 105, 0.8)', // status-success
                        'rgba(221, 107, 32, 0.8)', // status-warning
                      ].slice(0, pieChartData.labels.length),
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 2,
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          color: 'rgba(255, 255, 255, 0.7)',
                          padding: 15,
                          font: { size: 12 }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        boxPadding: 4
                      }
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-12">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 shadow-lg">
                    <WalletOutlined className="text-client-accent text-3xl" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-white font-semibold text-lg mb-1">No Payment Methods</h4>
                    <p className="text-white/60 text-sm mb-2">You haven't made any payments yet.</p>
                    <Button 
                      type="primary"
                      className="bg-client-accent hover:bg-client-accent/90"
                      onClick={() => {/* Optional: navigate to add funds or help */}}
                    >
                      Make a Payment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="col-span-12"
        >
          <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Payment History</h3>
              <Button 
                type="text" 
                size="small"
                className="text-white/60 hover:text-white"
                icon={<MoreOutlined />}
              />
            </div>
            {currentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4 shadow-lg">
                  <DollarCircleOutlined className="text-client-accent text-3xl" />
                </div>
                <h4 className="text-white font-semibold text-lg mb-1">No Payment History</h4>
                <p className="text-white/60 text-sm mb-2">You haven't made any payments yet.</p>
                <Button 
                  type="primary"
                  className="bg-client-accent hover:bg-client-accent/90"
                  onClick={() => {/* Optional: navigate to add funds or help */}}
                >
                  Make a Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {currentProjects.map((project, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                    className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-client-accent/20 flex items-center justify-center text-client-accent shadow">
                        <DollarCircleOutlined className="text-2xl" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-base">
                          {project.task_id ? project.task_title : project.project_name}
                        </h4>
                        <p className="text-white/60 text-xs">
                          {format_timeStamp(project.payment_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-white font-semibold text-lg">
                        ₹{project.amount.toLocaleString('en-IN')}
                      </span>
                      <Tag className="bg-client-accent/20 text-client-accent border-0 text-base px-3 py-1 rounded-full">
                        {project.payment_method}
                      </Tag>
                      {/* Premium Action: Download Receipt */}
                      <Button
                        type="text"
                        className="text-client-accent hover:text-client-primary transition-all duration-200"
                        icon={<DownloadOutlined />}
                        onClick={() => {/* TODO: implement download receipt */}}
                      >
                        <span className="hidden md:inline">Receipt</span>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {currentProjects.length > 0 && (
              <div className="flex justify-center mt-6 gap-2">
                <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`
                    ${currentPage === 1 
                      ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                      : 'bg-white/10 text-white hover:bg-white/20'}
                  `}
                >
                  Previous
                </Button>
                {pageNumbers.map(number => (
                  <Button
                    key={number}
                    onClick={() => handlePageChange(number)}
                    className={`
                      ${currentPage === number 
                        ? 'bg-client-accent text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'}
                    `}
                  >
                    {number}
                  </Button>
                ))}
                <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pageNumbers.length}
                  className={`
                    ${currentPage === pageNumbers.length 
                      ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                      : 'bg-white/10 text-white hover:bg-white/20'}
                  `}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const Spendings = React.memo(SpendingsInternal);

export default Spendings;