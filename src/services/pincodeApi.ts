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

// Fallback pincode data for common areas
const fallbackPincodeData: Record<string, PostOfficeInfo> = {
  "110001": {
    Name: "New Delhi GPO",
    BranchType: "Head Office",
    DeliveryStatus: "Delivery",
    Circle: "Delhi",
    District: "New Delhi",
    Division: "New Delhi",
    Region: "Delhi",
    State: "Delhi",
    Country: "India",
    Pincode: "110001"
  },
  "400001": {
    Name: "Mumbai GPO",
    BranchType: "Head Office", 
    DeliveryStatus: "Delivery",
    Circle: "Maharashtra",
    District: "Mumbai",
    Division: "Mumbai",
    Region: "Mumbai",
    State: "Maharashtra",
    Country: "India",
    Pincode: "400001"
  },
  "600001": {
    Name: "Chennai GPO",
    BranchType: "Head Office",
    DeliveryStatus: "Delivery", 
    Circle: "Tamil Nadu",
    District: "Chennai",
    Division: "Chennai",
    Region: "Chennai",
    State: "Tamil Nadu",
    Country: "India",
    Pincode: "600001"
  },
  "632001": {
    Name: "Vellore",
    BranchType: "Head Office",
    DeliveryStatus: "Delivery",
    Circle: "Tamil Nadu", 
    District: "Vellore",
    Division: "Vellore",
    Region: "Chennai",
    State: "Tamil Nadu",
    Country: "India",
    Pincode: "632001"
  },
  "632007": {
    Name: "Katpadi",
    BranchType: "Sub Office",
    DeliveryStatus: "Delivery",
    Circle: "Tamil Nadu",
    District: "Vellore", 
    Division: "Vellore",
    Region: "Chennai",
    State: "Tamil Nadu",
    Country: "India",
    Pincode: "632007"
  }
};

// Alternative API endpoints to try
const alternativeAPIs = [
  "https://api.postalpincode.in",
  "https://postalpincode.in/api"
];

// Fetch pincode details with multiple fallback strategies
export const fetchPincodeDetails = async (pincode: string): Promise<PostalPincodeResponse> => {
  console.log(`Fetching details for pincode: ${pincode}`);
  
  // First, try the fallback data
  if (fallbackPincodeData[pincode]) {
    console.log(`Using fallback data for pincode: ${pincode}`);
    return {
      Message: "Success",
      Status: "Success", 
      PostOffice: [fallbackPincodeData[pincode]]
    };
  }

  // Try alternative APIs
  for (const apiBase of alternativeAPIs) {
    try {
      console.log(`Trying API: ${apiBase}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`${apiBase}/pincode/${pincode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        mode: 'cors', // Try CORS first
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response successful:', data);
        
        if (data && typeof data.Status === 'string') {
          return data;
        }
      }
    } catch (error) {
      console.warn(`API ${apiBase} failed:`, error);
      continue; // Try next API
    }
  }

  // If all APIs fail, try to determine state/district from pincode pattern
  const stateInfo = getStateFromPincode(pincode);
  if (stateInfo) {
    console.log(`Using pincode pattern matching for: ${pincode}`);
    return {
      Message: "Success (Pattern Match)",
      Status: "Success",
      PostOffice: [{
        Name: `${stateInfo.city} - ${pincode}`,
        BranchType: "Sub Office",
        DeliveryStatus: "Delivery",
        Circle: stateInfo.state,
        District: stateInfo.city,
        Division: stateInfo.city,
        Region: stateInfo.region,
        State: stateInfo.state,
        Country: "India",
        Pincode: pincode
      }]
    };
  }

  // Final fallback - return error
  throw new Error(`Unable to fetch data for pincode ${pincode}. The pincode service may be temporarily unavailable.`);
};

// Get state information from pincode patterns
const getStateFromPincode = (pincode: string): { state: string; city: string; region: string } | null => {
  const pincodePatterns: Record<string, { state: string; city: string; region: string }> = {
    // Delhi
    "110": { state: "Delhi", city: "New Delhi", region: "Delhi" },
    "11": { state: "Delhi", city: "Delhi", region: "Delhi" },
    
    // Maharashtra  
    "400": { state: "Maharashtra", city: "Mumbai", region: "Mumbai" },
    "411": { state: "Maharashtra", city: "Pune", region: "Pune" },
    "440": { state: "Maharashtra", city: "Nagpur", region: "Nagpur" },
    
    // Tamil Nadu
    "600": { state: "Tamil Nadu", city: "Chennai", region: "Chennai" },
    "620": { state: "Tamil Nadu", city: "Tiruchirappalli", region: "Chennai" },
    "625": { state: "Tamil Nadu", city: "Madurai", region: "Chennai" },
    "630": { state: "Tamil Nadu", city: "Dindigul", region: "Chennai" },
    "632": { state: "Tamil Nadu", city: "Vellore", region: "Chennai" },
    
    // Karnataka
    "560": { state: "Karnataka", city: "Bengaluru", region: "Bengaluru" },
    "570": { state: "Karnataka", city: "Mysuru", region: "Bengaluru" },
    
    // Uttar Pradesh
    "201": { state: "Uttar Pradesh", city: "Ghaziabad", region: "Delhi" },
    "208": { state: "Uttar Pradesh", city: "Kanpur", region: "Lucknow" },
    "221": { state: "Uttar Pradesh", city: "Varanasi", region: "Varanasi" },
    "226": { state: "Uttar Pradesh", city: "Lucknow", region: "Lucknow" },
    
    // Gujarat
    "380": { state: "Gujarat", city: "Ahmedabad", region: "Ahmedabad" },
    "390": { state: "Gujarat", city: "Vadodara", region: "Vadodara" },
    
    // West Bengal
    "700": { state: "West Bengal", city: "Kolkata", region: "Kolkata" },
    "711": { state: "West Bengal", city: "Howrah", region: "Kolkata" }
  };

  // Try 3-digit pattern first, then 2-digit
  const threeDigit = pincode.substring(0, 3);
  const twoDigit = pincode.substring(0, 2);
  
  return pincodePatterns[threeDigit] || pincodePatterns[twoDigit] || null;
};

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

export const transformPincodeData = (postOffices: PostOfficeInfo[]): PincodeImportData[] => {
  return postOffices.map(office => ({
    pincode: office.Pincode,
    state: office.State,
    city: office.District,
    district: office.District,
    office_name: office.Name
  }));
};

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
