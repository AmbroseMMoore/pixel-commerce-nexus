
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Loader2, 
  MapPin, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Upload
} from "lucide-react";
import { useStates, useDistrictsByState, usePincodeImport } from "@/hooks/usePincodeApi";
import { useDeliveryZones } from "@/hooks/useDeliveryZones";
import { useBulkUploadPincodes } from "@/hooks/usePincodeZones";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const PincodeApiImport = () => {
  const [importType, setImportType] = useState<'state' | 'district'>('state');
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const { data: states, isLoading: statesLoading } = useStates();
  const { data: districts, isLoading: districtsLoading } = useDistrictsByState(
    selectedState, 
    !!selectedState && importType === 'district'
  );
  const { data: zones } = useDeliveryZones();
  
  const {
    isImporting,
    importData,
    importProgress,
    fetchPincodesByRegion,
    clearImportData
  } = usePincodeImport();

  const bulkUpload = useBulkUploadPincodes();

  const handleFetchData = async () => {
    if (!selectedState || (importType === 'district' && !selectedDistrict)) {
      toast.error("Please select all required fields");
      return;
    }

    try {
      const regionName = importType === 'state' ? selectedState : selectedDistrict;
      await fetchPincodesByRegion(importType, regionName, selectedState);
      toast.success(`Fetched ${importData.length} pincodes successfully`);
      setShowPreview(true);
    } catch (error: any) {
      toast.error(`Failed to fetch data: ${error.message}`);
    }
  };

  const handleImport = async () => {
    if (!selectedZone || importData.length === 0) {
      toast.error("Please select a delivery zone and ensure data is loaded");
      return;
    }

    try {
      const formattedData = importData.map(item => ({
        pincode: item.pincode,
        delivery_zone_id: selectedZone,
        state: item.state,
        city: item.city
      }));

      await bulkUpload.mutateAsync(formattedData);
      toast.success(`Successfully imported ${formattedData.length} pincodes`);
      clearImportData();
      setShowPreview(false);
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    }
  };

  const resetForm = () => {
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedZone("");
    clearImportData();
    setShowPreview(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Import Pincodes from Data.gov.in API
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="import-type">Import Type</Label>
            <Select value={importType} onValueChange={(value: 'state' | 'district') => setImportType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select import type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="state">By State</SelectItem>
                <SelectItem value="district">By District</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="state">State *</Label>
            <Select value={selectedState} onValueChange={setSelectedState} disabled={statesLoading}>
              <SelectTrigger>
                <SelectValue placeholder={statesLoading ? "Loading..." : "Select state"} />
              </SelectTrigger>
              <SelectContent>
                {states?.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {importType === 'district' && (
            <div>
              <Label htmlFor="district">District *</Label>
              <Select 
                value={selectedDistrict} 
                onValueChange={setSelectedDistrict} 
                disabled={districtsLoading || !selectedState}
              >
                <SelectTrigger>
                  <SelectValue placeholder={districtsLoading ? "Loading..." : "Select district"} />
                </SelectTrigger>
                <SelectContent>
                  {districts?.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="zone">Delivery Zone *</Label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger>
                <SelectValue placeholder="Select delivery zone" />
              </SelectTrigger>
              <SelectContent>
                {zones?.map((zone) => (
                  <SelectItem key={zone.id} value={zone.id}>
                    Zone {zone.zone_number} - {zone.zone_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isImporting && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Fetching pincode data...</span>
            </div>
            <Progress value={importProgress} className="w-full" />
            <p className="text-xs text-gray-500">{Math.round(importProgress)}% complete</p>
          </div>
        )}

        {importData.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">
                  {importData.length} pincodes ready for import
                </span>
              </div>
              
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Preview Import Data ({importData.length} records)</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-2">
                      {importData.slice(0, 100).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline">{item.pincode}</Badge>
                            <span>{item.city}, {item.state}</span>
                          </div>
                          <span className="text-xs text-gray-500">{item.office_name}</span>
                        </div>
                      ))}
                      {importData.length > 100 && (
                        <p className="text-center text-sm text-gray-500 py-2">
                          ... and {importData.length - 100} more records
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Before importing:</p>
                  <ul className="text-yellow-700 mt-1 space-y-1">
                    <li>• Existing pincodes will be updated with new zone assignment</li>
                    <li>• This operation cannot be undone</li>
                    <li>• Large imports may take a few minutes to complete</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleFetchData}
            disabled={
              !selectedState || 
              (importType === 'district' && !selectedDistrict) || 
              isImporting
            }
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Fetching...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Fetch Data
              </>
            )}
          </Button>

          {importData.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={!selectedZone || bulkUpload.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkUpload.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {importData.length} Pincodes
                </>
              )}
            </Button>
          )}

          <Button variant="outline" onClick={resetForm}>
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PincodeApiImport;
