import React from "react";
import { UserOutlined } from "@ant-design/icons";

const TalentEmptyState = () => (
  <div className="text-center py-12">
    <div className="text-white/40 text-6xl mb-4">
      <UserOutlined />
    </div>
    <h3 className="text-white font-medium mb-2">No freelancers found</h3>
    <p className="text-white/60">Try adjusting your search criteria or filters</p>
  </div>
);

export default TalentEmptyState;
