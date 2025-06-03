
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...payload } = await req.json();
    
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    if (action === 'create_order') {
      const { amount, currency = 'INR', receipt } = payload;
      
      // Create Razorpay order
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency,
          receipt,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Razorpay API error: ${error}`);
      }

      const order = await response.json();
      
      return new Response(JSON.stringify({ 
        success: true, 
        order,
        key_id: razorpayKeyId 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'verify_payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = payload;
      
      console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id });
      
      // Verify payment signature using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
      const key = encoder.encode(razorpayKeySecret);
      
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );
      
      const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      console.log('Expected signature:', expectedSignature);
      console.log('Received signature:', razorpay_signature);

      if (expectedSignature !== razorpay_signature) {
        console.error('Signature verification failed');
        throw new Error('Invalid payment signature');
      }

      console.log('Signature verification successful');

      // Update order status in database
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          updated_at: new Date().toISOString()
        })
        .eq('id', order_id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('Order updated successfully');

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Payment verified successfully' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Razorpay payment error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
