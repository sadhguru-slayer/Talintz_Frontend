import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FHeader from '../../components/freelancer/FHeader';
import FSider from '../../components/freelancer/FSider';
import { 
  SearchOutlined, 
  FilterOutlined, 
  RocketOutlined,
  ProjectOutlined,
  DollarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Select, Button, Input, Card, Avatar, Row, Col, Tag } from 'antd';
import { useMediaQuery } from 'react-responsive';
import './css/BrowseProjectsPage.css';
import Cookies from 'js-cookie';

const { Search } = Input;

// Helper to strip HTML tags and slice to 150 chars
function getShortDescription(html, maxLength = 150) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html || '';
  const text = tempDiv.textContent || tempDiv.innerText || '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function getProjectDuration(createdAt, deadline) {
  if (!createdAt || !deadline) return null;
  const start = new Date(createdAt);
  const end = new Date(deadline);
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (diffDays < 30) return 'short';
  if (diffDays <= 90) return 'medium';
  return 'long';
}

const BrowseProjectsPage = ({ userId, role, isAuthenticated, isEditable }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCard, setActiveCard] = useState(null);
  const [browseProjects, setBrowseProjects] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [selectedSort, setSelectedSort] = useState(null);

  const categoryOptions = Array.from(
    new Set(browseProjects.map(p => p.domain && p.domain.trim()).filter(Boolean))
  ).map(cat => ({
    value: cat.toLowerCase(),
    label: <span className="text-text-light">{cat}</span>
  }));

  useEffect(() => {
    const fetchBrowseProjects = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await fetch('http://127.0.0.1:8000/api/freelancer/browse-projects/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch browse projects');
        }
        const data = await response.json();
console.log(data)
        setBrowseProjects(data.browse_projects || []);
        // console.log('Browse Projects:', data.browse_projects);
      } catch (error) {
        console.error('Error fetching browse projects:', error);
      }
    };

    fetchBrowseProjects();
  }, []);

  // Add handler for Apply Now button
  const handleApplyNow = (projectId) => {
    navigate(`/freelancer/browse-projects/project-view/${projectId}`);
  };

  // Card title component for consistency
  const CardTitle = ({ icon, title }) => (
    <div className="flex items-center gap-2">
      <span className="text-freelancer-accent">{icon}</span>
      <span className="font-semibold text-freelancer-text-primary">{title}</span>
    </div>
  );

  const filteredProjects = browseProjects
    .filter(project => {
      // Search filter
      if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) && !getShortDescription(project.description, 150).toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Category filter
      if (selectedCategory && project.domain.toLowerCase() !== selectedCategory) {
        return false;
      }
      // Budget filter
      if (selectedBudget) {
        const budget = Number(project.budget);
        if (selectedBudget === 'low' && !(budget >= 1000 && budget <= 5000)) return false;
        if (selectedBudget === 'medium' && !(budget > 5000 && budget <= 15000)) return false;
        if (selectedBudget === 'high' && !(budget > 15000)) return false;
      }
      // Duration filter
      if (selectedDuration) {
        const durationType = getProjectDuration(project.created_at, project.deadline);
        if (durationType !== selectedDuration) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (selectedSort === 'recent') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (selectedSort === 'budget') {
        return Number(b.budget) - Number(a.budget);
      }
      if (selectedSort === 'matches') {
        return b.match_percent - a.match_percent;
      }
      return 0;
    });

  return (
    <div className="flex h-screen bg-freelancer-primary">
      <FSider 
        userId={userId}
        role={role}
        isAuthenticated={isAuthenticated}
        isEditable={isEditable}
        dropdown={true} 
        collapsed={true}
      />
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0 pb-16' : 'ml-16'}`}>
        <FHeader 
          userId={userId}
          role={role}
          isAuthenticated={isAuthenticated}
          isEditable={isEditable}
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-[1920px] mx-auto space-y-6">
            {/* Header Section */}
            <div className="mb-6">
              <div className="bg-freelancer-bg-card rounded-xl shadow-lg p-8 relative overflow-hidden border border-white/10">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-freelancer-accent/10 rounded-full -mr-48 -mt-48 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-freelancer-accent/10 rounded-full -ml-32 -mb-32 blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="max-w-3xl mx-auto">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-light mb-4 text-center">
                      Find Your Perfect Project
                    </h1>
                    <p className="text-text-light/80 text-center mb-8">
                      Browse through thousands of projects that match your skills and expertise
                    </p>

                    {/* Updated Search Box */}
                    <div className="flex gap-4">
                      <div className="relative flex-1">
                      <Input
                        size="large"
                        placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          prefix={
                            <SearchOutlined className="text-text-light/60" />
                          }
                          className="search-input-custom h-12 bg-freelancer-bg-card/50 border border-white/10 
                            rounded-lg text-text-light placeholder-text-light/60
                            hover:border-freelancer-accent/50 focus:border-freelancer-accent
                            transition-all duration-200"
                          style={{
                            backgroundColor: 'rgba(26, 27, 46, 0.5)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)'
                          }}
                      />
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        className="h-12 px-6 bg-freelancer-accent hover:bg-freelancer-accent/90 
                          border-0 text-text-light font-medium shadow-lg
                          transition-all duration-200"
                      >
                        Search Projects
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <Card 
              className="rounded-xl border border-white/10 hover:border-freelancer-accent transition-colors duration-200 shadow-md bg-freelancer-bg-card"
              bodyStyle={{ padding: '24px', background: 'transparent' }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  placeholder="Category"
                  className="w-full ant-select-dark-mode text-text-light placeholder-text-light/60"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categoryOptions}
                />
                <Select
                  placeholder="Budget Range"
                  className="w-full ant-select-dark-mode text-text-light placeholder-text-light/60"
                  value={selectedBudget}
                  onChange={setSelectedBudget}
                  options={[
                    { value: 'low', label: <span className="text-text-light">₹1000 - ₹5000</span> },
                    { value: 'medium', label: <span className="text-text-light">₹5000 - ₹15000</span> },
                    { value: 'high', label: <span className="text-text-light">₹15000+</span> },
                  ]}
                />
                <Select
                  placeholder="Project Duration"
                  className="w-full ant-select-dark-mode text-text-light placeholder-text-light/60"
                  value={selectedDuration}
                  onChange={setSelectedDuration}
                  options={[
                    { value: 'short', label: <span className="text-text-light">Less than 1 month</span> },
                    { value: 'medium', label: <span className="text-text-light">1-3 months</span> },
                    { value: 'long', label: <span className="text-text-light">3+ months</span> },
                  ]}
                />
                <Select
                  placeholder="Sort By"
                  className="w-full ant-select-dark-mode text-text-light placeholder-text-light/60"
                  value={selectedSort}
                  onChange={setSelectedSort}
                  options={[
                    { value: 'recent', label: <span className="text-text-light">Most Recent</span> },
                    { value: 'budget', label: <span className="text-text-light">Highest Budget</span> },
                    { value: 'matches', label: <span className="text-text-light">Best Matches</span> },
                  ]}
                />
              </div>
            </Card>

            <Button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedBudget(null);
                setSelectedDuration(null);
                setSelectedSort(null);
                setSearchQuery('');
              }}
              className="ml-2"
            >
              Clear Filters
            </Button>
            
            <Row gutter={[24, 24]}>
            {filteredProjects.map((project, index) => (
              <Col xs={24} sm={12} lg={8} key={project.id}>
                <Card
                  className={`
                    rounded-2xl border shadow-md transition-all duration-300 h-full group
                    ${project.is_invitation_pending ? 'border-4 border-purple-500 shadow-purple-200' : 'border-white/10 hover:border-freelancer-accent hover:shadow-xl'}
                    bg-gradient-to-br from-white/5 via-freelancer-bg-card to-white/10
                    relative overflow-visible
                  `}
                  onMouseEnter={() => setActiveCard(index)}
                  onMouseLeave={() => setActiveCard(null)}
                  bodyStyle={{ background: 'transparent', padding: 24 }}
                >
                  {/* Invitation Ribbon */}
                  {project.is_invitation_pending && (
                    <div className="absolute -top-4 -left-4 z-10">
                      <div className="bg-gradient-to-r from-purple-600 to-freelancer-accent text-white font-bold px-4 py-1 rounded-tr-lg rounded-bl-lg shadow-lg text-xs tracking-wide animate-pulse">
                        Opportunity: Invitation Pending
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col h-full">
                    {/* Project Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-freelancer-accent transition-colors">
                          {project.title}
                        </h3>
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <ClockCircleOutlined className="text-white/50" />
                          <span>
                            {project.deadline ? `Deadline: ${project.deadline}` : 'No deadline'}
                            {project.created_at && (
                              <>
                                {' '}
                                <span className="ml-2">•</span>{' '}
                                <span>
                                  Posted: {new Date(project.created_at).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                        {/* Hourly info */}
                        {project.payment_strategy === 'hourly' && (
                          <div className="flex items-center gap-2 mt-1">
                            <Tag color="geekblue" className="rounded-full px-3 py-1 text-xs font-semibold">
                              {project.hourly_rate ? `₹${Number(project.hourly_rate).toLocaleString()}/hr` : 'Hourly'}
                            </Tag>
                            {project.max_hours && (
                              <Tag color="blue" className="rounded-full px-3 py-1 text-xs font-semibold">
                                {project.max_hours} hrs
                              </Tag>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Tag
                          color="var(--freelancer-accent)"
                          className="text-white border-0 bg-freelancer-accent/20 font-medium rounded-full px-3 py-1"
                        >
                          ₹{Number(project.budget).toLocaleString()}
                        </Tag>
                        
                      </div>
                    </div>
          {/* Project description */}
<div
className="text-white/80 mb-4 text-sm leading-relaxed"
>
  {getShortDescription(project.description, 150)}
</div>
                    {/* Milestones */}
                    {project.milestones?.length > 0 && (
                      <div className="mb-3 bg-green-50/10 rounded-lg p-2 flex items-center gap-2 w-fit">
                        <Tag color="success" className="rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1">
                          <RocketOutlined /> Milestones
                        </Tag>
                        <Tag color="geekblue" className="font-medium rounded-full px-3 py-1 text-xs">
                          {project.payment_strategy === 'fixed' ? 'Fixed Price' : project.payment_strategy === 'hourly' ? 'Hourly' : project.payment_strategy}
                        </Tag>
                      </div>
                    )}
          
                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skills_required.map((skill, i) => (
                        <Tag
                          key={i}
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition-all
                            ${i < project.skill_match_count
                              ? '!border-green-500 !bg-green-200 !text-green-900 shadow'
                              : 'border-white/10 bg-white/10 text-white/60'
                            }`}
                        >
                          {skill}
                        </Tag>
                      ))}
                    </div>
          
                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar size={36} src={project.client_avatar || undefined} />
                          <span className="text-white/80 font-medium">{project.client}</span>
                          {project.already_bid && (
                            <Tag color="orange" className="ml-2 font-medium rounded-full px-2 py-0.5 text-xs">Already Bid</Tag>
                          )}
                        </div>
                        <Button
                          type="primary"
                          className={`!bg-freelancer-accent !text-white border-0 hover:!bg-freelancer-accent/90 transition-all duration-200 font-semibold rounded-lg px-4 shadow-lg
                            ${project.is_invitation_pending ? 'ring-2 ring-purple-400' : ''}
                          `}
                          onClick={() => handleApplyNow(project.id)}
                        >
                          {project.is_invitation_pending
                            ? "View Bid"
                            : project.already_bid
                              ? "View Bid"
                              : "Bid Now"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
            {/* Load More Button */}
            <div className="flex justify-center mt-8">
              <Button 
                type="default"
                size="large"
                className="px-8 border-white/10 hover:border-freelancer-accent bg-freelancer-bg-card text-text-light"
              >
                Load More Projects
              </Button>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .ant-select-dark-mode .ant-select-selector {
          background-color: var(--freelancer-bg-card) !important;
          border: 1px solid var(--freelancer-border-DEFAULT) !important;
          color: var(--freelancer-text-primary) !important;
          border-radius: 9999px !important;
          padding: 0.25rem 0.75rem !important;
          height: auto !important;
        }
        .ant-select-dark-mode .ant-select-arrow {
          color: var(--freelancer-text-secondary) !important;
        }
        .ant-select-dark-mode .ant-select-selection-item {
          color: var(--freelancer-text-primary) !important;
        }
        .ant-select-dropdown {
          background-color: var(--freelancer-bg-card) !important;
          border: 1px solid var(--freelancer-border-DEFAULT) !important;
          border-radius: 0.5rem !important;
        }
        .ant-select-item {
          color: var(--freelancer-text-primary) !important;
        }
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: var(--freelancer-accent) !important;
          color: #fff !important;
        }
        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: var(--freelancer-tertiary) !important;
        }/* For dropdown options */
.ant-select-dropdown .ant-select-item-option:hover,
.ant-select-dropdown .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
  background-color: var(--freelancer-accent) !important;
  color: #fff !important;
}

/* For the selector itself */
.ant-select-dark-mode .ant-select-selector:hover {
  border-color: var(--freelancer-accent) !important;
  
}
      `}</style>
    </div>
  );
};

export default BrowseProjectsPage;
