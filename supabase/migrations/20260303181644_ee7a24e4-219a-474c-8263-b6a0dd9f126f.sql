
-- Create handle_updated_at function first
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Cart abandonment tracking table
CREATE TABLE public.cart_abandonment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  reminder_step INTEGER NOT NULL DEFAULT 0,
  last_reminder_sent_at TIMESTAMPTZ,
  next_reminder_at TIMESTAMPTZ,
  cart_snapshot JSONB,
  cart_value NUMERIC DEFAULT 0,
  is_converted BOOLEAN DEFAULT FALSE,
  is_stopped BOOLEAN DEFAULT FALSE,
  is_paused BOOLEAN DEFAULT FALSE,
  total_reminders_sent INTEGER DEFAULT 0,
  converted_order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(customer_id)
);

CREATE INDEX idx_cart_abandonment_next_reminder 
ON public.cart_abandonment_tracking(next_reminder_at) 
WHERE is_converted = FALSE AND is_stopped = FALSE AND is_paused = FALSE;

CREATE INDEX idx_cart_abandonment_customer 
ON public.cart_abandonment_tracking(customer_id);

ALTER TABLE public.cart_abandonment_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage cart abandonment tracking"
ON public.cart_abandonment_tracking FOR ALL
USING (public.is_admin());

CREATE POLICY "Users can view their own tracking"
ON public.cart_abandonment_tracking FOR SELECT
USING (auth.uid() = customer_id);

-- Cart reminder schedule table
CREATE TABLE public.cart_reminder_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_number INTEGER NOT NULL UNIQUE,
  delay_hours INTEGER NOT NULL,
  message_type TEXT NOT NULL,
  message_preview TEXT,
  discount_code TEXT,
  discount_percentage INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cart_reminder_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reminder schedule"
ON public.cart_reminder_schedule FOR ALL
USING (public.is_admin());

CREATE POLICY "Public can read reminder schedule"
ON public.cart_reminder_schedule FOR SELECT
USING (true);

INSERT INTO public.cart_reminder_schedule (step_number, delay_hours, message_type, message_preview, discount_code, discount_percentage) VALUES
(1, 2, 'reminder', 'Hi {name}! 👋 You left some amazing items in your cart at CuteBae. Complete your order now before they''re gone! 🛒', NULL, NULL),
(2, 24, 'urgency', 'Hey {name}! ⏰ Your cart is waiting for you! These items are selling fast. Don''t miss out!', NULL, NULL),
(3, 48, 'discount', 'Hi {name}! 🎉 We saved your cart and here''s a special treat: Use code COMEBACK10 for 10% OFF!', 'COMEBACK10', 10),
(4, 72, 'discount', 'Hi {name}! Last chance! Use code COMEBACK15 for 15% OFF your cart!', 'COMEBACK15', 15),
(5, 96, 'final_discount', 'Hi {name}! Final reminder: Your 15% discount expires soon!', 'COMEBACK15', 15);

-- Cart reminder logs table
CREATE TABLE public.cart_reminder_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id UUID NOT NULL REFERENCES public.cart_abandonment_tracking(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  reminder_step INTEGER NOT NULL,
  message_template TEXT,
  whatsapp_message_id TEXT,
  delivery_status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reminder_logs_tracking ON public.cart_reminder_logs(tracking_id);
CREATE INDEX idx_reminder_logs_sent_at ON public.cart_reminder_logs(sent_at);

ALTER TABLE public.cart_reminder_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reminder logs"
ON public.cart_reminder_logs FOR ALL
USING (public.is_admin());

-- Cart reminder settings (master toggle)
CREATE TABLE public.cart_reminder_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  is_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cart_reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage reminder settings"
ON public.cart_reminder_settings FOR ALL
USING (public.is_admin());

INSERT INTO public.cart_reminder_settings (id, is_enabled) VALUES ('default', false);

-- Trigger to mark cart as converted when order is placed
CREATE OR REPLACE FUNCTION public.mark_cart_converted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.cart_abandonment_tracking
  SET is_converted = TRUE, converted_order_id = NEW.id, updated_at = NOW()
  WHERE customer_id = NEW.customer_id AND is_converted = FALSE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_order_created_mark_cart_converted
AFTER INSERT ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.mark_cart_converted();

-- Trigger to sync phone from address to customer
CREATE OR REPLACE FUNCTION public.sync_customer_phone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.phone_number IS NOT NULL AND NEW.phone_number != '' THEN
    UPDATE public.customers
    SET mobile_number = NEW.phone_number, updated_at = NOW()
    WHERE id = NEW.customer_id AND (mobile_number IS NULL OR mobile_number = '');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_address_sync_phone
AFTER INSERT OR UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.sync_customer_phone();

-- Updated_at trigger for tracking table
CREATE TRIGGER update_cart_abandonment_updated_at
BEFORE UPDATE ON public.cart_abandonment_tracking
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
