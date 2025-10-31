import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";

interface OrderCountdownProps {
  orderCreatedAt: string;
  orderId: string;
}

export function OrderCountdown({ orderCreatedAt, orderId }: OrderCountdownProps) {
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
      localStorage.removeItem('active_order_id');
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
          const activeOrderId = localStorage.getItem('active_order_id');
          if (activeOrderId === orderId) {
            localStorage.removeItem('active_order_id');
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
      localStorage.setItem(`order_pause_${orderId}`, JSON.stringify({
        pausedTime: timeLeft,
        orderId: orderId
      }));
      localStorage.setItem('active_order_id', orderId);
    }
    navigate("/");
  };

  // If time has expired, show Track Order button
  if (timeLeft === null || timeLeft <= 0) {
    return (
      <Button
        onClick={() => navigate(`/track-order/${orderId}`)}
        className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
      >
        Track your order
      </Button>
    );
  }

  // Format time as MM:SS
  const minutes = Math.floor((timeLeft || 0) / 60);
  const seconds = (timeLeft || 0) % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Button
      onClick={handleAddMoreItems}
      variant="outline"
      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      Add more items ({formattedTime})
    </Button>
  );
}
