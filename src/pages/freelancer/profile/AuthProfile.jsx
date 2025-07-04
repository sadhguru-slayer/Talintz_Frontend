import React from "react";
import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Tabs, Avatar, Button, Card, Tag, Progress, Tooltip, Modal
} from "antd";
import {
  FaEdit, FaBriefcase, FaGithub, FaLinkedin, FaGlobe
} from "react-icons/fa";
import {getBaseURL} from '../../../config/axios';
import {
  UserOutlined, EditOutlined, ProjectOutlined, StarOutlined,
  CheckCircleOutlined, EyeOutlined, SecurityScanOutlined,
  ExperimentOutlined, BookOutlined,
  SafetyCertificateOutlined, DollarOutlined,PhoneOutlined,CalendarOutlined,
  RiseOutlined, FallOutlined, ExclamationCircleOutlined, UpOutlined, DownOutlined,
  EnvironmentOutlined, MailOutlined, FileProtectOutlined, UsergroupAddOutlined,
  ShopOutlined, BankOutlined, TrophyOutlined, InfoCircleOutlined,
  RocketOutlined, CrownOutlined
} from '@ant-design/icons';
import './css/AuthProfile.css';
import Cookies from "js-cookie";
import axios from "axios";
import { IoSchoolOutline } from 'react-icons/io5';
import { GrConnect } from 'react-icons/gr';
import { BiSolidMessageRounded } from 'react-icons/bi';

// Add these motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};


// Minimal StatCard component
const StatCard = ({ title, value, icon, color, suffix, trend, trendValue }) => (
  <motion.div
    variants={cardVariants}
    whileHover={{ scale: 1.02 }}
    className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6 hover:bg-white/10 transition-colors"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-freelancer-accent text-lg sm:text-2xl">{icon}</span>
      {trend && (
        <div className={`flex items-center ${
          trend === 'up' ? 'text-status-success' : 'text-status-error'
        }`}>
          {trend === 'up' ? <RiseOutlined /> : <FallOutlined />}
          <span className="ml-1 text-xs sm:text-sm">{trendValue}%</span>
        </div>
      )}
    </div>
    <h3 className="text-white/60 text-xs sm:text-sm font-medium mb-1">{title}</h3>
    <p className="text-lg sm:text-xl font-semibold text-white/90">
      {value}{suffix}
    </p>
  </motion.div>
);

// Enhanced dummy data structure
const getDummyData = (role) => ({
  basic: {
    id: 1,
    name: "Alex Johnson",
    role: role,
    title: role === 'student' ? "Student Developer" : "Full Stack Developer",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    verified: true,
    location: "San Francisco, CA",
    joinDate: "January 2022",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    bio: "Passionate developer with a strong foundation in modern web technologies",
    about: `I am a seasoned Full Stack Developer with over 5 years of experience in building scalable web applications. My expertise spans across the entire development stack, from crafting responsive frontends to architecting robust backend systems.

Key Strengths:
• Proficient in React, Node.js, and Python
• Strong background in cloud technologies (AWS, GCP)
• Experience with microservices architecture
• Passionate about clean code and best practices

I've successfully delivered projects for clients ranging from startups to enterprise companies, consistently meeting deadlines and exceeding expectations. My approach combines technical excellence with clear communication and a focus on business objectives.

When I'm not coding, I contribute to open-source projects and mentor junior developers. I believe in continuous learning and staying updated with the latest industry trends.`,
    hourlyRate: 45,
    availability: "20-30 hrs/week",
  },
  
  professional: {
    skills: [
      { name: "React", level: 95, projects: 15 },
      { name: "Node.js", level: 90, projects: 12 },
      { name: "Python", level: 85, projects: 8 },
      { name: "MongoDB", level: 80, projects: 10 },
      { name: "AWS", level: 75, projects: 6 },
      { name: "TypeScript", level: 88, projects: 9 },
      { name: "Docker", level: 82, projects: 7 },
      { name: "GraphQL", level: 78, projects: 5 },
    ],
    languages: [
      { name: "English", level: "Native", proficiency: 100 },
      { name: "Spanish", level: "Fluent", proficiency: 85 },
      { name: "French", level: "Basic", proficiency: 40 },
    ],
    certifications: [
      {
        name: "AWS Certified Developer",
        issuer: "Amazon Web Services",
        date: "2023",
        credentialId: "AWS-123456",
      },
      {
        name: "Google Cloud Professional",
        issuer: "Google",
        date: "2022",
        credentialId: "GCP-789012",
      },
    ],
  },

  student: role === 'student' ? {
    institution: {
      name: "Stanford University",
      location: "Stanford, CA",
      program: "Computer Science",
      year: 3,
      gpa: 3.8,
    },
    academic: {
      major: "Computer Science",
      minor: "Data Science",
      expectedGraduation: "2025",
      coursework: [
        "Advanced Algorithms",
        "Machine Learning",
        "Database Systems",
        "Web Development",
      ],
      achievements: [
        {
          title: "Dean's List",
          period: "Fall 2023",
          description: "Maintained GPA above 3.7",
        },
        {
          title: "Hackathon Winner",
          period: "Spring 2023",
          description: "First place in University Hackathon",
        },
      ],
    },
    research: [
      {
        title: "ML Algorithm Optimization",
        role: "Research Assistant",
        professor: "Dr. Sarah Chen",
        period: "2023-Present",
      },
    ],
  } : null,

  experience: [
    {
      position: "Senior Developer",
      company: "Tech Solutions Inc.",
      location: "San Francisco, CA",
      duration: "2020-Present",
      description: "Lead developer for enterprise web applications",
      achievements: [
        "Reduced application load time by 40%",
        "Implemented CI/CD pipeline",
        "Mentored junior developers",
      ],
      technologies: ["React", "Node.js", "AWS"],
    },
    {
      position: "Full Stack Developer",
      company: "StartUp Innovations",
      location: "San Jose, CA",
      duration: "2019-2020",
      description: "Full stack development for SaaS products",
      achievements: [
        "Developed real-time collaboration features",
        "Improved database performance",
      ],
      technologies: ["Vue.js", "Python", "PostgreSQL"],
    },
  ],

  portfolio: [
    {
      title: "E-commerce Platform",
      description: "Full-featured online store with payment integration",
      image: "https://via.placeholder.com/300",
      link: "#",
      technologies: ["React", "Node.js", "Stripe"],
      highlights: [
        "100,000+ monthly active users",
        "99.9% uptime",
        "Mobile-first design",
      ],
    },
    {
      title: "Task Management App",
      description: "Real-time collaboration tool for teams",
      image: "https://via.placeholder.com/300",
      link: "#",
      technologies: ["Vue.js", "Firebase", "Material UI"],
      highlights: [
        "Real-time updates",
        "Offline support",
        "Cross-platform compatibility",
      ],
    },
  ],

  stats: {
    earnings: {
      total: 75000,
      monthly: 6250,
      trend: "+12%",
    },
    projects: {
      completed: 32,
      ongoing: 3,
      satisfaction: 98,
      onTime: 95,
    },
    ratings: {
      average: 4.8,
      total: 127,
      breakdown: {
        5: 85,
        4: 32,
        3: 8,
        2: 2,
        1: 0,
      },
    },
    hours: {
      total: 2840,
      weekly: 35,
      availability: "Open to offers",
    },
    points: 1500,
  },

  social: {
    github: "https://github.com/alexjohnson",
    linkedin: "https://linkedin.com/in/alexjohnson",
    website: "https://alexjohnson.dev",
    twitter: "https://twitter.com/alexjohnson",
  },

  education: role !== 'freelancer' ? [
    // education data
  ] : null,

  company_details: {
    name: "Tech Solutions Inc.",
    company_type: "Private Limited",
    industry: "Information Technology",
    employee_count: "50-100",
    gst_number: "GST123456789",
    pan_number: "ABCDE1234F",
    registration_number: "REG123456",
    registration_date: "2020-01-15",
    website: "https://techsolutions.com",
    annual_turnover: "₹5,00,00,000",
    verified: true
  },

  bank_details: {
    account_holder_name: "Alex Johnson",
    account_number: "1234567890",
    bank_name: "HDFC Bank",
    branch_name: "Main Branch",
    ifsc_code: "HDFC0001234",
    swift_code: "HDFCINBB",
    verified: true
  },

  addresses: [
    {
      address_type: "Primary",
      is_primary: true,
      street_address: "123 Tech Park, Silicon Valley",
      city: "San Francisco",
      state: "California",
      country: "United States",
      postal_code: "94105",
      verified: true
    },
    {
      address_type: "Secondary",
      is_primary: false,
      street_address: "456 Business Center",
      city: "San Jose",
      state: "California",
      country: "United States",
      postal_code: "95113",
      verified: false
    }
  ]
});

// Tab Components
const SkillsTab = ({ skills = [], languages = [] }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Skills & Expertise</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-white/10 text-white/90 rounded text-sm border border-white/20">
              {skill.name}
            </span>
          ))}
        </div>
      </div>
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Languages</h3>
        <div className="space-y-2">
          {languages.map((lang, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white/90">{lang.name}</span>
              <span className="text-sm text-white/60">{lang.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
// ... existing code ...

const ExperienceTab = ({ experience = [], portfolio = [], completedProjects = [] }) => (
  <div className="space-y-6">
    
    {/* Experience Section */}
    {experience.length > 0 && (
      <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-white">Work Experience</h3>
      {experience.map((exp, index) => (
        <div
          key={index}
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6 mb-4 shadow-lg"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="flex gap-2 items-center">
                <h3 className="text-lg font-semibold text-white">{exp.title}</h3>
                <p className="capitalize text-xs text-text-light bg-white/10 py-[2px] px-2 rounded-md">
                  {exp.status}
                </p>
              </span>
              <p className="text-freelancer-accent text-sm">{exp.client.username}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="bg-blue-900/30 text-blue-200 text-xs px-2 py-1 rounded">
                  {exp.domain?.name}
                </span>
                <span className="bg-green-900/30 text-green-200 text-xs px-2 py-1 rounded">
                  {exp.complexity_level}
                </span>
                {exp.skills_required?.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-purple-900/30 text-purple-200 text-xs px-2 py-1 rounded"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm text-white/70 block">{exp.deadline}</span>
              <span className="text-sm text-white/90 font-semibold block mt-1">
                {exp.pricing_strategy === "fixed" ? (
                  <>₹{Number(exp.budget).toLocaleString()} <span className="text-xs text-white/60">(Fixed)</span></>
                ) : (
                  <>
                    ₹{Number(exp.hourly_rate).toLocaleString()}<span className="text-xs text-white/60">/hr</span>
                    {exp.max_hours && (
                      <span className="text-xs text-white/60 ml-2">Max {exp.max_hours} hrs</span>
                    )}
                  </>
                )}
              </span>
              <span className="text-xs text-white/60 block mt-1 capitalize">
                {exp.payment_strategy} payment
              </span>
            </div>
          </div>
          {/* Description rendered as HTML */}
          <div
            className="mt-2 text-white/80 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: exp.description }}
          />
          {exp.achievements && exp.achievements.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-white">Key Achievements:</h4>
              <ul className="list-disc list-inside space-y-1 text-white/80">
                {exp.achievements.map((achievement, idx) => (
                  <li key={idx}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
    )}

    {/* Portfolio Section */}
    {portfolio.length > 0 && (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <FileProtectOutlined />
          Portfolio
        </h3>
        {portfolio.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileProtectOutlined className="text-freelancer-accent" />
                <div>
                  <h4 className="text-white font-medium">{item.title}</h4>
                  <p className="text-sm text-white/60">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  type="link"
                  className="text-freelancer-accent"
                  onClick={() => window.open(item.link, '_blank')}
                >
                  View
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

// ... existing code ...

const EducationTab = ({ education = [] }) => (
  <div className="space-y-6">
    {education.map((edu, index) => (
      <div key={index} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{edu.degree}</h3>
            <p className="text-text-light">{edu.institution}</p>
          </div>
          <span className="text-sm text-text-secondary">{edu.duration}</span>
        </div>
        <p className="mt-2 text-text-secondary">{edu.description}</p>
        {edu.achievements && (
          <div className="mt-4">
            <h4 className="font-medium mb-2 text-text-primary">Achievements:</h4>
            <ul className="list-disc list-inside space-y-1 text-text-secondary">
              {edu.achievements.map((achievement, idx) => (
                <li key={idx}>{achievement}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ))}
  </div>
);

const ReviewsTab = ({ reviews = [], averageRating = 0 }) => (
  <div className="space-y-6">
    {/* Rating Overview */}
    <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
      <div className="text-center">
        <div className="text-3xl font-bold text-yellow-500">{averageRating}</div>
        <div className="text-sm text-white/60">Average Rating</div>
      </div>
      <div className="flex-1 max-w-sm mx-8">
        {[5,4,3,2,1].map(rating => {
          const count = reviews.filter(r => r.rating === rating).length;
          const percentage = (count / reviews.length) * 100;
          return (
            <div key={rating} className="flex items-center space-x-2">
              <span className="text-sm w-8 text-white/80">{rating}★</span>
              <Progress 
                percent={percentage} 
                size="small" 
                showInfo={false}
                strokeColor="var(--freelancer-accent)"
                trailColor="rgba(255, 255, 255, 0.1)"
              />
              <span className="text-sm w-8 text-white/80">{count}</span>
              </div>
          );
        })}
      </div>
    </div>

    {/* Reviews List */}
    <div className="space-y-4">
      {reviews.map((review) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-start space-x-4">
            <Avatar size={48}>
              {review.from_user__username ? review.from_user__username[0] : '?'}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-white">{review.from_user__username || 'Anonymous'}</h4>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                  <StarOutlined
                      key={i}
                      className={i < (review.rating || 0) ? 'text-yellow-400' : 'text-white/30'}
                  />
                ))}
              </div>
            </div>
              <p className="mt-2 text-white/80">{review.feedback || 'No feedback provided'}</p>
              <div className="mt-2 text-sm text-white/60">
                <CalendarOutlined className="mr-1" />
                {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Date not available'}
          </div>
        </div>
      </div>
        </motion.div>
    ))}
    </div>
  </div>
);

const AcademicTab = ({ academic = {} }) => (
  <div className="space-y-6">
    <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
      <h3 className="text-lg font-semibold mb-4 text-text-primary">Academic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p className="text-text-secondary">Current GPA: <span className="font-medium text-text-primary">{academic.gpa || 'N/A'}</span></p>
          <p className="text-text-secondary">Major: <span className="font-medium text-text-primary">{academic.major || 'N/A'}</span></p>
          <p className="text-text-secondary">Minor: <span className="font-medium text-text-primary">{academic.minor || 'N/A'}</span></p>
        </div>
        <div>
          <p className="text-text-secondary">Expected Graduation: <span className="font-medium text-text-primary">{academic.expectedGraduation || 'N/A'}</span></p>
          <p className="text-text-secondary">Current Semester: <span className="font-medium text-text-primary">{academic.currentSemester || 'N/A'}</span></p>
        </div>
      </div>
    </div>
    
    {academic.research && (
      <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold mb-4 text-text-primary">Research & Publications</h3>
        <div className="space-y-4">
          {academic.research.map((item, index) => (
            <div key={index} className="border-b border-ui-border pb-4 last:border-b-0 last:pb-0">
              <h4 className="font-medium text-text-primary">{item.title}</h4>
              <p className="text-text-secondary mt-1">{item.description}</p>
              <span className="text-sm text-text-light">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Get tab items function
const getTabItems = (profile, reviews) => [
  {
    key: "1",
    label: "Skills & Expertise",
    children: <SkillsTab skills={profile?.skills || []} />
  },
  {
    key: "2",
    label: "Experience & Portfolio",
    children: <ExperienceTab experience={profile?.experience || []} portfolio={profile?.portfolio || []} completedProjects={profile?.completed_projects || []} />
  },
  {
    key: "3",
    label: "Reviews & Ratings",
    children: <ReviewsTab reviews={reviews || []} averageRating={profile?.avg_rating || 0} />
  }
];

const getFreelancerStats = (data) => {
  const stats = data?.stats || {};
  const completedProjects = stats?.projects?.completed || 0;
  const hourlyRate = data?.basic?.hourlyRate || 0;

  return [
    {
      title: "Total Earnings",
      value: completedProjects * hourlyRate,
      icon: <DollarOutlined className="text-2xl" />,
      color: "freelancer",
      trend: "up",
      trendValue: stats?.earnings?.trend || 0
    },
    {
      title: "Success Rate",
      value: stats?.projects?.satisfaction || 0,
      icon: <CheckCircleOutlined className="text-2xl" />,
      color: "success",
      suffix: "%",
      trend: "up",
      trendValue: 5
    },
    {
      title: "Active Projects",
      value: stats?.projects?.ongoing || 0,
      icon: <ProjectOutlined className="text-2xl" />,
      color: "blue"
    },
    {
      title: "Average Rating",
      value: stats?.ratings?.average || 0,
      icon: <StarOutlined className="text-2xl" />,
      color: "warning",
      suffix: "/5",
      trend: "up",
      trendValue: 8
    }
  ];
};

const getStudentStats = (data) => {
  const studentInfo = data?.student || {};
  
  return [
    {
      title: "Learning Progress",
      value: studentInfo?.academic?.progress || 0,
      icon: <BookOutlined className="text-2xl" />,
      color: 'teal',
      suffix: "%"
    },
    {
      title: "Skills Mastered",
      value: studentInfo?.professional?.skills?.length || 0,
      icon: <ExperimentOutlined className="text-2xl" />,
      color: 'indigo'
    },
    {
      title: "Academic Projects",
      value: studentInfo?.academic?.projects?.length || 0,
      icon: <ProjectOutlined className="text-2xl" />,
      color: 'yellow'
    },
    {
      title: "Internships",
      value: studentInfo?.experience?.internships?.length || 0,
      icon: <FaBriefcase className="text-2xl" />,
      color: 'pink'
    }
  ];
};

// Action buttons component
const ActionButtons = ({ isEditable }) => (
  <div className="flex gap-3">
    {isEditable ? (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-2 px-4 py-2 bg-freelancer-primary text-white rounded border border-freelancer-primary transition-colors"
      >
        <FaEdit />
        Edit Profile
      </motion.button>
    ) : (
      <>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2 bg-freelancer-primary text-white rounded border border-freelancer-primary transition-colors"
        >
          <GrConnect />
          Connect
        </motion.button>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-text-primary rounded border border-ui-border transition-colors"
        >
          <BiSolidMessageRounded />
          Message
        </motion.button>
      </>
    )}
  </div>
);

// First, let's update the AboutSection component to be more compact for the hero section
const AboutSection = ({ about }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 200; // Shorter for hero section
  
  if (!about) return null;
  
  const shouldShowReadMore = about.length > maxLength;
  const displayText = isExpanded ? about : about.slice(0, maxLength) + '...';
  
  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 w-full">
      <div className="flex items-center gap-3 mb-4">
        <FileProtectOutlined className="text-freelancer-accent text-lg" />
        <h3 className="text-base font-semibold text-white">About</h3>
      </div>
      <div className="relative">
        <div className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
          {displayText}
        </div>
        {shouldShowReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-freelancer-accent hover:text-freelancer-accent/80 text-sm font-medium transition-colors"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </div>
    </div>
  );
};

// Level definitions
const LEVELS = [
  // Bronze
  { tier: "Bronze", color: "#cd7f32", min: 0, max: 119, sub: 1 },
  { tier: "Bronze", color: "#cd7f32", min: 120, max: 249, sub: 2 },
  { tier: "Bronze", color: "#cd7f32", min: 250, max: 379, sub: 3 },
  // Silver
  { tier: "Silver", color: "#C0C0C0", min: 380, max: 529, sub: 1 },
  { tier: "Silver", color: "#C0C0C0", min: 530, max: 699, sub: 2 },
  { tier: "Silver", color: "#C0C0C0", min: 700, max: 889, sub: 3 },
  // Gold
  { tier: "Gold", color: "#FFD700", min: 890, max: 1099, sub: 1 },
  { tier: "Gold", color: "#FFD700", min: 1100, max: 1349, sub: 2 },
  { tier: "Gold", color: "#FFD700", min: 1350, max: Infinity, sub: 3 },
];

// Helper to get current level
function getFreelancerLevel(points) {
  return LEVELS.find(lvl => points >= lvl.min && points <= lvl.max) || LEVELS[0];
}

// Main AuthProfile component
const AuthProfile = () => {
  const navigate = useNavigate();
  const { userId, role: originalRole, isEditable } = useOutletContext();
const role = originalRole === 'student' ? 'freelancer' : originalRole;
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [dummyData, setDummyData] = useState(null);
  const [error, setError] = useState(null);
  
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showCompletionDetails, setShowCompletionDetails] = useState(false);
  const [categoryScores, setCategoryScores] = useState({
    basic_info: { score: 0, total: 20 },
    professional_info: { score: 0, total: 25 },
    verification: { score: 0, total: 30 },
    academic_details: { score: 0, total: 25 }
  });

  const [levelModalOpen, setLevelModalOpen] = useState(false);

  useEffect(() => {
    try {
      if (role) {
        const initialDummyData = getDummyData(role);
        setDummyData(initialDummyData);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await axios.get(
          `${getBaseURL()}/api/freelancer/get_profile_data/`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching freelancer profile data:", error);
      }
    };
    fetchProfileData();
  }, []);

  // Profile completion calculation
  useEffect(() => {
    if (dummyData) {
      const basic = calculateBasicInfoScore(dummyData);
      const professional = calculateProfessionalInfoScore(dummyData);
      const verification = calculateVerificationScore(dummyData);
      const academic = role === 'student' ? calculateAcademicScore(dummyData) : { score: 0, total: 0 };
      
      setCategoryScores({
        basic_info: basic,
        professional_info: professional,
        verification: verification,
        academic_details: academic
      });
      
      const totalScore = basic.score + professional.score + verification.score + academic.score;
      const totalPossible = basic.total + professional.total + verification.total + 
        (role === 'student' ? academic.total : 0);
      
      setProfileCompletion(Math.round((totalScore / totalPossible) * 100));
    }
  }, [dummyData, role]);

  // Helper functions for profile completion calculation
  const calculateBasicInfoScore = (data) => {
    const fields = ['name', 'avatar', 'bio', 'location', 'email'];
    let score = 0;
    fields.forEach(field => {
      if (data.basic?.[field]) score += 4;
    });
    return { score, total: 20, pending_items: getPendingItems(data, 'basic', fields) };
  };

  const calculateProfessionalInfoScore = (data) => {
    const fields = ['skills', 'experience', 'hourlyRate', 'availability', 'languages'];
    let score = 0;
    fields.forEach(field => {
      if (field === 'skills' && data.professional?.skills?.length > 0) score += 5;
      else if (field === 'experience' && data.experience?.length > 0) score += 5;
      else if (field === 'languages' && data.professional?.languages?.length > 0) score += 5;
      else if (data.basic?.[field]) score += 5;
    });
    return { score, total: 25, pending_items: getPendingItems(data, 'professional', fields) };
  };

  const calculateVerificationScore = (data) => {
    const fields = ['email_verified', 'identity_verified', 'portfolio_verified', 'skills_verified', 'certifications_verified'];
    let score = 0;
    fields.forEach(field => {
      if (data.verification?.[field]) score += 5;
    });
    return { score, total: 30, pending_items: getPendingItems(data, 'verification', fields) };
  };

  const calculateAcademicScore = (data) => {
    if (!data.student) return { score: 0, total: 25, pending_items: [] };
    
    const fields = ['institution', 'major', 'minor', 'expectedGraduation', 'research'];
    let score = 0;
    fields.forEach(field => {
      if (field === 'research' && data.student?.research?.length > 0) score += 5;
      else if (data.student?.[field] || data.student?.academic?.[field]) score += 5;
    });
    return { score, total: 25, pending_items: getPendingItems(data, 'academic', fields) };
  };

  const getPendingItems = (data, category, fields) => {
    const pendingItems = [];
    const messages = {
      basic: {
        name: 'Add your full name',
        avatar: 'Upload a profile picture',
        bio: 'Write a professional bio',
        location: 'Add your location',
        email: 'Verify your email address'
      },
      professional: {
        skills: 'Add your professional skills',
        experience: 'Add your work experience',
        hourlyRate: 'Set your hourly rate',
        availability: 'Set your availability',
        languages: 'Add languages you speak'
      },
      verification: {
        email_verified: 'Verify your email',
        identity_verified: 'Complete identity verification',
        portfolio_verified: 'Add verified portfolio items',
        skills_verified: 'Get skills verification',
        certifications_verified: 'Upload certification documents'
      },
      academic: {
        institution: 'Add your educational institution',
        major: 'Add your major',
        minor: 'Add your minor (if applicable)',
        expectedGraduation: 'Add expected graduation date',
        research: 'Add research experience'
      }
    };
    
    fields.forEach(field => {
      let isComplete = false;
      
      if (category === 'basic') {
        isComplete = Boolean(data.basic?.[field]);
      } else if (category === 'professional') {
        isComplete = field === 'skills' ? data.professional?.skills?.length > 0 :
                     field === 'experience' ? data.experience?.length > 0 :
                     field === 'languages' ? data.professional?.languages?.length > 0 :
                     Boolean(data.basic?.[field]);
      } else if (category === 'verification') {
        isComplete = Boolean(data.verification?.[field]);
      } else if (category === 'academic') {
        isComplete = field === 'research' ? data.student?.research?.length > 0 :
                   Boolean(data.student?.[field] || data.student?.academic?.[field]);
      }
      
      if (!isComplete) {
        pendingItems.push({
          item: messages[category][field],
          priority: category === 'verification' ? 'high' : 'medium'
        });
      }
    });
    
    return pendingItems;
  };

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center text-status-error">
          <p>Error loading profile: {error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded h-12 w-12 border-t-2 border-b-2 border-freelancer-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return <div>Loading...</div>;
  }

  const { user, profile, reviews } = profileData || {};

  const displayData = dummyData || {};

  // Use backend values if available, fallback to dummyData for dev/demo
  const points = profile?.points ?? displayData?.stats?.points ?? 0;
  const currentLevel = profile?.tier ?? "Bronze";
  const currentSubLevel = profile?.sub_level ?? 1;

  // Find the LEVELS object for this level/sub_level
  const levelObj = LEVELS.find(
    lvl => lvl.tier === currentLevel && lvl.sub === currentSubLevel
  ) || LEVELS[0];

  const currentLevelIndex = LEVELS.findIndex(
    lvl => lvl.tier === currentLevel && lvl.sub === currentSubLevel
  );
  const nextLevel = LEVELS[currentLevelIndex + 1] || levelObj;

  const isLastLevel = levelObj.max === Infinity;
  const progressToNext = isLastLevel
    ? 100
    : Math.round(((points - levelObj.min) / (levelObj.max - levelObj.min)) * 100);

  const getImageUrl = (url) => {
    if (!url || url === "null" || url === "") return '/path/to/fallback-image.jpg';
    return url;
  };

  return (
    <div className="min-h-fit w-full bg-freelancer-primary">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-freelancer-accent/2 rounded-full blur-2xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-brand-accent/1 rounded-full blur-xl animate-float-delayed"></div>
      </div>

      <div className="relative z-10 w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Row 1: Profile Header and Profile Completion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 mb-3 sm:mb-6">
          {/* Profile Header Card */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-xl sm:rounded-2xl ${
              profileCompletion === 100 
                ? 'lg:col-span-12' 
                : 'lg:col-span-8'
            }`}
          >
            {/* Premium Background with Multiple Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-freelancer-primary via-freelancer-primary/95 to-freelancer-bg-card"></div>
            <div className="absolute inset-0 bg-freelancer-gradient-soft opacity-30"></div>
            
            {/* Floating Orbs - Responsive */}
            <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-freelancer-accent/10 rounded-full blur-3xl -mr-24 lg:-mr-48 -mt-24 lg:-mt-48 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-brand-accent/8 rounded-full blur-2xl -ml-20 lg:-ml-40 -mb-20 lg:-mb-40 animate-float-delayed"></div>
            <div className="absolute top-1/2 right-1/4 w-16 h-16 lg:w-32 lg:h-32 bg-freelancer-accent/10 rounded-full blur-xl"></div>

            {/* Hero Section */}
            <div className="relative px-4 sm:px-8 py-6 sm:py-10">
              {/* Profile Image and Basic Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                {/* Profile Image Section */}
                <div className="relative z-10">
                  <div className="relative group">
        <div className="relative">
                      <Avatar 
                        size={120}
                        src={displayData?.basic?.avatar}
                        icon={<UserOutlined />}
                        className="border-4 border-white/20 shadow-xl transition-transform duration-300 group-hover:scale-105"
                      />
            {isEditable && (
              <Button 
                icon={<EditOutlined />}
                          size={"default"}
                          className="absolute -bottom-2 -right-2 rounded-full bg-freelancer-accent/90 hover:bg-freelancer-accent text-white border-none shadow-lg transition-all duration-300 hover:scale-110"
                          onClick={() => navigate(`/freelancer/profile/${userId}/edit_profile`)}
              />
            )}
          </div>
                    {/* Profile Status Badge */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                      <Tag color="freelancer-accent" className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                        {displayData?.basic?.role}
                      </Tag>
                </div>
          </div>
        </div>

                {/* Profile Info Section */}
                <div className="flex-1 z-10 text-center sm:text-left">
                  {/* Name and Tags */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-3 sm:gap-4 mb-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                      {user?.username}
                </h1>
                {/* Level Badge */}
                <button
                  onClick={() => setLevelModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm shadow-lg border"
                  style={{
                    background: "#cd7f3222", // Bronze color fallback
                    color: "#cd7f32",
                    borderColor: "#cd7f3288"
                  }}
                  title="View Level & Points Info"
                >
                  <TrophyOutlined />
                  {profile?.tier || "Bronze"}
                </button>
                {profileCompletion === 100 && (
                  <Tag color="success" icon={<CheckCircleOutlined />} className="px-3 py-1">
                    Profile Complete
                </Tag>
                )}
                {/* Connections count */}
                <Tooltip title="Connections" placement="top">
                  <div
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-medium cursor-pointer hover:bg-freelancer-accent/20 transition"
                    style={{ userSelect: 'none' }}
                    onClick={()=>navigate(`/freelancer/profile/${user?.id}/connections`)}
                  >
                    <UsergroupAddOutlined className="text-freelancer-accent" />
                    {profile?.connections || 0}
                    <span className="ml-1">Connections</span>
              </div>
                </Tooltip>
              </div>
{profile?.bio && (
  <div className="mb-4">
    <p className="text-white/90 text-sm italic border-l-2 border-freelancer-accent pl-3">
      {profile.bio}
    </p>
  </div>
)}
  
                  
                  {/* Contact Information */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {[
                      { icon: <MailOutlined />, label: 'Email', value: user?.email },
                      { icon: <UserOutlined />, label: 'Role', value: user?.role || 'Not specified' },
                      { icon: <CalendarOutlined />, label: 'Joined', value: user?.joined ? new Date(user.joined).toLocaleDateString() : 'Not provided' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                        <div className="p-1.5 rounded-lg bg-white/10 flex-shrink-0">
                          {React.cloneElement(item.icon, { className: 'text-freelancer-accent text-base' })}
              </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="text-xs font-medium text-white/60 truncate">{item.label}</p>
                          <p className="text-sm text-white/90 truncate">{item.value}</p>
            </div>
                      </div>
                    ))}
          </div>

                  {/* Stats Section */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300">
                      <div className="p-2 rounded-lg bg-white/10">
                        <StarOutlined className="text-freelancer-accent text-base" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-white/60">Rating</p>
                        <p className="text-sm text-white/90">{displayData?.stats?.ratings?.average || 0} ({displayData?.stats?.ratings?.total || 0} reviews)</p>
                      </div>
                    </div>
                  </div>
                </div>
          </div>

              {/* About */}
              <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* About section moved here */}
                <AboutSection about={profile?.about} />
                            </div>
                          </div>
      </motion.div>

          {/* Profile Completion Card (if not 100%) */}
          {profileCompletion !== 100 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-4 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center"
            >
                          <Progress 
                type="circle"
                percent={profileCompletion}
                size={80}
                strokeColor="#7c3aed"
              />
              <div className="mt-4 text-center">
                <p className="font-semibold text-text-light">Profile {profileCompletion}% Complete</p>
                <Button
                  type="link"
                  className="text-text-light mt-2"
                  onClick={() => setShowCompletionDetails(true)}
                >
                  Complete Now →
                </Button>
              </div>
            </motion.div>
                            )}
                          </div>

        {/* Row 2: Company Details and Bank Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Company Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShopOutlined className="text-freelancer-accent" />
                  Company Details
                </h3>
                {profile?.company_details?.verified && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
                )}
              </div>

              {profile?.company_details && Object.values(profile.company_details).some(value => value) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {[
                    { label: 'Company Name', value: profile.company_details.name },
                    { label: 'Company Type', value: profile.company_details.company_type },
                    { label: 'Industry', value: profile.company_details.industry },
                    { label: 'Employee Count', value: profile.company_details.employee_count },
                    { label: 'GST Number', value: profile.company_details.gst_number },
                    { label: 'PAN Number', value: profile.company_details.pan_number },
                    { label: 'Registration Number', value: profile.company_details.registration_number },
                    { label: 'Registration Date', value: profile.company_details.registration_date },
                    { label: 'Website', value: profile.company_details.website },
                    { label: 'Annual Turnover', value: profile.company_details.annual_turnover }
                  ].map((item, index) => (
                    item.value && (
                      <div key={index} className="flex flex-col">
                        <p className="text-xs text-white/60">{item.label}</p>
                        <p className="text-sm text-white/80 mt-1">{item.value}</p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <ShopOutlined className="text-4xl text-white/40" />
                    <p className="text-white/60">Add your company details to complete your profile</p>
                          <Button 
                      type="primary"
                      className="bg-freelancer-accent hover:bg-freelancer-accent/90"
                      onClick={() => navigate(`/freelancer/profile/${userId}/edit_profile`)}
                          >
                      Add Company Details
                          </Button>
                  </div>
                </div>
            )}
            </div>
        </motion.div>

          {/* Bank Details Card */}
      <motion.div 
            initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
      >
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BankOutlined className="text-freelancer-accent" />
                  Bank Details
                </h3>
                {profile?.bank_details?.verified && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
            )}
          </div>
          
              {profile?.bank_details && Object.values(profile.bank_details).some(value => value) ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  {[
                    { label: 'Account Holder', value: profile.bank_details.account_holder_name },
                    { label: 'Account Number', value: profile.bank_details.account_number },
                    { label: 'Bank Name', value: profile.bank_details.bank_name },
                    { label: 'Branch Name', value: profile.bank_details.branch_name },
                    { label: 'IFSC Code', value: profile.bank_details.ifsc_code },
                    { label: 'SWIFT Code', value: profile.bank_details.swift_code }
                  ].map((item, index) => (
                    item.value && (
                      <div key={index} className="flex flex-col">
                        <p className="text-xs text-white/60">{item.label}</p>
                        <p className="text-sm text-white/80 mt-1">{item.value}</p>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center gap-4">
                    <BankOutlined className="text-4xl text-white/40" />
                    <p className="text-white/60">Add your bank details to complete your profile</p>
                    <Button
                      type="primary"
                      className="bg-freelancer-accent hover:bg-freelancer-accent/90"
                      onClick={() => navigate(`/freelancer/profile/${userId}/edit_profile`)}
                    >
                      Add Bank Details
                    </Button>
                  </div>
                </div>
              )}
            </div>
            </motion.div>
        </div>

        {/* Row 3: Addresses and Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Addresses Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                <EnvironmentOutlined className="text-freelancer-accent" />
                Addresses
              </h3>

              {profile?.addresses?.length > 0 && profile.addresses.map((address, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <Tag color={address.is_primary ? 'success' : 'default'}>
                      {address.address_type}
                    </Tag>
                    {address.verified && (
                      <Tag color="success" icon={<CheckCircleOutlined />}>Verified</Tag>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-white/80">{address.street_address}</p>
                    <p className="text-white/60">{address.city}, {address.state}</p>
                    <p className="text-white/60">{address.country} - {address.postal_code}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tabs Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <div className="p-4 sm:p-6">
            {
            console.log(profile)
            }
              <Tabs
                defaultActiveKey="1"
                items={getTabItems(profile, reviews)}
                tabBarGutter={32}
                tabBarStyle={{ fontWeight: 600, fontSize: 16 }}
                className="custom-tabs"
              />
        </div>
      </motion.div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--freelancer-accent);
        }
        
        .custom-tabs .ant-tabs-ink-bar {
          background: var(--freelancer-accent);
        }

        .ant-card {
          background: transparent;
        }

        .ant-card-head {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ant-card-head-title {
          color: white;
        }

        .ant-tabs-tab {
          color: rgba(255, 255, 255, 0.6);
        }

        .ant-tabs-tab:hover {
          color: var(--freelancer-accent);
        }

        .custom-timeline .ant-timeline-item-tail {
          border-color: rgba(255, 255, 255, 0.1);
        }

        .custom-timeline .ant-timeline-item-head {
          background-color: var(--freelancer-accent);
        }

        .custom-pagination .ant-pagination-item {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .custom-pagination .ant-pagination-item a {
          color: white;
        }

        .custom-pagination .ant-pagination-item-active {
          background: var(--freelancer-accent);
          border-color: var(--freelancer-accent);
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

        /* Level Modal Styles */
        .level-modal .ant-modal-content {
          background: var(--freelancer-bg-card);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
        }

        .level-modal .ant-modal-header {
          background: transparent;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px 24px 16px;
        }

        .level-modal .ant-modal-title {
          color: var(--text-light);
        }

        .level-modal .ant-modal-body {
          background: transparent;
          padding: 24px;
        }

        .level-modal .ant-modal-close {
          color: var(--text-muted);
        }

        .level-modal .ant-modal-close:hover {
          color: var(--freelancer-accent);
        }

        /* Animated shine effect */
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-shine {
          animation: shine 2s infinite;
        }

        /* Hover effects for cards */
        .level-modal .bg-freelancer-bg-card:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
      `}</style>

      {/* Level Info Modal */}
      <Modal
        open={levelModalOpen}
        onCancel={() => setLevelModalOpen(false)}
        footer={null}
        width={800}
        className="level-modal"
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-freelancer-accent/20">
              <TrophyOutlined className="text-2xl text-freelancer-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-light mb-1">Freelancer Levels & Points</h2>
              <p className="text-sm text-text-muted">Track your progress and unlock new opportunities</p>
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Current Level Progress */}
          <div className="bg-freelancer-bg-card rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-light">Your Current Progress</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Level:</span>
                <span 
                  className="px-3 py-1 rounded-full font-bold text-sm"
                  style={{
                    background: levelObj.color + "22",
                    color: levelObj.color,
                    border: `1px solid ${levelObj.color}88`
                  }}
                >
                  {currentLevel} {currentSubLevel}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Current Points: {points}</span>
                <span className="text-text-muted">
                  {nextLevel.max === Infinity ? 'Max Level' : `${nextLevel.min} pts to ${nextLevel.tier} ${nextLevel.sub}`}
                </span>
              </div>
              <div className="relative">
                <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/20">
                  <div 
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                      width: `${Math.min(Math.max(progressToNext, 0), 100)}%`,
                      background: `linear-gradient(90deg, ${levelObj.color}88, ${levelObj.color})`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-text-muted">{levelObj.min}</span>
                  <span className="text-xs text-text-muted">{nextLevel.min}</span>
                </div>
              </div>
            </div>
          </div>

          {/* How to Earn Points */}
          <div className="bg-freelancer-bg-card rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-text-light mb-4 flex items-center gap-2">
              <RocketOutlined className="text-freelancer-accent" />
              How to Earn Points
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: <TrophyOutlined />, title: "Complete OBSPs", desc: "More points for higher difficulty levels", points: "50-200 pts" },
                { icon: <ProjectOutlined />, title: "Traditional Projects", desc: "Successfully complete client projects", points: "25-100 pts" },
                { icon: <StarOutlined />, title: "High Ratings", desc: "Get 4.5+ star ratings from clients", points: "10-50 pts" },
                { icon: <CheckCircleOutlined />, title: "On-time Delivery", desc: "Complete projects before deadline", points: "15 pts" }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="p-2 rounded-lg bg-freelancer-accent/20">
                    {React.cloneElement(item.icon, { className: 'text-freelancer-accent' })}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-text-light mb-1">{item.title}</h4>
                    <p className="text-sm text-text-muted mb-2">{item.desc}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-freelancer-accent/20 text-freelancer-accent">
                      {item.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Level Tiers */}
          <div className="bg-freelancer-bg-card rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-text-light mb-4 flex items-center gap-2">
              <CrownOutlined className="text-freelancer-accent" />
              Level Tiers & Benefits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["Bronze", "Silver", "Gold"].map(tier => {
                const tierLevels = LEVELS.filter(l => l.tier === tier);
                const tierColor = tierLevels[0].color;
                return (
                  <div 
                    key={tier} 
                    className="rounded-xl p-4 border-2 transition-all hover:scale-105"
                    style={{ 
                      borderColor: tierColor + "44",
                      background: `linear-gradient(135deg, ${tierColor}11, ${tierColor}05)`
                    }}
                  >
                    <div className="text-center mb-4">
                      <div 
                        className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold"
                        style={{ 
                          background: `linear-gradient(135deg, ${tierColor}88, ${tierColor})`,
                          color: '#fff'
                        }}
                      >
                        {tier === 'Bronze' ? '🥉' : tier === 'Silver' ? '🥈' : '🥇'}
                      </div>
                      <h4 className="font-bold text-lg" style={{ color: tierColor }}>
                        {tier}
                      </h4>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {tierLevels.map(lvl => (
                        <div key={lvl.sub} className="flex justify-between text-sm">
                          <span className="text-text-muted">{tier} {lvl.sub}</span>
                          <span className="text-text-light font-medium">
                            {lvl.min}–{lvl.max === Infinity ? "∞" : lvl.max} pts
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="text-xs text-text-muted">
                      <strong className="text-text-light">Benefits:</strong>
                      <ul className="mt-1 space-y-1">
                        {tier === 'Bronze' && (
                          <>
                            <li>• Access to Easy OBSPs</li>
                            <li>• Basic profile features</li>
                          </>
                        )}
                        {tier === 'Silver' && (
                          <>
                            <li>• Easy & Medium OBSPs</li>
                            <li>• Priority support</li>
                            <li>• Featured placement</li>
                          </>
                        )}
                        {tier === 'Gold' && (
                          <>
                            <li>• All OBSP levels</li>
                            <li>• Premium support</li>
                            <li>• VIP client access</li>
                            <li>• Exclusive projects</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* OBSP Relationship */}
          <div className="bg-freelancer-bg-card rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-text-light mb-4 flex items-center gap-2">
              OBSP Access by Level
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { level: "Bronze", access: "Easy OBSPs", color: "#cd7f32", icon: "🟤" },
                { level: "Silver", access: "Easy & Medium OBSPs", color: "#C0C0C0", icon: "⚪" },
                { level: "Gold", access: "All OBSPs (Easy, Medium, Hard)", color: "#FFD700", icon: "🟡" }
              ].map((item, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-white/5">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="font-semibold text-text-light mb-1">{item.level}</h4>
                  <p className="text-sm text-text-muted">{item.access}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center p-4 rounded-lg bg-freelancer-accent/10 border border-freelancer-accent/20">
            <p className="text-sm text-text-muted">
              <InfoCircleOutlined className="mr-2 text-freelancer-accent" />
              Levels are achieved through consistent, high-quality work. They cannot be bought and reflect your true expertise.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Component implementations
const StudentInfo = ({ profileData }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-3 space-y-2"
  >
    <p className="text-text-secondary flex items-center gap-2">
      <IoSchoolOutline className="text-text-light" />
      {profileData?.institution?.name} • {profileData?.academic?.major}
    </p>
    <div className="flex flex-wrap gap-2 mt-2">
      {profileData?.academic?.coursework?.map((course, index) => (
        <Tag 
          key={index}
          className="text-sm bg-freelancer-bg-card text-text-light px-3 py-1 rounded border border-freelancer-border-DEFAULT"
        >
          {course}
        </Tag>
      ))}
    </div>
  </motion.div>
);

const FreelancerInfo = ({ profileData }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-3 space-y-2"
  >
    <div className="flex items-center gap-3">
      <p className="text-text-secondary flex items-center gap-2">
        <FaBriefcase className="text-text-light" />
        {profileData?.experience?.[0]?.position || 'Experienced Professional'}
      </p>
      <Tag className="flex items-center gap-1 bg-freelancer-bg-card text-text-light border border-freelancer-border-DEFAULT">
        <StarOutlined />
        {profileData?.stats?.ratings?.average || '4.8'} Rating
      </Tag>
    </div>
    <div className="flex flex-wrap gap-2">
      {profileData?.skills?.map((skill, index) => (
        <Tag 
          key={index}
          className="text-sm bg-freelancer-bg-card text-text-light px-3 py-1 rounded border border-freelancer-border-DEFAULT"
        >
          {skill.name}
        </Tag>
      ))}
    </div>
  </motion.div>
);

const ContactAndSocial = ({ freelancerData }) => (
  <div className="mt-4 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="flex items-center text-text-secondary bg-freelancer-bg-DEFAULT p-2 rounded border border-ui-border">
        <MailOutlined className="mr-2 text-text-light" />
        {freelancerData.basic?.email}
      </div>
      <div className="flex items-center text-text-secondary bg-freelancer-bg-DEFAULT p-2 rounded border border-ui-border">
        <EnvironmentOutlined className="mr-2 text-text-light" />
        {freelancerData.basic?.location}
      </div>
    </div>
    
    <div className="flex items-center gap-4 mt-4">
      {freelancerData.social?.github && (
        <a href={freelancerData.social.github} target="_blank" rel="noopener noreferrer">
          <FaGithub className="text-2xl text-text-secondary hover:text-text-light transition-colors" />
        </a>
      )}
      {freelancerData.social?.linkedin && (
        <a href={freelancerData.social.linkedin} target="_blank" rel="noopener noreferrer">
          <FaLinkedin className="text-2xl text-text-secondary hover:text-text-light transition-colors" />
        </a>
      )}
      {freelancerData.social?.website && (
        <a href={freelancerData.social.website} target="_blank" rel="noopener noreferrer">
          <FaGlobe className="text-2xl text-text-secondary hover:text-text-light transition-colors" />
        </a>
      )}
    </div>
  </div>
);

const BioSection = ({ freelancerData }) => (
  freelancerData.basic?.bio && (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-6 bg-freelancer-bg-DEFAULT rounded border border-freelancer-border-DEFAULT"
    >
      <h3 className="text-lg font-semibold text-text-primary mb-3">Professional Bio</h3>
      <p className="text-text-secondary leading-relaxed">{freelancerData.basic.bio}</p>
    </motion.div>
  )
);

// Replace the existing Tabs component with this custom implementation
const CustomTabs = ({ items, defaultActiveKey }) => {
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-freelancer-border-DEFAULT">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveKey(item.key)}
            className={`px-6 py-3 font-medium transition-colors relative
              ${activeKey === item.key 
                ? 'text-text-light border-b-2 border-freelancer-primary' 
                : 'text-text-secondary hover:text-text-light'
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {items.find(item => item.key === activeKey)?.children}
      </div>
    </div>
  );
};

// Add these new components to enhance the profile

// Availability Schedule Component
const AvailabilitySchedule = ({ availability }) => (
  <div className="bg-freelancer-bg-DEFAULT p-4 rounded-lg border border-freelancer-border-DEFAULT">
    <h3 className="text-lg font-semibold text-text-primary mb-4">Weekly Availability</h3>
    <div className="grid grid-cols-7 gap-2">
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
        <div key={idx} className="text-center">
          <div className="text-sm text-text-secondary mb-2">{day}</div>
          <div className={`h-20 rounded-lg ${
            availability?.includes(day.toLowerCase())
              ? 'bg-freelancer-primary/20 border-2 border-freelancer-primary'
              : 'bg-gray-100 border-2 border-transparent'
          }`}>
            <div className="h-full flex items-center justify-center">
              <span className={`text-xs font-medium ${
                availability?.includes(day.toLowerCase())
                  ? 'text-text-light'
                  : 'text-text-secondary'
              }`}>
                {availability?.includes(day.toLowerCase()) ? '✓' : '–'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Achievement Showcase Component
const AchievementShowcase = ({ achievements }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
    {achievements?.map((achievement, idx) => (
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
        className="bg-white p-6 rounded-lg border border-freelancer-border-DEFAULT hover:shadow-lg transition-shadow"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-freelancer-bg-DEFAULT flex items-center justify-center">
            {achievement.icon}
          </div>
          <div>
            <h4 className="font-semibold text-text-primary">{achievement.title}</h4>
            <p className="text-sm text-text-secondary mt-1">{achievement.description}</p>
            {achievement.date && (
              <span className="text-xs text-text-light mt-2 block">
                Achieved: {achievement.date}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

// Skills Radar Chart Component
const SkillsRadar = ({ skills }) => {
  const chartData = {
    labels: skills.map(skill => skill.name),
    datasets: [{
      data: skills.map(skill => skill.level),
      backgroundColor: 'rgba(43, 108, 176, 0.2)',
      borderColor: '#2B6CB0',
      borderWidth: 2,
    }]
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-freelancer-border-DEFAULT">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Skills Overview</h3>
      <div className="h-[300px] w-full">
        {/* Implement with react-chartjs-2 Radar component */}
      </div>
    </div>
  );
};

const SkillProgress = ({ skill }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="mb-4"
  >
    <div className="flex justify-between mb-2">
      <span className="text-text-primary font-medium">{skill.name}</span>
      <span className="text-text-light">{skill.level}%</span>
    </div>
    <div className="h-2 bg-freelancer-bg-DEFAULT rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${skill.level}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full bg-gradient-to-r from-freelancer-primary to-freelancer-secondary"
      />
    </div>
    <div className="mt-1 text-xs text-text-secondary">
      {skill.projects} projects completed
    </div>
  </motion.div>
);

export default AuthProfile; 