
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Upload, Trash2, Plus } from "lucide-react";
import { usePincodeZones, useBulkUploadPincodes, useDeletePincodeZone } from "@/hooks/usePincodeZones";
import { useDeliveryZones } from "@/hooks/useDeliveryZones";
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

const PincodeZonesManager = () => {
  const [search, setSearch] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [page, setPage] = useState(1);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [bulkPincodes, setBulkPincodes] = useState("");

  const { data: zonesData } = useDeliveryZones();
  const zones = zonesData || [];
  
  const { data: pincodeData, isLoading } = usePincodeZones({
    page,
    pageSize: 50,
    zoneId: selectedZone || undefined,
    search: search || undefined
  });

  const bulkUpload = useBulkUploadPincodes();
  const deletePincode = useDeletePincodeZone();

  const pincodeZones = pincodeData?.pincodeZones || [];
  const totalCount = pincodeData?.totalCount || 0;

  const handleBulkUpload = async () => {
    if (!bulkPincodes.trim() || !selectedZone) return;

    const lines = bulkPincodes.trim().split('\n');
    const pincodes = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        pincode: parts[0],
        delivery_zone_id: selectedZone,
        state: parts[1] || undefined,
        city: parts[2] || undefined
      };
    }).filter(p => p.pincode);

    await bulkUpload.mutateAsync(pincodes);
    setIsUploadDialogOpen(false);
    setBulkPincodes("");
  };

  if (isLoading) {
    return <div>Loading pincodes...</div>;
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
            <SelectTrigger>
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Zones</SelectItem>
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
                <Label htmlFor="upload-zone">Select Delivery Zone</Label>
                <Select value={selectedZone} onValueChange={setSelectedZone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        Zone {zone.zone_number} - {zone.zone_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="bulk-pincodes">Pincodes (CSV Format)</Label>
                <textarea
                  id="bulk-pincodes"
                  className="w-full h-40 p-3 border rounded-md"
                  placeholder="Enter pincodes in CSV format:&#10;632001,Tamil Nadu,Vellore&#10;632002,Tamil Nadu,Vellore&#10;600001,Tamil Nadu,Chennai"
                  value={bulkPincodes}
                  onChange={(e) => setBulkPincodes(e.target.value)}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: pincode,state,city (one per line)
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkUpload} 
                  disabled={!bulkPincodes.trim() || !selectedZone || bulkUpload.isPending}
                >
                  {bulkUpload.isPending ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="text-sm text-gray-600">
        Showing {pincodeZones.length} of {totalCount} pincodes
      </div>

      <div className="grid gap-2">
        {pincodeZones.map((pincodeZone) => (
          <div key={pincodeZone.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-4">
              <div className="font-mono font-medium">{pincodeZone.pincode}</div>
              <div className="text-sm text-gray-600">
                {pincodeZone.city && `${pincodeZone.city}, `}{pincodeZone.state}
              </div>
              {pincodeZone.delivery_zone && (
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Zone {pincodeZone.delivery_zone.zone_number}
                </div>
              )}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Pincode</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete pincode "{pincodeZone.pincode}"?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deletePincode.mutate(pincodeZone.id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      {totalCount > 50 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
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
