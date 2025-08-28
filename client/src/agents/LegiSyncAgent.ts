/**
 * LegiSyncAgent.ts - Phase XVI Step 2
 * Live Legislative Synchronization Agent
 * Mock Bill Tracker with ZIP-District Mapping
 * Authority: Commander Mark via JASMY Relay
 */

// ZIP to District mapping
const ZIP_DISTRICT_MAP: Record<string, string> = {
  "20852": "8B",
  "20001": "3C", 
  "22102": "5A",
  "10001": "1A", // Additional mock entries
  "90210": "2D",
  "30309": "4F"
};

// Mock legislative bill structure
interface LegislativeBill {
  id: string;
  title: string;
  status: 'In Committee' | 'Active' | 'Passed' | 'Failed' | 'Pending';
  sponsor: string;
  summary: string;
  voteDate?: string;
  category: 'privacy' | 'voting' | 'infrastructure' | 'healthcare' | 'education';
}

// Mock bills database organized by district
const DISTRICT_BILLS: Record<string, LegislativeBill[]> = {
  "8B": [
    {
      id: "HB203",
      title: "HB203 - Civic Data Privacy Act",
      status: "In Committee",
      sponsor: "Rep. Lin",
      summary: "Establishes privacy protections for civic engagement data",
      category: "privacy"
    },
    {
      id: "SB108", 
      title: "SB108 - Voter Registration Modernization",
      status: "Active",
      sponsor: "Sen. Ruiz", 
      summary: "Modernizes voter registration systems with digital-first approach",
      voteDate: "2025-07-25",
      category: "voting"
    }
  ],
  "3C": [
    {
      id: "HB156",
      title: "HB156 - Municipal Broadband Initiative",
      status: "Active",
      sponsor: "Rep. Chen",
      summary: "Expands municipal broadband access for underserved communities",
      category: "infrastructure"
    },
    {
      id: "SB087",
      title: "SB087 - Community Health Oversight",
      status: "Passed",
      sponsor: "Sen. Martinez",
      summary: "Establishes community oversight for public health initiatives",
      category: "healthcare"
    },
    {
      id: "HB201",
      title: "HB201 - Civic Education Standards",
      status: "In Committee",
      sponsor: "Rep. Johnson",
      summary: "Updates civic education curriculum standards",
      category: "education"
    }
  ],
  "5A": [
    {
      id: "SB143",
      title: "SB143 - Digital Voting Security Act",
      status: "Active",
      sponsor: "Sen. Taylor",
      summary: "Enhances security protocols for digital voting systems",
      voteDate: "2025-08-01",
      category: "voting"
    },
    {
      id: "HB188",
      title: "HB188 - Infrastructure Transparency Act",
      status: "Pending",
      sponsor: "Rep. Davis",
      summary: "Requires public disclosure of infrastructure project details",
      category: "infrastructure"
    }
  ],
  "1A": [
    {
      id: "HB091",
      title: "HB091 - Open Government Data Act",
      status: "Active",
      sponsor: "Rep. Wilson",
      summary: "Mandates open data standards for government transparency",
      category: "privacy"
    }
  ],
  "2D": [
    {
      id: "SB067",
      title: "SB067 - Civic Engagement Incentives",
      status: "In Committee",
      sponsor: "Sen. Brown",
      summary: "Creates incentive programs for civic participation",
      category: "voting"
    }
  ],
  "4F": [
    {
      id: "HB174",
      title: "HB174 - Community Infrastructure Fund",
      status: "Passed",
      sponsor: "Rep. Anderson",
      summary: "Establishes dedicated funding for community infrastructure",
      category: "infrastructure"
    }
  ]
};

/**
 * Map ZIP code to legislative district
 */
export const getDistrictByZIP = (zipCode: string): string | null => {
  const district = ZIP_DISTRICT_MAP[zipCode];
  if (district) {
    console.log(`📨 ZIP ${zipCode} routed to District ${district}`);
  } else {
    console.log(`⚠️ ZIP ${zipCode} not found in district mapping`);
  }
  return district || null;
};

/**
 * Fetch mock bills by district ID
 */
export const getBillsByDistrict = (districtId: string): LegislativeBill[] => {
  const bills = DISTRICT_BILLS[districtId] || [];
  
  console.log(`📜 Bills in District ${districtId}:`);
  bills.forEach(bill => {
    console.log(`• ${bill.title} (${bill.status})`);
  });
  
  if (bills.length === 0) {
    console.log(`• No active bills found for District ${districtId}`);
  }
  
  return bills;
};

/**
 * Get all available districts
 */
export const getAvailableDistricts = (): string[] => {
  return Object.keys(DISTRICT_BILLS);
};

/**
 * Get district summary with bill counts
 */
export const getDistrictSummary = (districtId: string) => {
  const bills = DISTRICT_BILLS[districtId] || [];
  const activeCount = bills.filter(b => b.status === 'Active').length;
  const committeeCount = bills.filter(b => b.status === 'In Committee').length;
  const passedCount = bills.filter(b => b.status === 'Passed').length;
  
  return {
    districtId,
    totalBills: bills.length,
    activeBills: activeCount,
    committeeBills: committeeCount,
    passedBills: passedCount,
    bills
  };
};

/**
 * Search bills across all districts by category
 */
export const getBillsByCategory = (category: LegislativeBill['category']): LegislativeBill[] => {
  const allBills: LegislativeBill[] = [];
  
  Object.values(DISTRICT_BILLS).forEach(districtBills => {
    const categoryBills = districtBills.filter(bill => bill.category === category);
    allBills.push(...categoryBills);
  });
  
  console.log(`📊 Found ${allBills.length} bills in category: ${category}`);
  return allBills;
};

export type { LegislativeBill };