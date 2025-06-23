
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
  });
};

export const useDeliveryInfoByPincode = (pincode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["delivery-info", pincode],
    queryFn: () => getDeliveryInfoByPincode(pincode),
    enabled: !!pincode && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useBulkUploadPincodes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUploadPincodes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pincode-zones"] });
      toast.success("Pincodes uploaded successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to upload pincodes: " + error.message);
    },
  });
};

export const useDeletePincodeZone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePincodeZone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pincode-zones"] });
      toast.success("Pincode deleted successfully!");
    },
    onError: (error: any) => {
      toast.error("Failed to delete pincode: " + error.message);
    },
  });
};
