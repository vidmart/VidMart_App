import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { SplashScreen } from "./components/SplashScreen";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import CategoryItems from "./pages/CategoryItems";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Checkout from "./pages/Checkout";
import TrackOrder from "./pages/TrackOrder";
import RewardSummary from "./pages/RewardSummary";
import AlgorandSetupPage from "./pages/AlgorandSetup";
import AlgorandDetails from "./pages/AlgorandDetails";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const SPLASH_SHOWN_KEY = "vidmart_splash_shown";

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash has been shown in this session
    return !sessionStorage.getItem(SPLASH_SHOWN_KEY);
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem(SPLASH_SHOWN_KEY, "true");
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/category/:category" element={<CategoryItems />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/track-order/:orderId" element={<TrackOrder />} />
                <Route path="/rewards" element={<RewardSummary />} />
                <Route path="/algorand-setup" element={<AlgorandSetupPage />} />
                <Route path="/algorand-details" element={<AlgorandDetails />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
