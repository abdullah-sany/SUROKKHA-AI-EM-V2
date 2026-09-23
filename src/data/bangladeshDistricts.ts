export interface DistrictInfo {
  en: string;
  bn: string;
  division: string;
}

export const BANGLADESH_DISTRICTS: DistrictInfo[] = [
  // Dhaka Division (13 districts)
  { en: "Dhaka", bn: "ঢাকা", division: "Dhaka" },
  { en: "Gazipur", bn: "গাজীপুর", division: "Dhaka" },
  { en: "Narayanganj", bn: "নারায়ণগঞ্জ", division: "Dhaka" },
  { en: "Tangail", bn: "টাঙ্গাইল", division: "Dhaka" },
  { en: "Manikganj", bn: "মানিকগঞ্জ", division: "Dhaka" },
  { en: "Munshiganj", bn: "মুন্সিগঞ্জ", division: "Dhaka" },
  { en: "Narsingdi", bn: "নরসিংদী", division: "Dhaka" },
  { en: "Kishoreganj", bn: "কিশোরগঞ্জ", division: "Dhaka" },
  { en: "Faridpur", bn: "ফরিদপুর", division: "Dhaka" },
  { en: "Gopalganj", bn: "গোপালগঞ্জ", division: "Dhaka" },
  { en: "Madaripur", bn: "মাদারীপুর", division: "Dhaka" },
  { en: "Rajbari", bn: "রাজবাড়ী", division: "Dhaka" },
  { en: "Shariatpur", bn: "শরীয়তপুর", division: "Dhaka" },

  // Chattogram Division (11 districts)
  { en: "Chattogram", bn: "চট্টগ্রাম", division: "Chattogram" },
  { en: "Cox's Bazar", bn: "কক্সবাজার", division: "Chattogram" },
  { en: "Cumilla", bn: "কুমিল্লা", division: "Chattogram" },
  { en: "Brahmanbaria", bn: "ব্রাহ্মণবাড়িয়া", division: "Chattogram" },
  { en: "Chandpur", bn: "চাঁদপুর", division: "Chattogram" },
  { en: "Feni", bn: "ফেনী", division: "Chattogram" },
  { en: "Noakhali", bn: "নোয়াখালী", division: "Chattogram" },
  { en: "Lakshmipur", bn: "লক্ষ্মীপুর", division: "Chattogram" },
  { en: "Bandarban", bn: "বান্দরবান", division: "Chattogram" },
  { en: "Rangamati", bn: "রাঙ্গামাটি", division: "Chattogram" },
  { en: "Khagrachhari", bn: "খাগড়াছড়ি", division: "Chattogram" },

  // Rajshahi Division (8 districts)
  { en: "Rajshahi", bn: "রাজশাহী", division: "Rajshahi" },
  { en: "Bogura", bn: "বগুড়া", division: "Rajshahi" },
  { en: "Pabna", bn: "পাবনা", division: "Rajshahi" },
  { en: "Sirajganj", bn: "সিরাজগঞ্জ", division: "Rajshahi" },
  { en: "Naogaon", bn: "নওগাঁ", division: "Rajshahi" },
  { en: "Natore", bn: "নাটোর", division: "Rajshahi" },
  { en: "Chapainawabganj", bn: "চাঁপাইনবাবগঞ্জ", division: "Rajshahi" },
  { en: "Joypurhat", bn: "জয়পুরহাট", division: "Rajshahi" },

  // Khulna Division (10 districts)
  { en: "Khulna", bn: "খুলনা", division: "Khulna" },
  { en: "Jashore", bn: "যশোর", division: "Khulna" },
  { en: "Kushtia", bn: "কুষ্টিয়া", division: "Khulna" },
  { en: "Satkhira", bn: "সাতক্ষীরা", division: "Khulna" },
  { en: "Bagerhat", bn: "বাগেরহাট", division: "Khulna" },
  { en: "Jhenaidah", bn: "ঝিনাইদহ", division: "Khulna" },
  { en: "Chuadanga", bn: "চুয়াডাঙ্গা", division: "Khulna" },
  { en: "Magura", bn: "মাগুরা", division: "Khulna" },
  { en: "Meherpur", bn: "মেহেরপুর", division: "Khulna" },
  { en: "Narail", bn: "নড়াইল", division: "Khulna" },

  // Barishal Division (6 districts)
  { en: "Barishal", bn: "বরিশাল", division: "Barishal" },
  { en: "Patuakhali", bn: "পটুয়াখালী", division: "Barishal" },
  { en: "Bhola", bn: "ভোলা", division: "Barishal" },
  { en: "Pirojpur", bn: "পিরোজপুর", division: "Barishal" },
  { en: "Barguna", bn: "বরগুনা", division: "Barishal" },
  { en: "Jhalokati", bn: "ঝালকাঠি", division: "Barishal" },

  // Sylhet Division (4 districts)
  { en: "Sylhet", bn: "সিলেট", division: "Sylhet" },
  { en: "Moulvibazar", bn: "মৌলভীবাজার", division: "Sylhet" },
  { en: "Habiganj", bn: "হবিগঞ্জ", division: "Sylhet" },
  { en: "Sunamganj", bn: "সুনামগঞ্জ", division: "Sylhet" },

  // Rangpur Division (8 districts)
  { en: "Rangpur", bn: "রংপুর", division: "Rangpur" },
  { en: "Dinajpur", bn: "দিনাজপুর", division: "Rangpur" },
  { en: "Kurigram", bn: "কুড়িগ্রাম", division: "Rangpur" },
  { en: "Gaibandha", bn: "গাইবান্ধা", division: "Rangpur" },
  { en: "Nilphamari", bn: "নীলফামারী", division: "Rangpur" },
  { en: "Lalmonirhat", bn: "লালমনিরহাট", division: "Rangpur" },
  { en: "Thakurgaon", bn: "ঠাকুরগাঁও", division: "Rangpur" },
  { en: "Panchagarh", bn: "পঞ্চগড়", division: "Rangpur" },

  // Mymensingh Division (4 districts)
  { en: "Mymensingh", bn: "ময়মনসিংহ", division: "Mymensingh" },
  { en: "Jamalpur", bn: "জামালপুর", division: "Mymensingh" },
  { en: "Netrokona", bn: "নেত্রকোণা", division: "Mymensingh" },
  { en: "Sherpur", bn: "শেরপুর", division: "Mymensingh" },
];

export function getDistrictsForDivision(division?: string): DistrictInfo[] {
  if (!division) {
    return [...BANGLADESH_DISTRICTS].sort((a, b) => a.en.localeCompare(b.en));
  }
  return BANGLADESH_DISTRICTS.filter(d => d.division.toLowerCase() === division.toLowerCase())
    .sort((a, b) => a.en.localeCompare(b.en));
}
