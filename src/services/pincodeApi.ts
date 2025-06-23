
// Service for integrating with Data.gov.in pincode API
const DATA_GOV_API_BASE = "https://api.data.gov.in/resource/04cbe4b1-2f2b-4c39-a1d5-1c2e28bc0e32";

export interface DataGovPincode {
  pincode: string;
  officename: string;
  taluk: string;
  districtname: string;
  statename: string;
  telephone?: string;
  related_suboffice?: string;
  related_headoffice?: string;
  longitude?: string;
  latitude?: string;
}

export interface PincodeApiResponse {
  records: DataGovPincode[];
  total: number;
  count: number;
  limit: number;
  offset: number;
}

export interface PincodeImportData {
  pincode: string;
  state: string;
  city: string;
  district: string;
  office_name: string;
}

// Fetch pincodes by state
export const fetchPincodesByState = async (
  stateName: string,
  limit: number = 1000,
  offset: number = 0
): Promise<PincodeApiResponse> => {
  const params = new URLSearchParams({
    'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b', // Public API key from data.gov.in
    'format': 'json',
    'limit': limit.toString(),
    'offset': offset.toString(),
    'filters[statename]': stateName
  });

  const response = await fetch(`${DATA_GOV_API_BASE}?${params}`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

// Fetch pincodes by district
export const fetchPincodesByDistrict = async (
  districtName: string,
  stateName?: string,
  limit: number = 1000,
  offset: number = 0
): Promise<PincodeApiResponse> => {
  const params = new URLSearchParams({
    'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
    'format': 'json',
    'limit': limit.toString(),
    'offset': offset.toString(),
    'filters[districtname]': districtName
  });

  if (stateName) {
    params.append('filters[statename]', stateName);
  }

  const response = await fetch(`${DATA_GOV_API_BASE}?${params}`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

// Get unique states from API
export const fetchStates = async (): Promise<string[]> => {
  const params = new URLSearchParams({
    'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
    'format': 'json',
    'limit': '5000'
  });

  const response = await fetch(`${DATA_GOV_API_BASE}?${params}`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data: PincodeApiResponse = await response.json();
  const states = [...new Set(data.records.map(record => record.statename))];
  return states.sort();
};

// Get districts for a specific state
export const fetchDistrictsByState = async (stateName: string): Promise<string[]> => {
  const params = new URLSearchParams({
    'api-key': '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
    'format': 'json',
    'limit': '5000',
    'filters[statename]': stateName
  });

  const response = await fetch(`${DATA_GOV_API_BASE}?${params}`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data: PincodeApiResponse = await response.json();
  const districts = [...new Set(data.records.map(record => record.districtname))];
  return districts.sort();
};

// Transform API data to our format
export const transformPincodeData = (apiData: DataGovPincode[]): PincodeImportData[] => {
  return apiData.map(record => ({
    pincode: record.pincode,
    state: record.statename,
    city: record.districtname, // Using district as city for now
    district: record.districtname,
    office_name: record.officename
  }));
};
