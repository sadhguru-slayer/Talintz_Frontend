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
  StarOutlined, TeamOutlined, InfoCircleOutlined,
  ArrowRightOutlined, LeftOutlined, ThunderboltOutlined, AppstoreOutlined
} from "@ant-design/icons";
import { AiOutlineFileDone } from "react-icons/ai";
import { GrRevert } from "react-icons/gr";
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import Cookies from "js-cookie";
import { getBaseURL } from "../../../config/axios";
import DOMPurify from "dompurify";

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
        const token = Cookies.get('accessToken');
        const res = await fetch(`${getBaseURL()}/api/freelancer/project-details/${id}/`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch project details");
        const data = await res.json();
        console.log(data)
        setProject(data);
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
  }, [id, navigate]);
  
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
    if (!link && files?.length === 0) {
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

  const daysRemaining = calculateDaysRemaining(project?.deadline);

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
            <div className="flex flex-wrap gap-4 mt-4 bg-white/5 border border-white/10 rounded-lg p-4 shadow-sm">
  <div className="flex items-center gap-2 min-w-[120px]">
    <DollarOutlined className="text-freelancer-accent" />
    <span className="text-xs text-white/60">Budget</span>
    <span className="font-semibold text-white ml-1">
      ₹{project?.budget ? Number(project.budget).toLocaleString() : "N/A"}
    </span>
  </div>
  <div className="flex items-center gap-2 min-w-[120px]">
    <ThunderboltOutlined className="text-yellow-400" />
    <span className="text-xs text-white/60">Complexity</span>
    <span className="font-semibold text-white ml-1 capitalize">{project?.complexity_level ?? "N/A"}</span>
  </div>
  <div className="flex items-center gap-2 min-w-[140px]">
    <CalendarOutlined className="text-freelancer-accent" />
    <span className="text-xs text-white/60">Deadline</span>
    <span className="font-semibold text-white ml-1">
      {project?.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
    </span>
  </div>
  <div className="flex items-center gap-2 min-w-[120px]">
    <AppstoreOutlined className="text-freelancer-accent" />
    <span className="text-xs text-white/60">Domain</span>
    <span className="font-semibold text-white ml-1">{project?.domain?.name ?? "N/A"}</span>
  </div>
  <div className="flex items-center gap-2 min-w-[120px]">
    <ClockCircleOutlined className="text-freelancer-accent" />
    <span className="text-xs text-white/60">Pricing</span>
    <span className="font-semibold text-white ml-1">
      {project?.pricing_strategy === "hourly" ? "Hourly" : "Fixed"}
    </span>
  </div>
  <div className="flex items-center gap-2 min-w-[100px]">
    <TagOutlined className="text-blue-400" />
    <span className="text-xs text-white/60">Status</span>
    <Tag className="capitalize text-xs ml-1" color="blue">{project?.status}</Tag>
  </div>
</div>
          </div>
        </div>
      </Card>

      <div className="max-w-6xl mx-auto">
        <Row gutter={[10, 10]}>
          <Col xs={24} md={16}>
            <motion.div variants={itemVariants} className="space-y-6">
              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Project Overview</h2>
                <div
                  className="text-text-light leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project?.description ?? "") }}
                />
                <Divider />
                <div className="flex flex-wrap gap-2">
                  {project?.skills_required?.map((skill, idx) => (
                    <Tag
                      key={idx}
                      className="px-3 py-1 text-sm bg-freelancer-primary/20 text-freelancer-primary border-freelancer-primary/30"
                    >
                      {skill.name}
                    </Tag>
                  ))}
                </div>
              </Card>

              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Your Bid History</h2>
                {(!project?.bidding_history || project?.bidding_history.length === 0) ? (
                  <Alert
                    message="You have not placed any bids on this project yet."
                    type="info"
                    showIcon
                    className="mb-4"
                  />
                ) : (
                  <div className="space-y-4">
                    {project.bidding_history.map((bid) => (
                      <Card
                        key={bid.id}
                        className="bg-white/5 border border-white/10 rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between"
                        bodyStyle={{ padding: 16 }}
                      >
                        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                          <Tag color={bid.state === "accepted" ? "green" : bid.state === "submitted" ? "blue" : "orange"} className="capitalize text-xs">
                            {bid.state}
                          </Tag>
                          <span className="text-white/80 text-sm">
                            <DollarOutlined className="mr-1 text-freelancer-accent" />
                            {bid.total_value} {bid.currency}
                          </span>
                          {bid.bid_type && (
                            <span className="text-xs text-white/60 bg-freelancer-accent/10 px-2 py-1 rounded ml-2">
                              {bid.bid_type.replace('_', ' ')}
                            </span>
                          )}
                          {bid.hourly_rate && (
                            <span className="text-xs text-white/60 ml-2">
                              Hourly: ₹{bid.hourly_rate}/hr
                            </span>
                          )}
                          {bid.estimated_hours && (
                            <span className="text-xs text-white/60 ml-2">
                              Est. Hours: {bid.estimated_hours}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-white/60">
                            Placed: {bid.created_at ? new Date(bid.created_at).toLocaleDateString() : "N/A"}
                          </span>
                          <span className="text-xs text-white/60">
                            {bid.proposed_start && bid.proposed_end
                              ? `Duration: ${new Date(bid.proposed_start).toLocaleDateString()} - ${new Date(bid.proposed_end).toLocaleDateString()}`
                              : ""}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Milestones</h2>
                {project?.milestones?.length === 0 ? (
                  <Alert
                    message="No milestones have been added yet."
                    type="info"
                    showIcon
                    className="mb-4"
                  />
                ) : (
                  <Timeline>
                    {project?.milestones?.map((milestone, idx) => (
                      <Timeline.Item
                        key={milestone.id || idx}
                        color={milestone.status === "Completed" ? "green" : milestone.status === "Ongoing" ? "blue" : "gray"}
                        
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <span className="font-semibold text-freelancer-accent">{milestone.title}</span>
                            <Tag className="ml-2 capitalize" color={milestone.status === "Completed" ? "green" : milestone.status === "Ongoing" ? "blue" : "default"}>
                              {milestone.status}
                            </Tag>
                            <span className="ml-2 text-white/80">
                              Amount: ₹{milestone.amount}
                            </span>
                          </div>
                          <div className="text-white/60 text-sm mt-1 md:mt-0">
                            Due: {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
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
                    <Link
                      to={`/client/profile/${project?.client?.id}/view_profile/`}
                      className="font-semibold text-freelancer-accent hover:underline"
                    >
                      {project?.client?.username}
                    </Link>
                  </div>
                </div>
               
              </Card>

              <Card className="bg-freelancer-bg-card border border-white/10 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Alerts</h2>
                {project?.workspace_id && project?.status === "ongoing" && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-4 mb-6 flex flex-col gap-2 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <InfoCircleOutlined className="text-green-600 text-xl" />
                      <span className="text-green-800 font-medium">
                        Workspace is available for this project. Please navigate to your workspace to continue collaboration and project management.
                      </span>
                    </div>
                    <Button
                      type="primary"
                      className="bg-freelancer-accent ml-6"
                      onClick={() => navigate(`/freelancer/dashboard/workspace/${project.workspace_id}`)}
                    >
                      Go to Workspace
                    </Button>
                  </div>
                )}
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
