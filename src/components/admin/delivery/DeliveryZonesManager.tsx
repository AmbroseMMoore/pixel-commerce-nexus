
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useDeliveryZones, useUpsertDeliveryZone, useDeleteDeliveryZone } from "@/hooks/useDeliveryZones";
import { DeliveryZone } from "@/services/deliveryApi";
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

// Type for editing zone form
interface EditingZone {
  id?: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  description?: string;
  is_active: boolean;
}

const DeliveryZonesManager = () => {
  const { data: zones = [], isLoading } = useDeliveryZones();
  const upsertZone = useUpsertDeliveryZone();
  const deleteZone = useDeleteDeliveryZone();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<EditingZone | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;

    await upsertZone.mutateAsync(editingZone);
    setIsDialogOpen(false);
    setEditingZone(null);
  };

  const handleEdit = (zone: DeliveryZone) => {
    setEditingZone({
      id: zone.id,
      zone_number: zone.zone_number,
      zone_name: zone.zone_name,
      delivery_days_min: zone.delivery_days_min,
      delivery_days_max: zone.delivery_days_max,
      delivery_charge: zone.delivery_charge,
      description: zone.description || '',
      is_active: zone.is_active
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingZone({
      zone_number: Math.max(...zones.map(z => z.zone_number), 0) + 1,
      zone_name: '',
      delivery_days_min: 1,
      delivery_days_max: 1,
      delivery_charge: 0,
      description: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteZone.mutateAsync(id);
  };

  if (isLoading) {
    return <div>Loading zones...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Delivery Zones ({zones.length})</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingZone?.id ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zone_number">Zone Number</Label>
                  <Input
                    id="zone_number"
                    type="number"
                    value={editingZone?.zone_number || ''}
                    onChange={(e) => setEditingZone(prev => prev ? ({ ...prev, zone_number: parseInt(e.target.value) || 0 }) : null)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_charge">Delivery Charge (₹)</Label>
                  <Input
                    id="delivery_charge"
                    type="number"
                    step="0.01"
                    value={editingZone?.delivery_charge || ''}
                    onChange={(e) => setEditingZone(prev => prev ? ({ ...prev, delivery_charge: parseFloat(e.target.value) || 0 }) : null)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="zone_name">Zone Name</Label>
                <Input
                  id="zone_name"
                  value={editingZone?.zone_name || ''}
                  onChange={(e) => setEditingZone(prev => prev ? ({ ...prev, zone_name: e.target.value }) : null)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery_days_min">Min Days</Label>
                  <Input
                    id="delivery_days_min"
                    type="number"
                    value={editingZone?.delivery_days_min || ''}
                    onChange={(e) => setEditingZone(prev => prev ? ({ ...prev, delivery_days_min: parseInt(e.target.value) || 0 }) : null)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="delivery_days_max">Max Days</Label>
                  <Input
                    id="delivery_days_max"
                    type="number"
                    value={editingZone?.delivery_days_max || ''}
                    onChange={(e) => setEditingZone(prev => prev ? ({ ...prev, delivery_days_max: parseInt(e.target.value) || 0 }) : null)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingZone?.description || ''}
                  onChange={(e) => setEditingZone(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={editingZone?.is_active ?? true}
                  onCheckedChange={(checked) => setEditingZone(prev => prev ? ({ ...prev, is_active: checked }) : null)}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={upsertZone.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {upsertZone.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {zones.map((zone) => (
          <div key={zone.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                  Zone {zone.zone_number}
                </div>
                <div>
                  <h4 className="font-medium">{zone.zone_name}</h4>
                  <p className="text-sm text-gray-500">
                    {zone.delivery_days_min === zone.delivery_days_max 
                      ? `${zone.delivery_days_min} days`
                      : `${zone.delivery_days_min}-${zone.delivery_days_max} days`
                    } • ₹{zone.delivery_charge}
                  </p>
                </div>
              </div>
              {zone.description && (
                <p className="text-sm text-gray-600 mt-2">{zone.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded text-xs ${zone.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {zone.is_active ? 'Active' : 'Inactive'}
              </div>
              <Button variant="outline" size="sm" onClick={() => handleEdit(zone)}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Delivery Zone</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete zone "{zone.zone_name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(zone.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliveryZonesManager;
