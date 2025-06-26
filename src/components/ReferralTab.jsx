import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Users, Gift, Share2 } from "lucide-react";

const ReferralTab = ({ 
    role,
  placement = "dashboard", // "homepage", "dashboard", "profile"
  userStats = {}, // { referralCount, totalEarnings, referralCode }
  onClose,
  className = ""
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Hide if on the referrals page for this role (any subpage)
  useEffect(() => {
    if (location.pathname.startsWith(`/${role}/referrals`)) {
      setIsVisible(false);
    } else {
      // Only re-show if not dismissed
      const dismissed = localStorage.getItem(`referralTabDismissed_${placement}`);
      if (!dismissed || ((Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24)) >= 7) {
        setIsVisible(true);
      }
    }
  }, [location.pathname, role, placement]);

  // Check if user dismissed recently (you can use localStorage or API)
  useEffect(() => {
    const dismissed = localStorage.getItem(`referralTabDismissed_${placement}`);
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      
      // Re-show after 7 days
      if (daysSinceDismissal < 7) {
        setIsVisible(false);
      }
    }
  }, [placement]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(`referralTabDismissed_${placement}`, Date.now().toString());
    onClose?.();
  };

  const handleCopyCode = async () => {
    if (userStats.referralCode) {
      try {
        await navigator.clipboard.writeText(userStats.referralCode);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleNavigateToReferrals = () => {
    navigate(`/${role}/referrals`);
  };

  // Don't render if not visible
  if (!isVisible) return null;

  // Content based on placement
  const getTabContent = () => {
    switch (placement) {
      case "homepage":
        return {
          title: "Refer & Earn",
          subtitle: "Earn up to $500 for each friend who joins",
          cta: "Learn More",
          showEarnings: false,
          showCode: false
        };

      case "dashboard":
        return {
          title: "Referral Earnings",
          subtitle: `You've earned $${userStats.totalEarnings || 0} from referrals`,
          cta: "View Details",
          showEarnings: true,
          showCode: false
        };

      case "profile":
        return {
          title: "Your Referrals",
          subtitle: `${userStats.referralCount || 0} successful referrals`,
          cta: "Manage",
          showEarnings: false,
          showCode: true
        };

      default:
        return {
          title: "Refer & Earn",
          subtitle: "Share Talintz and earn rewards",
          cta: "Get Started",
          showEarnings: false,
          showCode: false
        };
    }
  };

  const content = getTabContent();

  // Get icon based on placement
  const getIcon = () => {
    switch (placement) {
      case "homepage":
        return <Gift className="w-5 h-5 text-client-accent" />;
      case "dashboard":
        return <Users className="w-5 h-5 text-client-accent" />;
      case "profile":
        return <Share2 className="w-5 h-5 text-client-accent" />;
      default:
        return <Gift className="w-5 h-5 text-client-accent" />;
    }
  };

  return (
    <div className={`bg-gradient-to-r from-client-accent/10 to-client-accent/5 border border-client-accent/20 rounded-lg p-4 relative ${className}`}>
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-client-text-muted hover:text-client-text-primary transition-colors"
        aria-label="Close referral tab"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          {getIcon()}

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-client-text-primary font-semibold text-sm">
              {content.title}
            </h3>
            <p className="text-client-text-secondary text-xs">
              {content.subtitle}
            </p>

            {/* Referral Code (Profile only) */}
            {content.showCode && userStats.referralCode && (
              <div className="mt-2 flex items-center space-x-2">
                <code className="text-client-accent font-mono text-xs bg-client-bg-card px-2 py-1 rounded">
                  {userStats.referralCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="text-client-accent hover:text-client-accent/80 text-xs"
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}

            {/* Earnings Display (Dashboard only) */}
            {content.showEarnings && (
              <div className="mt-1">
                <span className="text-green-600 font-semibold text-xs">
                  +${userStats.totalEarnings || 0} earned
                </span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNavigateToReferrals}
          className="bg-gradient-to-r from-client-accent to-client-accent/90 text-white px-4 py-2 rounded-lg text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          {content.cta}
        </button>
      </div>

      {/* Progress Bar (for active referrers) */}
      {userStats.referralCount > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-client-text-muted mb-1">
            <span>Progress to next tier</span>
            <span>{userStats.referralCount}/10</span>
          </div>
          <div className="w-full bg-client-bg-dark rounded-full h-1">
            <div 
              className="bg-client-accent h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((userStats.referralCount / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralTab;
