import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchZoneRegions, 
  bulkUploadZoneRegions, 
  deleteZoneRegion,
  getDeliveryInfoByPincode 
} from "@/services/deliveryApi";
import { toast } from "sonner";

// Rename to useZoneRegions to better reflect functionality
export const useZoneRegions = (options: {
  page?: number;
  pageSize?: number;
  zoneId?: string;
  search?: string;
} = {}) => {
  return useQuery({
    queryKey: ["zone-regions", options],
    queryFn: () => fetchZoneRegions(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on client errors (4xx)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Keep backward compatibility
export const usePincodeZones = useZoneRegions;

export const useDeliveryInfoByPincode = (pincode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["delivery-info", pincode],
    queryFn: () => getDeliveryInfoByPincode(pincode),
    enabled: !!pincode && enabled && /^\d{6}$/.test(pincode), // Only run for valid 6-digit pincodes
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

export const useBulkUploadZoneRegions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUploadZoneRegions,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["zone-regions"] });
      const count = Array.isArray(variables) ? variables.length : 1;
      console.log(`Successfully uploaded ${count} zone regions`);
    },
    onError: (error: any) => {
      console.error("Bulk upload failed:", error);
      // Don't show toast here as it's handled in the component
    },
  });
};

// Keep backward compatibility
export const useBulkUploadPincodes = useBulkUploadZoneRegions;

export const useDeleteZoneRegion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteZoneRegion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zone-regions"] });
      console.log("Zone region deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete zone region failed:", error);
      // Don't show toast here as it's handled in the component
    },
  });
};

// Keep backward compatibility
export const useDeletePincodeZone = useDeleteZoneRegion;
