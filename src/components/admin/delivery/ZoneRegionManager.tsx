
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, MapPin, Globe } from "lucide-react";
import { useZoneRegionsByZone, useAddZoneRegion, useRemoveZoneRegion } from "@/hooks/useZoneRegions";
import { useStates } from "@/hooks/usePincodeApi";
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

interface ZoneRegionManagerProps {
  zoneId: string;
  zoneName: string;
  zoneNumber: number;
}

const ZoneRegionManager: React.FC<ZoneRegionManagerProps> = ({
  zoneId,
  zoneName,
  zoneNumber
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [regionType, setRegionType] = useState<'state' | 'district'>('state');

  const { data: regions = [], isLoading } = useZoneRegionsByZone(zoneId);
  const { data: states = [] } = useStates();
  const addRegion = useAddZoneRegion();
  const removeRegion = useRemoveZoneRegion();

  const handleAddRegion = async () => {
    if (!selectedState) return;

    await addRegion.mutateAsync({
      delivery_zone_id: zoneId,
      state_name: regionType === 'district' ? `${selectedState} - ${districtName}` : selectedState,
      district_name: regionType === 'district' ? districtName : undefined,
      region_type: regionType
    });

    setSelectedState("");
    setDistrictName("");
    setIsDialogOpen(false);
  };

  const handleRemoveRegion = async (regionId: string) => {
    await removeRegion.mutateAsync(regionId);
  };

  if (isLoading) {
    return <div>Loading regions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Zone {zoneNumber} - {zoneName} Regions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {regions.length} regions assigned to this zone
          </p>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Region
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Region to Zone {zoneNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="region-type">Region Type</Label>
                  <Select value={regionType} onValueChange={(value: 'state' | 'district') => setRegionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="state">Entire State</SelectItem>
                      <SelectItem value="district">Specific District</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {regionType === 'district' && (
                  <div>
                    <Label htmlFor="district">District Name</Label>
                    <Input
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      placeholder="Enter district name"
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddRegion}
                    disabled={!selectedState || (regionType === 'district' && !districtName) || addRegion.isPending}
                  >
                    {addRegion.isPending ? 'Adding...' : 'Add Region'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-2">
          {regions.map((region) => (
            <div key={region.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant={region.region_type === 'state' ? 'default' : 'secondary'}>
                  {region.region_type === 'state' ? <Globe className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                  {region.region_type}
                </Badge>
                <span className="font-medium">{region.state_name}</span>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Region</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove "{region.state_name}" from this zone?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRemoveRegion(region.id)}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
          
          {regions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No regions assigned to this zone</p>
              <p className="text-sm">Click "Add Region" to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ZoneRegionManager;
