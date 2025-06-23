
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Truck, Clock, CheckCircle } from "lucide-react";
import { useDeliveryInfoByPincode } from "@/hooks/usePincodeZones";

interface PincodeCheckerProps {
  onDeliveryInfoChange?: (deliveryInfo: any) => void;
}

const PincodeChecker: React.FC<PincodeCheckerProps> = ({ onDeliveryInfoChange }) => {
  const [pincode, setPincode] = useState("");
  const [checkedPincode, setCheckedPincode] = useState("");
  
  const { data: deliveryInfo, isLoading, error } = useDeliveryInfoByPincode(
    checkedPincode, 
    !!checkedPincode
  );

  const handleCheck = () => {
    if (pincode.length === 6) {
      setCheckedPincode(pincode);
    }
  };

  const handlePincodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setPincode(numericValue);
  };

  React.useEffect(() => {
    if (deliveryInfo && onDeliveryInfoChange) {
      onDeliveryInfoChange(deliveryInfo);
    }
  }, [deliveryInfo, onDeliveryInfoChange]);

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
              className="text-center font-mono"
              maxLength={6}
            />
          </div>
          <Button 
            onClick={handleCheck}
            disabled={pincode.length !== 6 || isLoading}
          >
            {isLoading ? "Checking..." : "Check"}
          </Button>
        </div>

        {checkedPincode && (
          <div className="pt-2 border-t">
            {error && (
              <div className="text-red-600 text-sm flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery not available for pincode {checkedPincode}
              </div>
            )}
            
            {deliveryInfo && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Delivery available to {deliveryInfo.city}, {deliveryInfo.state}
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
