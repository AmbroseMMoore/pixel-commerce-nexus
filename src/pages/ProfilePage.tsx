
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useAddresses } from "@/hooks/useAddresses";
import { useWishlist } from "@/hooks/useWishlist";
import { useReturns } from "@/hooks/useReturns";
import { format } from "date-fns";
import { Heart, Package, RotateCcw } from "lucide-react";

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { addresses } = useAddresses();
  const { wishlistItems, isLoading: wishlistLoading, removeFromWishlist } = useWishlist();
  const { returns, isLoading: returnsLoading } = useReturns();
  
  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  
  // Form submission handler
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth");
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // If not authenticated, redirect to auth
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* Profile Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user?.avatar} alt={name} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{name}</h2>
                <p className="text-sm text-gray-500">{email}</p>
                <Button 
                  variant="outline" 
                  className="mt-4 w-full"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div>
            <Tabs defaultValue="orders" className="space-y-4">
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="returns">Returns</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
              
              {/* Orders Tab */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                    <CardDescription>
                      View and track all your orders here
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ordersLoading ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">Loading orders...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-6">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                        <Button className="mt-4" asChild>
                          <a href="/">Start Shopping</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row justify-between mb-2">
                              <div>
                                <p className="font-medium">{order.order_number}</p>
                                <p className="text-sm text-gray-500">
                                  {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                </p>
                              </div>
                              <div className="mt-2 sm:mt-0">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  order.status === 'delivered' 
                                    ? 'bg-green-100 text-green-800'
                                    : order.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <p className="text-sm">
                                {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'} · ₹{order.total_amount.toFixed(2)}
                              </p>
                              <div className="mt-2 sm:mt-0 space-x-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  order.payment_status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  Payment: {order.payment_status}
                                </span>
                              </div>
                            </div>
                            {order.order_items.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm font-medium mb-2">Items:</p>
                                <div className="space-y-1">
                                  {order.order_items.map((item, index) => (
                                    <p key={index} className="text-sm text-gray-600">
                                      {item.product.title} - {item.color.name} / {item.size.name} (Qty: {item.quantity})
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist">
                <Card>
                  <CardHeader>
                    <CardTitle>My Wishlist</CardTitle>
                    <CardDescription>
                      Items you've saved for later
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {wishlistLoading ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">Loading wishlist...</p>
                      </div>
                    ) : wishlistItems.length === 0 ? (
                      <div className="text-center py-6">
                        <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">Your wishlist is empty.</p>
                        <Button className="mt-4" asChild>
                          <a href="/">Browse Products</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {wishlistItems.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-sm">{item.product.title}</h3>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeFromWishlist(item.id)}
                              >
                                ×
                              </Button>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              {item.color.name} / {item.size.name}
                            </p>
                            <p className="font-semibold">
                              ₹{item.product.price_discounted 
                                ? item.product.price_discounted.toFixed(2) 
                                : item.product.price_original.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-400">
                              Added {format(new Date(item.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Returns Tab */}
              <TabsContent value="returns">
                <Card>
                  <CardHeader>
                    <CardTitle>Returns & Replacements</CardTitle>
                    <CardDescription>
                      Track your return and replacement requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {returnsLoading ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">Loading returns...</p>
                      </div>
                    ) : returns.length === 0 ? (
                      <div className="text-center py-6">
                        <RotateCcw className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No return requests found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {returns.map((returnItem) => (
                          <div key={returnItem.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{returnItem.order.order_number}</p>
                                <p className="text-sm text-gray-500">
                                  {returnItem.order_item.product.title} - {returnItem.order_item.color.name} / {returnItem.order_item.size.name}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                returnItem.status === 'approved'
                                  ? 'bg-green-100 text-green-800'
                                  : returnItem.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {returnItem.status.charAt(0).toUpperCase() + returnItem.status.slice(1)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Type:</strong> {returnItem.return_type === 'return' ? 'Return' : 'Replacement'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Reason:</strong> {returnItem.reason}
                            </p>
                            <p className="text-xs text-gray-400">
                              Requested on {format(new Date(returnItem.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Addresses Tab */}
              <TabsContent value="addresses">
                <Card>
                  <CardHeader>
                    <CardTitle>My Addresses</CardTitle>
                    <CardDescription>
                      Manage your delivery addresses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {addresses.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No addresses saved yet.</p>
                        <Button className="mt-4" onClick={() => navigate('/checkout')}>
                          Add Address
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((address) => (
                          <div key={address.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{address.full_name}</p>
                                <p className="text-sm text-gray-600">
                                  {address.address_line_1}
                                  {address.address_line_2 && `, ${address.address_line_2}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state} {address.postal_code}
                                </p>
                                <p className="text-sm text-gray-600">{address.country}</p>
                                <p className="text-sm text-gray-600">Phone: {address.phone_number}</p>
                              </div>
                              {address.is_default && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your account details here
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                            disabled
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                        />
                      </div>
                      
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
