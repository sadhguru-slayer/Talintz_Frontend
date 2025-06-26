import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Avatar, Tag, Button, Badge, Tooltip } from 'antd';
import { StarOutlined, ThunderboltOutlined, TeamOutlined, DollarOutlined, RiseOutlined } from '@ant-design/icons';

const FreelancerCard = ({ freelancer }) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
  >
    <div className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-white/10">
      <div className="h-24 bg-gradient-to-r from-client-accent to-client-primary relative">
        <div className="absolute inset-0 bg-opacity-20 bg-black"></div>
        {freelancer.matchScore && (
          <Badge.Ribbon text={freelancer.matchScore} color="#6366F1" className="z-10" />
        )}
      </div>
      
      <div className="px-6 pb-6">
        <div className="flex flex-col items-center -mt-12">
          <Avatar 
            size={64} 
            src={freelancer.avatar}
            className="border-4 border-white shadow-md"
          />
          <h3 className="font-semibold text-white mt-2">{freelancer.name}</h3>
          <p className="text-sm text-white/70">{freelancer.specialization}</p>
          
          <div className="flex items-center mt-1">
            <StarOutlined className="text-client-accent mr-1" />
            <span className="font-medium text-white">{freelancer.rating}</span>
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-1">
            {freelancer.skills.slice(0, 3).map((skill, idx) => (
              <Tag key={idx} className="text-xs m-0.5 bg-client-accent/20 text-client-accent border-client-accent/30">{skill}</Tag>
            ))}
            {freelancer.skills.length > 3 && (
              <Tooltip title={freelancer.skills.slice(3).join(', ')}>
                <Tag className="text-xs m-0.5 bg-white/10 text-white/70 border-white/20">+{freelancer.skills.length - 3}</Tag>
              </Tooltip>
            )}
          </div>

          <div className="w-full mt-4 grid grid-cols-2 gap-2 text-xs text-white/70">
            <div className="flex items-center">
              <ThunderboltOutlined className="mr-1 text-client-accent" />
              {freelancer.response_time}
            </div>
            <div className="flex items-center">
              <RiseOutlined className="mr-1 text-client-accent" />
              {freelancer.success_rate}% Success
            </div>
            <div className="flex items-center">
              <TeamOutlined className="mr-1 text-client-accent" />
              {freelancer.projectsCompleted} Projects
            </div>
            <div className="flex items-center font-medium text-client-accent">
              <DollarOutlined className="mr-1" />
              ₹{freelancer.hourly_rate}/hr
            </div>
          </div>

          <Button 
            type="primary"
            className="w-full mt-4 bg-client-accent hover:bg-client-accent/90 border-0 text-white"
          >
            Invite to Project
          </Button>
        </div>
      </div>
    </div>
  </motion.div>
);

const FreelancerSuggestions = ({ project }) => {
  const categories = [
    {
      title: "Best Matches",
      description: "AI-powered suggestions based on your project requirements",
      icon: (
        <div className="w-10 h-10 rounded-full bg-client-accent/20 flex items-center justify-center text-client-accent">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      ),
      freelancers: [
        {
          id: 3,
          name: "Alex Rivera",
          avatar: "https://ui-avatars.com/api/?name=Alex+Rivera&background=0D9488&color=fff",
          specialization: "Full Stack Developer",
          skills: ["React", "Node.js", "TypeScript", "AWS"],
          rating: 4.7,
          matchScore: "95% Match",
          response_time: "1 hour",
          success_rate: 98,
          projectsCompleted: 32,
          hourly_rate: 45
        },
        {
          id: 4,
          name: "Emma Wilson",
          avatar: "https://ui-avatars.com/api/?name=Emma+Wilson&background=0D9488&color=fff",
          specialization: "Frontend Developer",
          skills: ["React", "Next.js", "TailwindCSS", "TypeScript"],
          rating: 4.9,
          matchScore: "92% Match",
          response_time: "2 hours",
          success_rate: 96,
          projectsCompleted: 28,
          hourly_rate: 40
        }
      ]
    },
    {
      title: "Previously Worked With",
      description: "Freelancers you've successfully collaborated with",
      icon: (
        <div className="w-10 h-10 rounded-full bg-client-accent/20 flex items-center justify-center text-client-accent">
          <TeamOutlined className="text-xl" />
        </div>
      ),
      freelancers: [
        {
          id: 1,
          name: "Sarah Johnson",
          avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D9488&color=fff",
          specialization: "Backend Developer",
          skills: ["Node.js", "MongoDB", "Express", "AWS"],
          rating: 4.8,
          response_time: "30 mins",
          success_rate: 100,
          projectsCompleted: 15,
          hourly_rate: 35
        }
      ]
    }
  ];

  return (
    <div className="mt-8 space-y-8 min-h-screen bg-client-primary p-4">
      {/* Project Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl rounded-xl shadow-md p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Project Posted Successfully
          </h2>
          <Link
            to="/client/dashboard"
            className="text-client-accent hover:text-client-accent/80 text-sm font-medium"
          >
            View Dashboard →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-base font-medium text-white">{project.title}</h3>
            <p className="text-sm text-white/70 mt-1">
            <div dangerouslySetInnerHTML={{ __html: project?.description?.substring(0, 150) }} />
              
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-white/70">Budget</p>
              <p className="text-base text-white">₹{project.budget}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Type</p>
              <p className="text-base text-white">
                {project.is_collaborative ? 'Collaborative' : 'Single Freelancer'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-white/70">Domain</p>
              <p className="text-base text-white">{project.domain?.name}</p>
            </div>
            {project.tasks?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-white/70">Tasks</p>
              <p className="text-base text-white">
                {project.tasks?.length || 'No'} tasks
              </p>
            </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Freelancer Categories */}
      {categories.map((category, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            {category.icon}
            <div>
              <h3 className="text-lg font-semibold text-white">
                {category.title}
              </h3>
              <p className="text-sm text-white/70">
                {category.description}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {category.freelancers.map((freelancer, idx) => (
              <FreelancerCard key={idx} freelancer={freelancer} />
            ))}
          </div>
        </motion.div>
      ))}

      {/* Create New Project Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => window.location.reload()}
        className="w-full mt-6 py-3 px-4 bg-client-accent text-white rounded-lg hover:bg-client-accent/90 transition-colors flex items-center justify-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Create Another Project</span>
      </motion.button>
    </div>
  );
};

export default FreelancerSuggestions;