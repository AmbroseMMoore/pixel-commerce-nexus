
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { mockUser } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

// Mock orders data
const mockOrders = [
  {
    id: "1",
    orderNumber: "ORD-12345",
    date: "2023-05-20",
    status: "Delivered",
    total: 129.99,
    items: 3
  },
  {
    id: "2",
    orderNumber: "ORD-12340",
    date: "2023-04-15",
    status: "Processing",
    total: 79.99,
    items: 1
  }
];

// Mock wishlist data
const mockWishlist = [
  {
    id: "1",
    title: "Premium Cotton T-Shirt",
    price: 29.99,
    image: "/placeholder.svg"
  },
  {
    id: "2",
    title: "Slim Fit Jeans",
    price: 59.99,
    image: "/placeholder.svg"
  },
];

const ProfilePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  
  // Mock user profile data (normally would come from the actual user object)
  const [name, setName] = useState(user?.name || mockUser.name);
  const [email, setEmail] = useState(user?.email || mockUser.email);
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  
  // Form submission handler
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully.",
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };
  
  // If not authenticated, redirect to login
  if (!isAuthenticated && !mockUser) {
    navigate("/login");
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
                  <AvatarImage src={user?.avatar || mockUser.avatar} alt={name} />
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
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
                <TabsTrigger value="returns">Returns</TabsTrigger>
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
                    {mockOrders.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                        <Button className="mt-4" asChild>
                          <a href="/">Start Shopping</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {mockOrders.map((order) => (
                          <div key={order.id} className="border rounded-lg p-4">
                            <div className="flex flex-col sm:flex-row justify-between mb-2">
                              <div>
                                <p className="font-medium">{order.orderNumber}</p>
                                <p className="text-sm text-gray-500">{order.date}</p>
                              </div>
                              <div className="mt-2 sm:mt-0">
                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                  {order.status}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                              <p className="text-sm">
                                {order.items} {order.items === 1 ? 'item' : 'items'} · ${order.total.toFixed(2)}
                              </p>
                              <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                                View Details
                              </Button>
                            </div>
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
                    {mockWishlist.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-500">Your wishlist is empty.</p>
                        <Button className="mt-4" asChild>
                          <a href="/">Browse Products</a>
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {mockWishlist.map((item) => (
                          <div key={item.id} className="border rounded-lg overflow-hidden">
                            <div className="aspect-square relative">
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium">{item.title}</h3>
                              <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                              <div className="flex gap-2 mt-2">
                                <Button size="sm" variant="secondary" className="flex-1">
                                  Add to Cart
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1">
                                  Remove
                                </Button>
                              </div>
                            </div>
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
                    <CardTitle>Returns & Cancellations</CardTitle>
                    <CardDescription>
                      Manage your return requests and cancellations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <p className="text-gray-500 mb-4">You don't have any return or cancellation requests.</p>
                    <p className="text-sm text-gray-500">
                      If you need to return or cancel an order, please navigate to your order details and select the appropriate option.
                    </p>
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
