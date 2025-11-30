
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { useAddresses } from "@/hooks/useAddresses";
import { useRazorpay } from "@/hooks/useRazorpay";
import { useDeliveryInfoByPincode } from "@/hooks/usePincodeZones";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useLogging } from "@/hooks/useLogging";
import { MapPin, Truck, Clock } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/hooks/useDeliveryInfo";

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { addresses } = useAddresses();
  const { logFormSuccess, logFormError } = useLogging();
  const { initiatePayment, isLoading: isPaymentLoading } = useRazorpay();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    // Auto-fill with the most recent address if available
    if (addresses && addresses.length > 0) {
      const mostRecentAddress = addresses[0]; // addresses are ordered by created_at desc
      return {
        fullName: mostRecentAddress.full_name || "",
        addressLine1: mostRecentAddress.address_line_1 || "",
        addressLine2: mostRecentAddress.address_line_2 || "",
        city: mostRecentAddress.city || "",
        state: mostRecentAddress.state || "",
        postalCode: mostRecentAddress.postal_code || "",
        phoneNumber: mostRecentAddress.phone_number || ""
      };
    }
    return {
      fullName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      phoneNumber: ""
    };
  });

  // Get delivery info for the postal code
  const { data: deliveryInfo } = useDeliveryInfoByPincode(
    deliveryAddress.postalCode,
    deliveryAddress.postalCode.length === 6
  );

  const baseDeliveryCharge = deliveryInfo?.delivery_charge || 0;
  const effectiveDeliveryCharge = cartTotal >= FREE_SHIPPING_THRESHOLD ? 0 : baseDeliveryCharge;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotal);
  const hasFreeShipping = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const totalWithDelivery = cartTotal + effectiveDeliveryCharge;

  if (!user) {
    navigate('/auth?redirect=/checkout');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleAddressChange = (field: string, value: string) => {
    setDeliveryAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = () => {
    const required = ['fullName', 'addressLine1', 'city', 'state', 'postalCode', 'phoneNumber'];
    return required.every(field => deliveryAddress[field as keyof typeof deliveryAddress].trim() !== '');
  };

  const createOrderInDatabase = async () => {
    // STEP 1: Validate stock availability first
    for (const item of cartItems) {
      const { data: sizeData, error: sizeError } = await supabase
        .from('product_sizes')
        .select('stock_quantity, name')
        .eq('id', item.size_id)
        .single();
      
      if (sizeError || !sizeData) {
        throw new Error(`Unable to verify stock for ${item.product.title}`);
      }
      
      if (sizeData.stock_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.product.title} (${sizeData.name}). Only ${sizeData.stock_quantity} units available.`
        );
      }
    }

    // STEP 2: Create address record
    const { data: addressData, error: addressError } = await supabase
      .from('addresses')
      .insert({
        customer_id: user.id,
        full_name: deliveryAddress.fullName,
        address_line_1: deliveryAddress.addressLine1,
        address_line_2: deliveryAddress.addressLine2,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postal_code: deliveryAddress.postalCode,
        country: 'IN',
        phone_number: deliveryAddress.phoneNumber,
        is_default: false
      })
      .select()
      .single();

    if (addressError) throw addressError;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create order with delivery information
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        order_number: orderNumber,
        total_amount: totalWithDelivery,
        status: 'pending',
        delivery_address_id: addressData.id,
        payment_method: 'razorpay',
        payment_status: 'pending',
        delivery_zone_id: deliveryInfo?.zone_id || null,
        delivery_charge: effectiveDeliveryCharge,
        estimated_delivery_days: deliveryInfo?.delivery_days_max || null,
        delivery_pincode: deliveryAddress.postalCode
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items with denormalized data for historical accuracy
    const orderItems = cartItems.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id,
      color_id: item.color_id,
      size_id: item.size_id,
      quantity: item.quantity,
      unit_price: item.product.price_discounted || item.product.price_original,
      total_price: (item.product.price_discounted || item.product.price_original) * item.quantity,
      // Store denormalized data to preserve order details even if product variants change
      size_name: item.size.name,
      color_name: item.color.name,
      color_code: item.color.color_code
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // STEP 3: Deduct stock for each item
    for (const item of cartItems) {
      const { error: stockError } = await supabase.rpc('deduct_stock', {
        p_size_id: item.size_id,
        p_quantity: item.quantity
      });
      
      if (stockError) {
        console.error('Stock deduction error:', stockError);
        // Log but don't fail the order - stock will need manual adjustment
      }
    }

    return orderData;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required delivery address fields.",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryInfo) {
      toast({
        title: "Delivery not available",
        description: "Please enter a valid pincode where delivery is available.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Handle Razorpay payment
      const orderData = await createOrderInDatabase();
        
        // Initiate Razorpay payment
        await initiatePayment(
          totalWithDelivery,
          orderData.id,
          {
            name: deliveryAddress.fullName,
            email: user.email || '',
            contact: deliveryAddress.phoneNumber
          },
          () => {
            // Payment success
            clearCart();
            logFormSuccess('checkout_form', 'order_placed', {
              orderId: orderData.id,
              orderNumber: orderData.order_number,
              totalAmount: totalWithDelivery,
              itemCount: cartItems.length,
              paymentMethod: 'razorpay',
              deliveryCharge: effectiveDeliveryCharge
            });
            navigate('/profile?tab=orders');
          },
          async (error) => {
            // Payment failed - restore stock
            try {
              for (const item of cartItems) {
                await supabase.rpc('restore_stock', {
                  p_size_id: item.size_id,
                  p_quantity: item.quantity
                });
              }
            } catch (restoreError) {
              console.error('Failed to restore stock:', restoreError);
            }
            
            logFormError('checkout_form', 'payment_failed', error, {
              orderId: orderData.id,
              orderNumber: orderData.order_number
            });
          }
        );
    } catch (error: any) {
      console.error('Order placement error:', error);
      logFormError('checkout_form', 'order_failed', error, deliveryAddress);
      toast({
        title: "Order failed",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isProcessing || isPaymentLoading;

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery Address Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={deliveryAddress.fullName}
                    onChange={(e) => handleAddressChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="addressLine1">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    value={deliveryAddress.addressLine1}
                    onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                    placeholder="Street address"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={deliveryAddress.addressLine2}
                    onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                    placeholder="Apartment, suite, etc. (optional)"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={deliveryAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={deliveryAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Postal Code *</Label>
                    <Input
                      id="postalCode"
                      value={deliveryAddress.postalCode}
                      onChange={(e) => handleAddressChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="PIN code"
                      required
                      maxLength={6}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number *</Label>
                    <Input
                      id="phoneNumber"
                      value={deliveryAddress.phoneNumber}
                      onChange={(e) => handleAddressChange('phoneNumber', e.target.value)}
                      placeholder="+91 12345 67890"
                      required
                    />
                  </div>
                </div>

                {/* Delivery Information */}
                {deliveryAddress.postalCode.length === 6 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    {deliveryInfo ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-green-600">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            Delivery available to {deliveryInfo.city}, {deliveryInfo.state}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span>
                              {deliveryInfo.delivery_days_min === deliveryInfo.delivery_days_max 
                                ? `${deliveryInfo.delivery_days_min} days`
                                : `${deliveryInfo.delivery_days_min}-${deliveryInfo.delivery_days_max} days`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                            <div className="flex flex-col">
                              <span>
                                ₹{effectiveDeliveryCharge} delivery charge
                                {hasFreeShipping && (
                                  <span className="ml-2 text-green-600 font-medium">(Free Shipping Applied!)</span>
                                )}
                              </span>
                              {!hasFreeShipping && remainingForFreeShipping > 0 && (
                                <span className="text-xs text-amber-600">
                                  Add ₹{remainingForFreeShipping.toFixed(0)} more for free shipping
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Delivery not available for this pincode
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Online Payment (Razorpay)</p>
                    <p className="text-sm text-muted-foreground">
                      Secure payment via Credit/Debit Card, UPI, Net Banking, and Wallets
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.product.image_url || '/placeholder.svg'}
                        alt={item.product.title}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.title}</p>
                        <p className="text-xs text-gray-500">
                          {item.color.name} • {item.size.name} • Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        ₹{((item.product.price_discounted || item.product.price_original) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span>Delivery Charge</span>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className={hasFreeShipping ? "line-through text-muted-foreground text-sm" : ""}>
                          ₹{effectiveDeliveryCharge.toFixed(2)}
                        </span>
                        {hasFreeShipping && (
                          <span className="text-green-600 font-medium text-sm">(Free Shipping!)</span>
                        )}
                      </div>
                      {!hasFreeShipping && remainingForFreeShipping > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          (Add ₹{remainingForFreeShipping.toFixed(0)} more for free shipping)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₹0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{totalWithDelivery.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isLoading || !deliveryInfo}
                >
                  {isLoading ? "Processing..." : "Pay Now"}
                </Button>

                {!deliveryInfo && deliveryAddress.postalCode.length === 6 && (
                  <p className="text-sm text-red-600 text-center">
                    Please enter a valid pincode where delivery is available
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;
