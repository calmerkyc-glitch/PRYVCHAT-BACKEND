import { useEffect, useState } from "react";
import "../styles/splash.css";

export default function SplashScreen({ onFinish }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 5400);
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 6000);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`splash-container ${isExiting ? "splash-exit" : ""}`}>
      <div className="splash-background"></div>
      <div className="splash-overlay"></div>

      <div className="splash-content">
        <div className="splash-floating-lock">
          <div className="splash-lock-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
        </div>

        <div className="splash-card">
          <div className="splash-card-badge">
            <img src="/splash.png" alt="Pryv logo" className="splash-logo" />
          </div>

          <div className="splash-card-body">
            <h1 className="splash-title">Pryv Chat</h1>
            <p className="splash-subtitle">
              Secure. Private. Professional. Conversations that stay between you.
            </p>
          </div>
        </div>

        <div className="splash-track"></div>
        <div className="splash-status">
          <span className="splash-status-mark"></span>
          <span>END-TO-END ENCRYPTED</span>
        </div>
      </div>
    </div>
  );
}
