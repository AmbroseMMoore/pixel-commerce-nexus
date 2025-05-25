
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import { HeroSlide, PopupSettings, fetchHeroSlides, saveHeroSlides, fetchPopupSettings, savePopupSettings } from "@/services/cmsApi";

const AdminCMS = () => {
  // Hero slides state
  const [heroSlides, setHeroSlides] = useState<Omit<HeroSlide, 'created_at' | 'updated_at'>[]>([
    {
      id: "1",
      title: "Welcome to CuteBae",
      subtitle: "Discover amazing products for kids",
      cta_text: "Shop Now",
      cta_link: "/category/boys",
      image_url: "/placeholder.svg",
      order_index: 0,
      is_active: true
    }
  ]);

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLoadingHero, setIsLoadingHero] = useState(false);

  // Popup state
  const [popupTitle, setPopupTitle] = useState("Special Offer!");
  const [popupDescription, setPopupDescription] = useState("Sign up now and get 10% off your first order");
  const [popupButtonText, setPopupButtonText] = useState("Sign Up");
  const [popupImageUrl, setPopupImageUrl] = useState("/placeholder.svg");
  const [popupImageFile, setPopupImageFile] = useState<File | null>(null);
  const [popupEnabled, setPopupEnabled] = useState(false);
  const [isLoadingPopup, setIsLoadingPopup] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadHeroSlides();
    loadPopupSettings();
  }, []);

  const loadHeroSlides = async () => {
    try {
      const slides = await fetchHeroSlides();
      if (slides.length > 0) {
        setHeroSlides(slides.map(slide => ({
          id: slide.id,
          title: slide.title,
          subtitle: slide.subtitle,
          cta_text: slide.cta_text,
          cta_link: slide.cta_link,
          image_url: slide.image_url,
          order_index: slide.order_index,
          is_active: slide.is_active
        })));
      }
    } catch (error) {
      console.error('Error loading hero slides:', error);
    }
  };

  const loadPopupSettings = async () => {
    try {
      const settings = await fetchPopupSettings();
      if (settings) {
        setPopupTitle(settings.title);
        setPopupDescription(settings.description);
        setPopupButtonText(settings.button_text);
        setPopupImageUrl(settings.image_url || "/placeholder.svg");
        setPopupEnabled(settings.is_enabled);
      }
    } catch (error) {
      console.error('Error loading popup settings:', error);
    }
  };

  const updateSlide = (index: number, field: keyof HeroSlide, value: string | number) => {
    const updatedSlides = [...heroSlides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    setHeroSlides(updatedSlides);
  };

  const addSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      title: "New Slide",
      subtitle: "Add your subtitle here",
      cta_text: "Shop Now",
      cta_link: "/category/boys",
      image_url: "/placeholder.svg",
      order_index: heroSlides.length,
      is_active: true
    };
    setHeroSlides([...heroSlides, newSlide]);
    setActiveSlideIndex(heroSlides.length);
  };

  const removeSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      toast({
        title: "Cannot remove slide",
        description: "At least one slide is required.",
        variant: "destructive"
      });
      return;
    }
    const updatedSlides = heroSlides.filter((_, i) => i !== index);
    // Update order_index for remaining slides
    updatedSlides.forEach((slide, i) => {
      slide.order_index = i;
    });
    setHeroSlides(updatedSlides);
    if (activeSlideIndex >= updatedSlides.length) {
      setActiveSlideIndex(updatedSlides.length - 1);
    }
  };

  const handleSlideImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      updateSlide(index, 'image_url', imageUrl);
    }
  };

  const handlePopupImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setPopupImageFile(file);
      setPopupImageUrl(URL.createObjectURL(file));
    }
  };

  const saveHeroSlidesToDb = async () => {
    setIsLoadingHero(true);
    try {
      await saveHeroSlides(heroSlides.map(slide => ({
        title: slide.title,
        subtitle: slide.subtitle,
        cta_text: slide.cta_text,
        cta_link: slide.cta_link,
        image_url: slide.image_url,
        order_index: slide.order_index,
        is_active: true
      })));
      
      toast({
        title: "Hero slides updated",
        description: "The hero section slides have been successfully saved to the database.",
      });
    } catch (error) {
      console.error('Error saving hero slides:', error);
      toast({
        title: "Error",
        description: "Failed to save hero slides. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHero(false);
    }
  };

  const savePopupToDb = async () => {
    setIsLoadingPopup(true);
    try {
      await savePopupSettings({
        title: popupTitle,
        description: popupDescription,
        button_text: popupButtonText,
        image_url: popupImageUrl,
        is_enabled: popupEnabled
      });
      
      toast({
        title: "Popup settings updated",
        description: `The popup has been ${popupEnabled ? 'enabled' : 'disabled'} and settings saved to the database.`,
      });
    } catch (error) {
      console.error('Error saving popup settings:', error);
      toast({
        title: "Error",
        description: "Failed to save popup settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingPopup(false);
    }
  };

  const activeSlide = heroSlides[activeSlideIndex];

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
                  <CardTitle className="flex items-center justify-between">
                    Hero Section Slider
                    <Button onClick={addSlide} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slide
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Slide Selector */}
                    <div className="flex items-center space-x-4">
                      <Label>Select Slide:</Label>
                      <Select value={activeSlideIndex.toString()} onValueChange={(value) => setActiveSlideIndex(parseInt(value))}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {heroSlides.map((slide, index) => (
                            <SelectItem key={slide.id} value={index.toString()}>
                              Slide {index + 1}: {slide.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {heroSlides.length > 1 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removeSlide(activeSlideIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="slideTitle">Title</Label>
                          <Input
                            id="slideTitle"
                            value={activeSlide.title}
                            onChange={(e) => updateSlide(activeSlideIndex, 'title', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="slideSubtitle">Subtitle</Label>
                          <Textarea
                            id="slideSubtitle"
                            value={activeSlide.subtitle}
                            onChange={(e) => updateSlide(activeSlideIndex, 'subtitle', e.target.value)}
                            rows={3}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="slideButtonText">Button Text</Label>
                          <Input
                            id="slideButtonText"
                            value={activeSlide.cta_text}
                            onChange={(e) => updateSlide(activeSlideIndex, 'cta_text', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="slideButtonLink">Button Link</Label>
                          <Input
                            id="slideButtonLink"
                            value={activeSlide.cta_link}
                            onChange={(e) => updateSlide(activeSlideIndex, 'cta_link', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="slideImage">Slide Image</Label>
                          <Input
                            id="slideImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSlideImageChange(activeSlideIndex, e)}
                          />
                        </div>
                        
                        <Button onClick={saveHeroSlidesToDb} disabled={isLoadingHero}>
                          {isLoadingHero ? "Saving..." : "Save Hero Slides"}
                        </Button>
                      </div>
                      
                      <div className="border rounded-md p-4">
                        <h3 className="font-medium mb-4">Preview - Slide {activeSlideIndex + 1}</h3>
                        <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden relative" style={{ width: '95%', margin: '0 auto' }}>
                          <img
                            src={activeSlide.image_url}
                            alt="Slide preview"
                            className="w-full h-full object-cover rounded-2xl"
                          />
                          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-6 text-center rounded-2xl">
                            <h2 className="text-2xl md:text-4xl font-bold mb-2 font-holtwood text-black">{activeSlide.title}</h2>
                            <p className="mb-4 max-w-md font-quicksand">{activeSlide.subtitle}</p>
                            <Button variant="secondary" className="font-quicksand">{activeSlide.cta_text}</Button>
                          </div>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600">
                            {heroSlides.length} slide{heroSlides.length !== 1 ? 's' : ''} total
                          </p>
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
                      
                      <Button onClick={savePopupToDb} disabled={isLoadingPopup}>
                        {isLoadingPopup ? "Saving..." : "Save Popup Settings"}
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
