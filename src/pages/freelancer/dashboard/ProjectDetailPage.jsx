import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { 
  Progress, Card, Row, Col, Modal, Button, Input, notification, 
  Spin, Tag, Timeline, Tooltip, Select, Statistic, Badge, DatePicker,
  Upload, Avatar, Rate, Divider, Space, Alert
} from "antd";
import { 
  CheckCircleOutlined, ExclamationCircleOutlined, UploadOutlined,
  ClockCircleOutlined, DollarOutlined, FileDoneOutlined,
  MessageOutlined, UserOutlined, CalendarOutlined, FlagOutlined,
  LinkOutlined, EnvironmentOutlined, GlobalOutlined, TagOutlined,
  StarOutlined, TeamOutlined, FileTextOutlined, InfoCircleOutlined,
  ArrowRightOutlined, LeftOutlined
} from "@ant-design/icons";
import { GrRevert } from "react-icons/gr";
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [taskStatus, setTaskStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const pathnames = location.pathname.split("/").filter((x) => x);

  const handleMenuClick = (component) => {
    if (location.pathname !== "/freelancer/dashboard") {
      navigate("/freelancer/dashboard", { state: { component } });
    }
  };

  const [yourTasks] = useState([
    { name: 'Initial Design', status: 'pending', dueDate: '2024-12-15', priority: 'High' },
  ]);
  
  const [tasks] = useState([
    { name: 'Design Wireframe', status: 'Completed', dueDate: '2024-12-10', priority: 'High', assignedTo: 'You' },
    { name: 'Build Frontend', status: 'In Progress', dueDate: '2024-12-18', priority: 'Medium', assignedTo: 'You' },
    { name: 'Backend API Integration', status: 'Pending', dueDate: '2024-12-22', priority: 'Low', assignedTo: 'Team Member' },
  ]);

  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        if (location.state?.project) {
          const projectWithDefaults = {
            title: location.state.project.name || "Untitled Project",
            client: location.state.project.client || "No Client",
            deadline: location.state.project.deadline || "No deadline",
            status: location.state.project.status || "Pending",
            description: location.state.project.description || "No description available",
            budget: location.state.project.budget || "N/A",
            completionPercentage: location.state.project.completionPercentage || 0,
            isCollaborative: location.state.project.isCollaborative || false,
            milestones: location.state.project.milestones || [],
            messages: location.state.project.messages || [],
            type: location.state.project.type || "N/A",
            experienceLevel: location.state.project.experienceLevel || "N/A",
            currentBids: location.state.project.currentBids || 0,
            clientDetails: location.state.project.clientDetails || {
              name: "No Name",
              rating: 0,
              location: "No Location",
              memberSince: "N/A",
              totalProjects: 0,
              completedProjects: 0
            },
            skills: location.state.project.skills || [],
            biddingHistory: location.state.project.biddingHistory || []
          };
          setProject(projectWithDefaults);
        } else {
          const mockProject = {
            title: "Untitled Project",
            client: "No Client",
            deadline: "No deadline",
            status: "Pending",
            budget: "N/A",
            description: "No description available",
            completionPercentage: 0,
            isCollaborative: false,
            milestones: [],
            messages: [],
            type: "N/A",
            experienceLevel: "N/A",
            currentBids: 0,
            clientDetails: {
              name: "No Name",
              rating: 0,
              location: "No Location",
              memberSince: "N/A",
              totalProjects: 0,
              completedProjects: 0
            },
            skills: [
              "React.js",
              "Node.js",
              "UI/UX Design",
              "Responsive Design",
              "JavaScript",
              "HTML5",
              "CSS3",
              "Web Development"
            ],
            biddingHistory: [
              {
                id: 1,
                freelancer: "John Doe",
                amount: "$3,500",
                date: "2024-03-15",
                status: "Pending",
                proposal: "I have extensive experience in web development and can deliver a high-quality website within the specified timeline."
              },
              {
                id: 2,
                freelancer: "Jane Smith",
                amount: "$4,200",
                date: "2024-03-14",
                status: "Pending",
                proposal: "Specialized in modern web design with a focus on user experience and performance optimization."
              }
            ]
          };
          setProject(mockProject);
        }
      } catch (error) {
        console.error("Error fetching project details:", error);
        notification.error({
          message: "Error loading project details",
          description: "Failed to load project information. Please try again.",
        });
        navigate('/freelancer/dashboard/projects');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    } else {
      navigate('/freelancer/dashboard/projects');
    }
  }, [id, location.state, navigate]);
  
  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleAddComment = (value) => {
    if (value) {
      const newMessage = {
        sender: "Freelancer",
        message: value,
      };
      setProject((prevState) => ({
        ...prevState,
        messages: [...prevState.messages, newMessage],
      }));
      handleCloseModal();
      notification.success({ message: "Comment added successfully!" });
    }
  };

  const [previousStatus, setPreviousStatus] = useState("");
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [showRevert, setShowRevert] = useState(false);
  const [link, setLink] = useState("");
  const [files, setFiles] = useState([]);

  const handleChange = (e) => {
    const selectedStatus = e.target.value;
    setNewStatus(selectedStatus);
    setIsStatusModalVisible(true);
  };

  const handleConfirm = (link, files) => {
    setPreviousStatus(taskStatus);
    setTaskStatus(newStatus);
    setIsStatusModalVisible(false);

    notification.success({
      message: "Status Updated",
      description: `Task status changed to ${newStatus.replace(/_/g, " ").toUpperCase()}`,
      placement: 'bottomRight'
    });
  };

  const handleCancel = () => {
    setIsStatusModalVisible(false);
  };

    // Animation variants
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    };
  
    const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1
      }
    };
  

  const handleRevert = () => {
    setShowRevert(false);
    setTaskStatus(previousStatus);
    
    notification.info({
      message: "Status Reverted",
      description: `Task status reverted to previous state`,
      placement: 'bottomRight'
    });
  };

  const handleFileChange = (info) => {
    setFiles(info.fileList);
  };

  const handleLinkChange = (e) => {
    setLink(e.target.value);
  };

  const handleConfirmChange = () => {
    if (!link && files.length === 0) {
      notification.error({
        message: "No Attachments",
        description: "Please add a link or upload at least one file.",
      });
      return;
    }

    setShowRevert(true);
    handleConfirm(link, files);
    setLink("");
    setFiles([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="Loading project details..." />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl text-gray-600 mb-2">Project Not Found</h2>
          <Button 
            type="primary" 
            onClick={() => navigate('/freelancer/dashboard/projects')}
            className="bg-freelancer-primary hover:bg-freelancer-secondary"
          >
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const calculateDaysRemaining = (deadline) => {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = calculateDaysRemaining(project.deadline);

  return (
    <div className="p-6 !bg-freelancer-primary min-h-screen">
      <Card
        className="bg-freelancer-bg-card rounded-2xl border border-white/10 shadow-lg mb-8 relative overflow-hidden"
        bodyStyle={{ background: 'transparent', padding: '2rem' }}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-accent/10 rounded-full -ml-32 -mb-32 blur-xl"></div>

          <div className="relative z-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-freelancer-text-primary mb-2">Project Details</h1>
                <p className="text-freelancer-text-secondary">View and manage project information</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  icon={<LeftOutlined />}
                  onClick={() => navigate('/freelancer/dashboard/projects')}
                  className="flex items-center justify-center px-4 py-2 rounded-lg border border-freelancer-accent/30 text-freelancer-accent bg-freelancer-accent/5 hover:bg-freelancer-accent/10 hover:border-freelancer-accent/50 font-medium transition-all duration-300"
                >
                  Back to Projects
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="max-w-6xl mx-auto px-4">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <motion.div variants={itemVariants} className="space-y-6">
              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Project Overview</h2>
                <p className="text-text-light leading-relaxed">
                {project.description}
              </p>
                <Divider />
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill, idx) => (
                    <Tag
                      key={idx}
                      className="px-3 py-1 text-sm bg-freelancer-primary/20 text-freelancer-primary border-freelancer-primary/30"
                    >
                      {skill}
                    </Tag>
                  ))}
                </div>
              </Card>

              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Bidding History</h2>
                {project.biddingHistory.length === 0 ? (
                  <Alert
                    message="No bids have been placed yet."
                    type="info"
                    showIcon
                    className="mb-4"
                  />
                ) : (
                  <Timeline>
                    {project.biddingHistory.map((bid) => (
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
            </Card>
            </motion.div>
          </Col>
          
          <Col xs={24} md={8}>
            <motion.div variants={itemVariants} className="space-y-6">
              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Client Details</h2>
                <div className="flex items-center gap-3 mb-2">
                  <Avatar size={48} icon={<UserOutlined />} />
                <div>
                    <div className="font-semibold text-white">{project.clientDetails.name}</div>
                    <Rate disabled allowHalf value={project.clientDetails.rating} className="text-freelancer-accent" />
                  </div>
                </div>
                <div className="text-white/80 text-sm mb-1">
                  <span className="font-semibold">Location:</span> {project.clientDetails.location}
              </div>
                <div className="text-white/80 text-sm mb-1">
                  <span className="font-semibold">Member Since:</span> {project.clientDetails.memberSince}
                </div>
                <div className="text-white/80 text-sm mb-1">
                  <span className="font-semibold">Total Projects:</span> {project.clientDetails.totalProjects}
                </div>
                <div className="text-white/80 text-sm">
                  <span className="font-semibold">Completed Projects:</span> {project.clientDetails.completedProjects}
                </div>
              </Card>

              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Alerts</h2>
                <Alert
                  message="This project is open for bidding. Submit your proposal before the deadline."
                  type="info"
                  showIcon
                  className="mb-2"
                />
                <Alert
                  message="You have not placed a bid on this project yet."
                  type="warning"
                  showIcon
                />
            </Card>

              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Recommendations</h2>
                <ul className="list-disc pl-5 text-white/80">
                  <li>Highlight relevant experience in your proposal.</li>
                  <li>Offer a competitive bid based on the average.</li>
                  <li>Communicate promptly if the client reaches out.</li>
                </ul>
            </Card>
            </motion.div>
          </Col>
        </Row>
      </div>

      <Modal
        title={<span className="text-lg">Send Message</span>}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => handleAddComment(document.getElementById("comment").value)}
            className="bg-freelancer-primary hover:bg-freelancer-secondary border-freelancer-primary"
          >
            Send
          </Button>,
        ]}
        width={500}
      >
        <Input.TextArea
          id="comment"
          rows={4}
          placeholder="Type your message here..."
          className="mb-4"
        />
        <Upload
          multiple
          beforeUpload={() => false}
          showUploadList={{ showRemoveIcon: true }}
          className="mb-2"
        >
          <Button icon={<UploadOutlined />} className="bg-freelancer-primary text-freelancer-secondary border-freelancer-tertiary">
            Attach Files
          </Button>
        </Upload>
      </Modal>
    </div>
  );
};

const CARD_STYLES = {
  wrapper: `
    rounded-xl border border-freelancer-border-DEFAULT 
    transition-all duration-200 
    shadow-md bg-white
  `,
  wrapperHighlighted: `
    rounded-xl border border-freelancer-border-DEFAULT 
    transition-all duration-200 
    shadow-md bg-freelancer-bg-card
  `,
  header: {
    padding: '16px 20px',
    fontSize: '16px',
    borderBottom: '1px solid var(--freelancer-border-DEFAULT)',
    background: 'transparent'
  },
  body: {
    padding: '20px',
    backgroundColor: 'transparent'
  }
};

export default ProjectDetailPage;
