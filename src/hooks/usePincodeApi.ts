
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStates,
  fetchDistrictsByState,
  fetchPincodesByState,
  fetchPincodesByDistrict,
  transformPincodeData,
  fetchPincodeDetails,
  type PincodeImportData
} from "@/services/pincodeApi";

export const useStates = () => {
  return useQuery({
    queryKey: ["api-states"],
    queryFn: fetchStates,
    staleTime: 60 * 60 * 1000, // 1 hour (static data)
    retry: 2,
  });
};

export const useDistrictsByState = (stateName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["api-districts", stateName],
    queryFn: () => fetchDistrictsByState(stateName),
    enabled: !!stateName && enabled,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

export const usePincodeDetails = (pincode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["pincode-details", pincode],
    queryFn: () => fetchPincodeDetails(pincode),
    enabled: !!pincode && enabled && /^\d{6}$/.test(pincode),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const usePincodeImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState<PincodeImportData[]>([]);
  const [importProgress, setImportProgress] = useState(0);

  const fetchPincodesByRegion = async (
    type: 'state' | 'district',
    regionName: string,
    stateName?: string
  ): Promise<PincodeImportData[]> => {
    setIsImporting(true);
    setImportProgress(0);

    try {
      let allRecords: PincodeImportData[] = [];
      let offset = 0;
      const limit = 100; // Smaller batches for the new API
      let hasMore = true;

      while (hasMore) {
        const response = type === 'state' 
          ? await fetchPincodesByState(regionName, limit, offset)
          : await fetchPincodesByDistrict(regionName, stateName, limit, offset);

        allRecords = [...allRecords, ...response.records];
        
        setImportProgress(Math.min((allRecords.length / Math.max(response.total, 1)) * 100, 100));

        hasMore = response.records.length === limit && allRecords.length < response.total;
        offset += limit;

        // Add delay to be respectful to the API
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Remove duplicates
      const uniqueRecords = allRecords.filter((record, index, self) => 
        index === self.findIndex(r => r.pincode === record.pincode)
      );

      setImportData(uniqueRecords);
      return uniqueRecords;
    } catch (error) {
      console.error("Failed to fetch pincode data:", error);
      throw error;
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  const clearImportData = () => {
    setImportData([]);
    setImportProgress(0);
  };

  return {
    isImporting,
    importData,
    importProgress,
    fetchPincodesByRegion,
    clearImportData
  };
};
