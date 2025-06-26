import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Button, Tabs, Upload, Form, Input, Modal, Select, Tag, Empty, Image, Tooltip } from "antd";
import { FaPlus, FaEdit, FaTrash, FaLink, FaGithub, FaEye, FaProjectDiagram } from "react-icons/fa";
import { Modal as AntModal } from 'antd';
import { ProjectOutlined, ExperimentOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const Portfolio = () => {
  const { userId, isEditable } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);
  const [form] = Form.useForm();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  
  // Dummy data for portfolio
  const [portfolioData, setPortfolioData] = useState({
    projects: [
      {
        id: 1,
        title: "E-commerce Website",
        description: "A full-featured online store with payment integration, product management, and customer dashboard.",
        image: "https://via.placeholder.com/600x400",
        tags: ["React", "Node.js", "MongoDB", "Stripe"],
        links: {
          live: "https://example-ecommerce.com",
          github: "https://github.com/username/ecommerce-project"
        },
        featured: true
      },
      {
        id: 2,
        title: "Task Management App",
        description: "A productivity tool for teams with real-time updates, task assignment, and progress tracking.",
        image: "https://via.placeholder.com/600x400",
        tags: ["React", "Firebase", "Material UI"],
        links: {
          live: "https://task-app-example.com",
          github: "https://github.com/username/task-management"
        },
        featured: true
      },
      {
        id: 3,
        title: "Social Media Dashboard",
        description: "Analytics dashboard for social media management with data visualization and reporting features.",
        image: "https://via.placeholder.com/600x400",
        tags: ["Vue.js", "D3.js", "Express", "PostgreSQL"],
        links: {
          live: "https://social-dashboard-example.com",
          github: "https://github.com/username/social-dashboard"
        },
        featured: false
      }
    ],
    skills: [
      { name: "React", level: "Advanced", years: 3 },
      { name: "Node.js", level: "Advanced", years: 4 },
      { name: "JavaScript", level: "Expert", years: 5 },
      { name: "TypeScript", level: "Intermediate", years: 2 },
      { name: "MongoDB", level: "Advanced", years: 3 },
      { name: "PostgreSQL", level: "Intermediate", years: 2 },
      { name: "AWS", level: "Intermediate", years: 2 },
      { name: "Docker", level: "Beginner", years: 1 },
    ],
    certifications: [
      { 
        id: 1,
        name: "AWS Certified Developer", 
        issuer: "Amazon Web Services", 
        date: "2022-05-15",
        expires: "2025-05-15",
        credentialId: "AWS-DEV-12345",
        url: "https://aws.amazon.com/certification/verify"
      },
      { 
        id: 2,
        name: "MongoDB Certified Developer", 
        issuer: "MongoDB University", 
        date: "2021-11-10",
        expires: null,
        credentialId: "MDB-DEV-67890",
        url: "https://university.mongodb.com/certification/verify"
      }
    ]
  });

  useEffect(() => {
    // In a real app, you would fetch the portfolio data here
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [userId]);

  const showAddModal = (type) => {
    setModalType("add");
    setActiveTab(type);
    setIsModalVisible(true);
    form.resetFields();
  };

  const showEditModal = (type, item) => {
    setModalType("edit");
    setActiveTab(type);
    setSelectedItem(item);
    setIsModalVisible(true);
    
    if (type === "projects") {
      form.setFieldsValue({
        title: item.title,
        description: item.description,
        tags: item.tags,
        liveLink: item.links.live,
        githubLink: item.links.github,
        featured: item.featured
      });
    } else if (type === "skills") {
      form.setFieldsValue({
        name: item.name,
        level: item.level,
        years: item.years
      });
    } else if (type === "certifications") {
      form.setFieldsValue({
        name: item.name,
        issuer: item.issuer,
        date: item.date,
        expires: item.expires,
        credentialId: item.credentialId,
        url: item.url
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = (values) => {
    // In a real app, you would send this data to your backend
    console.log("Submitted values:", values);
    setIsModalVisible(false);
    
    // For demo purposes, update the local state
    if (modalType === "add") {
      if (activeTab === "projects") {
        const newProject = {
          id: portfolioData.projects.length + 1,
          title: values.title,
          description: values.description,
          image: "https://via.placeholder.com/600x400", // In a real app, this would be the uploaded image
          tags: values.tags,
          links: {
            live: values.liveLink,
            github: values.githubLink
          },
          featured: values.featured
        };
        setPortfolioData({
          ...portfolioData,
          projects: [...portfolioData.projects, newProject]
        });
      } else if (activeTab === "skills") {
        const newSkill = {
          name: values.name,
          level: values.level,
          years: values.years
        };
        setPortfolioData({
          ...portfolioData,
          skills: [...portfolioData.skills, newSkill]
        });
      } else if (activeTab === "certifications") {
        const newCertification = {
          id: portfolioData.certifications.length + 1,
          name: values.name,
          issuer: values.issuer,
          date: values.date,
          expires: values.expires,
          credentialId: values.credentialId,
          url: values.url
        };
        setPortfolioData({
          ...portfolioData,
          certifications: [...portfolioData.certifications, newCertification]
        });
      }
    } else if (modalType === "edit" && selectedItem) {
      if (activeTab === "projects") {
        const updatedProjects = portfolioData.projects.map(project => 
          project.id === selectedItem.id 
            ? {
                ...project,
                title: values.title,
                description: values.description,
                tags: values.tags,
                links: {
                  live: values.liveLink,
                  github: values.githubLink
                },
                featured: values.featured
              } 
            : project
        );
        setPortfolioData({
          ...portfolioData,
          projects: updatedProjects
        });
      } else if (activeTab === "skills") {
        const updatedSkills = portfolioData.skills.map(skill => 
          skill.name === selectedItem.name 
            ? {
                name: values.name,
                level: values.level,
                years: values.years
              } 
            : skill
        );
        setPortfolioData({
          ...portfolioData,
          skills: updatedSkills
        });
      } else if (activeTab === "certifications") {
        const updatedCertifications = portfolioData.certifications.map(cert => 
          cert.id === selectedItem.id 
            ? {
                ...cert,
                name: values.name,
                issuer: values.issuer,
                date: values.date,
                expires: values.expires,
                credentialId: values.credentialId,
                url: values.url
              } 
            : cert
        );
        setPortfolioData({
          ...portfolioData,
          certifications: updatedCertifications
        });
      }
    }
  };

  const handleDelete = (type, item) => {
    if (type === "projects") {
      setPortfolioData({
        ...portfolioData,
        projects: portfolioData.projects.filter(project => project.id !== item.id)
      });
    } else if (type === "skills") {
      setPortfolioData({
        ...portfolioData,
        skills: portfolioData.skills.filter(skill => skill.name !== item.name)
      });
    } else if (type === "certifications") {
      setPortfolioData({
        ...portfolioData,
        certifications: portfolioData.certifications.filter(cert => cert.id !== item.id)
      });
    }
  };

  const handlePreview = (project) => {
    setPreviewProject(project);
    setPreviewVisible(true);
  };

  const renderModalContent = () => {
    if (activeTab === "projects") {
      return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Project Title"
            rules={[{ required: true, message: 'Please enter the project title' }]}
          >
            <Input placeholder="E.g., E-commerce Website" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea rows={4} placeholder="Describe your project..." />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="Technologies Used"
            rules={[{ required: true, message: 'Please add at least one technology' }]}
          >
            <Select mode="tags" placeholder="Add technologies">
              <Option value="React">React</Option>
              <Option value="Vue.js">Vue.js</Option>
              <Option value="Angular">Angular</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="Express">Express</Option>
              <Option value="MongoDB">MongoDB</Option>
              <Option value="PostgreSQL">PostgreSQL</Option>
              <Option value="AWS">AWS</Option>
              <Option value="Firebase">Firebase</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="liveLink"
            label="Live Demo URL"
          >
            <Input placeholder="https://example.com" />
          </Form.Item>
          
          <Form.Item
            name="githubLink"
            label="GitHub Repository"
          >
            <Input placeholder="https://github.com/username/repo" />
          </Form.Item>
          
          <Form.Item
            name="featured"
            valuePropName="checked"
          >
            <div className="flex items-center">
            <input type="checkbox" className="mr-2" />
              <span className="text-white/80">Feature this project (shown at the top)</span>
            </div>
          </Form.Item>
          
          <Form.Item
            name="image"
            label="Project Image"
          >
            <Upload
              listType="picture-card"
              showUploadList={true}
              beforeUpload={() => false}
              className="text-white"
            >
              <div className="text-white/80">
                <FaPlus className="text-white/80" />
                <div style={{ marginTop: 8 }} className="text-white/80">Upload</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      );
    } else if (activeTab === "skills") {
      return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Skill Name"
            rules={[{ required: true, message: 'Please enter the skill name' }]}
          >
            <Input placeholder="E.g., React, Python, AWS" />
          </Form.Item>
          
          <Form.Item
            name="level"
            label="Proficiency Level"
            rules={[{ required: true, message: 'Please select a level' }]}
          >
            <Select placeholder="Select level">
              <Option value="Beginner">Beginner</Option>
              <Option value="Intermediate">Intermediate</Option>
              <Option value="Advanced">Advanced</Option>
              <Option value="Expert">Expert</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="years"
            label="Years of Experience"
            rules={[{ required: true, message: 'Please enter years of experience' }]}
          >
            <Input type="number" min={0} max={50} />
          </Form.Item>
        </Form>
      );
    } else if (activeTab === "certifications") {
      return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Certification Name"
            rules={[{ required: true, message: 'Please enter the certification name' }]}
          >
            <Input placeholder="E.g., AWS Certified Developer" />
          </Form.Item>
          
          <Form.Item
            name="issuer"
            label="Issuing Organization"
            rules={[{ required: true, message: 'Please enter the issuer' }]}
          >
            <Input placeholder="E.g., Amazon Web Services" />
          </Form.Item>
          
          <Form.Item
            name="date"
            label="Issue Date"
            rules={[{ required: true, message: 'Please enter the issue date' }]}
          >
            <Input type="date" />
          </Form.Item>
          
          <Form.Item
            name="expires"
            label="Expiration Date (if applicable)"
          >
            <Input type="date" />
          </Form.Item>
          
          <Form.Item
            name="credentialId"
            label="Credential ID"
          >
            <Input placeholder="E.g., AWS-DEV-12345" />
          </Form.Item>
          
          <Form.Item
            name="url"
            label="Verification URL"
          >
            <Input placeholder="https://example.com/verify" />
          </Form.Item>
        </Form>
      );
    }
  };

  const ProjectPreviewModal = ({ project, visible, onClose }) => {
    if (!project) return null;
    
    return (
      <AntModal
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={800}
        className="[&_.ant-modal-content]:bg-freelancer-tertiary  [&_.ant-modal-content]:border [&_.ant-modal-content]:border-white/10 [&_.ant-modal-content]:rounded-xl"
      >
        <div className="space-y-6">
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <img 
              src={project.image} 
              alt={project.title}
              className="w-full h-full object-cover"
            />
            {project.featured && (
              <div className="absolute top-4 right-4 bg-freelancer-accent/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                Featured Project
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">{project.title}</h2>
            
            <p className="text-white/80 leading-relaxed">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {project.tags.map(tag => (
                <Tag 
                  key={tag} 
                  className="bg-white/10 text-white/90 border border-white/20 rounded-full px-3"
                >
                  {tag}
                </Tag>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              {project.links.live && (
                <a
                  href={project.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-freelancer-accent text-white rounded-lg hover:bg-freelancer-accent/90 transition-colors"
                >
                  <FaLink className="mr-2" /> View Live Demo
                </a>
              )}
              {project.links.github && (
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-white/10 text-white/80 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <FaGithub className="mr-2" /> View Source Code
                </a>
              )}
            </div>
          </div>
        </div>
      </AntModal>
    );
  };

  return (
    <div className="min-h-fit w-full bg-freelancer-primary">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-freelancer-accent/2 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-brand-accent/1 rounded-full blur-xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-6"
        >
          {/* Premium Background with Multiple Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-freelancer-primary via-freelancer-primary/95 to-freelancer-tertiary "></div>
          <div className="absolute inset-0 bg-freelancer-gradient-soft opacity-30"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-freelancer-accent/10 rounded-full blur-3xl -mr-24 lg:-mr-48 -mt-24 lg:-mt-48 animate-float"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-brand-accent/8 rounded-full blur-2xl -ml-20 lg:-ml-40 -mb-20 lg:-mb-40 animate-float-delayed"></div>

          <div className="relative px-6 sm:px-8 py-6 sm:py-8">
          <div className="flex items-center">
              <div className="bg-white/10 p-4 rounded-xl mr-4">
                <FaProjectDiagram className="text-freelancer-accent text-3xl" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">Professional Portfolio</h1>
                <p className="text-white/80">Showcase your best work and professional achievements</p>
            </div>
          </div>
        </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10"
        >
          <div className="p-4 sm:p-6">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
              tabBarGutter={32}
              tabBarStyle={{ fontWeight: 600, fontSize: 16 }}
              className="custom-tabs"
            tabBarExtraContent={
              isEditable && (
                <Button 
                  type="primary" 
                  icon={<FaPlus className="mr-2" />}
                  onClick={() => showAddModal(activeTab)}
                    className="bg-freelancer-accent hover:bg-freelancer-accent/90 text-white border-0"
                >
                  Add {activeTab === "projects" ? "Project" : activeTab === "skills" ? "Skill" : "Certification"}
                </Button>
              )
            }
          >
              <TabPane 
                tab={
                  <span className="flex items-center gap-2">
                    <ProjectOutlined />
                    Featured Projects
                  </span>
                } 
                key="projects"
              >
              {portfolioData.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {portfolioData.projects.map(project => (
                    <motion.div
                      key={project.id}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                          className="group hover:shadow-lg transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden h-full flex flex-col"
                        cover={
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              alt={project.title} 
                              src={project.image} 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {project.featured && (
                                <div className="absolute top-3 right-3 bg-freelancer-accent/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                                Featured
                              </div>
                            )}
                          </div>
                        }
                          actions={[
                            <div key="actions" className="flex justify-center gap-4 px-4 py-2 border-t border-white/10">
                          <Tooltip title="Preview Project">
                            <Button 
                              type="text" 
                                  icon={<FaEye className="text-freelancer-accent hover:text-freelancer-accent/80" />}
                              onClick={() => handlePreview(project)}
                                  className="flex items-center justify-center"
                            />
                              </Tooltip>
                              {isEditable && (
                                <>
                          <Tooltip title="Edit Project">
                            <Button 
                              type="text" 
                                      icon={<FaEdit className="text-freelancer-accent hover:text-freelancer-accent/80" />}
                              onClick={() => showEditModal("projects", project)}
                                      className="flex items-center justify-center"
                            />
                                  </Tooltip>
                          <Tooltip title="Delete Project">
                            <Button 
                              type="text" 
                                      icon={<FaTrash className="text-red-400 hover:text-red-500" />}
                              onClick={() => handleDelete("projects", project)}
                                      className="flex items-center justify-center"
                            />
                          </Tooltip>
                                </>
                              )}
                            </div>
                          ]}
                        >
                          <div className="px-1 space-y-3 flex-grow">
                            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                            <p className="text-white/80 text-sm line-clamp-2">{project.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {project.tags.map(tag => (
                              <Tag 
                                key={tag} 
                                  className="bg-white/10 text-white/90 border border-white/20 rounded-full px-3"
                              >
                                {tag}
                              </Tag>
                            ))}
                          </div>
                          <div className="flex space-x-4 pt-2">
                            {project.links.live && (
                              <a 
                                href={project.links.live}
                                target="_blank"
                                rel="noopener noreferrer" 
                                  className="text-freelancer-accent hover:text-freelancer-accent/80 flex items-center text-sm font-medium"
                              >
                                <FaLink className="mr-1.5" /> Live Demo
                              </a>
                            )}
                            {project.links.github && (
                              <a 
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer" 
                                  className="text-freelancer-accent hover:text-freelancer-accent/80 flex items-center text-sm font-medium"
                              >
                                <FaGithub className="mr-1.5" /> Source Code
                              </a>
                            )}
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty 
                  description={
                      <span className="text-white/80">
                      No projects yet. {isEditable && "Showcase your work by adding your first project!"}
                    </span>
                  }
                  className="my-12"
                />
              )}
            </TabPane>

              <TabPane 
                tab={
                  <span className="flex items-center gap-2">
                    <ExperimentOutlined />
                    Technical Skills
                  </span>
                } 
                key="skills"
              >
              {portfolioData.skills.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {portfolioData.skills.map(skill => (
                    <motion.div
                      key={skill.name}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                        <Card className="hover:shadow-md transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl h-full">
                          <div className="flex justify-between items-start h-full">
                            <div className="space-y-2 flex-grow">
                              <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                            <div className="flex items-center gap-3">
                              <Tag className={`rounded-full px-3 ${
                                  skill.level === 'Expert' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  skill.level === 'Advanced' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                  skill.level === 'Intermediate' ? 'bg-freelancer-accent/20 text-freelancer-accent border-freelancer-accent/30' :
                                  'bg-white/10 text-white/80 border-white/20'
                              }`}>
                                {skill.level}
                              </Tag>
                                <span className="text-sm text-white/60">
                                {skill.years} {skill.years === 1 ? 'year' : 'years'}
                              </span>
                            </div>
                          </div>
                          {isEditable && (
                              <div className="flex gap-2 ml-4">
                              <Button 
                                type="text" 
                                  icon={<FaEdit className="text-freelancer-accent hover:text-freelancer-accent/80" />}
                                onClick={() => showEditModal("skills", skill)}
                              />
                              <Button 
                                type="text" 
                                  icon={<FaTrash className="text-red-400 hover:text-red-500" />}
                                onClick={() => handleDelete("skills", skill)}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty 
                  description={
                      <span className="text-white/80">
                      No skills added. {isEditable && "Highlight your technical expertise!"}
                    </span>
                  }
                  className="my-12"
                />
              )}
            </TabPane>

              <TabPane 
                tab={
                  <span className="flex items-center gap-2">
                    <SafetyCertificateOutlined />
                    Certifications
                  </span>
                } 
                key="certifications"
              >
              {portfolioData.certifications.length > 0 ? (
                  <div className="space-y-4 p-6">
                  {portfolioData.certifications.map(cert => (
                    <motion.div
                      key={cert.id}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.2 }}
                    >
                        <Card className="hover:shadow-md transition-all duration-300 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl h-full">
                          <div className="flex justify-between items-start h-full">
                            <div className="space-y-3 flex-grow">
                            <div>
                                <h3 className="text-lg font-semibold text-white">{cert.name}</h3>
                                <p className="text-white/80">Issued by {cert.issuer}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Tag className="bg-freelancer-accent/20 text-freelancer-accent border-freelancer-accent/30 rounded-full px-3">
                                Issued: {new Date(cert.date).toLocaleDateString()}
                              </Tag>
                              {cert.expires && (
                                  <Tag className="bg-orange-500/20 text-orange-400 border-orange-500/30 rounded-full px-3">
                                  Expires: {new Date(cert.expires).toLocaleDateString()}
                                </Tag>
                              )}
                            </div>
                            {cert.credentialId && (
                                <p className="text-sm text-white/60">
                                Credential ID: {cert.credentialId}
                              </p>
                            )}
                            {cert.url && (
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                  className="inline-flex items-center text-freelancer-accent hover:text-freelancer-accent/80 font-medium"
                              >
                                <FaLink className="mr-1.5" /> Verify Credential
                              </a>
                            )}
                          </div>
                          {isEditable && (
                              <div className="flex gap-2 ml-4">
                              <Button 
                                type="text" 
                                  icon={<FaEdit className="text-freelancer-accent hover:text-freelancer-accent/80" />}
                                onClick={() => showEditModal("certifications", cert)}
                              />
                              <Button 
                                type="text" 
                                  icon={<FaTrash className="text-red-400 hover:text-red-500" />}
                                onClick={() => handleDelete("certifications", cert)}
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <Empty 
                  description={
                      <span className="text-white/80">
                      No certifications yet. {isEditable && "Add your professional certifications!"}
                    </span>
                  }
                  className="my-12"
                />
              )}
            </TabPane>
          </Tabs>
          </div>
        </motion.div>

        {/* Modals */}
        <Modal
          title={
            <span className="text-lg font-semibold text-white">
              {modalType === "add" ? "Add New" : "Edit"} {
                activeTab === "projects" ? "Project" : 
                activeTab === "skills" ? "Skill" : 
                "Certification"
              }
            </span>
          }
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="cancel" onClick={handleCancel} className="text-white/80 hover:text-white">
              Cancel
            </Button>,
            <Button 
              key="submit" 
              type="primary" 
              onClick={() => form.submit()}
              className="bg-freelancer-accent hover:bg-freelancer-accent/90 text-white border-0"
            >
              {modalType === "add" ? "Add" : "Save Changes"}
            </Button>
          ]}
          className="[&_.ant-modal-content]:bg-freelancer-tertiary  [&_.ant-modal-content]:border [&_.ant-modal-content]:border-white/10 [&_.ant-modal-content]:rounded-xl"
        >
          {renderModalContent()}
        </Modal>

        <ProjectPreviewModal
          project={previewProject}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
        />
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--freelancer-accent);
        }
        
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--freelancer-accent);
        }

        .ant-tabs-tab {
          color: rgba(255, 255, 255, 0.6);
        }

        .ant-tabs-tab:hover {
          color: var(--freelancer-accent);
        }

        .ant-modal-header {
          background: transparent !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-modal-title {
          color: white !important;
        }

        .ant-form-item-label > label {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-input,
        .ant-input-affix-wrapper,
        .ant-select-selector {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }

        .ant-input::placeholder,
        .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        .ant-select-dropdown {
          background: var(--freelancer-tertiary ) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-select-item {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background: var(--freelancer-accent) !important;
          color: white !important;
        }

        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .ant-card {
          display: flex;
          flex-direction: column;
        }

        .ant-card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .ant-card-actions {
          margin-top: auto;
          background: transparent !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-card-actions > li {
          margin: 0 !important;
        }

        .ant-card-actions > li > span {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* Modal Styles */
        .ant-modal-content {
          background: var(--freelancer-tertiary ) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 1rem !important;
        }

        .ant-modal-header {
          background: var(--freelancer-tertiary ) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 1.5rem !important;
        }

        .ant-modal-body {
          background: var(--freelancer-tertiary ) !important;
          padding: 1.5rem !important;
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-modal-footer {
          background: var(--freelancer-tertiary ) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 1rem 1.5rem !important;
        }

        /* Form Styles */
        .ant-form-item-label > label {
          color: rgba(255, 255, 255, 0.8) !important;
          font-size: 0.875rem !important;
        }

        .ant-input,
        .ant-input-affix-wrapper,
        .ant-select-selector {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 0.75rem !important;
        }

        .ant-input:hover,
        .ant-input-affix-wrapper:hover,
        .ant-select:hover .ant-select-selector {
          border-color: var(--freelancer-accent) !important;
        }

        .ant-input:focus,
        .ant-input-affix-wrapper-focused,
        .ant-select-focused .ant-select-selector {
          border-color: var(--freelancer-accent) !important;
          box-shadow: 0 0 0 2px rgba(var(--freelancer-accent-rgb), 0.2) !important;
        }

        .ant-input::placeholder,
        .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        /* Select Dropdown Styles */
        .ant-select-dropdown {
          background: var(--freelancer-tertiary ) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }

        .ant-select-item {
          color: rgba(255, 255, 255, 0.8) !important;
          padding: 0.5rem 0.75rem !important;
        }

        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background: var(--freelancer-accent) !important;
          color: white !important;
        }

        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        /* Upload Component Styles */
        .ant-upload.ant-upload-select-picture-card {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.5rem !important;
        }

        .ant-upload.ant-upload-select-picture-card:hover {
          border-color: var(--freelancer-accent) !important;
        }

        .ant-upload-list-picture-card .ant-upload-list-item {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 0.5rem !important;
        }

        .ant-upload-list-picture-card .ant-upload-list-item-name {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-upload-list-picture-card .ant-upload-list-item-actions {
          background: rgba(0, 0, 0, 0.5) !important;
        }

        .ant-upload-list-picture-card .ant-upload-list-item-actions .anticon {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-upload-list-picture-card .ant-upload-list-item-actions .anticon:hover {
          color: var(--freelancer-accent) !important;
        }

        /* Checkbox Styles */
        .ant-checkbox-wrapper {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        .ant-checkbox-wrapper:hover .ant-checkbox-inner {
          border-color: var(--freelancer-accent) !important;
        }

        .ant-checkbox-inner {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        .ant-checkbox-checked .ant-checkbox-inner {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
        }

        .ant-checkbox-wrapper:hover .ant-checkbox-checked .ant-checkbox-inner {
          background: var(--freelancer-accent) !important;
          border-color: var(--freelancer-accent) !important;
        }

        /* Form Item Label Styles */
        .ant-form-item-label > label {
          color: rgba(255, 255, 255, 0.8) !important;
        }

        /* Input Styles */
        .ant-input,
        .ant-input-affix-wrapper,
        .ant-select-selector {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          color: white !important;
        }

        .ant-input::placeholder,
        .ant-select-selection-placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }

        /* Responsive styles */
        @media (max-width: 640px) {
          .ant-tabs-tab {
            padding: 8px 12px;
            font-size: 14px;
          }

          .ant-tabs-tab + .ant-tabs-tab {
            margin-left: 8px;
          }

          .ant-tabs-content {
            padding: 12px 0;
          }
        }

        @media (max-width: 768px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .grid-cols-4 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Portfolio;
