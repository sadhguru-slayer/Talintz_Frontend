import React from 'react';
import { Card, Tag, Button, Radio, Space, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import { 
  RocketOutlined, 
  ClockCircleOutlined, 
  CrownOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  StarOutlined
} from '@ant-design/icons';

const TierDetermination = ({ project, tier, onTierChange }) => {
  const getProjectValue = () => {
    if (project.pricing_strategy === 'fixed') {
      return parseFloat(project.budget) || 0;
    } else if (project.pricing_strategy === 'hourly') {
      const hourlyRate = parseFloat(project.hourly_rate) || 0;
      const estimatedHours = parseInt(project.estimated_hours) || 0;
      return hourlyRate * estimatedHours;
    }
    return 0;
  };

  const projectValue = getProjectValue();

  const tiers = [
    {
      key: 'quick',
      title: 'Quick Assignment',
      icon: <RocketOutlined className="text-2xl" />,
      description: 'Fast, simple projects under ₹500',
      features: [
        'Direct assignment after review',
        '24-hour decision window',
        'Simple project requirements',
        'Basic quality checks'
      ],
      color: 'green',
      range: 'Under ₹500',
      recommended: projectValue < 500
    },
    {
      key: 'standard',
      title: 'Standard Process',
      icon: <ClockCircleOutlined className="text-2xl" />,
      description: 'Medium projects ₹500 - ₹2,000',
      features: [
        'Shortlist 3-5 candidates',
        'Optional interview phase',
        '3-5 day decision window',
        'Enhanced quality matching'
      ],
      color: 'blue',
      range: '₹500 - ₹2,000',
      recommended: projectValue >= 500 && projectValue <= 2000
    },
    {
      key: 'premium',
      title: 'Premium Process',
      icon: <CrownOutlined className="text-2xl" />,
      description: 'Complex projects over ₹2,000',
      features: [
        'Multi-stage selection',
        'Mandatory discussion phase',
        '7-14 day decision window',
        'Premium quality assurance'
      ],
      color: 'purple',
      range: 'Over ₹2,000',
      recommended: projectValue > 2000
    }
  ];

  const currentTier = tiers.find(t => t.key === tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-7xl mx-auto"
    >
      {/* Project Summary */}
      <Card className="mb-6 bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{project.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <Tag className="bg-client-accent/20 text-client-accent border-client-accent/30">
                {project.pricing_strategy === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}
              </Tag>
              <Tag className="bg-white/20 text-white border-white/30">
                {project.complexity_level}
              </Tag>
              <div className="flex items-center gap-2 text-white/60">
                <DollarOutlined />
                <span>₹{projectValue.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-white/60">Recommended Tier</div>
              <div className="text-lg font-semibold text-client-accent">
                {currentTier?.title}
              </div>
            </div>
            <Tooltip title="You can change the assignment tier based on your preferences">
              <InfoCircleOutlined className="text-white/60 text-lg" />
            </Tooltip>
          </div>
        </div>
      </Card>

      {/* Tier Selection */}
      <Card className="bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl border border-white/10">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-2">Assignment Process</h2>
          <p className="text-white/60">
            Choose how you'd like to assign this project to freelancers
          </p>
        </div>

        <Radio.Group 
          value={tier} 
          onChange={(e) => onTierChange(e.target.value)}
          className="w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tierOption) => (
              <motion.div
                key={tierOption.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Radio.Button 
                  value={tierOption.key}
                  className="w-full h-full"
                >
                  <Card 
                    className={`h-full transition-all duration-300 ${
                      tier === tierOption.key
                        ? 'bg-client-accent/20 border-client-accent/50 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                        tier === tierOption.key
                          ? 'bg-client-accent text-white'
                          : `bg-${tierOption.color}-500/20 text-${tierOption.color}-400`
                      }`}>
                        {tierOption.icon}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {tierOption.title}
                      </h3>
                      
                      <p className="text-sm text-white/60 mb-3">
                        {tierOption.description}
                      </p>
                      
                      <Tag className={`mb-3 ${
                        tierOption.recommended
                          ? 'bg-green-500/20 text-green-400 border-green-400/30'
                          : 'bg-white/20 text-white/80 border-white/30'
                      }`}>
                        {tierOption.recommended ? 'Recommended' : tierOption.range}
                      </Tag>
                      
                      <ul className="text-left space-y-1">
                        {tierOption.features.map((feature, index) => (
                          <li key={index} className="text-xs text-white/70 flex items-center gap-2">
                            <StarOutlined className="text-client-accent text-xs" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </Radio.Button>
              </motion.div>
            ))}
          </div>
        </Radio.Group>
      </Card>
    </motion.div>
  );
};

export default TierDetermination; 