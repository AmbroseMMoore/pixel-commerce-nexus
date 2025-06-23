
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchStates,
  fetchDistrictsByState,
  fetchPincodesByState,
  fetchPincodesByDistrict,
  transformPincodeData,
  type PincodeImportData
} from "@/services/pincodeApi";

export const useStates = () => {
  return useQuery({
    queryKey: ["api-states"],
    queryFn: fetchStates,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

export const useDistrictsByState = (stateName: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["api-districts", stateName],
    queryFn: () => fetchDistrictsByState(stateName),
    enabled: !!stateName && enabled,
    staleTime: 10 * 60 * 1000,
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
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const response = type === 'state' 
          ? await fetchPincodesByState(regionName, limit, offset)
          : await fetchPincodesByDistrict(regionName, stateName, limit, offset);

        const transformedData = transformPincodeData(response.records);
        allRecords = [...allRecords, ...transformedData];

        setImportProgress(Math.min((allRecords.length / response.total) * 100, 100));

        hasMore = response.records.length === limit && allRecords.length < response.total;
        offset += limit;

        // Add small delay to prevent rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100));
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
