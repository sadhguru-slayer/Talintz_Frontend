import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, Tabs, Tag, Pagination, Card, Alert, Timeline } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, CalendarOutlined, UserOutlined, LeftOutlined, RightOutlined, CrownOutlined, ProjectOutlined, AppstoreOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { FaEye, FaBriefcase, FaClock, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import '../../../assets/css/ProjectManagementPage.css';

const { Option } = Select;

const tabItems = [
  {
    label: (
      <span className="flex items-center gap-2">
        <FaClock className="text-freelancer-accent" />
        <span className="text-freelancer-text-primary">Milestones</span>
      </span>
    ),
    key: '1',
    children: (
      <div className="p-4 bg-freelancer-bg-card rounded-lg">
        <p className="text-freelancer-text-secondary">Milestone tracking will go here.</p>
      </div>
    ),
  },
  {
    label: (
      <span className="flex items-center gap-2">
        <FaBriefcase className="text-freelancer-accent" />
        <span className="text-freelancer-text-primary">Shared Files</span>
      </span>
    ),
    key: '2',
    children: (
      <div className="p-4 bg-freelancer-bg-card rounded-lg">
        <p className="text-freelancer-text-secondary">File sharing and uploads will go here.</p>
      </div>
    ),
  },
  {
    label: (
      <span className="flex items-center gap-2">
        <UserOutlined className="text-freelancer-accent" />
        <span className="text-freelancer-text-primary">Messages</span>
      </span>
    ),
    key: '3',
    children: (
      <div className="p-4 bg-freelancer-bg-card rounded-lg">
        <p className="text-freelancer-text-secondary">Messaging and collaboration tools will go here.</p>
      </div>
    ),
  },
];

const WorkspaceSection = () => {
  const navigate = useNavigate();
  
  // Mock data for workspaces (active projects)
  const workspaces = [
    {
      id: 1,
      name: 'Website Redesign',
      client: 'ABC Corp',
      lastActivity: '2 hours ago',
      unreadMessages: 3,
      sharedFiles: 5,
      progress: 65,
      members: [
        { name: 'John Doe', role: 'Client', avatar: 'JD' },
        { name: 'You', role: 'Freelancer', avatar: 'YO' }
      ]
    },
    {
      id: 2,
      name: 'Mobile App Development',
      client: 'AppWorks',
      lastActivity: '1 day ago',
      unreadMessages: 0,
      sharedFiles: 8,
      progress: 45,
      members: [
        { name: 'Sarah Smith', role: 'Client', avatar: 'SS' },
        { name: 'You', role: 'Freelancer', avatar: 'YO' }
      ]
    }
  ];

  const handleWorkspaceClick = (workspaceId) => {
    navigate(`/freelancer/dashboard/workspace/${workspaceId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppstoreOutlined className="text-2xl text-freelancer-accent" />
          <h2 className="text-xl font-semibold text-freelancer-text-primary">Your Workspaces</h2>
        </div>
        <Tag
          icon={<CrownOutlined />}
          className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 px-4 py-1 rounded-full"
        >
          Premium
        </Tag>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {workspaces.map((workspace) => (
          <Card 
            key={workspace.id}
            className="bg-freelancer-bg-card border border-white/10 hover:border-freelancer-accent/30 transition-all duration-300 cursor-pointer"
            onClick={() => handleWorkspaceClick(workspace.id)}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Project Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-freelancer-text-primary">{workspace.name}</h3>
                    <p className="text-freelancer-text-secondary">Client: {workspace.client}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-freelancer-text-secondary">Progress</span>
                    <div className="w-24 h-2 bg-freelancer-bg-card rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-freelancer-accent rounded-full"
                        style={{ width: `${workspace.progress}%` }}
                      />
                    </div>
                    <span className="text-sm text-freelancer-text-secondary">{workspace.progress}%</span>
                  </div>
                </div>

                {/* Members */}
                <div className="mt-4 flex items-center gap-2">
                  {workspace.members.map((member, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-2 bg-freelancer-primary/50 px-3 py-1 rounded-full"
                    >
                      <div className="w-6 h-6 rounded-full bg-freelancer-accent/20 flex items-center justify-center text-xs text-freelancer-accent">
                        {member.avatar}
                      </div>
                      <span className="text-sm text-freelancer-text-secondary">{member.name}</span>
                      <span className="text-xs text-freelancer-text-secondary/70">({member.role})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                <Button
                  icon={<FaClock className="mr-2" />}
                  className="flex items-center justify-center text-freelancer-accent border border-freelancer-accent/30 bg-freelancer-accent/5 hover:bg-freelancer-accent/10"
                >
                  Track Time
                </Button>
                <Button
                  icon={<FaBriefcase className="mr-2" />}
                  className="flex items-center justify-center text-freelancer-accent border border-freelancer-accent/30 bg-freelancer-accent/5 hover:bg-freelancer-accent/10"
                >
                  Share Files
                </Button>
                <Button
                  icon={<UserOutlined className="mr-2" />}
                  className="flex items-center justify-center text-freelancer-accent border border-freelancer-accent/30 bg-freelancer-accent/5 hover:bg-freelancer-accent/10"
                >
                  Chat
                  {workspace.unreadMessages > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-freelancer-accent text-white text-xs rounded-full">
                      {workspace.unreadMessages}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Activity Bar */}
            <div className="mt-4 pt-4 border-t border-freelancer-border flex items-center justify-between text-sm text-freelancer-text-secondary">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <FaBriefcase className="text-freelancer-accent" />
                  {workspace.sharedFiles} files shared
                </span>
                <span className="flex items-center gap-1">
                  <UserOutlined className="text-freelancer-accent" />
                  {workspace.members.length} members
                </span>
              </div>
              <span>Last activity: {workspace.lastActivity}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const [activeTab, setActiveTab] = useState('projects');

  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    const mockProjects = [
      { id: 1, name: 'Website Redesign', deadline: '2024-12-31', status: 'Ongoing', client: 'ABC Corp', description: 'Complete website overhaul with modern design', skills: [], biddingHistory: [] },
      { id: 2, name: 'App Development', deadline: '2024-12-20', status: 'Pending', client: 'XYZ Ltd', description: 'Native mobile app for iOS and Android', skills: [], biddingHistory: [] },
      { id: 3, name: 'SEO Optimization', deadline: '2024-12-25', status: 'Completed', client: 'Tech Solutions', description: 'Improve search engine rankings', skills: [], biddingHistory: [] },
      { id: 4, name: 'Mobile App Development', deadline: '2024-11-15', status: 'Ongoing', client: 'AppWorks', description: 'Cross-platform mobile application', skills: [], biddingHistory: [] },
      { id: 5, name: 'E-commerce Platform', deadline: '2025-01-05', status: 'Pending', client: 'RetailPro', description: 'Full-featured online store', skills: [], biddingHistory: [] },
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return {
          color: '#f97316', // Orange-500
          bg: 'bg-orange-500/10',
          text: 'text-orange-500'
        };
      case 'ongoing':
        return {
          color: '#3b82f6', // Blue-500
          bg: 'bg-blue-500/10',
          text: 'text-blue-500'
        };
      case 'completed':
        return {
          color: '#22c55e', // Green-500
          bg: 'bg-green-500/10',
          text: 'text-green-500'
        };
      default:
        return {
          color: 'var(--freelancer-text-muted)',
          bg: 'bg-freelancer-bg-card',
          text: 'text-freelancer-text-muted'
        };
    }
  };

  const columns = [
    {
      title: <span className="text-freelancer-text-secondary font-semibold">Project Name</span>,
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="space-y-1">
          <div className="font-semibold text-freelancer-text-primary">{text}</div>
          <div className="text-sm text-freelancer-text-secondary">{record.description}</div>
        </div>
      ),
    },
    {
      title: <span className="text-freelancer-text-secondary font-semibold">Deadline</span>,
      dataIndex: 'deadline',
      key: 'deadline',
      render: (date) => (
        <div className="flex items-center gap-2 text-freelancer-text-secondary">
          <CalendarOutlined className="text-freelancer-accent" />
          <span className="font-medium">{date}</span>
        </div>
      ),
    },
    {
      title: <span className="text-freelancer-text-secondary font-semibold">Status</span>,
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { color, bg, text } = getStatusColor(status);
        return (
          <Tag
            style={{ 
              background: color, 
              color: '#fff', 
              border: 0, 
              borderRadius: '9999px', 
              padding: '0.25rem 1rem',
              fontWeight: 500
            }}
            className={`${bg} ${text} font-medium text-xs`}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: <span className="text-freelancer-text-secondary font-semibold">Actions</span>,
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-3">
          <Button
            icon={<FaEye className="mr-1" />}
            onClick={() => openDetails(record)}
            className="flex items-center justify-center px-4 py-2 rounded-lg border border-freelancer-accent/30 text-freelancer-accent bg-freelancer-accent/5 hover:bg-freelancer-accent/10 hover:border-freelancer-accent/50 font-medium transition-all duration-300"
          >
            Preview
          </Button>
          <Button
            onClick={() => handleViewDetails(record.id, record)}
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-freelancer-accent to-freelancer-accent/80 text-white border-0 font-medium hover:from-freelancer-accent/90 hover:to-freelancer-accent/70 transition-all duration-300 shadow-lg shadow-freelancer-accent/20"
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const handleFilter = (value) => {
    setStatusFilter(value);
    const filtered = projects.filter((project) => {
      return (
        (project.status.toLowerCase().includes(value.toLowerCase()) || value === '') &&
        (project.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
    setFilteredProjects(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = projects.filter((project) => {
      return (
        (project.status.toLowerCase().includes(statusFilter.toLowerCase()) || statusFilter === '') &&
        (project.name.toLowerCase().includes(value.toLowerCase()))
      );
    });
    setFilteredProjects(filtered);
  };

  const openDetails = (project) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setSelectedProject(null);
    setShowDetails(false);
  };

  const handleViewDetails = (id, project) => {
    navigate(`/freelancer/dashboard/projects/${id}`, { 
      state: { project } 
    });
  };

  const paginatedData = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const ProjectCard = ({ project }) => {
    const { color, bg, text } = getStatusColor(project.status);
    return (
      <div className="bg-freelancer-bg-card rounded-xl border border-white/10 p-6 shadow-lg flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-freelancer-text-primary">{project.name}</h3>
            <p className="text-freelancer-text-secondary text-sm mt-1">{project.description}</p>
          </div>
          <Tag
            style={{ background: color, color: '#fff', border: 0, borderRadius: '9999px', padding: '0.25rem 1rem' }}
            className={`${bg} ${text} font-medium text-xs`}
          >
            {project.status}
          </Tag>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center text-freelancer-text-secondary">
            <CalendarOutlined className="mr-2 text-freelancer-accent" />
            <span>{project.deadline}</span>
          </div>
          <div className="flex items-center text-freelancer-text-secondary">
            <UserOutlined className="mr-2 text-freelancer-accent" />
            <span>{project.client}</span>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            icon={<FaEye className="mr-1" />}
            onClick={() => openDetails(project)}
            className="flex items-center justify-center px-4 py-2 rounded-lg border border-freelancer-accent/30 text-freelancer-accent bg-freelancer-accent/5 hover:bg-freelancer-accent/10 hover:border-freelancer-accent/50 font-medium transition-all duration-300"
          >
            Preview
          </Button>
          <Button
            onClick={() => handleViewDetails(project.id, project)}
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-freelancer-accent to-freelancer-accent/80 text-white border-0 font-medium hover:from-freelancer-accent/90 hover:to-freelancer-accent/70 transition-all duration-300 shadow-lg shadow-freelancer-accent/20"
          >
            View Details
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 !bg-freelancer-primary min-h-screen">
      <Card
        className="bg-freelancer-bg-card rounded-2xl border border-white/10 shadow-lg mb-8 relative overflow-hidden"
        bodyStyle={{ background: 'transparent', padding: '2rem' }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-accent/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-freelancer-text-primary mb-2">Project Management</h1>
                <p className="text-freelancer-text-secondary">Manage your projects and workspace</p>
              </div>
            </div>

            <div className="flex gap-4 border-b border-freelancer-border">
              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all duration-300 ${
                  activeTab === 'projects'
                    ? 'text-freelancer-accent border-b-2 border-freelancer-accent'
                    : 'text-freelancer-text-secondary hover:text-freelancer-accent'
                }`}
              >
                <ProjectOutlined />
                Projects
              </button>
              <button
                onClick={() => setActiveTab('workspace')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all duration-300 ${
                  activeTab === 'workspace'
                    ? 'text-freelancer-accent border-b-2 border-freelancer-accent'
                    : 'text-freelancer-text-secondary hover:text-freelancer-accent'
                }`}
              >
                <AppstoreOutlined />
                Workspace
              </button>
            </div>
          </div>
        </div>
      </Card>

      {activeTab === 'projects' ? (
        <>
          <Card className="bg-transparent rounded-2xl border border-white/10 shadow-lg">
            <div className="hidden md:block">
              <Table
                dataSource={paginatedData}
                columns={columns}
                pagination={false}
                rowKey="id"
                className="project-table freelancer-table-primary"
                rowClassName="transition-colors duration-200"
                style={{ background: 'var(--freelancer-primary)' }}
              />
            </div>
            <div className="block md:hidden space-y-4">
              {paginatedData.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </Card>

          <div className="mt-6 flex justify-center">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredProjects.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              className="custom-pagination"
              prevIcon={<LeftOutlined className="text-freelancer-accent" />}
              nextIcon={<RightOutlined className="text-freelancer-accent" />}
            />
          </div>
        </>
      ) : (
        <WorkspaceSection />
      )}

      <Modal
        title={
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-freelancer-text-primary">
                {selectedProject?.name}
              </h3>
              {selectedProject && (
                <Tag
                  style={{ background: getStatusColor(selectedProject.status).color, color: '#fff', border: 0, borderRadius: '9999px', padding: '0.25rem 1rem' }}
                  className={`mt-2 ${getStatusColor(selectedProject.status).bg} ${getStatusColor(selectedProject.status).text}`}
                >
                  {selectedProject.status}
                </Tag>
              )}
            </div>
          </div>
        }
        open={showDetails}
        onCancel={closeDetails}
        footer={null}
        width={800}
        className="project-modal freelancer-modal-primary"
        bodyStyle={{ background: 'var(--freelancer-primary)' }}
      >
        {selectedProject && (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-freelancer-bg-card rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <UserOutlined className="text-freelancer-accent" />
                  <h4 className="text-sm font-medium text-freelancer-text-secondary">Client</h4>
                </div>
                <p className="text-lg text-freelancer-text-primary">{selectedProject.client}</p>
              </div>
              <div className="p-6 bg-freelancer-bg-card rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <CalendarOutlined className="text-freelancer-accent" />
                  <h4 className="text-sm font-medium text-freelancer-text-secondary">Deadline</h4>
                </div>
                <p className="text-lg text-freelancer-text-primary">{selectedProject.deadline}</p>
              </div>
            </div>
            <div className="p-6 bg-freelancer-bg-card rounded-xl border border-white/10">
              <h4 className="text-sm font-medium text-freelancer-text-secondary mb-3">Project Description</h4>
              <p className="text-freelancer-text-secondary leading-relaxed">{selectedProject.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(selectedProject.skills) && selectedProject.skills.map((skill, idx) => (
                <Tag 
                  key={idx}
                  className="px-3 py-1 text-sm bg-freelancer-primary/20 text-freelancer-primary border-freelancer-primary/30"
                >
                  {skill}
                </Tag>
              ))}
            </div>
            {(selectedProject.biddingHistory || []).length === 0 ? (
              <Alert
                message="No bids have been placed yet."
                type="info"
                showIcon
                className="mb-4"
              />
            ) : (
              <Timeline>
                {(selectedProject.biddingHistory || []).map((bid) => (
                  <Timeline.Item
                    key={bid.id}
                    color={bid.status === "Accepted" ? "green" : bid.status === "Pending" ? "blue" : "red"}
                    dot={
                      bid.status === "Accepted" ? <CheckCircleOutlined /> :
                      bid.status === "Pending" ? <ClockCircleOutlined /> :
                      <ExclamationCircleOutlined />
                    }
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <span className="font-semibold text-freelancer-accent">{bid.freelancer}</span>
                        <span className="ml-2 text-white/80">{bid.amount}</span>
                        <Tag className="ml-2" color={bid.status === "Accepted" ? "green" : bid.status === "Pending" ? "blue" : "red"}>
                          {bid.status}
                        </Tag>
                      </div>
                      <div className="text-white/60 text-sm mt-1 md:mt-0">
                        {bid.date}
                      </div>
                    </div>
                    <div className="text-white/80 mt-1">{bid.proposal}</div>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
            <Tabs items={tabItems} className="project-tabs" />
          </div>
        )}
      </Modal>

      <style jsx global>{`
        .freelancer-table-primary .ant-table {
          background: var(--freelancer-primary) !important;
          border-radius: 12px;
          overflow: hidden;
        }

        .freelancer-table-primary .ant-table-container {
          background: var(--freelancer-primary) !important;
        }

        .freelancer-table-primary .ant-table-content {
          background: var(--freelancer-primary) !important;
        }

        .freelancer-table-primary .ant-table-thead > tr > th {
          background: var(--freelancer-bg-card) !important;
          color: var(--freelancer-text-secondary) !important;
          font-weight: 600 !important;
          padding: 16px !important;
          border-bottom: 1px solid var(--freelancer-border) !important;
        }

        .freelancer-table-primary .ant-table-tbody > tr > td {
          background: var(--freelancer-primary) !important;
          color: var(--freelancer-text-primary) !important;
          padding: 16px !important;
          border-bottom: 1px solid var(--freelancer-border) !important;
          transition: all 0.3s ease;
        }

        .freelancer-table-primary .ant-table-tbody > tr:hover > td {
          background: var(--freelancer-bg-card) !important;
        }

        .freelancer-table-primary .ant-table-tbody > tr:last-child > td {
          border-bottom: none !important;
        }

        .freelancer-table-primary .ant-table-cell {
          vertical-align: middle !important;
        }

        .freelancer-table-primary .ant-table-row {
          transition: all 0.3s ease;
        }


        .freelancer-modal-primary .ant-modal-content,
        .freelancer-modal-primary .ant-modal-header,
        .freelancer-modal-primary .ant-modal-body {
          background: var(--freelancer-primary) !important;
        }

        /* Custom scrollbar for table */
        .freelancer-table-primary .ant-table-body::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        .freelancer-table-primary .ant-table-body::-webkit-scrollbar-track {
          background: var(--freelancer-bg-card);
        }

        .freelancer-table-primary .ant-table-body::-webkit-scrollbar-thumb {
          background: var(--freelancer-border);
          border-radius: 3px;
        }

        .freelancer-table-primary .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: var(--freelancer-accent);
        }


        .ant-btn:active {
          transform: translateY(0) !important;
        }

        /* Enhanced input and select styles */
        .ant-input-affix-wrapper {
          transition: all 0.3s ease !important;
        }

        .ant-input-affix-wrapper:hover {
          border-color: var(--freelancer-accent) !important;
        }

        .ant-select:hover .ant-select-selector {
          border-color: var(--freelancer-accent) !important;
        }


        /* Modal Styles */
        .freelancer-modal-primary .ant-modal-content {
          background: var(--freelancer-primary) !important;
          border: 1px solid var(--freelancer-border) !important;
        }

        .freelancer-modal-primary .ant-modal-header {
          background: var(--freelancer-primary) !important;
          border-bottom: 1px solid var(--freelancer-border) !important;
          padding: 1.5rem !important;
        }

        .freelancer-modal-primary .ant-modal-title {
          color: var(--freelancer-text-primary) !important;
        }

        .freelancer-modal-primary .ant-modal-close {
          color: var(--freelancer-accent) !important;
          transition: all 0.3s ease !important;
        }

        .freelancer-modal-primary .ant-modal-close:hover {
          color: var(--freelancer-accent) !important;
          background: var(--freelancer-bg-card) !important;
        }

        .freelancer-modal-primary .ant-modal-body {
          background: var(--freelancer-primary) !important;
          padding: 1.5rem !important;
        }

        /* Tabs Styles */
        .project-tabs .ant-tabs-nav {
          background: var(--freelancer-bg-card) !important;
          padding: 0.5rem !important;
          border-radius: 0.5rem !important;
          margin-bottom: 1.5rem !important;
        }

        .project-tabs .ant-tabs-tab {
          color: var(--freelancer-text-secondary) !important;
          padding: 0.75rem 1.25rem !important;
          transition: all 0.3s ease !important;
          border-radius: 0.375rem !important;
        }

        .project-tabs .ant-tabs-tab:hover {
          color: var(--freelancer-accent) !important;
        }

        .project-tabs .ant-tabs-tab-active {
          background: var(--freelancer-accent) !important;
        }

        .project-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
        }

        .project-tabs .ant-tabs-ink-bar {
          display: none !important;
        }

        /* Updated Pagination Styles */
        .custom-pagination .ant-pagination-prev .ant-pagination-item-link,
        .custom-pagination .ant-pagination-next .ant-pagination-item-link {
          background: var(--freelancer-bg-card) !important;
          border: 1px solid var(--freelancer-border) !important;
          color: var(--freelancer-accent) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .custom-pagination .ant-pagination-prev:hover .ant-pagination-item-link,
        .custom-pagination .ant-pagination-next:hover .ant-pagination-item-link {
          border-color: var(--freelancer-accent) !important;
          background: var(--freelancer-accent) !important;
          color: white !important;
        }

        .custom-pagination .ant-pagination-disabled .ant-pagination-item-link {
          color: var(--freelancer-text-secondary) !important;
          border-color: var(--freelancer-border) !important;
          background: var(--freelancer-bg-card) !important;
          opacity: 0.5 !important;
        }

        .custom-pagination .ant-pagination-disabled:hover .ant-pagination-item-link {
          background: var(--freelancer-bg-card) !important;
          color: var(--freelancer-text-secondary) !important;
        }

        /* Tab Switcher Styles */
        .tab-switcher button {
          position: relative;
          overflow: hidden;
        }

        .tab-switcher button::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--freelancer-accent);
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .tab-switcher button:hover::after {
          transform: translateX(0);
        }

        .tab-switcher button.active::after {
          transform: translateX(0);
        }

        /* Workspace Card Hover Effects */
        .workspace-card {
          transition: all 0.3s ease;
        }

        .workspace-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ProjectManagementPage;
