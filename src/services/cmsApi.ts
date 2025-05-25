
import { supabase } from "@/integrations/supabase/client";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PopupSettings {
  id: string;
  title: string;
  description: string;
  button_text: string;
  image_url?: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

// Hero Slides API
export const fetchHeroSlides = async (): Promise<HeroSlide[]> => {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('order_index');

  if (error) throw error;
  return data || [];
};

export const saveHeroSlides = async (slides: Omit<HeroSlide, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> => {
  // First, deactivate all existing slides
  const { error: deactivateError } = await supabase
    .from('hero_slides')
    .update({ is_active: false });

  if (deactivateError) throw deactivateError;

  // Then insert new slides
  const { error: insertError } = await supabase
    .from('hero_slides')
    .insert(slides.map(slide => ({
      ...slide,
      is_active: true
    })));

  if (insertError) throw insertError;
};

// Popup Settings API
export const fetchPopupSettings = async (): Promise<PopupSettings | null> => {
  const { data, error } = await supabase
    .from('popup_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const savePopupSettings = async (settings: Omit<PopupSettings, 'id' | 'created_at' | 'updated_at'>): Promise<void> => {
  const { error } = await supabase
    .from('popup_settings')
    .upsert({
      ...settings,
      id: '1' // Use a fixed ID for singleton
    });

  if (error) throw error;
};
