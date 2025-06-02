
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const PopupModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupSettings, setPopupSettings] = useState<PopupSettings | null>(null);

  useEffect(() => {
    const fetchPopupSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('popup_settings')
          .select('*')
          .eq('id', '1')
          .single();

        if (error) {
          console.error('Error fetching popup settings:', error);
          return;
        }

        if (data && data.is_enabled) {
          setPopupSettings(data);
          
          // Check if popup should be shown based on frequency
          const lastShown = localStorage.getItem('popup_last_shown');
          const now = new Date().getTime();
          
          let shouldShow = true;
          
          if (data.display_frequency === 'once_per_session') {
            const sessionShown = sessionStorage.getItem('popup_shown');
            if (sessionShown) shouldShow = false;
          } else if (data.display_frequency === 'once_per_day' && lastShown) {
            const oneDayAgo = now - (24 * 60 * 60 * 1000);
            if (parseInt(lastShown) > oneDayAgo) shouldShow = false;
          } else if (data.display_frequency === 'once_per_week' && lastShown) {
            const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
            if (parseInt(lastShown) > oneWeekAgo) shouldShow = false;
          }
          
          if (shouldShow) {
            setTimeout(() => {
              setIsOpen(true);
            }, data.display_delay || 3000);
          }
        }
      } catch (error) {
        console.error('Error in popup setup:', error);
      }
    };

    fetchPopupSettings();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    
    // Record that popup was shown
    const now = new Date().getTime().toString();
    localStorage.setItem('popup_last_shown', now);
    sessionStorage.setItem('popup_shown', 'true');
  };

  const handleButtonClick = () => {
    // Handle popup button action (e.g., redirect, newsletter signup, etc.)
    handleClose();
  };

  if (!popupSettings) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4 p-4">
          {popupSettings.image_url && (
            <div className="flex justify-center">
              <img
                src={popupSettings.image_url}
                alt={popupSettings.title}
                className="max-w-full max-h-40 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">{popupSettings.title}</h3>
            <p className="text-gray-600">{popupSettings.description}</p>
          </div>
          
          <div className="flex justify-center">
            <Button onClick={handleButtonClick} className="w-full">
              {popupSettings.button_text}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupModal;
