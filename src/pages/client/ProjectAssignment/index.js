// Project Assignment - Main Entry Point
import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectAssignmentContainer from './ProjectAssignmentContainer';

const ProjectAssignment = () => {
  const { projectId } = useParams();
  
  return <ProjectAssignmentContainer projectId={projectId} />;
};

export default ProjectAssignment;