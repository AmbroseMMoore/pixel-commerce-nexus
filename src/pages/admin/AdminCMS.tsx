
import React, { useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";

const AdminCMS = () => {
  // Hero section state
  const [heroTitle, setHeroTitle] = useState("Summer Collection 2023");
  const [heroSubtitle, setHeroSubtitle] = useState("Discover the latest trends for the season");
  const [heroButtonText, setHeroButtonText] = useState("Shop Now");
  const [heroImageUrl, setHeroImageUrl] = useState("/placeholder.svg");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  // Popup state
  const [popupTitle, setPopupTitle] = useState("Special Offer!");
  const [popupDescription, setPopupDescription] = useState("Sign up now and get 10% off your first order");
  const [popupButtonText, setPopupButtonText] = useState("Sign Up");
  const [popupImageUrl, setPopupImageUrl] = useState("/placeholder.svg");
  const [popupImageFile, setPopupImageFile] = useState<File | null>(null);
  const [popupEnabled, setPopupEnabled] = useState(false);

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setHeroImageFile(file);
      setHeroImageUrl(URL.createObjectURL(file));
    }
  };

  const handlePopupImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPopupImageFile(file);
      setPopupImageUrl(URL.createObjectURL(file));
    }
  };

  const saveHero = () => {
    // In a real app, you would upload the image and save the data to your backend
    toast({
      title: "Hero section updated",
      description: "The hero section has been successfully updated.",
    });
  };

  const savePopup = () => {
    // In a real app, you would upload the image and save the data to your backend
    toast({
      title: "Popup settings updated",
      description: `The popup has been ${popupEnabled ? 'enabled' : 'disabled'} and settings updated.`,
    });
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Content Management</h1>
          </div>

          <Tabs defaultValue="hero">
            <TabsList className="mb-4">
              <TabsTrigger value="hero">Hero Section</TabsTrigger>
              <TabsTrigger value="popup">Popup</TabsTrigger>
            </TabsList>

            {/* Hero Section Tab */}
            <TabsContent value="hero">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="heroTitle">Title</Label>
                        <Input
                          id="heroTitle"
                          value={heroTitle}
                          onChange={(e) => setHeroTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="heroSubtitle">Subtitle</Label>
                        <Textarea
                          id="heroSubtitle"
                          value={heroSubtitle}
                          onChange={(e) => setHeroSubtitle(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="heroButtonText">Button Text</Label>
                        <Input
                          id="heroButtonText"
                          value={heroButtonText}
                          onChange={(e) => setHeroButtonText(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="heroImage">Hero Image</Label>
                        <Input
                          id="heroImage"
                          type="file"
                          accept="image/*"
                          onChange={handleHeroImageChange}
                        />
                      </div>
                      
                      <Button onClick={saveHero}>Save Hero Section</Button>
                    </div>
                    
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium mb-4">Preview</h3>
                      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative">
                        <img
                          src={heroImageUrl}
                          alt="Hero preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-6 text-center">
                          <h2 className="text-2xl md:text-4xl font-bold mb-2">{heroTitle}</h2>
                          <p className="mb-4 max-w-md">{heroSubtitle}</p>
                          <Button variant="secondary">{heroButtonText}</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Popup Tab */}
            <TabsContent value="popup">
              <Card>
                <CardHeader>
                  <CardTitle>Popup Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="popupEnabled"
                          checked={popupEnabled}
                          onCheckedChange={setPopupEnabled}
                        />
                        <Label htmlFor="popupEnabled">Enable Popup</Label>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="popupTitle">Title</Label>
                        <Input
                          id="popupTitle"
                          value={popupTitle}
                          onChange={(e) => setPopupTitle(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="popupDescription">Description</Label>
                        <Textarea
                          id="popupDescription"
                          value={popupDescription}
                          onChange={(e) => setPopupDescription(e.target.value)}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="popupButtonText">Button Text</Label>
                        <Input
                          id="popupButtonText"
                          value={popupButtonText}
                          onChange={(e) => setPopupButtonText(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="popupImage">Popup Image</Label>
                        <Input
                          id="popupImage"
                          type="file"
                          accept="image/*"
                          onChange={handlePopupImageChange}
                        />
                      </div>
                      
                      <Button onClick={savePopup} disabled={!popupEnabled}>
                        Save Popup Settings
                      </Button>
                    </div>
                    
                    <div className={`border rounded-md p-4 ${!popupEnabled && 'opacity-60'}`}>
                      <h3 className="font-medium mb-4">Preview</h3>
                      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                        <img
                          src={popupImageUrl}
                          alt="Popup preview"
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-6">
                          <h4 className="text-xl font-bold mb-2">{popupTitle}</h4>
                          <p className="text-gray-600 mb-4">{popupDescription}</p>
                          <Button className="w-full">{popupButtonText}</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminCMS;
