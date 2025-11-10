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
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Logo with enhanced animation */}
        <div className="animate-scale-in drop-shadow-2xl">
          <div className="relative">
            <img
              src={splashLogo}
              alt="VIDMart Logo"
              className="w-64 h-64 object-contain filter drop-shadow-lg"
            />
            {/* Animated glow ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute w-72 h-72 border-2 border-white/20 rounded-full animate-spin-slow"></div>
            </div>
          </div>
        </div>

        {/* Tagline with modern typography */}
        <div className="text-center mt-6 space-y-2">
          <h1 className="text-white text-3xl font-bold tracking-tight">
            VIDMart
          </h1>
          <p className="text-white/90 text-sm font-medium tracking-wide">
            Delivered in Minutes
          </p>
        </div>

        {/* Loading indicator - Modern dots animation */}
        <div className="flex gap-2 mt-8">
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.15s" }}
          ></div>
          <div
            className="w-2 h-2 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.3s" }}
          ></div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );
}

// Add this to your global CSS or Tailwind config for the spin-slow animation
// If not already present:
// @keyframes spin-slow {
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// }
// animation-spin-slow: spin-slow 8s linear infinite;
