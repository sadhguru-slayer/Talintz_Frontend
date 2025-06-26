import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Avatar, Button, Input, Empty, List, Tag, Dropdown, Menu, Progress, DatePicker } from "antd";
import { FaUserPlus, FaSearch, FaEllipsisH, FaUserMinus, FaEnvelope, FaUserCheck } from "react-icons/fa";
import { IoSchoolOutline, IoPeopleCircle } from "react-icons/io5";
import { RiGraduationCapFill } from "react-icons/ri";
import { DownloadOutlined, SearchOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { faker } from "@faker-js/faker";

const { Search } = Input;
const { RangePicker } = DatePicker;

// Enhanced connection card with analytics
const ConnectionCard = ({ item, role, onAction }) => (
  <motion.div 
    whileHover={{ y: -5 }} 
    className="h-full"
  >
    <Card
      className="rounded-xl border border-white/10 hover:border-freelancer-accent transition-colors duration-200 h-full bg-freelancer-bg-card shadow-md"
      bodyStyle={{ background: 'transparent' }}
    >
      <div className="flex flex-col h-full">
        {/* Connection Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar src={item.avatar} size={48} className="border-2 border-white/20" />
            <div>
              <h3 className="text-lg font-medium text-text-light">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 text-text-light/60 text-sm">
                <ClockCircleOutlined />
                <span>{item.title}</span>
              </div>
            </div>
          </div>
          <Tag color="var(--freelancer-accent)" className="text-text-light border-0 bg-freelancer-accent/20">
            {faker.number.int({ min: 60, max: 100 })}% Match
          </Tag>
        </div>

        {/* Connection Details */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-text-light/60 mb-1">
            <span>Connection Strength</span>
            <span>{faker.number.int({ min: 60, max: 100 })}%</span>
          </div>
          <Progress 
            percent={faker.number.int({ min: 60, max: 100 })} 
            showInfo={false}
            strokeColor="var(--freelancer-accent)"
            trailColor="rgba(255, 255, 255, 0.1)"
          />
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['React', 'Node.js', 'UI/UX'].map((skill, i) => (
            <Tag 
              key={i}
              className="bg-freelancer-border-DEFAULT/50 text-text-light/60 border border-white/10"
            >
              {skill}
            </Tag>
          ))}
        </div>

        {/* Connection Footer */}
        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.mutualConnections && (
                <span className="text-text-light/60">
                  {item.mutualConnections} mutual connections
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                type="primary"
                className="border-0 transition-colors duration-200 bg-freelancer-accent hover:bg-freelancer-accent/90 text-text-light"
                icon={<FaEnvelope className="mr-2" />}
              >
                Message
              </Button>
              <Dropdown
                overlay={
                  <Menu className="bg-freelancer-bg-card border border-white/10">
                    <Menu.Item key="view-profile" className="text-text-light hover:text-white">
                      View Full Profile
                    </Menu.Item>
                    <Menu.Item key="remove" className="text-status-error hover:text-status-error">
                      Remove Connection
                    </Menu.Item>
        {role === 'student' && (
                      <Menu.Item key="academic" className="text-text-light hover:text-white">
                        Academic History
                      </Menu.Item>
                    )}
                  </Menu>
                }
              >
                <Button icon={<FaEllipsisH />} className="text-text-light hover:text-white" />
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
);

const Connections = () => {
  const { userId, role: originalRole, isEditable } = useOutletContext();
const role = originalRole === 'student' ? 'freelancer' : originalRole;
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("connections");
  
  // Dummy data for connections
  const connectionsData = [
    {
      id: 1,
      name: "Emma Wilson",
      title: "UX Designer",
      avatar: "https://randomuser.me/api/portraits/women/32.jpg",
      connected: true,
    },
    {
      id: 2,
      name: "James Rodriguez",
      title: "Frontend Developer",
      avatar: "https://randomuser.me/api/portraits/men/42.jpg",
      connected: true,
    },
    {
      id: 3,
      name: "Sophia Chen",
      title: "Project Manager",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      connected: true,
    },
    {
      id: 4,
      name: "David Kim",
      title: "Mobile Developer",
      avatar: "https://randomuser.me/api/portraits/men/56.jpg",
      connected: true,
    },
  ];
  
  // Dummy data for pending requests
  const pendingData = [
    {
      id: 5,
      name: "Olivia Taylor",
      title: "Content Strategist",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg",
      pending: true,
      sentByMe: false,
    },
    {
      id: 6,
      name: "Noah Martinez",
      title: "Backend Developer",
      avatar: "https://randomuser.me/api/portraits/men/33.jpg",
      pending: true,
      sentByMe: true,
    },
  ];
  
  // Dummy data for suggested connections
  const suggestedData = [
    {
      id: 7,
      name: "Ava Johnson",
      title: "UI Designer",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
      mutualConnections: 3,
    },
    {
      id: 8,
      name: "Liam Thompson",
      title: "DevOps Engineer",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg",
      mutualConnections: 2,
    },
    {
      id: 9,
      name: "Isabella Garcia",
      title: "Data Scientist",
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      mutualConnections: 5,
    },
    {
      id: 10,
      name: "Mason Lee",
      title: "Full Stack Developer",
      avatar: "https://randomuser.me/api/portraits/men/91.jpg",
      mutualConnections: 1,
    },
  ];

  // Add student-specific dummy data
  const universityNetworkData = role === 'student' ? [
    {
      id: 11,
      name: "Professor Smith",
      title: "Computer Science Dept.",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
      type: "faculty",
      courses: ["Machine Learning", "Algorithms"]
    },
    {
      id: 12,
      name: "Classmate Sarah",
      title: "Computer Science Student",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      type: "student",
      mutualCourses: 3
    }
  ] : [];

  const [connections, setConnections] = useState(connectionsData);
  const [pendingRequests, setPendingRequests] = useState(pendingData);
  const [suggestedConnections, setSuggestedConnections] = useState(suggestedData);

  useEffect(() => {
    // In a real app, you would fetch the connections data here
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [userId]);

  const handleSearch = (value) => {
    setSearchText(value);
    
    // Filter connections based on search text
    if (value) {
      const filteredConnections = connectionsData.filter(
        conn => conn.name.toLowerCase().includes(value.toLowerCase()) || 
                conn.title.toLowerCase().includes(value.toLowerCase())
      );
      setConnections(filteredConnections);
      
      const filteredPending = pendingData.filter(
        conn => conn.name.toLowerCase().includes(value.toLowerCase()) || 
                conn.title.toLowerCase().includes(value.toLowerCase())
      );
      setPendingRequests(filteredPending);
      
      const filteredSuggested = suggestedData.filter(
        conn => conn.name.toLowerCase().includes(value.toLowerCase()) || 
                conn.title.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestedConnections(filteredSuggested);
    } else {
      // Reset to original data
      setConnections(connectionsData);
      setPendingRequests(pendingData);
      setSuggestedConnections(suggestedData);
    }
  };

  const handleConnect = (id) => {
    // In a real app, you would send a connection request to the backend
    const newSuggested = suggestedConnections.filter(conn => conn.id !== id);
    setSuggestedConnections(newSuggested);
    
    const connToAdd = suggestedData.find(conn => conn.id === id);
    if (connToAdd) {
      setPendingRequests([
        ...pendingRequests,
        {
          ...connToAdd,
          pending: true,
          sentByMe: true
        }
      ]);
    }
  };

  const handleAccept = (id) => {
    // In a real app, you would accept the connection request via the backend
    const connToAccept = pendingRequests.find(conn => conn.id === id);
    if (connToAccept) {
      setConnections([
        ...connections,
        {
          ...connToAccept,
          connected: true,
          pending: false
        }
      ]);
      
      setPendingRequests(pendingRequests.filter(conn => conn.id !== id));
    }
  };

  const handleReject = (id) => {
    // In a real app, you would reject the connection request via the backend
    setPendingRequests(pendingRequests.filter(conn => conn.id !== id));
  };

  const handleRemoveConnection = (id) => {
    // In a real app, you would remove the connection via the backend
    setConnections(connections.filter(conn => conn.id !== id));
  };

  const handleCancelRequest = (id) => {
    // In a real app, you would cancel the connection request via the backend
    setPendingRequests(pendingRequests.filter(conn => conn.id !== id));
  };

  return (
    <div className="min-h-fit w-full bg-freelancer-primary">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-freelancer-accent/2 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-brand-accent/1 rounded-full blur-xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-6"
        >
          <div className="absolute inset-0 bg-freelancer-gradient-soft opacity-30"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-freelancer-accent/10 rounded-full blur-3xl -mr-24 lg:-mr-48 -mt-24 lg:-mt-48 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-brand-accent/8 rounded-full blur-2xl -ml-20 lg:-ml-40 -mb-20 lg:-mb-40 animate-float-delayed"></div>

            {/* Header Section */}
            <div className="mb-6">
              <div className="bg-freelancer-bg-card rounded-xl shadow-lg p-8 relative overflow-hidden border border-white/10">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-accent/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-light mb-4 text-center">
                      Professional Network
                    </h1>
                    <p className="text-text-light/80 text-center mb-8">
                  {role === 'student' ? 'Academic and Professional Connections' : 'Manage your professional relationships'}
                </p>

                    {/* Search Box */}
              <div className="flex gap-4">
                      <Input
                        size="large"
                        placeholder="Search connections..."
                        prefix={<SearchOutlined className="text-text-light/80" />}
                        className="flex-1 bg-transparent border border-white/10 rounded-lg text-text-light"
                        style={{ 
                          color: 'var(--text-light)',
                        }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                <Button
                  type="primary"
                        size="large"
                        className="bg-freelancer-accent hover:bg-freelancer-accent/90 border-0 text-text-light font-medium shadow-lg"
                        onClick={() => handleSearch(searchText)}
                >
                        Search
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>

            {/* Tabs Section */}
            <Card 
              className="rounded-xl border border-white/10 hover:border-freelancer-accent transition-colors duration-200 shadow-md bg-freelancer-bg-card"
              bodyStyle={{ padding: '24px', background: 'transparent' }}
            >
              <div className="flex gap-4 mb-6">
            {[
              { key: "connections", label: "Connections", count: connections.length },
              { key: "pending", label: "Pending", count: pendingRequests.length },
              { key: "suggestions", label: "Suggestions", count: suggestedConnections.length },
              ...(role === 'student' ? [{ key: "university", label: "University Network", count: universityNetworkData.length, icon: <IoSchoolOutline className="mr-2" /> }] : [])
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-3 font-medium transition-colors relative flex items-center rounded-lg
                  ${activeTab === tab.key 
                        ? 'bg-freelancer-accent/20 text-freelancer-accent' 
                        : 'text-text-light/60 hover:text-text-light hover:bg-white/5'
                  }`}
              >
                {tab.icon}
                {tab.label}
                    <Tag className={`ml-2 ${activeTab === tab.key ? 'bg-freelancer-accent text-white' : 'bg-white/10 text-text-light'} border-none`}>
                  {tab.count}
                </Tag>
              </button>
            ))}
          </div>
          
              {/* Tab Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {activeTab === "connections" && connections.map(item => (
                  <ConnectionCard key={item.id} item={item} role={role} />
                ))}
                {activeTab === "pending" && pendingRequests.map(item => (
                  <ConnectionCard key={item.id} item={item} role={role} />
                ))}
                {activeTab === "suggestions" && suggestedConnections.map(item => (
                  <ConnectionCard key={item.id} item={item} role={role} />
                ))}
                {role === 'student' && activeTab === "university" && universityNetworkData.map(item => (
                  <ConnectionCard key={item.id} item={item} role={role} />
                ))}
                          </div>
                        </Card>
          
        </motion.div>
      </div>

      <style jsx global>{`
        .ant-input {
          background-color: transparent !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
          color: var(--text-light) !important;
          
        }
        
        .ant-input:hover,
        .ant-input:focus {
          background-color: transparent !important;
          border-color: var(--freelancer-accent) !important;
          color: var(--text-light) !important;
        }
        
        .ant-input::placeholder {
          color: rgba(255, 255, 255, 0.6) !important;
          background: transparent !important;
        }
        
        .ant-input-prefix {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        /* Fix for the input wrapper */
        .ant-input-affix-wrapper {
          background-color: transparent !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }

        .ant-input-affix-wrapper:hover,
        .ant-input-affix-wrapper-focused {
          background-color: transparent !important;
          border-color: var(--freelancer-accent) !important;
        }

        /* Ensure the input inside the wrapper maintains the dark theme */
        .ant-input-affix-wrapper .ant-input {
          background: transparent !important;
        }

        /* Additional fixes for the input wrapper */
        .ant-input-affix-wrapper > input.ant-input {
          background: transparent !important;
        }

        /* Override any Ant Design default styles */
        .ant-input-affix-wrapper:not(.ant-input-affix-wrapper-disabled):hover {
          background-color: transparent !important;
        }

        .ant-input-affix-wrapper-focused,
        .ant-input-affix-wrapper:focus {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default Connections;
