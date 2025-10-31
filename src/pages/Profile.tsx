import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Trash2, Star, Pencil, LogOut } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { OrderCountdown } from "@/components/OrderCountdown";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    landmark: "",
    pin_code: "",
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("profiles" as any)
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      return data as any;
    },
    enabled: !!user,
  });

  const { data: addresses, isLoading: addressesLoading } = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("addresses" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });
      return (data as any) || [];
    },
    enabled: !!user,
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("orders" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (data as any) || [];
    },
    enabled: !!user,
  });

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
  });

  const addAddress = useMutation({
    mutationFn: async (data: typeof addressForm) => {
      if (!user) throw new Error("Not authenticated");
      
      const isFirstAddress = !addresses || addresses.length === 0;
      
      const { error } = await supabase
        .from("addresses" as any)
        .insert({
          user_id: user.id,
          ...data,
          is_default: isFirstAddress,
        } as any);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
      toast.success("Address added successfully!");
      setShowAddressDialog(false);
      setAddressForm({ name: "", phone: "", address_line1: "", address_line2: "", landmark: "", pin_code: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add address");
    },
  });

  const updateAddress = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof addressForm }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("addresses" as any)
        .update(data as any)
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
      toast.success("Address updated successfully!");
      setShowAddressDialog(false);
      setEditingAddress(null);
      setAddressForm({ name: "", phone: "", address_line1: "", address_line2: "", landmark: "", pin_code: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update address");
    },
  });

  const setDefaultAddress = useMutation({
    mutationFn: async (addressId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("addresses" as any)
        .update({ is_default: true })
        .eq("id", addressId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
      toast.success("Default address updated!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update default address");
    },
  });

  const deleteAddress = useMutation({
    mutationFn: async (addressId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("addresses" as any)
        .delete()
        .eq("id", addressId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      queryClient.invalidateQueries({ queryKey: ["defaultAddress"] });
      toast.success("Address deleted!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete address");
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("profiles" as any)
        .update(data as any)
        .eq("id", user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      updateAddress.mutate({ id: editingAddress.id, data: addressForm });
    } else {
      addAddress.mutate(addressForm);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingAddress(null);
    setAddressForm({ name: "", phone: "", address_line1: "", address_line2: "", landmark: "", pin_code: "" });
    setShowAddressDialog(true);
  };

  const handleOpenEditDialog = (address: any) => {
    setEditingAddress(address);
    setAddressForm({
      name: address.name || "",
      phone: address.phone || "",
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      landmark: address.landmark || "",
      pin_code: address.pin_code,
    });
    setShowAddressDialog(true);
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-foreground hover:text-primary"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Profile
            </h1>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Your Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-muted border-border text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-input border-border text-foreground"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-input border-border text-foreground"
                      placeholder="+1 234 567 8900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-foreground">Shipping Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="bg-input border-border text-foreground"
                      placeholder="123 Main St, City, State, ZIP"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-foreground">Your Addresses</CardTitle>
                <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenAddDialog} className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90">
                      <MapPin className="mr-2 h-4 w-4" />
                      Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Contact Name</Label>
                        <Input
                          id="name"
                          value={addressForm.name}
                          onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                          placeholder="Full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={addressForm.phone}
                          onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                          placeholder="+91 1234567890"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address_line1">Address Line 1 *</Label>
                        <Input
                          id="address_line1"
                          value={addressForm.address_line1}
                          onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                          placeholder="Street, Building name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address_line2">Address Line 2</Label>
                        <Input
                          id="address_line2"
                          value={addressForm.address_line2}
                          onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                          placeholder="Apartment, Suite, etc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                          id="landmark"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                          placeholder="Near..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pin_code">Pin Code *</Label>
                        <Input
                          id="pin_code"
                          value={addressForm.pin_code}
                          onChange={(e) => setAddressForm({ ...addressForm, pin_code: e.target.value })}
                          placeholder="123456"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
                        disabled={addAddress.isPending || updateAddress.isPending}
                      >
                        {addAddress.isPending || updateAddress.isPending 
                          ? "Saving..." 
                          : editingAddress 
                          ? "Update Address" 
                          : "Save Address"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {addressesLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
                  </div>
                ) : addresses && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address: any) => (
                      <div
                        key={address.id}
                        className="p-4 border border-border rounded-lg relative"
                      >
                        <div className="mb-2">
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                            Deliver in 15 mins
                          </span>
                        </div>
                        {address.is_default && (
                          <div className="absolute top-4 right-4 flex items-center gap-1 text-primary">
                            <Star className="h-4 w-4 fill-primary" />
                            <span className="text-xs font-semibold">Default</span>
                          </div>
                        )}
                        <div className="space-y-1 mt-2">
                          <p className="font-semibold text-foreground">{address.address_line1}</p>
                          {address.address_line2 && (
                            <p className="text-sm text-muted-foreground">{address.address_line2}</p>
                          )}
                          {address.landmark && (
                            <p className="text-sm text-muted-foreground">Landmark: {address.landmark}</p>
                          )}
                          <p className="text-sm text-muted-foreground">Pin Code: {address.pin_code}</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditDialog(address)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {!address.is_default && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDefaultAddress.mutate(address.id)}
                              disabled={setDefaultAddress.isPending}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteAddress.mutate(address.id)}
                            disabled={deleteAddress.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No addresses added yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            {ordersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
              </div>
            ) : orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <Card key={order.id} className="border-border bg-card">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-foreground flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Order #{order.id.slice(0, 8)}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            ₹{Number(order.total).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">Payment Method</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-semibold text-foreground mb-1">Shipping Address</p>
                        <p className="text-sm text-muted-foreground">{order.shipping_address}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-foreground mb-3">Items</p>
                        <div className="space-y-3">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex gap-3 pb-3 border-b border-border last:border-0">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80";
                                }}
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  ₹{item.price.toFixed(2)} × {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold text-primary">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add more items countdown button */}
                      <OrderCountdown orderCreatedAt={order.created_at} orderId={order.id} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="py-12 text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start shopping to see your order history here
                  </p>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90"
                  >
                    Start Shopping
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
