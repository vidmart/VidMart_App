import { useEffect, useState } from "react";
import splashLogo from "@/assets/vidmart-splash-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onComplete(), 300); // Wait for fade-out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-primary transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="animate-scale-in">
        <img
          src={splashLogo}
          alt="VIDMart Logo"
          className="w-64 h-64 object-contain animate-pulse"
        />
      </div>
    </div>
  );
}
