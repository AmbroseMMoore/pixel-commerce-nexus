-- Fix search_path security warnings for stock management functions

CREATE OR REPLACE FUNCTION deduct_stock(
  p_size_id UUID,
  p_quantity INTEGER
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO v_current_stock
  FROM product_sizes
  WHERE id = p_size_id;
  
  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  UPDATE product_sizes
  SET stock_quantity = stock_quantity - p_quantity
  WHERE id = p_size_id
  AND stock_quantity >= p_quantity;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION restore_stock(
  p_size_id UUID,
  p_quantity INTEGER
) RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE product_sizes
  SET stock_quantity = stock_quantity + p_quantity
  WHERE id = p_size_id;
END;
$$;

CREATE OR REPLACE FUNCTION check_stock_availability(
  p_size_id UUID,
  p_required_quantity INTEGER
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
STABLE
SET search_path = public
AS $$
DECLARE
  v_available_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO v_available_stock
  FROM product_sizes
  WHERE id = p_size_id;
  
  RETURN v_available_stock >= p_required_quantity;
END;
$$;