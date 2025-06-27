import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";

const EmailVerificationBanner = ({ username, email, role, onVerify }) => {
  const [visible, setVisible] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  if (!visible) return null;

  // Role-based color scheme with dark theme defaults
  const roleColors = {
    client: {
      bg: "bg-client-dark", // Dark background for client
      text: "text-client-accent", // Client accent color for text
      buttonBg: "bg-client-accent",
      buttonHover: "hover:bg-client-accent/80",
      border: "border-client-accent/30",
      highlight: "text-client-accent" // For emphasized text
    },
    freelancer: {
      bg: "bg-freelancer-dark", // Dark background for freelancer
      text: "text-freelancer-accent", // Freelancer accent color for text
      buttonBg: "bg-freelancer-accent",
      buttonHover: "hover:bg-freelancer-accent/80",
      border: "border-freelancer-accent/30",
      highlight: "text-freelancer-accent"
    },
    default: {
      bg: "bg-gray-900", // Fallback dark background
      text: "text-brand-accent", // Default accent color
      buttonBg: "bg-brand-accent",
      buttonHover: "hover:bg-brand-accent/80",
      border: "border-gray-700",
      highlight: "text-brand-accent"
    }
  };

  const colors = roleColors[role] || roleColors.default;

  // Adjust text size based on screen size
  const textSize = isMobile ? "text-sm" : isTablet ? "text-base" : "text-lg";

  return (
    <div
      className={`fixed bottom-20 right-6 z-50 ${colors.bg} ${colors.border} border rounded-lg shadow-lg p-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 max-w-[90%]`}
    >
      <span className={`${colors.text} ${textSize}`}>
        <b className={colors.highlight}>{username}</b>, please verify your email <b className={colors.highlight}>{email}</b> to unlock all features.
      </span>
      <div className="flex gap-2">
        <button
          onClick={onVerify}
          className={`${colors.buttonBg} ${colors.buttonHover} text-gray-900 font-medium px-4 py-2 rounded-md transition-colors ${textSize}`}
        >
          Verify
        </button>
        <button
          onClick={() => setVisible(false)}
          className={`${colors.text} hover:opacity-80 text-lg cursor-pointer transition-opacity`}
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
