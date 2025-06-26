import React from "react";
import { Input, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
const { Option } = Select;

const TalentFilters = ({
  skills,
  onSearch,
  onFilterChange,
  filters,
  freelancerTypes = [
    { value: "all", label: "All Types" },
    { value: "professional", label: "Professional" },
    { value: "talentrise", label: "TalentRise" },
  ],
}) => (
  <div className="flex flex-col md:flex-row gap-4 mb-6">
    {/* Search Input */}
    <Input
      placeholder="Search by name, skills, or specialization..."
      allowClear
      prefix={<SearchOutlined className="text-white/60" />}
      value={filters.search || ""}
      onChange={(e) => onSearch(e.target.value)}
      className="filter-input-client"
    />

    {/* Skills Filter */}
    <Select
      mode="multiple"
      allowClear
      placeholder="Filter by skills"
      className="filter-select-client"
      value={filters.skills}
      onChange={(val) => onFilterChange("skills", val)}
      dropdownClassName="dropdown-client"
    >
      {skills.map((skill) => (
        <Option key={skill} value={skill}>
          {skill}
        </Option>
      ))}
    </Select>

    <style jsx global>{`
        .filter-input-client {
          width: 100%;
          max-width: 16rem;
          min-height: 48px;
          border-radius: 0.75rem;
          background-color: rgba(26, 27, 46, 0.5);
          border: 1px solid var(--client-border-DEFAULT);
          color: #fff;
          padding: 0 1rem;
          backdrop-filter: blur(12px);
          WebkitBackdropFilter: blur(12px);
          transition: border-color 0.2s ease-in-out;
        }
      
        .filter-input-client input {
          background: transparent !important;
          color: #fff !important;
        }
      
        .filter-input-client::placeholder,
        .filter-input-client input::placeholder {
          color: #aaa !important;
        }
      
        .filter-input-client:hover,
        .filter-input-client:focus-within {
          border-color: var(--client-accent);
          background-color: rgba(26, 27, 46, 0.6);
        }
      
        .filter-select-client {
          width: 100%;
          max-width: 16rem;
        }
      
        .filter-select-client .ant-select-selector {
          background-color: rgba(26, 27, 46, 0.5) !important;
          border: 1px solid var(--client-border-DEFAULT) !important;
          border-radius: 0.75rem !important;
          min-height: 48px !important;
          padding: 0.25rem 1rem !important;
          display: flex;
          align-items: center;
          color: #fff !important;
          backdrop-filter: blur(12px);
          WebkitBackdropFilter: blur(12px);
          transition: border-color 0.2s ease-in-out;
        }
      
        .filter-select-client:hover .ant-select-selector {
          border-color: var(--client-accent) !important;
          background-color: rgba(26, 27, 46, 0.6) !important;
        }
      
        .filter-select-client .ant-select-selection-item {
          color: #fff !important;
        }
      
        .filter-select-client .ant-select-arrow {
          color: #bbb !important;
        }
      
        .dropdown-client {
          background-color: rgba(26, 27, 46, 0.95) !important;
          border: 1px solid var(--client-border-DEFAULT) !important;
          border-radius: 0.5rem !important;
        }
      
        .dropdown-client .ant-select-item {
          color: #fff !important;
        }
      
        .dropdown-client .ant-select-item-option-selected:not(.ant-select-item-option-disabled),
        .dropdown-client .ant-select-item-option-active:not(.ant-select-item-option-disabled),
        .dropdown-client .ant-select-item-option:hover {
          background-color: var(--client-accent) !important;
          color: #fff !important;
        }
          /* Make sure select placeholder text is visible */
.filter-select-client .ant-select-selection-placeholder {
  color: #aaa !important;
  opacity: 1 !important; /* fixes invisibility in some browsers */
}

      `}</style>
      
  </div>
);

export default TalentFilters;
