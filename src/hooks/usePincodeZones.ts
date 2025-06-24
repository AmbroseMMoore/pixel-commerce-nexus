
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchPincodeZones, 
  bulkUploadPincodes, 
  deletePincodeZone,
  getDeliveryInfoByPincode 
} from "@/services/deliveryApi";
import { toast } from "sonner";

export const usePincodeZones = (options: {
  page?: number;
  pageSize?: number;
  zoneId?: string;
  search?: string;
} = {}) => {
  return useQuery({
    queryKey: ["pincode-zones", options],
    queryFn: () => fetchPincodeZones(options),
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

export const useBulkUploadPincodes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUploadPincodes,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pincode-zones"] });
      const count = Array.isArray(variables) ? variables.length : 1;
      console.log(`Successfully uploaded ${count} pincodes`);
    },
    onError: (error: any) => {
      console.error("Bulk upload failed:", error);
      // Don't show toast here as it's handled in the component
    },
  });
};

export const useDeletePincodeZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePincodeZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pincode-zones"] });
      console.log("Pincode deleted successfully");
    },
    onError: (error: any) => {
      console.error("Delete pincode failed:", error);
      // Don't show toast here as it's handled in the component
    },
  });
};
