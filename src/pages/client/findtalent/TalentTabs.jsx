import React from "react";
import { TeamOutlined, StarOutlined, HistoryOutlined } from "@ant-design/icons";

const tabs = [
  { key: 'all', label: 'All Talent', icon: <TeamOutlined /> },
  { key: 'previous', label: 'Previous', icon: <HistoryOutlined /> },
  { key: 'top', label: 'Top Rated', icon: <StarOutlined /> }
];

const TalentTabs = ({ activeTab, onTabChange, stats }) => (
  <div className="flex border-b border-white/10 mb-4">
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => onTabChange(tab.key)}
        className={`flex-1 px-4 py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all ${
          activeTab === tab.key
            ? 'text-client-accent border-b-2 border-client-accent bg-white/5'
            : 'text-white/70 hover:text-white hover:bg-white/5'
        }`}
      >
        {tab.icon}
        <span className="hidden sm:inline">{tab.label}</span>
        <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{stats[tab.key]}</span>
      </button>
    ))}
  </div>
);

export default TalentTabs;
