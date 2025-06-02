import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import ImageUpload from "@/components/admin/ImageUpload";
import { Trash2, Plus, Save } from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order_index: number;
  is_active: boolean;
}

interface PopupSettings {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  button_text: string;
  is_enabled: boolean;
  popup_type: string;
  display_delay: number;
  display_frequency: string;
}

const AdminCMS = () => {
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [popupSettings, setPopupSettings] = useState<PopupSettings>({
    id: '1',
    title: '',
    description: '',
    image_url: '',
    button_text: 'Learn More',
    is_enabled: false,
    popup_type: 'promotional',
    display_delay: 3000,
    display_frequency: 'once_per_session'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [newSlide, setNewSlide] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    image_url: '',
    cta_text: 'Shop Now',
    cta_link: '/search',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    fetchHeroSlides();
    fetchPopupSettings();
  }, []);

  const fetchHeroSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setHeroSlides(data || []);
    } catch (error: any) {
      console.error('Error fetching hero slides:', error);
      toast({
        title: "Error",
        description: "Failed to load hero slides",
        variant: "destructive",
      });
    }
  };

  const fetchPopupSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('popup_settings')
        .select('*')
        .eq('id', '1')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setPopupSettings(data);
    } catch (error: any) {
      console.error('Error fetching popup settings:', error);
    }
  };

  const saveHeroSlide = async () => {
    if (!newSlide.title || !newSlide.subtitle || !newSlide.image_url) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('hero_slides')
        .insert([{
          title: newSlide.title,
          subtitle: newSlide.subtitle,
          image_url: newSlide.image_url,
          cta_text: newSlide.cta_text,
          cta_link: newSlide.cta_link,
          order_index: newSlide.order_index || heroSlides.length,
          is_active: newSlide.is_active ?? true
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hero slide added successfully",
      });

      setNewSlide({
        title: '',
        subtitle: '',
        image_url: '',
        cta_text: 'Shop Now',
        cta_link: '/search',
        order_index: 0,
        is_active: true
      });

      fetchHeroSlides();
    } catch (error: any) {
      console.error('Error saving hero slide:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save hero slide",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHeroSlide = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Hero slide deleted successfully",
      });

      fetchHeroSlides();
    } catch (error: any) {
      console.error('Error deleting hero slide:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete hero slide",
        variant: "destructive",
      });
    }
  };

  const savePopupSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('popup_settings')
        .upsert({
          id: '1',
          title: popupSettings.title,
          description: popupSettings.description,
          image_url: popupSettings.image_url || null,
          button_text: popupSettings.button_text,
          is_enabled: popupSettings.is_enabled,
          popup_type: popupSettings.popup_type,
          display_delay: popupSettings.display_delay,
          display_frequency: popupSettings.display_frequency
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Popup settings saved successfully",
      });
    } catch (error: any) {
      console.error('Error saving popup settings:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save popup settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Content Management</h1>

          <Tabs defaultValue="hero-slider" className="space-y-4">
            <TabsList>
              <TabsTrigger value="hero-slider">Hero Slider</TabsTrigger>
              <TabsTrigger value="popup">Popup Settings</TabsTrigger>
              <TabsTrigger value="media-config">Media Storage</TabsTrigger>
            </TabsList>

            <TabsContent value="hero-slider" className="space-y-6">
              {/* Add New Hero Slide */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Hero Slide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={newSlide.title}
                        onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                        placeholder="Enter slide title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Subtitle *</Label>
                      <Input
                        id="subtitle"
                        value={newSlide.subtitle}
                        onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                        placeholder="Enter slide subtitle"
                      />
                    </div>
                  </div>

                  <ImageUpload
                    label="Hero Image *"
                    value={newSlide.image_url || ''}
                    onChange={(url) => setNewSlide({ ...newSlide, image_url: url })}
                    placeholder="https://example.com/image.jpg"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cta_text">Button Text</Label>
                      <Input
                        id="cta_text"
                        value={newSlide.cta_text}
                        onChange={(e) => setNewSlide({ ...newSlide, cta_text: e.target.value })}
                        placeholder="Shop Now"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cta_link">Button Link</Label>
                      <Input
                        id="cta_link"
                        value={newSlide.cta_link}
                        onChange={(e) => setNewSlide({ ...newSlide, cta_link: e.target.value })}
                        placeholder="/search"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={newSlide.is_active}
                      onCheckedChange={(checked) => setNewSlide({ ...newSlide, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>

                  <Button onClick={saveHeroSlide} disabled={isLoading}>
                    <Plus className="h-4 w-4 mr-2" />
                    {isLoading ? "Adding..." : "Add Slide"}
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Hero Slides */}
              <Card>
                <CardHeader>
                  <CardTitle>Existing Hero Slides ({heroSlides.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {heroSlides.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No hero slides found. Add your first slide above.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {heroSlides.map((slide) => (
                        <div key={slide.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{slide.title}</h3>
                              <p className="text-sm text-gray-500">{slide.subtitle}</p>
                              <p className="text-xs text-gray-400 mt-1">Order: {slide.order_index}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-1 rounded text-xs ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {slide.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                            {slide.image_url && (
                              <img
                                src={slide.image_url}
                                alt={slide.title}
                                className="w-20 h-12 object-cover rounded ml-4"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteHeroSlide(slide.id)}
                              className="ml-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="popup" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popup Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="popup_enabled"
                      checked={popupSettings.is_enabled}
                      onCheckedChange={(checked) => setPopupSettings({ ...popupSettings, is_enabled: checked })}
                    />
                    <Label htmlFor="popup_enabled">Enable Popup</Label>
                  </div>

                  <div>
                    <Label htmlFor="popup_title">Title</Label>
                    <Input
                      id="popup_title"
                      value={popupSettings.title}
                      onChange={(e) => setPopupSettings({ ...popupSettings, title: e.target.value })}
                      placeholder="Welcome to our store!"
                    />
                  </div>

                  <div>
                    <Label htmlFor="popup_description">Description</Label>
                    <Textarea
                      id="popup_description"
                      value={popupSettings.description}
                      onChange={(e) => setPopupSettings({ ...popupSettings, description: e.target.value })}
                      placeholder="Get 10% off your first order with code WELCOME10"
                      rows={3}
                    />
                  </div>

                  <ImageUpload
                    label="Popup Image (Optional)"
                    value={popupSettings.image_url || ''}
                    onChange={(url) => setPopupSettings({ ...popupSettings, image_url: url })}
                    placeholder="https://example.com/popup-image.jpg"
                  />

                  <div>
                    <Label htmlFor="popup_button">Button Text</Label>
                    <Input
                      id="popup_button"
                      value={popupSettings.button_text}
                      onChange={(e) => setPopupSettings({ ...popupSettings, button_text: e.target.value })}
                      placeholder="Get Discount"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="display_delay">Display Delay (ms)</Label>
                      <Input
                        id="display_delay"
                        type="number"
                        value={popupSettings.display_delay}
                        onChange={(e) => setPopupSettings({ ...popupSettings, display_delay: parseInt(e.target.value) || 3000 })}
                        placeholder="3000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="display_frequency">Display Frequency</Label>
                      <Select
                        value={popupSettings.display_frequency}
                        onValueChange={(value) => setPopupSettings({ ...popupSettings, display_frequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once_per_session">Once per session</SelectItem>
                          <SelectItem value="once_per_day">Once per day</SelectItem>
                          <SelectItem value="once_per_week">Once per week</SelectItem>
                          <SelectItem value="always">Always</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={savePopupSettings} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Popup Settings"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media-config" className="space-y-6">
              <MediaStorageConfig />
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
};

export default AdminCMS;
