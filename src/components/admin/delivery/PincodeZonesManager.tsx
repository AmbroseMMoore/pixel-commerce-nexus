
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Upload, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { usePincodeZones, useBulkUploadPincodes, useDeletePincodeZone } from "@/hooks/usePincodeZones";
import { useDeliveryZones } from "@/hooks/useDeliveryZones";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ALL_ZONES_VALUE = "ALL_ZONES";

const PincodeZonesManager = () => {
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>(ALL_ZONES_VALUE);
  const [page, setPage] = useState(1);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [bulkPincodes, setBulkPincodes] = useState("");
  const [uploadZoneId, setUploadZoneId] = useState<string>("");
  const [isValidating, setIsValidating] = useState(false);

  const { data: zonesData } = useDeliveryZones();
  const zones = zonesData || [];
  
  const { data: pincodeData, isLoading, error } = usePincodeZones({
    page,
    pageSize: 50,
    zoneId: selectedZone === ALL_ZONES_VALUE ? undefined : selectedZone,
    search: search || undefined
  });

  const bulkUpload = useBulkUploadPincodes();
  const deletePincode = useDeletePincodeZone();

  const pincodeZones = pincodeData?.pincodeZones || [];
  const totalCount = pincodeData?.totalCount || 0;

  // Validate pincode format (6 digits for Indian pincodes)
  const validatePincode = (pincode: string): boolean => {
    return /^\d{6}$/.test(pincode.trim());
  };

  // Parse and validate bulk upload data
  const parseBulkData = useCallback((text: string) => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const parsed = [];
    const errors = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',').map(p => p.trim());
      
      if (parts.length < 1) {
        errors.push(`Line ${i + 1}: Empty line`);
        continue;
      }

      const pincode = parts[0];
      if (!validatePincode(pincode)) {
        errors.push(`Line ${i + 1}: Invalid pincode format "${pincode}". Must be 6 digits.`);
        continue;
      }

      parsed.push({
        pincode,
        delivery_zone_id: uploadZoneId,
        state: parts[1] || undefined,
        city: parts[2] || undefined
      });
    }

    return { parsed, errors };
  }, [uploadZoneId]);

  // Debounced search
  const debouncedSearch = useMemo(() => {
    const timer = setTimeout(() => {
      // Search logic is handled by the query
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleBulkUpload = async () => {
    if (!bulkPincodes.trim() || !uploadZoneId) {
      toast.error("Please select a zone and enter pincode data");
      return;
    }

    setIsValidating(true);
    
    try {
      const { parsed, errors } = parseBulkData(bulkPincodes);

      if (errors.length > 0) {
        toast.error(`Validation errors found:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n...and ${errors.length - 5} more` : ''}`);
        setIsValidating(false);
        return;
      }

      if (parsed.length === 0) {
        toast.error("No valid pincodes found to upload");
        setIsValidating(false);
        return;
      }

      await bulkUpload.mutateAsync(parsed);
      setIsUploadDialogOpen(false);
      setBulkPincodes("");
      setUploadZoneId("");
      toast.success(`Successfully uploaded ${parsed.length} pincodes`);
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeletePincode = async (id: string, pincode: string) => {
    try {
      await deletePincode.mutateAsync(id);
      toast.success(`Pincode ${pincode} deleted successfully`);
    } catch (error: any) {
      toast.error(`Failed to delete pincode: ${error.message}`);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 border border-red-200 rounded-lg bg-red-50">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <div>
          <p className="font-medium text-red-800">Error loading pincode data</p>
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading pincodes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Label htmlFor="search">Search Pincodes</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              placeholder="Search by pincode, city, or state"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-48">
          <Label htmlFor="zone-filter">Filter by Zone</Label>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value={ALL_ZONES_VALUE}>All Zones</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  Zone {zone.zone_number} - {zone.zone_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Bulk Upload Pincodes</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="upload-zone">Select Delivery Zone *</Label>
                <Select value={uploadZoneId} onValueChange={setUploadZoneId}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border shadow-lg z-50">
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        Zone {zone.zone_number} - {zone.zone_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bulk-pincodes">Pincodes (CSV Format) *</Label>
                <textarea
                  id="bulk-pincodes"
                  className="w-full h-40 p-3 border rounded-md resize-none"
                  placeholder="Enter pincodes in CSV format:&#10;632001,Tamil Nadu,Vellore&#10;632002,Tamil Nadu,Vellore&#10;600001,Tamil Nadu,Chennai"
                  value={bulkPincodes}
                  onChange={(e) => setBulkPincodes(e.target.value)}
                />
                <div className="text-sm text-gray-500 mt-1 space-y-1">
                  <p>Format: pincode,state,city (one per line)</p>
                  <p>• Pincode must be exactly 6 digits</p>
                  <p>• State and city are optional</p>
                  <p>• Lines with errors will be skipped</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsUploadDialogOpen(false)}
                  disabled={isValidating || bulkUpload.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkUpload} 
                  disabled={!bulkPincodes.trim() || !uploadZoneId || isValidating || bulkUpload.isPending}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Validating...
                    </>
                  ) : bulkUpload.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-sm text-gray-600">
        Showing {pincodeZones.length} of {totalCount} pincodes
        {selectedZone !== ALL_ZONES_VALUE && (
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            Filtered by {zones.find(z => z.id === selectedZone)?.zone_name}
          </span>
        )}
      </div>

      <div className="grid gap-2">
        {pincodeZones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search || selectedZone !== ALL_ZONES_VALUE ? (
              <div>
                <p>No pincodes found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    setSearch("");
                    setSelectedZone(ALL_ZONES_VALUE);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <p>No pincodes have been added yet. Use the bulk upload feature to add pincodes.</p>
            )}
          </div>
        ) : (
          pincodeZones.map((pincodeZone) => (
            <div key={pincodeZone.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="font-mono font-medium text-lg">{pincodeZone.pincode}</div>
                <div className="text-sm text-gray-600">
                  {pincodeZone.city && `${pincodeZone.city}, `}{pincodeZone.state}
                </div>
                {pincodeZone.delivery_zone && (
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    Zone {pincodeZone.delivery_zone.zone_number} - {pincodeZone.delivery_zone.zone_name}
                  </div>
                )}
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={deletePincode.isPending}
                  >
                    {deletePincode.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Pincode</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete pincode "{pincodeZone.pincode}"? 
                      This will remove delivery zone mapping for this area.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeletePincode(pincodeZone.id, pincodeZone.pincode)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}
      </div>

      {totalCount > 50 && (
        <div className="flex justify-center gap-2 items-center">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {Math.ceil(totalCount / 50)}
          </span>
          <Button
            variant="outline"
            disabled={page >= Math.ceil(totalCount / 50)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default PincodeZonesManager;
