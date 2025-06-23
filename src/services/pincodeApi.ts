
// Service for integrating with PostalPincode.in API
const POSTAL_PINCODE_API_BASE = "https://api.postalpincode.in";

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

// Fetch pincode details by pincode with improved error handling
export const fetchPincodeDetails = async (pincode: string): Promise<PostalPincodeResponse> => {
  try {
    console.log(`Fetching details for pincode: ${pincode}`);
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${POSTAL_PINCODE_API_BASE}/pincode/${pincode}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`API request failed: ${response.status} ${response.statusText}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // Validate response structure
    if (!data || typeof data.Status !== 'string') {
      throw new Error('Invalid API response structure');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching pincode details:', error);
    
    // If API fails, return a proper error response
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }
    
    throw error;
  }
};

// Get unique states (Indian states list)
export const fetchStates = async (): Promise<string[]> => {
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

// Improved district fetching with better API integration
export const fetchDistrictsByState = async (stateName: string): Promise<string[]> => {
  try {
    console.log(`Fetching districts for state: ${stateName}`);
    
    // Sample pincodes for major states to get district data
    const samplePincodes: { [key: string]: string[] } = {
      "Tamil Nadu": ["600001", "620001", "625001", "632001", "641001", "682001"],
      "Karnataka": ["560001", "570001", "580001", "590001", "575001"],
      "Maharashtra": ["400001", "411001", "440001", "421001", "416001"],
      "Delhi": ["110001", "110002", "110003", "110004", "110005"],
      "Uttar Pradesh": ["201301", "208001", "221001", "226001", "250001"],
      "Gujarat": ["380001", "390001", "395001", "361001"],
      "Rajasthan": ["302001", "313001", "324001", "342001"],
      "West Bengal": ["700001", "711001", "721001", "734001"],
      "Andhra Pradesh": ["530001", "515001", "517001", "533001"],
      "Telangana": ["500001", "506001", "507001", "502001"]
    };

    const districts = new Set<string>();
    const pincodes = samplePincodes[stateName] || [];
    
    // Try to fetch data from sample pincodes
    for (const pincode of pincodes.slice(0, 3)) {
      try {
        const response = await fetchPincodeDetails(pincode);
        if (response.Status === "Success" && response.PostOffice) {
          response.PostOffice.forEach(office => {
            if (office.State && office.State.toLowerCase().includes(stateName.toLowerCase())) {
              districts.add(office.District);
            }
          });
        }
        
        // Add delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.warn(`Failed to fetch districts for pincode ${pincode}:`, error);
        continue;
      }
    }
    
    // If API didn't return districts, use fallback data
    if (districts.size === 0) {
      const fallbackDistricts: { [key: string]: string[] } = {
        "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Vellore", "Erode", "Tirunelveli"],
        "Karnataka": ["Bengaluru Urban", "Mysuru", "Hubli-Dharwad", "Mangalore", "Belagavi", "Ballari"],
        "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur"],
        "Delhi": ["Central Delhi", "New Delhi", "South Delhi", "East Delhi", "North Delhi"],
        "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut"],
        "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
        "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Udaipur"],
        "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
        "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
        "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"]
      };
      
      return fallbackDistricts[stateName] || [];
    }
    
    return Array.from(districts).sort();
  } catch (error) {
    console.error(`Error fetching districts for ${stateName}:`, error);
    return [];
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

// Simplified fetch functions for backwards compatibility
export const fetchPincodesByState = async (
  stateName: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ records: PincodeImportData[]; total: number; count: number; limit: number; offset: number }> => {
  console.log(`Fetching pincodes for state: ${stateName}`);
  return {
    records: [],
    total: 0,
    count: 0,
    limit,
    offset
  };
};

export const fetchPincodesByDistrict = async (
  districtName: string,
  stateName?: string,
  limit: number = 100,
  offset: number = 0
): Promise<{ records: PincodeImportData[]; total: number; count: number; limit: number; offset: number }> => {
  console.log(`Fetching pincodes for district: ${districtName}`);
  return {
    records: [],
    total: 0,
    count: 0,
    limit,
    offset
  };
};
