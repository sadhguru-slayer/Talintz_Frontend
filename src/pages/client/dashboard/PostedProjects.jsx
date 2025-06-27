import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, Button, Table, Input, Select, Pagination, Tabs, Tag } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {motion} from 'framer-motion'
import { 
  SearchOutlined, CalendarOutlined, UserOutlined, 
  HomeOutlined, ReloadOutlined, MoreOutlined,
  FileTextOutlined, TeamOutlined, ClockCircleOutlined
} from "@ant-design/icons";
import { FaEye, FaBriefcase, FaClock, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useMediaQuery } from 'react-responsive';
import './PostedProjects.css'

const { Option } = Select;

// Simplified WorkspaceTab without animations
const WorkspaceTab = ({ selectedProject }) => (
  <div className="space-y-6">
    {/* Ongoing Projects Section */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Ongoing Projects</h3>
      <div className="grid gap-4">
        {selectedProject?.ongoingProjects?.map((project) => (
          <div
            key={project.id}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-medium">{project.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Tag className="bg-client-accent/20 text-client-accent border-0">
                    {project.type}
                  </Tag>
                  <span className="text-white/60 text-sm">
                    Due: {project.deadline}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white/80 text-sm mb-1">{project.status}</div>
                <div className="text-white/60 text-xs">Updated {project.lastUpdate}</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Progress</span>
                <span className="text-white">{project.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="h-full rounded-full bg-client-accent"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <TeamOutlined className="text-white/60" />
              <div className="flex -space-x-2">
                {project.team.map((member, index) => (
                  <div
                    key={index}
                    className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs text-white"
                  >
                    {member.split(' ')[0][0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Recent Updates Section */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Recent Updates</h3>
      <div className="space-y-3">
        {selectedProject?.recentUpdates?.map((update) => (
          <div
            key={update.id}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-3 hover:bg-white/10 transition-colors duration-200"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-client-accent/20 flex items-center justify-center flex-shrink-0">
                <UserOutlined className="text-client-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm">
                  <span className="font-medium">{update.user}</span> updated {update.project}
                </p>
                <p className="text-white/60 text-sm mt-1">{update.update}</p>
                <span className="text-white/40 text-xs mt-1 block">{update.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Then, update the tabItems definition to use a function that returns the items
const getTabItems = (selectedProject) => [
  {
    label: (
      <span className="flex items-center gap-2">
        <TeamOutlined className="text-client-accent" />
        Workspace
      </span>
    ),
    key: 'workspace',
    children: <WorkspaceTab selectedProject={selectedProject} />
  },
  {
    label: (
      <span className="flex items-center gap-2">
        <FaClock className="text-client-primary" />
        Milestones
      </span>
    ),
    key: '1',
    children: (
      <div className="space-y-4">
        {selectedProject?.milestones?.map((milestone, index) => (
          <div key={index} className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-white">{milestone.title}</h4>
              <Tag color={getStatusColor(milestone.status, milestone.health).color}>
                {milestone.status}
              </Tag>
            </div>
            <p className="text-white/60 mt-2">{milestone.description}</p>
            <div className="mt-2 text-sm text-white/40">
              Due: {milestone.deadline}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: (
      <span className="flex items-center gap-2">
        <FaBriefcase className="text-client-primary" />
        Shared Files
      </span>
    ),
    key: '2',
    children: (
      <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <p className="text-white/60">File sharing and uploads will go here.</p>
      </div>
    ),
  },
  {
    label: (
      <span className="flex items-center gap-2">
        <UserOutlined className="text-client-primary" />
        Messages
      </span>
    ),
    key: '3',
    children: (
      <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <p className="text-white/60">Messaging and collaboration tools will go here.</p>
      </div>
    ),
  },
];

// Add this component for the empty state
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <FaBriefcase className="text-4xl text-gray-300 mb-4" />
    <p className="text-text-secondary text-lg">{message}</p>
  </div>
);

const PostedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'workspace'
  
  const pageSize = 4;
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Add workspaceData inside the component
  const workspaceData = useMemo(() => ({
    ongoingProjects: [
      {
        id: 1,
        title: "E-commerce Website Redesign",
        type: "Traditional",
        progress: 65,
        deadline: "2024-04-15",
        team: ["John D.", "Sarah M."],
        lastUpdate: "2 hours ago",
        status: "In Progress"
      },
      {
        id: 2,
        title: "Mobile App Development",
        type: "OBSP",
        progress: 80,
        deadline: "2024-04-20",
        team: ["Mike R.", "Lisa K."],
        lastUpdate: "1 hour ago",
        status: "In Progress"
      },
      {
        id: 3,
        title: "Brand Identity Design",
        type: "OBSP",
        progress: 45,
        deadline: "2024-05-01",
        team: ["Alex W."],
        lastUpdate: "3 hours ago",
        status: "In Progress"
      }
    ],
    recentUpdates: [
      {
        id: 1,
        project: "E-commerce Website Redesign",
        update: "Completed homepage wireframes",
        time: "2 hours ago",
        user: "John D."
      },
      {
        id: 2,
        project: "Mobile App Development",
        update: "Implemented user authentication",
        time: "1 hour ago",
        user: "Mike R."
      },
      {
        id: 3,
        project: "Brand Identity Design",
        update: "Delivered initial logo concepts",
        time: "3 hours ago",
        user: "Alex W."
      }
    ]
  }), []);

  // Calculate project health based on milestones and deadlines
  const calculateProjectHealth = (project) => {
    const now = new Date();
    const deadline = new Date(project.deadline);
    const timeLeft = deadline - now;
    const totalDuration = new Date(project.deadline) - new Date(project.created_at);
    const progress = 1 - (timeLeft / totalDuration);

    if (project.status === 'completed') return 'completed';
    if (progress > 0.9) return 'critical';
    if (progress > 0.7) return 'warning';
    return 'healthy';
  };

  // Enhanced status colors based on tailwind config
  const getStatusColor = (status, health) => {
    const colors = {
      pending: {
        color: '#1A365D', // brand.primary
        bg: 'bg-brand-neutral',
        text: 'text-text-secondary'
      },
      ongoing: {
        color: '#38A169', // status.success
        bg: 'bg-status-success/10',
        text: 'text-status-success'
      },
      completed: {
        color: '#38A169', // status.success
        bg: 'bg-status-success/10',
        text: 'text-status-success'
      },
      critical: {
        color: '#E53E3E', // status.error
        bg: 'bg-status-error/10',
        text: 'text-status-error'
      },
      warning: {
        color: '#DD6B20', // status.warning
        bg: 'bg-status-warning/10',
        text: 'text-status-warning'
      }
    };

    if (health === 'critical') return colors.critical;
    if (health === 'warning') return colors.warning;
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getAuthHeaders = () => {
    const accessToken = Cookies.get("accessToken");
    return { Authorization: `Bearer ${accessToken}` };
  };

  // Optimize data fetching with useCallback
  const fetchTheProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://talintzbackend-production.up.railway.app/api/client/posted_projects/', {
        headers: getAuthHeaders(),
        // Add cache control
        params: { _t: Date.now() } // Prevent caching
      });
      
      const projectsData = response.data.map(project => ({
        ...project,
        isOBSP: project.type === 'OBSP',
        packType: project.budget <= 10000 ? 'Basic' : project.budget <= 20000 ? 'Mid' : 'Premium',
        health: calculateProjectHealth(project),
        progress: calculateProgress(project),
      }));

      setProjects(projectsData);
      setFilteredProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateProgress = (project) => {
    const now = new Date();
    const start = new Date(project.created_at);
    const end = new Date(project.deadline);
    const total = end - start;
    const elapsed = now - start;
    return Math.min(Math.max(elapsed / total, 0), 1);
  };

  // Optimize filtering with useMemo
  const filteredProjectsList = useMemo(() => {
    return projects.filter((project) => {
      const matchesStatus = !statusFilter || 
        project.status.toLowerCase().includes(statusFilter.toLowerCase());
      const matchesSearch = !searchTerm || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, searchTerm]);

  // Optimize pagination
  const paginatedData = useMemo(() => {
    return filteredProjectsList.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredProjectsList, currentPage, pageSize]);

  const handleFilter = (statusValue) => {
    setStatusFilter(statusValue);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const openDetails = (project) => {
    console.log(project)
    setSelectedProject(project);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedProject(null);
    setShowDetails(false);
  };

  const handlePaginationChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {text}
            {record.isOBSP && (
              <Tag className="bg-indigo-50 text-indigo-600 border-0">
                OBSP {record.packType}
              </Tag>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Budget: ₹{record.budget.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => (
        <div className="flex items-center gap-2 text-text-secondary">
          <CalendarOutlined className="text-client-primary" />
          {date}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const { color, bg, text } = getStatusColor(status, record.health);
        return (
          <div className="space-y-2">
            <Tag className={` text-text-primary border-0 font-medium`}>
              {status}
            </Tag>
            {record.health !== 'completed' && (
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-full rounded-full ${
                    record.health === 'critical' ? 'bg-red-500' :
                    record.health === 'warning' ? 'bg-orange-500' :
                    'bg-emerald-500'
                  }`}
                  style={{ width: `${(record.progress || 0) * 100}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            type="text"
            className="flex items-center gap-2 text-text-secondary hover:text-client-primary"
            icon={<FaEye />}
            onClick={() => openDetails(record)}
          >
            Preview
          </Button>
          <Button
            type="primary"
            className="flex items-center gap-2 bg-client-primary hover:bg-client-secondary"
            onClick={() => navigate(`/client/view-bids/posted-project/${record.id}`, { state: { record } })}
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const handleRefresh = () => {
    fetchTheProjects();
  };

  useEffect(() => {
    fetchTheProjects();
  }, [fetchTheProjects]);

  useEffect(() => {
    const status = location.state?.status;
    if (status) {
      handleFilter(status);
    }
  }, [location.state, projects]);

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6 bg-client-bg">
      {/* Header Card - Simplified */}
      <div className="mb-6 lg:mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 rounded-xl lg:rounded-2xl"></div>
        <div className="absolute inset-0 bg-client-gradient-soft opacity-50 rounded-xl lg:rounded-2xl"></div>
        
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-client-accent/20 backdrop-blur-sm border border-client-accent/30 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6"
              >
                <span className="text-client-accent text-xs lg:text-sm font-semibold">Project Management</span>
              </motion.div>

              <h1 className="text-2xl font-bold text-white mb-2">
                Project Dashboard
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                  {`${projects.length} Total Projects`}
                </span>
                <span className="bg-white/10 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full border border-white/20">
                  {`${projects.filter(p => p.status === 'Ongoing').length} Active`}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                Refresh
              </Button>
              <Button 
                type="primary"
                onClick={() => navigate('/client/post-project')}
                className="bg-client-accent hover:bg-client-accent/90"
              >
                New Project
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Simplified */}
      <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl border border-white/10">
        {/* Tab Navigation */}
        <div className="border-b border-white/10">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'projects'
                  ? 'border-client-accent text-client-accent'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <FaBriefcase className="text-lg" />
                All Projects
              </span>
            </button>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'workspace'
                  ? 'border-client-accent text-client-accent'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                <TeamOutlined className="text-lg" />
                Workspace
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'projects' ? (
            <div>
              {/* Search and Filter */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">All Projects</h2>
                <div className="flex gap-4">
                  <Input
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={handleSearch}
                    prefix={<SearchOutlined className="text-white/60"/>}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 w-64"
                  />
                  <Select
                    value={statusFilter}
                    onChange={handleFilter}
                    className="w-48 custom-select"
                    placeholder="Filter by Status"
                  >
                    <Option value="">All Statuses</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="Ongoing">Ongoing</Option>
                    <Option value="Completed">Completed</Option>
                  </Select>
                </div>
              </div>

              {/* Projects List */}
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-client-accent" />
                </div>
              ) : filteredProjectsList.length === 0 ? (
                <EmptyState 
                  message={
                    statusFilter 
                      ? `No projects found with status "${statusFilter}"`
                      : searchTerm
                      ? "No projects match your search"
                      : "No projects posted yet"
                  } 
                />
              ) : (
                <div className="space-y-4">
                  {paginatedData.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-white font-medium">{project.title}</h3>
                            {project.isOBSP && (
                              <Tag className="bg-client-accent/20 text-client-accent border-0">
                                OBSP {project.packType}
                              </Tag>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-white/60 text-sm">
                              Budget: ₹{project.budget.toLocaleString()}
                            </span>
                            <span className="text-white/60 text-sm">
                              Deadline: {project.deadline}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            type="text"
                            icon={<FaEye />}
                            onClick={() => openDetails(project)}
                            className="text-white/60 hover:text-white"
                          />
                          <Button
                            type="primary"
                            onClick={() => navigate(`/client/view-bids/posted-project/${project.id}`)}
                            className="bg-client-accent hover:bg-client-accent/90"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {filteredProjectsList.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Pagination
                    current={currentPage}
                    pageSize={pageSize}
                    total={filteredProjectsList.length}
                    onChange={handlePaginationChange}
                    showSizeChanger={false}
                    className="custom-pagination"
                  />
                </div>
              )}
            </div>
          ) : (
            <WorkspaceTab selectedProject={selectedProject} />
          )}
        </div>
      </div>

      {/* Project Details Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <FaBriefcase className="text-client-accent text-xl" />
            <span className="text-lg font-medium text-white">Project Details</span>
          </div>
        }
        open={showDetails}
        onCancel={closeDetails}
        footer={null}
        width={800}
        className="custom-modal"
      >
        {selectedProject && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-white">
                  {selectedProject.title}
                </h3>
                <Tag 
                  className={`
                    ${getStatusColor(selectedProject.status, selectedProject.health).bg} 
                    ${getStatusColor(selectedProject.status, selectedProject.health).text} 
                    border-0
                  `}
                >
                  {selectedProject.status}
                </Tag>
              </div>

              <div className="grid grid-cols-2 gap-4 text-white/60">
                <div className="flex items-center gap-2">
                  <CalendarOutlined />
                  <span>Deadline: {selectedProject.deadline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserOutlined />
                  <span>Budget: ₹{selectedProject.budget.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default React.memo(PostedProjects);

