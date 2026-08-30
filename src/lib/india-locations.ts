// Indian states/UTs and their notable cities, used to back the address form's
// State picker and City suggestions.
//
// The state list is exhaustive (all 28 states + 8 union territories) and is
// treated as a closed set — a delivery address can't be in a state that
// doesn't exist. The city lists are deliberately NOT exhaustive: India has
// thousands of towns, so these cover the ones customers actually type, and the
// City field still accepts anything typed in full. Restricting it to this list
// would block legitimate deliveries to smaller towns.

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

export type IndianState = (typeof INDIAN_STATES)[number];

export const CITIES_BY_STATE: Record<string, string[]> = {
  "Andaman and Nicobar Islands": ["Port Blair", "Diglipur", "Mayabunder", "Rangat", "Car Nicobar"],
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati",
    "Kakinada", "Kadapa", "Anantapur", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam",
    "Adoni", "Tenali", "Proddatur", "Chittoor", "Hindupur", "Bhimavaram", "Madanapalle", "Srikakulam",
  ],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Tezu", "Along"],
  Assam: [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon",
    "Karimganj", "Sivasagar", "Goalpara", "Diphu", "North Lakhimpur", "Dhubri", "Golaghat",
  ],
  Bihar: [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai",
    "Katihar", "Munger", "Chhapra", "Bettiah", "Saharsa", "Sasaram", "Hajipur", "Dehri",
    "Siwan", "Motihari", "Nawada", "Bagaha", "Buxar", "Kishanganj", "Jamalpur", "Jehanabad",
  ],
  Chandigarh: ["Chandigarh"],
  Chhattisgarh: [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur",
    "Ambikapur", "Dhamtari", "Chirmiri", "Mahasamund", "Bhatapara",
  ],
  "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu"],
  Delhi: [
    "New Delhi", "Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Pitampura", "Janakpuri",
    "Vasant Kunj", "Lajpat Nagar", "Connaught Place", "Mayur Vihar", "Shahdara", "Narela", "Najafgarh",
  ],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Calangute", "Candolim"],
  Gujarat: [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh",
    "Anand", "Nadiad", "Bharuch", "Mehsana", "Navsari", "Vapi", "Morbi", "Surendranagar", "Gandhidham",
    "Bhuj", "Porbandar", "Valsad", "Godhra", "Palanpur", "Veraval", "Amreli", "Botad",
  ],
  Haryana: [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal",
    "Sonipat", "Panchkula", "Bhiwani", "Sirsa", "Bahadurgarh", "Jind", "Thanesar", "Kaithal",
    "Rewari", "Palwal", "Narnaul", "Fatehabad", "Gohana", "Tohana",
  ],
  "Himachal Pradesh": [
    "Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali", "Bilaspur", "Hamirpur",
    "Una", "Chamba", "Nahan", "Palampur", "Kangra", "Baddi", "Kasauli",
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Udhampur", "Kathua", "Sopore", "Pulwama",
    "Rajouri", "Poonch", "Kupwara", "Budgam", "Gulmarg", "Pahalgam",
  ],
  Jharkhand: [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro Steel City", "Deoghar", "Phusro", "Hazaribagh",
    "Giridih", "Ramgarh", "Medininagar", "Chirkunda", "Chaibasa", "Dumka", "Gumla",
  ],
  Karnataka: [
    "Bengaluru", "Mysuru", "Hubballi", "Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere",
    "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", "Raichur", "Bidar", "Hospet", "Hassan",
    "Gadag", "Udupi", "Chitradurga", "Kolar", "Mandya", "Chikkamagaluru", "Bagalkot", "Karwar",
  ],
  Kerala: [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad",
    "Kannur", "Kottayam", "Malappuram", "Pathanamthitta", "Idukki", "Kasaragod", "Wayanad",
    "Guruvayur", "Munnar", "Cherthala", "Perinthalmanna", "Thalassery",
  ],
  Ladakh: ["Leh", "Kargil", "Nubra", "Diskit"],
  Lakshadweep: ["Kavaratti", "Agatti", "Minicoy", "Andrott"],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam",
    "Rewa", "Katni", "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara",
    "Guna", "Shivpuri", "Vidisha", "Damoh", "Mandsaur", "Khargone", "Neemuch", "Hoshangabad",
  ],
  Maharashtra: [
    "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Navi Mumbai",
    "Kalyan", "Dombivli", "Vasai-Virar", "Amravati", "Kolhapur", "Nanded", "Sangli", "Jalgaon",
    "Akola", "Latur", "Ahmednagar", "Chandrapur", "Parbhani", "Ichalkaranji", "Jalna", "Bhusawal",
    "Panvel", "Satara", "Beed", "Yavatmal", "Osmanabad", "Nandurbar", "Wardha", "Ratnagiri", "Lonavala",
  ],
  Manipur: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Ukhrul", "Senapati"],
  Meghalaya: ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara", "Williamnagar", "Cherrapunji"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Saiha", "Mamit"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Mon"],
  Odisha: [
    "Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak",
    "Baripada", "Jharsuguda", "Jeypore", "Bargarh", "Rayagada", "Bhawanipatna", "Dhenkanal", "Angul",
  ],
  Puducherry: ["Puducherry", "Karaikal", "Yanam", "Mahe"],
  Punjab: [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot",
    "Moga", "Batala", "Firozpur", "Sangrur", "Barnala", "Kapurthala", "Khanna", "Phagwara",
    "Muktsar", "Rajpura", "Nabha", "Malerkotla", "Faridkot", "Gurdaspur",
  ],
  Rajasthan: [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar",
    "Bharatpur", "Pali", "Sri Ganganagar", "Hanumangarh", "Kishangarh", "Beawar", "Dhaulpur",
    "Tonk", "Banswara", "Chittorgarh", "Jhunjhunu", "Barmer", "Nagaur", "Sawai Madhopur", "Mount Abu",
  ],
  Sikkim: ["Gangtok", "Namchi", "Gyalshing", "Mangan", "Rangpo", "Jorethang", "Pelling"],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Tiruppur",
    "Vellore", "Erode", "Thoothukudi", "Dindigul", "Thanjavur", "Ranipet", "Sivakasi", "Karur",
    "Hosur", "Nagercoil", "Kanchipuram", "Kumbakonam", "Cuddalore", "Tiruvannamalai", "Pollachi",
    "Rajapalayam", "Namakkal", "Ooty", "Kodaikanal", "Ambur", "Karaikudi", "Neyveli",
  ],
  Telangana: [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar",
    "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Siddipet", "Jagtial", "Mancherial",
    "Secunderabad", "Sangareddy", "Medak",
  ],
  Tripura: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia", "Ambassa", "Khowai"],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Noida",
    "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Firozabad", "Jhansi", "Muzaffarnagar",
    "Mathura", "Rampur", "Shahjahanpur", "Farrukhabad", "Ayodhya", "Mirzapur", "Bulandshahr",
    "Etawah", "Sitapur", "Bahraich", "Modinagar", "Hapur", "Unnao", "Jaunpur", "Lakhimpur",
    "Hathras", "Banda", "Pilibhit", "Barabanki", "Khurja", "Gonda", "Mainpuri", "Greater Noida",
  ],
  Uttarakhand: [
    "Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh", "Nainital",
    "Mussoorie", "Pithoragarh", "Almora", "Kotdwar", "Ramnagar", "Pauri", "Tehri", "Bageshwar",
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Bardhaman", "Malda", "Kharagpur",
    "Haldia", "Darjeeling", "Krishnanagar", "Baharampur", "Raiganj", "Jalpaiguri", "Bankura",
    "Cooch Behar", "Medinipur", "Barasat", "Habra", "Santipur", "Bally", "Chandannagar", "Purulia",
  ],
};

/** Every city in the dataset, de-duplicated and alphabetical. */
export const ALL_CITIES: string[] = Array.from(
  new Set(Object.values(CITIES_BY_STATE).flat())
).sort((a, b) => a.localeCompare(b));

/**
 * Cities to suggest for a state. Falls back to the full list when no state is
 * chosen yet, so the field is useful before the customer picks a state.
 */
export function citiesForState(state?: string): string[] {
  const cities = state ? CITIES_BY_STATE[state] : undefined;
  return cities ? [...cities].sort((a, b) => a.localeCompare(b)) : ALL_CITIES;
}

/** The state a city belongs to, when it's unambiguous. Used to auto-fill State. */
export function stateForCity(city: string): string | undefined {
  const needle = city.trim().toLowerCase();
  if (!needle) return undefined;
  const matches = Object.entries(CITIES_BY_STATE).filter(([, cities]) =>
    cities.some((c) => c.toLowerCase() === needle)
  );
  return matches.length === 1 ? matches[0][0] : undefined;
}
