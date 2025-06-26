import React, { useState, useRef, useEffect } from "react";

const PremiumOtpVerificationModal = ({
  email,
  onSubmit,
  onResend,
  onClose,
  loading,
  error,
  onVerificationSuccess,
}) => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [modalState, setModalState] = useState("input"); // "input", "success", "referral"
  const inputRefs = useRef([]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return; // Only allow digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    // Prevent Enter if not all boxes are filled
    if (e.key === "Enter" && otp.some((digit) => digit === "")) {
      e.preventDefault();
    }
  };

  // Handle paste (allow pasting the whole code)
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 0) return;
    const newOtp = paste.split("").concat(Array(6 - paste.length).fill(""));
    setOtp(newOtp);
    // Focus the last filled box
    const lastFilled = Math.min(paste.length - 1, 5);
    if (inputRefs.current[lastFilled]) {
      inputRefs.current[lastFilled].focus();
    }
  };

  // Handle form submission with smooth transitions
  const handleSubmit = async (code) => {
    try {
      await onSubmit(code);
      
      // Transition to success state
      setModalState("success");
      
      // After 3 seconds, transition to referral promo
      setTimeout(() => {
        setModalState("referral");
      }, 3000);
      
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  // Handle modal close with auth state update
  const handleClose = () => {
    // Update auth state when modal closes
    if (modalState === "referral") {
      onVerificationSuccess();
    }
    onClose();
  };

  // Button is enabled only if all boxes are filled
  const isVerifyEnabled = !loading && otp.every((digit) => digit !== "");

  // Render modal content based on state
  const renderModalContent = () => {
    switch (modalState) {
      case "success":
        return (
          <div className="text-center transition-all duration-500 ease-in-out">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-client-text-primary text-2xl font-bold mb-3 animate-pulse">
              Email Verified!
            </h2>
            <p className="text-client-text-secondary mb-4">
              Your email has been successfully verified.
            </p>
            <div className="text-client-text-muted text-sm">
              You can now refer and earn rewards!
            </div>
          </div>
        );

      case "referral":
        return (
          <div className="text-center transition-all duration-500 ease-in-out">
            <div className="w-20 h-20 bg-gradient-to-r from-client-accent to-client-accent/80 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 className="text-client-text-primary text-2xl font-bold mb-3">
              🎉 You're Verified!
            </h2>
            <p className="text-client-text-secondary mb-6">
              Your email is now verified. You can refer friends and earn rewards!
            </p>
            
            <div className="bg-gradient-to-r from-client-accent/10 to-client-accent/5 p-4 rounded-lg mb-6">
              <h3 className="text-client-text-primary font-semibold mb-2">
                Refer & Earn Program
              </h3>
              <ul className="text-client-text-secondary text-sm space-y-1">
                <li>• Earn rewards for each successful referral</li>
                <li>• Help friends discover great opportunities</li>
                <li>• Build your network and reputation</li>
              </ul>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-client-bg-card border border-client-border text-client-text-secondary px-4 py-2 rounded-lg hover:bg-client-bg-dark hover:text-client-text-primary transition-colors"
              >
                Maybe Later
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("Navigate to referral page");
                  handleClose();
                }}
                className="flex-1 bg-gradient-to-r from-client-accent to-client-accent/90 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Learn More
              </button>
            </div>
          </div>
        );

      default: // "input" state
        return (
          <>
            <h2 className="text-client-text-primary text-2xl font-bold mb-4">
              Verify Your Email
            </h2>
            <p className="text-client-text-secondary mb-6">
              Enter the 6-digit code sent to <b className="text-client-accent">{email}</b>.
            </p>

            {/* OTP Boxes */}
            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-12 bg-client-bg-card border border-client-border rounded-lg text-center text-client-text-primary text-xl focus:outline-none focus:ring-2 focus:ring-client-accent focus:border-client-accent transition-all"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-status-error text-sm mb-4 text-center">{error}</div>
            )}

            {/* Resend Code */}
            <div className="text-center mb-6">
              <button
                type="button"
                onClick={onResend}
                className="text-client-accent hover:underline text-sm"
                disabled={loading}
              >
                Didn't receive the code? Resend
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-client-bg-card border border-client-border text-client-text-secondary px-4 py-2 rounded-lg hover:bg-client-bg-dark hover:text-client-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => isVerifyEnabled && handleSubmit(otp.join(""))}
                className={`flex-1 bg-gradient-to-r from-client-accent to-client-accent/90 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity ${
                  !isVerifyEnabled ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={!isVerifyEnabled}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`bg-client-bg-card border border-client-border rounded-2xl shadow-xl max-w-md w-full p-8 transition-all duration-500 ease-in-out ${
        modalState === "success" ? "h-80" : modalState === "referral" ? "h-auto" : "h-auto"
      }`}>
        {renderModalContent()}
      </div>
    </div>
  );
};

export default PremiumOtpVerificationModal;
