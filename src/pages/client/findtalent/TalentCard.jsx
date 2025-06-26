import React, { useState } from "react";
import { Avatar, Tooltip, Tag, Collapse, Button } from "antd";
import {
  StarOutlined,
  RiseOutlined,
  ProjectOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { FaGraduationCap } from "react-icons/fa";

const { Panel } = Collapse;

const TalentCard = ({ freelancer, onViewProfile }) => {
  const [expanded, setExpanded] = useState(false);

  // Always show this as the role for now
  const designatedRole = "Dev & Designer";

  // Only show first 4 skills, rest in tooltip
  const skills = Array.isArray(freelancer.skills) ? freelancer.skills : [];
  const mainSkills = skills.slice(0, 4);
  const extraSkills = skills.length > 4 ? skills.slice(4) : [];

  return (
    <div className="relative bg-gradient-to-br from-client-secondary/40 to-client-bg-dark/30 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      {/* Header */}
      <div className="flex items-center gap-4 p-5 bg-white/5 border-b border-white/10">
        <Avatar
          size={64}
          src={freelancer.avatar}
          className="border-4 border-client-accent/30 shadow-lg"
        />
        <div>
          <h3 className="font-semibold text-white text-lg mb-1">{freelancer.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/70 text-sm">{designatedRole}</span>
            {freelancer.top_rated && (
              <Tag
                color="gold"
                className="ml-2 bg-yellow-400/20 text-yellow-400 border-0 font-medium"
                style={{ borderRadius: 8 }}
              >
                <StarOutlined /> Top Rated
              </Tag>
            )}
            {freelancer.isTalentRise && (
              <Tag
                color="cyan"
                className="ml-2 bg-client-accent/20 text-client-accent border-0 font-medium"
                style={{ borderRadius: 8 }}
              >
                <RiseOutlined /> TalentRise
              </Tag>
            )}
          </div>
        </div>
      </div>
      {/* Skills */}
      <div className="flex flex-wrap gap-2 px-5 pt-3">
        {mainSkills.map((skill, idx) => (
          <Tag
            key={idx}
            className="bg-client-accent/10 text-client-accent border-0 font-medium"
            style={{ borderRadius: 8 }}
          >
            {skill}
          </Tag>
        ))}
        {extraSkills.length > 0 && (
          <Tooltip title={extraSkills.join(", ")}>
            <Tag className="bg-white/10 text-white/60 border-0 font-medium" style={{ borderRadius: 8 }}>
              +{extraSkills.length} more
            </Tag>
          </Tooltip>
        )}
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 px-5 py-3 text-xs text-white/80">
        <div className="flex items-center gap-2">
          <ProjectOutlined className="text-client-accent" /> {freelancer.completed_projects ?? "N/A"} projects
        </div>
        <div className="flex items-center gap-2">
          <TrophyOutlined className="text-yellow-400" /> {freelancer.success_rate ?? "N/A"}% success
        </div>
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-client-primary" /> {freelancer.response_time ?? "N/A"}
        </div>
        <div className="flex items-center gap-2">
          <DollarOutlined className="text-client-accent" /> ₹{freelancer.hourly_rate ?? "N/A"}/hr
        </div>
      </div>
      {/* TalentRise extra */}
      {freelancer.isTalentRise && (
        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 text-xs text-client-accent font-medium">
            <FaGraduationCap /> {freelancer.university} | {freelancer.availableHours} hrs/week
          </div>
        </div>
      )}
      {/* Expandable details */}
      <Collapse
        bordered={false}
        activeKey={expanded ? ["1"] : []}
        onChange={() => setExpanded(!expanded)}
        className="bg-transparent px-5 "
        expandIconPosition="end"
        style={{ borderRadius: 0 }}
      >
        <Panel
          header={<span className="text-client-accent font-medium">More Details</span>}
          key="1"
          className="bg-white/5 border border-white/10 !rounded-tr-lg !rounded-tl-lg"
        >
          {freelancer.academicProjects && (
            <div>
              <div className="font-semibold text-white/80 mb-1">Academic Projects:</div>
              <ul className="list-disc ml-5 text-white/60">
                {freelancer.academicProjects.map((proj, i) => (
                  <li key={i}>{proj}</li>
                ))}
              </ul>
            </div>
          )}
          {/* Add more details as needed */}
        </Panel>
      </Collapse>
      {/* Action */}
      <div className="px-5 pb-5 pt-2">
        <Button
          type="primary"
          className="w-full bg-client-accent hover:bg-client-accent/90 border-none rounded-lg mt-2 font-semibold text-base transition-all duration-300"
          onClick={() => onViewProfile(freelancer.id)}
        >
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default TalentCard;
