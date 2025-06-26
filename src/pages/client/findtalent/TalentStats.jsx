import React from "react";
import { TeamOutlined, StarOutlined, RiseOutlined, HistoryOutlined } from "@ant-design/icons";

const TalentStats = ({ stats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    {[
      { icon: <TeamOutlined />, label: "Available", value: stats.total },
      { icon: <StarOutlined />, label: "Top Rated", value: stats.topRated },
      { icon: <RiseOutlined />, label: "TalentRise", value: stats.talentRise },
      { icon: <HistoryOutlined />, label: "Previous", value: stats.previous }
    ].map((stat, i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/20">
          {stat.icon}
        </div>
        <div>
          <p className="text-white/70 text-sm">{stat.label}</p>
          <p className="text-white font-semibold">{stat.value}</p>
        </div>
      </div>
    ))}
  </div>
);

export default TalentStats;
