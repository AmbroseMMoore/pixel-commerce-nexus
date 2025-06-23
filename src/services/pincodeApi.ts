
// Service for integrating with PostalPincode.in API
const POSTAL_PINCODE_API_BASE = "http://www.postalpincode.in/api";

export interface PostalPincodeResponse {
  Message: string;
  Status: string;
  PostOffice: PostOfficeInfo[] | null;
}

export interface PostOfficeInfo {
  Name: string;
  Description?: string;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  State: string;
  Country: string;
  Pincode: string;
}

export interface PincodeImportData {
  pincode: string;
  state: string;
  city: string;
  district: string;
  office_name: string;
}

// Fetch pincode details by pincode
export const fetchPincodeDetails = async (pincode: string): Promise<PostalPincodeResponse> => {
  const response = await fetch(`${POSTAL_PINCODE_API_BASE}/pincode/${pincode}`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

// Fetch pincodes by post office name
export const fetchPincodesByPostOffice = async (postOfficeName: string): Promise<PostalPincodeResponse> => {
  const response = await fetch(`${POSTAL_PINCODE_API_BASE}/postoffice/${encodeURIComponent(postOfficeName)}`);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};

// Get unique states (we'll need to build this from known data or use a predefined list)
export const fetchStates = async (): Promise<string[]> => {
  // Indian states list - since the API doesn't provide a states endpoint
  const indianStates = [
    "Andhra Pradesh",
    "Arunachal Pradesh", 
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
  ];
  
  return indianStates.sort();
};

// Get districts for a specific state (we'll use sample pincodes to find districts)
export const fetchDistrictsByState = async (stateName: string): Promise<string[]> => {
  // This is a limitation of the PostalPincode.in API - it doesn't have a direct districts endpoint
  // We'll return some common districts as an example, but in a real implementation,
  // you might want to maintain a static list or use a different approach
  
  const sampleDistricts: { [key: string]: string[] } = {
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Thanjavur", "Dindigul"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubli-Dharwad", "mangalore", "Belagavi", "Gulbarga", "Davanagere", "Bellary", "Bijapur", "Shimoga"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Sangli", "Jalgaon"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Allahabad", "Bareilly", "Aligarh", "Moradabad"]
  };
  
  return sampleDistricts[stateName] || [];
};

// Fetch pincodes by state using sample major cities
export const fetchPincodesByState = async (
  stateName: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ records: PincodeImportData[]; total: number; count: number; limit: number; offset: number }> => {
  // Since PostalPincode.in doesn't have a direct state search, 
  // we'll use major cities from that state to get sample pincodes
  const districts = await fetchDistrictsByState(stateName);
  const allRecords: PincodeImportData[] = [];
  
  // Get pincodes for first few districts (to avoid too many API calls)
  const districtsToQuery = districts.slice(0, 3);
  
  for (const district of districtsToQuery) {
    try {
      const response = await fetchPincodesByPostOffice(district);
      if (response.Status === "Success" && response.PostOffice) {
        const records = transformPincodeData(response.PostOffice);
        allRecords.push(...records);
      }
    } catch (error) {
      console.warn(`Failed to fetch data for ${district}:`, error);
    }
  }
  
  // Remove duplicates
  const uniqueRecords = allRecords.filter((record, index, self) => 
    index === self.findIndex(r => r.pincode === record.pincode)
  );
  
  const paginatedRecords = uniqueRecords.slice(offset, offset + limit);
  
  return {
    records: paginatedRecords,
    total: uniqueRecords.length,
    count: paginatedRecords.length,
    limit,
    offset
  };
};

// Fetch pincodes by district
export const fetchPincodesByDistrict = async (
  districtName: string,
  stateName?: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ records: PincodeImportData[]; total: number; count: number; limit: number; offset: number }> => {
  try {
    const response = await fetchPincodesByPostOffice(districtName);
    
    if (response.Status !== "Success" || !response.PostOffice) {
      return { records: [], total: 0, count: 0, limit, offset };
    }
    
    let records = transformPincodeData(response.PostOffice);
    
    // Filter by state if provided
    if (stateName) {
      records = records.filter(record => 
        record.state.toLowerCase().includes(stateName.toLowerCase())
      );
    }
    
    const paginatedRecords = records.slice(offset, offset + limit);
    
    return {
      records: paginatedRecords,
      total: records.length,
      count: paginatedRecords.length,
      limit,
      offset
    };
  } catch (error) {
    console.error(`Failed to fetch pincodes for ${districtName}:`, error);
    return { records: [], total: 0, count: 0, limit, offset };
  }
};

// Transform API data to our format
export const transformPincodeData = (postOffices: PostOfficeInfo[]): PincodeImportData[] => {
  return postOffices.map(office => ({
    pincode: office.Pincode,
    state: office.State,
    city: office.District,
    district: office.District,
    office_name: office.Name
  }));
};
