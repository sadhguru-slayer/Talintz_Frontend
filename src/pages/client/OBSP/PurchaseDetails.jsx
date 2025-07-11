import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api, { getBaseURL } from '../../../config/axios';  // Adjust the import based on your setup
import Cookies from 'js-cookie';  // For accessing the access token
import { CheckCircleOutlined, CalendarOutlined, InfoCircleOutlined, FileOutlined, DownloadOutlined, UserOutlined, DownOutlined, RightOutlined } from '@ant-design/icons'; // Added for icons

const PurchaseDetails = () => {
  const { obspResponseId } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(null);  // Track the currently expanded phase (single expansion for tab-like feel)

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await fetch(`${getBaseURL()}/api/obsp/api/responses/${parseInt(obspResponseId)}/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await response.json();
        console.log(data.data);
        setDetails(data.data);  // Assuming data.data contains the response object
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data.error : 'An error occurred while fetching data');
        setLoading(false);
      }
    };
    fetchDetails();
  }, [obspResponseId]);

  if (loading) {
    return <div>Loading details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!details) {
    return <div>No details found for this OBSP response.</div>;
  }

  return (
    <div className="space-y-8 m-4 p-4 bg-client-secondary/80 border border-client-border rounded-xl shadow-card">
      {/* Project Summary Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CheckCircleOutlined className="text-client-accent text-xl" />
            <h2 className="text-xl font-bold text-white tracking-tight">{details.title}</h2>
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-client-accent/10 text-client-accent font-semibold text-sm">
            {details.complexity_level}
          </span>
        </div>
        <div className="flex flex-wrap gap-8 text-white/80 text-base mb-4">
          <div>
            <span className="block text-sm text-white/50">Status</span>
            <span className="font-medium">{statusBadge(details.status)}</span>
          </div>
          <div>
            <span className="block text-sm text-white/50">Price</span>
            <span className="font-semibold text-lg text-client-accent">₹{details.budget}</span>
          </div>
          <div>
            <span className="block text-sm text-white/50">Milestones Count</span>
            <span className="font-medium">{details.milestones ? details.milestones.length : 0}</span>
          </div>
          {details.milestones && details.milestones.length > 0 && details.milestones[details.milestones.length - 1]?.deadline && details.status === "processing" ? (
            <div>
              <span className="block text-sm text-white/50">Last Milestone Deadline</span>
              <span className="flex items-center gap-1 font-medium">
                <CalendarOutlined /> {formatDate(details.milestones[details.milestones.length - 1].deadline)}
              </span>
            </div>
          ) : (
            details.milestones && details.milestones.length > 0 && (
              <div>
                <span className="block text-sm text-white/50">Project Duration</span>
                <span className="font-medium">
                  {details.milestones.reduce((total, milestone) => total + (milestone.estimated_days || 0), 0)} days
                </span>
              </div>
            )
          )}
        </div>
        <div className="mb-3">
          <span className="block text-sm text-white/50 mb-1">Features</span>
          <ul className="list-disc list-inside text-white/80 text-base">
            {details.features && details.features.length > 0 ? (
              details.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))
            ) : (
              <li>No features listed</li>
            )}
          </ul>
        </div>
        <div>
          <span className="block text-sm text-white/50 mb-1">Required Skills</span>
          
          {/* Legend for Skill Types */}
          <div className="flex items-center gap-2 mb-2 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Required</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Core</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span>Optional</span>
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {/* Required Skills */}
            {details.skills_required && details.skills_required.required_skills && details.skills_required.required_skills.length > 0 ? (
              details.skills_required.required_skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-500 text-white px-3 py-1 rounded-full text-md font-medium shadow-sm hover:bg-blue-600 transition"
                >
                  {skill}
                </span>
              ))
            ) : null}
            
            {/* Core Skills */}
            {details.skills_required && details.skills_required.core_skills && details.skills_required.core_skills.length > 0 && (
              details.skills_required.core_skills.map((skill, index) => (
                <span
                  key={`core-${index}`}
                  className="bg-green-500 text-white px-3 py-1 rounded-full text-md font-medium shadow-sm hover:bg-green-600 transition"
                >
                  {skill}
                </span>
              ))
            )}
            
            {/* Optional Skills */}
            {details.skills_required && details.skills_required.optional_skills && details.skills_required.optional_skills.length > 0 && (
              details.skills_required.optional_skills.map((skill, index) => (
                <span
                  key={`optional-${index}`}
                  className="bg-gray-500 text-white px-3 py-1 rounded-full text-md font-medium shadow-sm hover:bg-gray-600 transition"
                >
                  {skill}
                </span>
              ))
            )}
            
            {/* Fallback if no skills */}
            {(!details.skills_required || 
              (!details.skills_required.required_skills?.length && 
               !details.skills_required.core_skills?.length && 
               !details.skills_required.optional_skills?.length)) && (
              <span className="text-white/80 text-md italic">No required skills</span>
            )}
          </div>
        </div>
      </div>

      {/* Client Selections Section */}
      {details.client_selections && Object.keys(details.client_selections).length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4 tracking-tight flex items-center gap-2">
            <InfoCircleOutlined className="text-client-accent" /> Your Scope
          </h2>
          <div className="space-y-4">
            {/* Horizontal Heading Boxes - Limit to first three for prominence */}
            <div className="flex gap-2 overflow-x-auto">
              {Object.entries(details.client_selections || {})
                .slice(0, 3)  // Limit to three boxes
                .map(([phaseKey, phaseData], index, array) => {
                  let additionalClasses = '';
                  if (index === 0 && array.length > 1) {
                    additionalClasses = 'rounded-r-lg';  // First item: round right
                  } else if (index === array.length - 1 && array.length > 1) {
                    additionalClasses = 'rounded-l-lg';  // Last item: round left
                  } else if (index > 0 && index < array.length - 1) {
                    additionalClasses = 'rounded-l-lg rounded-r-lg';  // Middle: round both
                  }
                  return (
                    <div
                      key={phaseKey}
                      className={`flex-shrink-0 p-4 bg-client-bg-grey rounded-t-lg cursor-pointer transition-all ${additionalClasses} ${
                        expandedPhase === phaseKey ? 'border-b-0 bg-client-accent/5 rounded-b-none' : 'rounded-lg'
                      } `}
                      onClick={() => setExpandedPhase(expandedPhase === phaseKey ? null : phaseKey)}
                    >
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        {phaseData?.phase_display || phaseKey}
                         </h3>
                    </div>
                  );
                })}
            </div>
            {/* Connected Content for the Expanded Phase with Fluid Design */}
            {expandedPhase && (
              <div
                className={`p-4 !mt-0 bg-client-bg-grey bg-client-accent/5 rounded-b-lg border border-t-0 border-white/10 shadow-sm transition-all duration-300 ease-in-out ${
                  expandedPhase ? 'opacity-100 h-auto' : 'opacity-0 h-0'
                }`}
              >
                {details.client_selections[expandedPhase]?.selected_fields?.length > 0 ? (
                  <ul className="space-y-2">
                    {details.client_selections[expandedPhase]?.selected_fields?.map((field, index) => (
                      <li key={index} className="flex justify-between items-center gap-4 p-3 bg-white/5 rounded-md">
                        <div className="flex-1 flex items-center gap-2">
                          {getFieldIcon(field?.field_label)}
                          <span className="text-white font-medium">{field?.field_label}: </span>
                          <span className="text-white/80">{renderSelectedValue(field?.selected_value)}</span>
                        </div>
                        {field?.price_impact > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-client-accent/20 text-client-accent text-sm font-semibold">
                            +₹{field?.price_impact}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/60 text-base italic">No selections for this phase.</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Milestones Section */}
      <div className="bg-client-secondary/80 border border-client-border rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircleOutlined className="text-client-accent text-lg" />
          <h3 className="text-lg font-semibold text-white">Milestones</h3>
        </div>
        <ul className="divide-y divide-white/10">
          {Array.isArray(details.milestones) ? (
            details.milestones.map((milestone) => (
              <li key={milestone.id} className="flex items-center justify-between py-2">
                <span className="text-white/90">{milestone.title}</span>
                {statusBadge(milestone.status)}
                <span className="text-sm text-white/50 flex items-center gap-1">
                {milestone.deadline ? (
                  <>
                    <CalendarOutlined /> {formatDate(milestone.deadline)}
                  </>
                ) : (
                  <span>{milestone.estimated_days} Days</span>
                )}
                </span>
              </li>
            ))
          ) : (
            <li>No milestones available</li>
          )}
        </ul>
      </div>

      {/* Additional Sections if data is available */}
    </div>
  );
};

export default PurchaseDetails;

const statusBadge = (statusRaw) => {
  if (!statusRaw) return null;
  const status = statusRaw.replace(/_/g, " ").toLowerCase();
  const prettyStatus = status
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  const statusConfig = {
    pending: { color: "bg-gray-200 text-gray-800", icon: "⏳" },
    "in progress": { color: "bg-blue-100 text-blue-800", icon: "🚧" },
    "under review": { color: "bg-blue-100 text-blue-800", icon: "🔍" },
    approved: { color: "bg-green-100 text-green-800", icon: "✅" },
    completed: { color: "bg-green-200 text-green-900", icon: "🏁" },
    submitted: { color: "bg-blue-50 text-blue-700", icon: "📤" },
    revision: { color: "bg-orange-100 text-orange-800", icon: "✏️" },
    "changes requested": { color: "bg-orange-100 text-orange-800", icon: "✏️" },
    disputed: { color: "bg-red-100 text-red-800", icon: "⚠️" },
    "qa phase": { color: "bg-purple-100 text-purple-800", icon: "🧪" },
  };
  const config = statusConfig[status] || statusConfig["pending"];
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full ${config.color} font-semibold text-sm`}>
      {config.icon} {prettyStatus}
    </span>
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const getFieldIcon = (fieldLabel) => {
  if (fieldLabel?.toLowerCase().includes('file')) return <FileOutlined className="text-client-accent text-base" />;
  if (fieldLabel?.toLowerCase().includes('price')) return <DownloadOutlined className="text-client-accent text-base" />;
  if (fieldLabel?.toLowerCase().includes('email')) return <UserOutlined className="text-client-accent text-base" />;
  return <InfoCircleOutlined className="text-client-accent text-base" />;
};

const renderSelectedValue = (value) => {
  if (!value) return 'N/A';
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (Array.isArray(value)) return value.map(item => item.name || JSON.stringify(item)).join(', ');
  if (typeof value === 'object') return value.name || JSON.stringify(value, null, 2).substring(0, 50) + '...';
  return String(value);
};