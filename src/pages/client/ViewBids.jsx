import { useEffect, useState, useCallback } from 'react';
import CSider from '../../components/client/CSider';
import { useNavigate, useLocation } from 'react-router-dom';
import CHeader from '../../components/client/CHeader';
import { Modal, Button, Input, Select, Card, Tag } from 'antd';
import { 
  FaEye, 
  FaCalendarAlt, 
  FaUserCircle, 
  FaDollarSign,
  FaSearch
} from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';

const { Search } = Input;
const { Option } = Select;

const ViewBids = ({userId, role}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // State management
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status) => {
    const statusMap = {
      pending: { color: 'var(--status-warning)', className: 'text-status-warning bg-status-warning/10' },
      ongoing: { color: 'var(--client-primary)', className: 'text-client-primary bg-client-primary/10' },
      completed: { color: 'var(--status-success)', className: 'text-status-success bg-status-success/10' }
    };
    return statusMap[status?.toLowerCase()] || { color: 'var(--text-muted)', className: 'text-text-muted bg-text-muted/10' };
  };

  // Mock data fetch
  useEffect(() => {
    const mockProjects = [
      {
        id: 1, 
        name: 'Website Redesign', 
        deadline: '2024-12-31', 
        status: 'Ongoing',
        budget: 2000,
        totalBids: 5,
        description: 'Complete website redesign with modern UI/UX features',
        bids: [
          { 
            freelancer: 'John Doe',
            avatar: 'https://ui-avatars.com/api/?name=John+Doe',
            rating: 4.8,
            price: 1200,
            days: 15,
            description: 'Redesign the website with modern UI/UX features.',
            completedProjects: 25
          },
          // ... other bids
        ]
      },
      // ... other projects
    ];
    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  // Handlers
  const handleFilter = useCallback((value) => {
    setStatusFilter(value);
    setFilteredProjects(
      projects.filter(project => 
        (!value || project.status.toLowerCase().includes(value.toLowerCase())) &&
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [projects, searchTerm]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setFilteredProjects(
      projects.filter(project => 
        project.name.toLowerCase().includes(value.toLowerCase()) &&
        (!statusFilter || project.status.toLowerCase().includes(statusFilter.toLowerCase()))
      )
    );
  }, [projects, statusFilter]);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <div className="flex h-screen bg-client-bg">
      <CSider userId={userId} role={role} collapsed={true} />

      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0' : 'ml-14'}`}>
        <CHeader userId={userId}/>
        
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Project Bids</h2>
              <Button
                type="primary"
                className="bg-client-primary hover:bg-client-primary/90 text-white w-full md:w-auto"
                onClick={() => navigate('/client/post-project')}
              >
                Post New Project
              </Button>
            </div>

            {/* Main Content */}
            <Card className="border border-ui-border">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Search
                  placeholder="Search projects"
                  allowClear
                  prefix={<FaSearch className="text-text-muted" />}
                  onSearch={handleSearch}
                  className="w-full md:w-72"
                />
                <Select
                  placeholder="Filter by status"
                  className="w-full md:w-48"
                  value={statusFilter}
                  onChange={handleFilter}
                  allowClear
                >
                  <Option value="Ongoing">Ongoing</Option>
                  <Option value="Pending">Pending</Option>
                  <Option value="Completed">Completed</Option>
                </Select>
              </div>

              {/* Project List */}
              <div className="space-y-4">
                {filteredProjects
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map(project => (
                    <div
                      key={project.id}
                      className="border border-ui-border rounded-lg p-4 hover:border-client-primary transition-colors"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h3 className="text-lg font-medium text-text-primary">{project.name}</h3>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-secondary">
                            <span className="flex items-center gap-2">
                              <FaCalendarAlt /> {project.deadline}
                            </span>
                            <span className="flex items-center gap-2">
                              <FaDollarSign /> ₹{project.budget}
                            </span>
                            <span className="flex items-center gap-2">
                              <FaUserCircle /> {project.totalBids} bids
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Tag className={getStatusColor(project.status).className}>
                            {project.status}
                          </Tag>
                          <Button
                            icon={<FaEye />}
                            onClick={() => setSelectedProject(project)}
                            className="border-ui-border hover:text-client-primary"
                          >
                            View Bids
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              <div className="mt-6 flex justify-center">
                <Select
                  value={pageSize}
                  className="w-20 mr-4"
                  options={[
                    { value: 4, label: '4 / page' },
                    { value: 8, label: '8 / page' },
                    { value: 12, label: '12 / page' },
                  ]}
                />
                <Button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Previous
                </Button>
                <span className="mx-4 flex items-center">
                  Page {currentPage} of {Math.ceil(filteredProjects.length / pageSize)}
                </span>
                <Button
                  disabled={currentPage >= Math.ceil(filteredProjects.length / pageSize)}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            </Card>

            {/* Bid Details Modal */}
            <Modal
              title={selectedProject?.name}
              open={!!selectedProject}
              onCancel={() => setSelectedProject(null)}
              footer={null}
              width={800}
            >
              {selectedProject && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                    <span className="flex items-center gap-2">
                      <FaCalendarAlt /> Deadline: {selectedProject.deadline}
                    </span>
                    <span className="flex items-center gap-2">
                      <FaDollarSign /> Budget: ₹{selectedProject.budget}
                    </span>
                    <Tag className={getStatusColor(selectedProject.status).className}>
                      {selectedProject.status}
                    </Tag>
                  </div>

                  <div className="space-y-4">
                    {selectedProject.bids.map((bid, index) => (
                      <div
                        key={index}
                        className="border border-ui-border rounded-lg p-4 hover:border-client-primary transition-colors"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={bid.avatar}
                              alt={bid.freelancer}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <h4 className="font-medium text-text-primary">{bid.freelancer}</h4>
                              <div className="text-sm text-text-secondary">
                                ⭐ {bid.rating} • {bid.completedProjects} projects
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-client-primary">₹{bid.price}</div>
                            <div className="text-sm text-text-secondary">{bid.days} days</div>
                          </div>
                        </div>
                        <p className="mt-3 text-text-secondary text-sm">{bid.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBids;