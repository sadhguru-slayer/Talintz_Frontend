import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Input, Select, Tabs, Tag, Pagination, Card, Alert, Timeline, Avatar, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { SearchOutlined, CalendarOutlined, UserOutlined, LeftOutlined, RightOutlined, CrownOutlined, ProjectOutlined, AppstoreOutlined, CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { FaEye, FaBriefcase, FaClock, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import '../../../assets/css/ProjectManagementPage.css';
import { getBaseURL } from "../../../config/axios";
import Cookies from "js-cookie";
import DOMPurify from "dompurify";

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

const WorkspaceSection = ({ workspaces }) => {
  const navigate = useNavigate();

  const handleWorkspaceClick = (workspaceId) => {
    navigate(`/freelancer/dashboard/workspace/${workspaceId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
          <AppstoreOutlined className="text-2xl text-freelancer-accent" />
          <h2 className="text-xl font-semibold text-freelancer-text-primary">Your Workspaces</h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {workspaces.map((ws) => (
          <Card 
            key={ws.id}
            className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => handleWorkspaceClick(ws.id)}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-freelancer-text-primary">{ws.title}</div>
                <Tag color="purple" className="capitalize text-sm">{ws.type}</Tag>
              </div>
              <div className="flex flex-wrap gap-6 mt-1 text-sm">
                <span>
                  <span className="font-medium text-text-muted">Status:</span>
                  <span className="text-text-light"> {ws.status}</span>
                </span>
                <span>
                  <span className="font-medium text-text-muted">Budget:</span>
                  <span className="text-text-light"> {ws.budget}</span>
                </span>
                <span>
                  <CalendarOutlined className="mr-1 text-freelancer-accent" />
                  <span className="font-medium text-text-muted">Deadline:</span>
                  <span className="text-text-light">
                    {ws.deadline ? new Date(ws.deadline).toLocaleDateString() : "-"}
                  </span>
                </span>
                  </div>
              <div className="mt-2">
                <div className="font-semibold text-sm text-freelancer-text-primary mb-1">Participants:</div>
                <div className="flex flex-wrap gap-3 items-center">
                  {ws.participants.map((p) => (
                    <Tooltip key={p.id} title={`${p.username} (${p.role})`}>
                      <div className="flex flex-col items-center mr-2">
                        <Avatar
                          size={40}
                          src={p.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.username)}`}
                          className="border border-freelancer-accent/30 shadow"
                        />
                        <span className="text-xs text-freelancer-text-secondary mt-1 font-medium max-w-[60px] truncate text-center">{p.username}</span>
                        <span className="text-[10px] text-freelancer-accent/80">{p.role}</span>
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
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
    const token = Cookies.get('accessToken');

    // Fetch assigned projects
    const fetchAssignedProjects = async () => {
      try {
        const res = await fetch(`${getBaseURL()}/api/freelancer/assigned-projects/`, {
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setProjects(data); // <-- set state
        setFilteredProjects(data); // <-- set filtered state
      } catch (err) {
        console.error("Error fetching assigned projects:", err);
      }
    };

    // Fetch freelancer workspaces
    const fetchFreelancerWorkspaces = async () => {
      try {
        const res = await fetch(`${getBaseURL()}/api/freelancer/workspaces/`, {
          credentials: "include",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setWorkspaces(data); // <-- set state
      } catch (err) {
        console.error("Error fetching freelancer workspaces:", err);
      }
    };

    fetchAssignedProjects();
    fetchFreelancerWorkspaces();
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
      title: "Project Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (date) => <span>{date}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag>{status}</Tag>,
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client) => (
        <span>
          {client.username} <span className="text-xs text-gray-400">(ID: {client.id})</span>
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button onClick={() => handleViewDetails(record.id, record)}>
            View Details
          </Button>
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

  const MAX_DESC_LENGTH = 120;

  const ProjectCard = ({ project }) => {
    // Slice and sanitize description
    let desc = project.description || "";
    let isLong = desc.length > MAX_DESC_LENGTH;
    let slicedDesc = isLong ? desc.slice(0, MAX_DESC_LENGTH) + "..." : desc;
    let safeDesc = DOMPurify.sanitize(slicedDesc);

    return (
      <Card
        className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
        style={{ marginBottom: 16 }}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-freelancer-text-primary">{project?.title}</div>
            <Tag color="blue" className="capitalize text-sm">{project.status}</Tag>
          </div>
          {/* Description as dangerous HTML with slicing */}
          <div
            className="text-freelancer-text-secondary text-sm mt-1"
            style={{ minHeight:15, maxHeight: 48, overflow: "hidden" }}
            dangerouslySetInnerHTML={{ __html: safeDesc }}
          />
          <div className="flex flex-wrap justify-between items-center">
          <div className="flex gap-6">
            <span>
              <CalendarOutlined className="mr-1 text-freelancer-accent" />
              <span className="font-medium text-text-muted">Deadline:</span>
              <span className="text-text-light">
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : "-"}
              </span>
            </span>
            <span>
              <UserOutlined className="mr-1 text-freelancer-accent" />
              <span className="font-medium text-text-muted">Client:</span>
              <span className="text-text-light"> {project.client.username}</span>
            </span>
          </div>
            <div className="flex justify-end mt-3">
          <Button
              type="primary"
              className="bg-freelancer-accent"
            onClick={() => handleViewDetails(project.id, project)}
          >
            View Details
          </Button>
        </div>
      </div>

        </div>
      </Card>
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
            <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
        <ProjectOutlined className="text-2xl text-freelancer-accent" />
        <h2 className="text-xl font-semibold text-freelancer-text-primary">Your Projects</h2>
            </div>
              {paginatedData.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
      

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
        <WorkspaceSection workspaces={workspaces} />
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
