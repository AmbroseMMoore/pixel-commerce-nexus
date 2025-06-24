
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Truck, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DeliveryInfo {
  zone_id: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  state?: string;
  city?: string;
}

interface PincodeCheckerProps {
  onDeliveryInfoChange?: (deliveryInfo: DeliveryInfo | null) => void;
}

const PincodeChecker: React.FC<PincodeCheckerProps> = ({ onDeliveryInfoChange }) => {
  const [pincode, setPincode] = useState("");
  const [checkedPincode, setCheckedPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check pincode using zone_regions table
  const checkPincodeDelivery = async (pincodeToCheck: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Checking pincode: ${pincodeToCheck} in zone_regions table`);
      
      // First, get all rows for this pincode
      const { data: zoneRegions, error: queryError } = await supabase
        .from('zone_regions')
        .select(`
          id,
          state_name,
          district_name,
          pincode,
          delivery_zone:delivery_zones(
            id,
            zone_number,
            zone_name,
            delivery_days_min,
            delivery_days_max,
            delivery_charge,
            is_active
          )
        `)
        .eq('pincode', pincodeToCheck)
        .order('id', { ascending: true }); // Get first row consistently

      if (queryError) {
        console.error('Query error:', queryError);
        throw new Error('Error checking pincode availability');
      }

      if (!zoneRegions || zoneRegions.length === 0) {
        throw new Error('Delivery not available for this pincode');
      }

      // Take the first row as specified
      const firstRegion = zoneRegions[0];
      
      if (!firstRegion.delivery_zone || !firstRegion.delivery_zone.is_active) {
        throw new Error('Delivery zone is not active for this pincode');
      }

      const result: DeliveryInfo = {
        zone_id: firstRegion.delivery_zone.id,
        zone_number: firstRegion.delivery_zone.zone_number,
        zone_name: firstRegion.delivery_zone.zone_name,
        delivery_days_min: firstRegion.delivery_zone.delivery_days_min,
        delivery_days_max: firstRegion.delivery_zone.delivery_days_max,
        delivery_charge: firstRegion.delivery_zone.delivery_charge,
        state: firstRegion.state_name,
        city: firstRegion.district_name
      };

      console.log('Delivery info found:', result);
      setDeliveryInfo(result);
      
      if (onDeliveryInfoChange) {
        onDeliveryInfoChange(result);
      }
    } catch (err) {
      console.error('Error checking pincode:', err);
      setError(err instanceof Error ? err.message : 'Unable to check delivery for this pincode');
      setDeliveryInfo(null);
      
      if (onDeliveryInfoChange) {
        onDeliveryInfoChange(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async () => {
    if (pincode.length === 6) {
      console.log(`Checking pincode: ${pincode}`);
      setCheckedPincode(pincode);
      await checkPincodeDelivery(pincode);
    }
  };

  const handlePincodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPincode(numericValue);
    
    // Reset state if pincode changes
    if (numericValue !== checkedPincode) {
      setError(null);
      setDeliveryInfo(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pincode.length === 6) {
      handleCheck();
    }
  };

  // Show results only if we've checked a pincode
  const showResults = checkedPincode && (deliveryInfo || error);

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold">Check Delivery & Charges</h3>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Enter your pincode (6 digits)"
              value={pincode}
              onChange={(e) => handlePincodeChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="text-center font-mono"
              maxLength={6}
            />
          </div>
          <Button 
            onClick={handleCheck}
            disabled={pincode.length !== 6 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Checking...
              </>
            ) : (
              "Check"
            )}
          </Button>
        </div>

        {showResults && (
          <div className="pt-2 border-t">
            {error && (
              <div className="text-red-600 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Delivery not available for pincode {checkedPincode}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {error}
                  </div>
                </div>
              </div>
            )}
            
            {deliveryInfo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Delivery available {deliveryInfo.city && deliveryInfo.state ? `to ${deliveryInfo.city}, ${deliveryInfo.state}` : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="text-sm font-medium">Delivery Time</div>
                      <div className="text-xs text-gray-600">
                        {deliveryInfo.delivery_days_min === deliveryInfo.delivery_days_max 
                          ? `${deliveryInfo.delivery_days_min} days`
                          : `${deliveryInfo.delivery_days_min}-${deliveryInfo.delivery_days_max} days`
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">Delivery Charge</div>
                      <div className="text-xs text-gray-600">₹{deliveryInfo.delivery_charge}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-2 rounded text-xs text-blue-800">
                  <strong>{deliveryInfo.zone_name}</strong> - Zone {deliveryInfo.zone_number}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PincodeChecker;
