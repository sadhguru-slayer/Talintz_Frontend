import React, { useState, useMemo, useEffect } from "react";
import { Row, Col, Button } from "antd";
import { TeamOutlined, StarOutlined, RiseOutlined, HistoryOutlined, SearchOutlined, RocketOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import Cookies from 'js-cookie'
import CHeader from "../../components/client/CHeader";
import CSider from "../../components/client/CSider";
import TalentCard from "./findtalent/TalentCard";
import TalentFilters from "./findtalent/TalentFilters";
import TalentStats from "./findtalent/TalentStats";
import TalentTabs from "./findtalent/TalentTabs";
import TalentEmptyState from "./findtalent/TalentEmptyState";
import axios from "axios";
import { useMediaQuery } from "react-responsive";

const FindTalent = ({ userId, role }) => {
  const [freelancers, setFreelancers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({ skills: [], freelancerType: "all" });
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Fetch freelancers from API
  useEffect(() => {
    const url = `http://127.0.0.1:8000/api/client/freelancers/?tab=${activeTab}`;
    axios
      .get(url, {
        headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` }
      })
      .then((res) => {
        setFreelancers(res.data);
        console.log(activeTab,res.data)
      })
      .catch((err) => {
        console.error("Error fetching freelancers:", err);
      });
  }, [activeTab]);

  // Unique skills for filter (from all freelancers' freelancer_profile.skills)
  const allSkills = useMemo(() => {
    const skillSet = new Set();
    freelancers.forEach(f => {
      f.freelancer_profile?.skills?.forEach(skill => skillSet.add(skill.name));
    });
    return Array.from(skillSet);
  }, [freelancers]);

  // Stats for header
  const stats = useMemo(() => ({
    total: freelancers.length,
    previous: 0, // You can update this if your API provides this info
    all: freelancers.length,
    top: freelancers.filter(f => f.freelancer_profile?.success_rate >= 95).length,
  }), [freelancers]);

  // Filtering logic
  const filteredFreelancers = useMemo(() => {
    let filtered = [...freelancers];

    // Real-time search filter
    if (filters.search && filters.search.trim() !== "") {
      const searchLower = filters.search.trim().toLowerCase();
      filtered = filtered.filter(f => {
        const profile = f.freelancer_profile || {};
        const name = (f.username || "").toLowerCase();
        const skills = (profile.skills || []).map(s => s.name.toLowerCase()).join(" ");
        // Use designated role for now
        const role = "dev & designer";
        return (
          name.includes(searchLower) ||
          skills.includes(searchLower) ||
          role.includes(searchLower)
        );
      });
    }

    // Skills filter (skills is an array of objects)
    if (filters.skills.length > 0) {
      filtered = filtered.filter(f =>
        f.freelancer_profile?.skills?.some(skill =>
          filters.skills.includes(skill.name)
        )
      );
    }

    // Freelancer type filter (if you want to support it)
    // if (filters.freelancerType !== "all") {
    //   // Implement logic based on your backend data
    // }

    // "Top Rated" tab
    if (activeTab === "top") {
      filtered = filtered.filter(f => f.freelancer_profile?.success_rate >= 95);
    }

    return filtered;
  }, [freelancers, filters, activeTab]);

  return (
    <div className="flex h-screen bg-client-primary">
      <CSider userId={userId} role={role} dropdown={true} collapsed={true} />
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'ml-0 pb-16' : 'ml-16'}`}>
        <CHeader userId={userId} sidebarCollapsed={true} />
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center text-white/60 text-sm mb-6">
            <span className="hover:text-white cursor-pointer flex items-center transition-colors">
              <TeamOutlined className="mr-1" /> Dashboard
            </span>
            <span className="mx-2">›</span>
            <span className="text-white font-medium">Find Talent</span>
          </div>

          {/* Premium Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6 lg:mb-8 relative overflow-hidden rounded-2xl"
          >
            <div className="absolute inset-0 bg-client-gradient-primary rounded-2xl"></div>
            <div className="absolute inset-0 bg-client-gradient-soft opacity-50 rounded-2xl"></div>
            <div className="absolute top-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-client-accent/8 rounded-full blur-3xl -mr-24 lg:-mr-48 -mt-24 lg:-mt-48 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 lg:w-80 lg:h-80 bg-brand-accent/6 rounded-full blur-2xl -ml-20 lg:-ml-40 -mb-20 lg:-mb-40 animate-float-delayed"></div>
            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 bg-client-accent/20 backdrop-blur-sm border border-client-accent/30 rounded-full px-3 py-1.5 lg:px-4 lg:py-2 mb-4 lg:mb-6">
                    <span className="text-client-accent text-xs lg:text-sm font-semibold">Talent Discovery</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">Find Talent</h1>
                  <p className="text-white/70">Discover skilled freelancers for your projects</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    icon={<SearchOutlined />}
                    className="bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    Advanced Search
                  </Button>
                  <Button 
                    icon={<RocketOutlined />}
                    className="bg-client-accent/20 text-client-accent border border-client-accent/30 hover:bg-client-accent/30 hover:text-white transition-all duration-300"
                  >
                    Invite Talent
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
            <TalentFilters
              skills={allSkills}
              filters={filters}
              onSearch={val => setFilters(f => ({ ...f, search: val }))}
              onFilterChange={(name, value) => setFilters(f => ({ ...f, [name]: value }))}
            />
          </div>

          {/* Tabs */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
            <TalentTabs activeTab={activeTab} onTabChange={setActiveTab} stats={stats} />
            <div className="p-6">
              {filteredFreelancers.length === 0 ? (
                <TalentEmptyState />
              ) : (
                <Row gutter={[32, 32]}>
                  {filteredFreelancers.map(freelancer => {
                    const profile = freelancer.freelancer_profile || {};
                    return (
                      <Col xs={24} sm={12} md={8} lg={8} key={freelancer.id}>
                        <TalentCard
                          freelancer={{
                            id: freelancer.id,
                            name: freelancer.username || "N/A",
                            avatar: profile.avatar || "N/A",
                            specialization: profile.bio || "N/A",
                            skills: Array.isArray(profile.skills) && profile.skills.length > 0
                              ? profile.skills.map(s => s.name)
                              : ["N/A"],
                            hourly_rate: profile.hourly_rate !== undefined && profile.hourly_rate !== null
                              ? profile.hourly_rate
                              : "N/A",
                            success_rate: profile.success_rate !== undefined && profile.success_rate !== null
                              ? profile.success_rate
                              : "N/A",
                            total_projects_completed: profile.total_projects_completed !== undefined && profile.total_projects_completed !== null
                              ? profile.total_projects_completed
                              : "N/A",
                            response_time: profile.response_time_avg || "N/A",
                            // Add more fields as needed, with "N/A" fallback
                          }}
                          onViewProfile={id => {/* navigate logic */}}
                        />
                      </Col>
                    );
                  })}
                </Row>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindTalent; 