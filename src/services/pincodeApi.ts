
// Service for integrating with PostalPincode.in API
const POSTAL_PINCODE_API_BASE = "https://api.postalpincode.in"; // Changed to HTTPS

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
  try {
    const response = await fetch(`${POSTAL_PINCODE_API_BASE}/pincode/${pincode}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pincode details:', error);
    throw error;
  }
};

// Fetch pincodes by post office name
export const fetchPincodesByPostOffice = async (postOfficeName: string): Promise<PostalPincodeResponse> => {
  try {
    const response = await fetch(`${POSTAL_PINCODE_API_BASE}/postoffice/${encodeURIComponent(postOfficeName)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching pincodes by post office:', error);
    throw error;
  }
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

// Sample pincodes for different states to help with data fetching
const SAMPLE_PINCODES: { [key: string]: string[] } = {
  "Tamil Nadu": ["600001", "620001", "625001", "632001", "641001"],
  "Karnataka": ["560001", "570001", "580001", "590001"],
  "Maharashtra": ["400001", "411001", "440001", "421001"],
  "Delhi": ["110001", "110002", "110003", "110004"],
  "Uttar Pradesh": ["201301", "208001", "221001", "226001"],
  "Gujarat": ["380001", "390001", "395001"],
  "Rajasthan": ["302001", "313001", "324001"],
  "West Bengal": ["700001", "711001", "721001"],
  "Andhra Pradesh": ["500001", "530001", "515001"],
  "Telangana": ["500001", "506001", "507001"]
};

// Get districts for a specific state using sample pincodes
export const fetchDistrictsByState = async (stateName: string): Promise<string[]> => {
  const samplePincodes = SAMPLE_PINCODES[stateName] || [];
  const districts = new Set<string>();
  
  // Try to fetch data from a few sample pincodes to get district names
  for (const pincode of samplePincodes.slice(0, 3)) {
    try {
      const response = await fetchPincodeDetails(pincode);
      if (response.Status === "Success" && response.PostOffice) {
        response.PostOffice.forEach(office => {
          if (office.State.toLowerCase().includes(stateName.toLowerCase())) {
            districts.add(office.District);
          }
        });
      }
    } catch (error) {
      console.warn(`Failed to fetch districts for pincode ${pincode}:`, error);
    }
  }
  
  // If we couldn't get districts from API, return some common ones
  if (districts.size === 0) {
    const commonDistricts: { [key: string]: string[] } = {
      "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Vellore"],
      "Karnataka": ["Bengaluru", "Mysuru", "Hubli-Dharwad", "Mangalore", "Belagavi"],
      "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
      "Delhi": ["Central Delhi", "New Delhi", "South Delhi", "East Delhi"],
      "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"]
    };
    return commonDistricts[stateName] || [];
  }
  
  return Array.from(districts).sort();
};

// Fetch pincodes by state using sample pincodes to get real data
export const fetchPincodesByState = async (
  stateName: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ records: PincodeImportData[]; total: number; count: number; limit: number; offset: number }> => {
  const samplePincodes = SAMPLE_PINCODES[stateName] || [];
  const allRecords: PincodeImportData[] = [];
  
  console.log(`Fetching pincodes for state: ${stateName}`);
  
  // Use sample pincodes to get actual data from the API
  for (const pincode of samplePincodes) {
    try {
      const response = await fetchPincodeDetails(pincode);
      if (response.Status === "Success" && response.PostOffice) {
        const stateRecords = response.PostOffice
          .filter(office => office.State.toLowerCase().includes(stateName.toLowerCase()))
          .map(office => ({
            pincode: office.Pincode,
            state: office.State,
            city: office.District,
            district: office.District,
            office_name: office.Name
          }));
        allRecords.push(...stateRecords);
      }
    } catch (error) {
      console.warn(`Failed to fetch data for pincode ${pincode}:`, error);
    }
    
    // Add small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Remove duplicates
  const uniqueRecords = allRecords.filter((record, index, self) => 
    index === self.findIndex(r => r.pincode === record.pincode)
  );
  
  console.log(`Found ${uniqueRecords.length} unique pincodes for ${stateName}`);
  
  const paginatedRecords = uniqueRecords.slice(offset, offset + limit);
  
  return {
    records: paginatedRecords,
    total: uniqueRecords.length,
    count: paginatedRecords.length,
    limit,
    offset
  };
};

// Fetch pincodes by district using pincode lookup
export const fetchPincodesByDistrict = async (
  districtName: string,
  stateName?: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ records: PincodeImportData[]; total: number; count: number; limit: number; offset: number }> => {
  console.log(`Fetching pincodes for district: ${districtName}, state: ${stateName}`);
  
  // Try to find sample pincodes for the given state
  const statePincodes = stateName ? SAMPLE_PINCODES[stateName] || [] : [];
  let allRecords: PincodeImportData[] = [];
  
  if (statePincodes.length > 0) {
    // Use state's sample pincodes to find district data
    for (const pincode of statePincodes) {
      try {
        const response = await fetchPincodeDetails(pincode);
        if (response.Status === "Success" && response.PostOffice) {
          const districtRecords = response.PostOffice
            .filter(office => 
              office.District.toLowerCase().includes(districtName.toLowerCase()) ||
              office.Name.toLowerCase().includes(districtName.toLowerCase())
            )
            .map(office => ({
              pincode: office.Pincode,
              state: office.State,
              city: office.District,
              district: office.District,
              office_name: office.Name
            }));
          allRecords.push(...districtRecords);
        }
      } catch (error) {
        console.warn(`Failed to fetch data for pincode ${pincode}:`, error);
      }
      
      // Add small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  // Remove duplicates
  const uniqueRecords = allRecords.filter((record, index, self) => 
    index === self.findIndex(r => r.pincode === record.pincode)
  );
  
  console.log(`Found ${uniqueRecords.length} unique pincodes for district ${districtName}`);
  
  const paginatedRecords = uniqueRecords.slice(offset, offset + limit);
  
  return {
    records: paginatedRecords,
    total: uniqueRecords.length,
    count: paginatedRecords.length,
    limit,
    offset
  };
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
