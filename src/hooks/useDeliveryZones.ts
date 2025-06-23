
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchDeliveryZones, 
  upsertDeliveryZone, 
  deleteDeliveryZone
} from "@/services/deliveryApi";
import { toast } from "sonner";

// Type for the upsert input
interface DeliveryZoneInput {
  id?: string;
  zone_number: number;
  zone_name: string;
  delivery_days_min: number;
  delivery_days_max: number;
  delivery_charge: number;
  description?: string;
  is_active: boolean;
}

export const useDeliveryZones = () => {
  return useQuery({
    queryKey: ["delivery-zones"],
    queryFn: fetchDeliveryZones,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpsertDeliveryZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (zone: DeliveryZoneInput) => upsertDeliveryZone(zone),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
      toast.success(data.id ? "Delivery zone updated successfully!" : "Delivery zone created successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to save delivery zone: " + error.message);
    },
  });
};

export const useDeleteDeliveryZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDeliveryZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-zones"] });
      toast.success("Delivery zone deleted successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to delete delivery zone: " + error.message);
    },
  });
};
