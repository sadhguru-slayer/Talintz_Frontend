import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";

const EmailVerificationBanner = ({ username, email, role, onVerify }) => {
  const [visible, setVisible] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  if (!visible) return null;

  // Determine the color scheme based on the role
  const roleColors = {
    client: {
      bg: "bg-client-bg-card",
      text: "text-client-text-primary",
      buttonBg: "bg-client-accent",
      buttonHover: "hover:bg-client-accent/90",
      border: "border-client-border-DEFAULT",
    },
    freelancer: {
      bg: "bg-freelancer-bg-card",
      text: "text-freelancer-text-primary",
      buttonBg: "bg-freelancer-accent",
      buttonHover: "hover:bg-freelancer-accent/90",
      border: "border-freelancer-border-DEFAULT",
    },
  };

  const colors = roleColors[role] || {
    bg: "bg-brand-neutral",
    text: "text-text-primary",
    buttonBg: "bg-brand-accent",
    buttonHover: "hover:bg-brand-accent/90",
    border: "border-ui-border",
  };

  // Adjust text size based on screen size
  const textSize = isMobile ? "text-sm" : isTablet ? "text-base" : "text-lg";

  return (
    <div
      className={`fixed bottom-20 right-6 z-50 ${colors.bg} ${colors.border} bg-brand-dark border rounded-lg shadow-md p-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 max-w-[80%]`}
    >
      <span className={`text-brand-neutral ${textSize}`}>
        <b className="text-client-accent">{username}</b>, please verify your email <b className="text-client-accent">{email}</b> to unlock all features.
      </span>
      <div className="flex gap-2">
      <button
        onClick={onVerify}
        className={`bg-brand-accent text-white px-4 py-2 rounded transition-colors ${textSize}`}
      >
        Verify
      </button>
      <button
        onClick={() => setVisible(false)}
        className="text-gray-500 hover:text-gray-700 text-lg cursor-pointer"
        aria-label="Close"
      >
        ×
      </button></div>
    </div>
  );
};

export default EmailVerificationBanner;
