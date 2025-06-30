import React, { useState, useEffect } from 'react';
import { Spin, Result, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import Cookies from 'js-cookie';
import TierDetermination from './TierDetermination';
import QuickAssignment from './QuickAssignment';
import StandardAssignment from './StandardAssignment';
import PremiumAssignment from './PremiumAssignment';
import {getBaseURL} from '../../../config/axios';

const ProjectAssignmentContainer = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignmentTier, setAssignmentTier] = useState(null);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${getBaseURL()}/api/client/get_project/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
          },
        }
      );
      
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setError(error.response?.data?.error || 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const determineAssignmentTier = (projectData) => {
    // Calculate project value
    let projectValue = 0;
    
    if (projectData.pricing_strategy === 'fixed') {
      projectValue = parseFloat(projectData.budget) || 0;
    } else if (projectData.pricing_strategy === 'hourly') {
      const hourlyRate = parseFloat(projectData.hourly_rate) || 0;
      const estimatedHours = parseInt(projectData.estimated_hours) || 0;
      projectValue = hourlyRate * estimatedHours;
    }

    // Determine tier based on value and complexity
    if (projectValue < 500) {
      return 'quick';
    } else if (projectValue >= 500 && projectValue <= 2000) {
      return 'standard';
    } else {
      return 'premium';
    }
  };

  useEffect(() => {
    if (project) {
      const tier = determineAssignmentTier(project);
      setAssignmentTier(tier);
    }
  }, [project]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-client-bg-dark">
        <div className="text-center">
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: 'var(--client-accent)' }} spin />} 
            size="large"
          />
          <p className="text-white mt-4 text-lg">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-client-bg-dark">
        <Result
          status="error"
          title="Failed to Load Project"
          subTitle={error}
          extra={[
            <Button 
              type="primary" 
              key="retry"
              onClick={fetchProjectData}
              className="bg-client-accent border-none"
            >
              Try Again
            </Button>
          ]}
        />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen bg-client-bg-dark">
        <Result
          status="404"
          title="Project Not Found"
          subTitle="The project you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-client-bg-dark">
      {/* Tier Determination Component */}
      <TierDetermination 
        project={project} 
        tier={assignmentTier}
        onTierChange={setAssignmentTier}
      />

      {/* Render appropriate assignment component based on tier */}
      {assignmentTier === 'quick' && (
        <QuickAssignment project={project} />
      )}
      
      {assignmentTier === 'standard' && (
        <StandardAssignment project={project} />
      )}
      
      {assignmentTier === 'premium' && (
        <PremiumAssignment project={project} />
      )}
    </div>
  );
};

export default ProjectAssignmentContainer; 