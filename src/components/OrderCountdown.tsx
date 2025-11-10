import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Clock } from "lucide-react";

interface OrderCountdownProps {
  orderCreatedAt: string;
  orderId: string;
}

export function OrderCountdown({
  orderCreatedAt,
  orderId,
}: OrderCountdownProps) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Check if this order was paused
    const pausedData = localStorage.getItem(`order_pause_${orderId}`);
    let startTime: number | null = null;

    if (pausedData) {
      const { pausedTime } = JSON.parse(pausedData);
      startTime = pausedTime;
      setTimeLeft(pausedTime);
      // Resume countdown, don't stay paused
      setIsPaused(false);
      // Clear active order flag when resuming
      localStorage.removeItem("active_order_id");
    } else {
      const calculateTimeLeft = () => {
        const orderTime = new Date(orderCreatedAt).getTime();
        const now = new Date().getTime();
        const elapsed = now - orderTime;
        const oneMinute = 60 * 1000; // 60 seconds in milliseconds

        const remaining = oneMinute - elapsed;

        if (remaining <= 0) {
          return null;
        }

        return Math.floor(remaining / 1000); // Return seconds left
      };

      // Initial calculation
      const initial = calculateTimeLeft();
      setTimeLeft(initial);
      startTime = initial;
    }

    // Don't set up interval if already expired
    if (startTime === null || startTime <= 0) {
      return;
    }

    // Countdown interval
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Clean up when expired
          localStorage.removeItem(`order_pause_${orderId}`);
          const activeOrderId = localStorage.getItem("active_order_id");
          if (activeOrderId === orderId) {
            localStorage.removeItem("active_order_id");
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [orderCreatedAt, orderId]);

  const handleAddMoreItems = () => {
    // Pause timer and store state
    if (timeLeft !== null) {
      setIsPaused(true);
      localStorage.setItem(
        `order_pause_${orderId}`,
        JSON.stringify({
          pausedTime: timeLeft,
          orderId: orderId,
        })
      );
      localStorage.setItem("active_order_id", orderId);
    }
    navigate("/");
  };

  // Format time as MM:SS
  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // If time has expired, show Track Order button
  if (timeLeft === null || timeLeft <= 0) {
    return (
      <div className="w-full space-y-2">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm font-semibold text-green-700 mb-2">
            ✓ Order Confirmed
          </p>
          <p className="text-xs text-green-600">Your order is being prepared</p>
        </div>
        <Button
          onClick={() => navigate(`/track-order/${orderId}`)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 rounded-lg transition-colors"
        >
          Track your order
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      {/* Countdown Timer Card */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-full">
              <Clock className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-orange-700 font-medium">
                Add more items
              </p>
              <p className="text-xs text-orange-600">Before checkout closes</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-700 font-mono tracking-wider">
              {formattedTime}
            </p>
            <p className="text-xs text-orange-600">minutes left</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 w-full bg-orange-200 rounded-full h-1 overflow-hidden">
          <div
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-full rounded-full transition-all duration-1000"
            style={{
              width: `${((60 - (timeLeft || 0)) / 60) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Add More Items Button */}
      <Button
        onClick={handleAddMoreItems}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold h-10 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <ShoppingCart className="h-5 w-5" />
        <span className="hidden sm:inline">Add more items</span>
        <span className="sm:hidden">Add items</span>
      </Button>
    </div>
  );
}
