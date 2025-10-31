import { useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Package } from "lucide-react";

export default function TrackOrder() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  // Two sample coordinates - restaurant and delivery location
  const restaurantCoords = { x: 30, y: 30 };
  const deliveryCoords = { x: 70, y: 70 };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile?tab=orders")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Track Order
          </h1>
        </div>

        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-6">
            {/* Status Message */}
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Your order is confirmed
              </h2>
              <p className="text-lg text-muted-foreground">
                and will be delivered in 15 mins
              </p>
              {orderId && (
                <p className="text-sm text-muted-foreground mt-2">
                  Order ID: #{orderId.slice(0, 8)}
                </p>
              )}
            </div>

            {/* Map View */}
            <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
              {/* Simple map-like background */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted opacity-50" />
              
              {/* Grid pattern to simulate map */}
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Dotted line connecting the two points */}
                <line
                  x1={`${restaurantCoords.x}%`}
                  y1={`${restaurantCoords.y}%`}
                  x2={`${deliveryCoords.x}%`}
                  y2={`${deliveryCoords.y}%`}
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  strokeDasharray="10,10"
                  strokeLinecap="round"
                />
              </svg>

              {/* Restaurant marker */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${restaurantCoords.x}%`,
                  top: `${restaurantCoords.y}%`,
                }}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-background">
                    <Package className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-background px-3 py-1 rounded-full shadow-md border border-border">
                    <p className="text-xs font-semibold text-foreground">Restaurant</p>
                  </div>
                </div>
              </div>

              {/* Delivery location marker */}
              <div
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${deliveryCoords.x}%`,
                  top: `${deliveryCoords.y}%`,
                }}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-lg border-4 border-background animate-pulse">
                    <MapPin className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-background px-3 py-1 rounded-full shadow-md border border-border">
                    <p className="text-xs font-semibold text-foreground">Your Location</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm font-semibold text-foreground mb-1">Estimated Time</p>
                <p className="text-2xl font-bold text-primary">15 mins</p>
              </div>
              <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                <p className="text-sm font-semibold text-foreground mb-1">Status</p>
                <p className="text-lg font-semibold text-accent">Out for Delivery</p>
              </div>
            </div>

            <Button
              onClick={() => navigate("/profile?tab=orders")}
              className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
            >
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
