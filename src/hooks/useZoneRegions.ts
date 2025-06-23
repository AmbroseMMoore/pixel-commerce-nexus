
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchZoneRegions, 
  fetchZoneRegionsByZone,
  addZoneRegion,
  removeZoneRegion,
  getDeliveryInfoByPincodeRegion
} from "@/services/zoneRegionsApi";
import { toast } from "sonner";

export const useZoneRegions = () => {
  return useQuery({
    queryKey: ["zone-regions"],
    queryFn: fetchZoneRegions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useZoneRegionsByZone = (zoneId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["zone-regions", zoneId],
    queryFn: () => fetchZoneRegionsByZone(zoneId),
    enabled: !!zoneId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDeliveryInfoByPincodeRegion = (pincode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["delivery-info-region", pincode],
    queryFn: () => getDeliveryInfoByPincodeRegion(pincode),
    enabled: !!pincode && enabled && /^\d{6}$/.test(pincode),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useAddZoneRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addZoneRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zone-regions"] });
      toast.success("Region added to zone successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to add region: " + error.message);
    },
  });
};

export const useRemoveZoneRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeZoneRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zone-regions"] });
      toast.success("Region removed from zone successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to remove region: " + error.message);
    },
  });
};
