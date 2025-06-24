
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Truck, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { getDeliveryInfoByPincode } from "@/services/deliveryApi";

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
      
      const result = await getDeliveryInfoByPincode(pincodeToCheck);
      
      if (result) {
        console.log('Delivery info found:', result);
        setDeliveryInfo(result);
        
        if (onDeliveryInfoChange) {
          onDeliveryInfoChange(result);
        }
      } else {
        throw new Error('Delivery not available for this pincode');
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
