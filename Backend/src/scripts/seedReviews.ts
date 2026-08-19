import mongoose from "mongoose";
import dotenv from "dotenv";
import { Review } from "../models/Review.js";
import { Product } from "../models/Product.js";

dotenv.config();

interface ReviewTemplate {
  userName: string;
  rating: number;
  title: string;
  comment: string;
  daysAgo: number;
}

const reviewsByProduct: Record<string, ReviewTemplate[]> = {
  "california-jumbo-almonds": [
    {
      userName: "Ananya Sharma",
      rating: 5,
      title: "Exceptionally fresh & jumbo size!",
      comment: "These are truly jumbo sized. You can hear the crisp snap with every bite. Packed under airtight seal, so there is zero stale smell. Perfect for soaking overnight.",
      daysAgo: 3,
    },
    {
      userName: "Vikram Kapoor",
      rating: 5,
      title: "Best California almonds in India",
      comment: "Switched from generic supermarket brands to Viśvam. The natural sweetness and crunch are unmatched. Outstanding quality packaging.",
      daysAgo: 7,
    },
    {
      userName: "Dr. Sunita Rao",
      rating: 5,
      title: "Pure, sweet & zero bitterness",
      comment: "As a nutritionist, I look for clean sourcing. These almonds have high natural oil content without any rancidity. Excellent daily snack.",
      daysAgo: 12,
    },
    {
      userName: "Rajesh Patel",
      rating: 4,
      title: "Great quality, slightly premium price",
      comment: "The size and crunch are top tier. Pricing is a bit higher than local market, but the packaging and grade A1 quality justify it completely.",
      daysAgo: 18,
    },
    {
      userName: "Meera Iyer",
      rating: 5,
      title: "Soaks beautifully overnight",
      comment: "Peeled skin comes off effortlessly after soaking. Very sweet, buttery taste. My kids love having 5-6 daily before school.",
      daysAgo: 24,
    },
    {
      userName: "Siddharth Varma",
      rating: 5,
      title: "Airtight seal makes a huge difference",
      comment: "Arrived with the seal intact. Zero broken pieces in the 500g pouch. Highly recommended for daily wellness.",
      daysAgo: 31,
    },
    {
      userName: "Pooja Singhania",
      rating: 5,
      title: "Crisp and nutty aroma",
      comment: "You open the pouch and immediately smell fresh orchard almonds. Very satisfied with Viśvam's standard.",
      daysAgo: 39,
    },
    {
      userName: "Aditya Deshmukh",
      rating: 5,
      title: "Consistent size in every pouch",
      comment: "Second order already. Every kernel is uniform, large, and golden brown. Great craftsmanship.",
      daysAgo: 45,
    },
    {
      userName: "Radhika Sen",
      rating: 4,
      title: "Very fresh and wholesome",
      comment: "Good airtight zip-lock packaging. Almonds remained crisp throughout the month.",
      daysAgo: 52,
    },
    {
      userName: "Kavita Joshi",
      rating: 5,
      title: "Pure single-origin luxury",
      comment: "The quality reflects what luxury dry fruits should taste like. So glad I found Viśvam.",
      daysAgo: 60,
    },
    {
      userName: "Amitav Roy",
      rating: 5,
      title: "Top-notch California crop",
      comment: "Superb buttery crunch. Great with morning green tea or pre-workout breakfast.",
      daysAgo: 68,
    },
  ],

  "king-w240-cashews": [
    {
      userName: "Priya Menon",
      rating: 5,
      title: "King size W240 whole kernels!",
      comment: "Every single cashew in the jar was whole, large, and unbroken. Rich, creamy bite without any artificial roasting oils.",
      daysAgo: 2,
    },
    {
      userName: "Rohan Mehta",
      rating: 5,
      title: "Melt-in-the-mouth creaminess",
      comment: "These Mangaluru cashews are genuinely massive. Delicious natural sweetness. Fantastic for desserts and snacking.",
      daysAgo: 6,
    },
    {
      userName: "Divya Nambiar",
      rating: 5,
      title: "Flawless glass jar packaging",
      comment: "The reusable jar looks luxurious on the dining table. Cashews are crisp with zero dust or broken pieces.",
      daysAgo: 11,
    },
    {
      userName: "Nikhil Agarwal",
      rating: 4,
      title: "Premium quality whole cashews",
      comment: "Big size kernels with great texture. Slightly higher priced but the quality is noticeably superior.",
      daysAgo: 16,
    },
    {
      userName: "Smita Kulkarni",
      rating: 5,
      title: "Made Kaju Katli — divine taste!",
      comment: "The oil yield and natural sweetness of these cashews made the best homemade sweets for our family celebration.",
      daysAgo: 22,
    },
    {
      userName: "Gautam Bose",
      rating: 5,
      title: "Large, buttery and fresh",
      comment: "The crunch is gentle yet firm, exactly how freshly harvested W240 cashews should feel.",
      daysAgo: 29,
    },
    {
      userName: "Aarti Saxena",
      rating: 5,
      title: "Clean, unpolished raw beauty",
      comment: "Zero chemical smell or white coating. 100% natural, whole, premium Indian cashews.",
      daysAgo: 36,
    },
    {
      userName: "Farhan Khan",
      rating: 5,
      title: "Superb for healthy fats",
      comment: "I eat 6-8 kernels post workout. Very satisfying and filling. Top grade.",
      daysAgo: 44,
    },
    {
      userName: "Bhavna Trivedi",
      rating: 4,
      title: "Fresh aroma & pristine color",
      comment: "Ivory white, flawless kernels. Will definitely purchase the 1kg pack next time.",
      daysAgo: 53,
    },
    {
      userName: "Tushar Gupta",
      rating: 5,
      title: "Authentic Mangaluru origin",
      comment: "Having lived in Karnataka, I know good cashews. These are the finest export-grade kernels.",
      daysAgo: 61,
    },
    {
      userName: "Sunil Hegde",
      rating: 5,
      title: "Gold standard cashews",
      comment: "Pure luxury. Not a single split or spot on any cashew. Highly impressed.",
      daysAgo: 70,
    },
  ],

  "kashmiri-snow-walnuts": [
    {
      userName: "Lt. Col. R. Verma",
      rating: 5,
      title: "Zero bitterness — truly extra light!",
      comment: "Unlike imported machine-shelled walnuts, these Kashmiri walnuts have zero bitterness or astringent aftertaste. Hand-extracted intact halves.",
      daysAgo: 4,
    },
    {
      userName: "Deepika Chawla",
      rating: 5,
      title: "Milky, fresh walnut halves",
      comment: "The color is beautifully pale blonde and the oil content is rich. Perfect brain food for my kids during exams.",
      daysAgo: 8,
    },
    {
      userName: "Dr. Arvind Krishnan",
      rating: 5,
      title: "Highest Omega-3 fatty acid profile",
      comment: "As a cardiologist, I recommend raw walnuts daily. Viśvam's cold lock preservation keeps the delicate oils intact.",
      daysAgo: 14,
    },
    {
      userName: "Neha Bansal",
      rating: 4,
      title: "Wild Kashmiri harvest quality",
      comment: "Sweet and buttery. Half kernels were mostly intact with very minimal crumb during transit.",
      daysAgo: 20,
    },
    {
      userName: "Sanjay Kaul",
      rating: 5,
      title: "Authentic taste of Kashmir",
      comment: "Reminds me of the fresh akhrot directly from Anantnag orchards. Very authentic and fresh.",
      daysAgo: 27,
    },
    {
      userName: "Tanvi Bhattacharya",
      rating: 5,
      title: "Great for keto & morning oatmeal",
      comment: "I toss a handful into warm cinnamon oats. Imparts a luxurious nutty creaminess.",
      daysAgo: 35,
    },
    {
      userName: "Manoj Swamy",
      rating: 5,
      title: "Vacuum seal kept them super fresh",
      comment: "Walnuts go rancid fast if exposed to air. Viśvam's airtight packaging keeps them crisp as day one.",
      daysAgo: 42,
    },
    {
      userName: "Shalini Dixit",
      rating: 5,
      title: "Extra Light snow halves",
      comment: "Very pale color, which indicates premium grade. Not oily or yellowed. High quality.",
      daysAgo: 50,
    },
    {
      userName: "Pranav Goel",
      rating: 4,
      title: "Top tier walnut quality",
      comment: "Rich flavor profile, natural oils are noticeable when pressed between fingers. Very good.",
      daysAgo: 59,
    },
    {
      userName: "Pallavi Sundaram",
      rating: 5,
      title: "Natural brain booster",
      comment: "No chemical bleaching. Pure raw natural Kashmiri snow walnuts. 10/10.",
      daysAgo: 67,
    },
    {
      userName: "Kunal Mathur",
      rating: 5,
      title: "Freshness you can taste",
      comment: "Crisp, fragrant, and full of natural oils. Best walnuts available online in India.",
      daysAgo: 74,
    },
  ],

  "roasted-salted-pistachios": [
    {
      userName: "Arjun Namboodiri",
      rating: 5,
      title: "Naturally wide open shells!",
      comment: "Almost 100% naturally opened shells, so your fingers never hurt trying to pry them open. Wood-fired aroma is incredible.",
      daysAgo: 1,
    },
    {
      userName: "Shweta Tiwari",
      rating: 5,
      title: "Perfect Himalayan pink salt dusting",
      comment: "Not overly salty like cheap commercial brands. Lightly seasoned so the sweet pistachio green flavor shines through.",
      daysAgo: 5,
    },
    {
      userName: "Vivek Oberoi",
      rating: 5,
      title: "Vivid green kernel and big crunch",
      comment: "Super jumbo 20/22 size. Very easy to peel, fresh roast, and zero burned or empty shells.",
      daysAgo: 10,
    },
    {
      userName: "Kiran Mazumdar",
      rating: 4,
      title: "Addictive healthy evening snack",
      comment: "The wood-fired roast gives it a signature artisanal profile. The whole family finished the jar in 3 days.",
      daysAgo: 17,
    },
    {
      userName: "Harish Venkat",
      rating: 5,
      title: "No empty shells in the pack!",
      comment: "Usually 15% of supermarket pistachios are empty shells. Viśvam pack was 100% plump filled kernels.",
      daysAgo: 25,
    },
    {
      userName: "Natasha Cooper",
      rating: 5,
      title: "Artisanal roasting at its finest",
      comment: "Pink salt crystals provide the perfect mineral balance. Outstanding freshness.",
      daysAgo: 33,
    },
    {
      userName: "Rameshwar Dayal",
      rating: 5,
      title: "Rich green color, super fresh",
      comment: "Bright purple and emerald green inside. Shows it was fresh crop and stored properly under cold lock.",
      daysAgo: 41,
    },
    {
      userName: "Sangeeta Pai",
      rating: 4,
      title: "Crisp, flavorful and wholesome",
      comment: "Great quality pouch packaging with moisture barrier. Pistachios stayed crisp throughout monsoon.",
      daysAgo: 48,
    },
    {
      userName: "Ashish N.",
      rating: 5,
      title: "Jumbo pistachios done right",
      comment: "Large calibre, clean shells, perfectly balanced roast. My favorite dry fruit from Viśvam.",
      daysAgo: 56,
    },
    {
      userName: "Preeti Mahajan",
      rating: 5,
      title: "Five stars for taste & freshness",
      comment: "Crispy, slightly sweet, subtly savory. The best accompaniment to evening tea.",
      daysAgo: 65,
    },
    {
      userName: "Chetan Bhagat",
      rating: 5,
      title: "Premium artisanal snack",
      comment: "High fiber and rich in potassium. Perfect work-desk companion for mindful snacking.",
      daysAgo: 73,
    },
  ],

  "iranian-mamra-almonds": [
    {
      userName: "Zarina Billimoria",
      rating: 5,
      title: "50%+ oil content — real Mamra!",
      comment: "You press one almond with a spoon and the oil literally coats the surface. Authentic Chaharmahal Iranian harvest.",
      daysAgo: 3,
    },
    {
      userName: "Suresh Chandra",
      rating: 5,
      title: "Unrivaled brain booster for elders",
      comment: "Bought this for my mother. Her memory and energy levels have improved noticeably. The richest almond on earth.",
      daysAgo: 9,
    },
    {
      userName: "Kareena Sethi",
      rating: 5,
      title: "Small curve shape, immense richness",
      comment: "Do not mistake small size for low quality; real Mamra has that signature crescent curve and unmatched oil density.",
      daysAgo: 15,
    },
    {
      userName: "Dr. Homi Bhabha",
      rating: 5,
      title: "Authentic single-origin Iranian crop",
      comment: "Zero bitter seeds. Every single almond is sweet, dense, and packed with vitamin E and polyphenols.",
      daysAgo: 23,
    },
    {
      userName: "Lata Mangeshwar",
      rating: 4,
      title: "Very rich taste and aroma",
      comment: "Tastes like real royal badam. A luxury worth every single rupee.",
      daysAgo: 30,
    },
    {
      userName: "Viren Merchant",
      rating: 5,
      title: "Worth the premium price tag",
      comment: "The tin packaging keeps the moisture and oil locked. 100% authentic Mamra almonds.",
      daysAgo: 38,
    },
    {
      userName: "Nandini Piramal",
      rating: 5,
      title: "Extremely rich almond milk yield",
      comment: "Blended 10 soaked Mamra almonds for morning almond milk. Incredibly thick and naturally sweet.",
      daysAgo: 46,
    },
    {
      userName: "Manish Malhotra",
      rating: 5,
      title: "Royal presentation & purity",
      comment: "The gold foil sealed tin makes it feel like an heirloom gift. Superb quality.",
      daysAgo: 54,
    },
    {
      userName: "Rita Godrej",
      rating: 4,
      title: "Pure wellness in every bite",
      comment: "High oil content, natural sweetness, and authentic origin. Very pleased.",
      daysAgo: 62,
    },
    {
      userName: "Alok Sanghavi",
      rating: 5,
      title: "True superfood grade",
      comment: "Highest grade Mamra I have tasted outside Iran. Truly exceptional.",
      daysAgo: 71,
    },
    {
      userName: "Sameer Nair",
      rating: 5,
      title: "Purest quality Mamra",
      comment: "Authentic mountain harvest. High oil content is easily noticeable.",
      daysAgo: 80,
    },
  ],

  "afghani-organic-anjeer": [
    {
      userName: "Fazal Khan",
      rating: 5,
      title: "Soft honey core with crunchy seeds",
      comment: "Not dry or rubbery like market anjeer. These are succulent, plump, and have a rich honey syrup texture inside.",
      daysAgo: 2,
    },
    {
      userName: "Shobha De",
      rating: 5,
      title: "Zero added sugar — natural sweetness",
      comment: "Strung on traditional natural threads. Perfect digestive fiber for daily wellness.",
      daysAgo: 7,
    },
    {
      userName: "Rahul Bajaj",
      rating: 5,
      title: "Kandahar sun-dried quality",
      comment: "Large disc size with soft chew. Rich in natural calcium and potassium.",
      daysAgo: 13,
    },
    {
      userName: "Anupama Chopra",
      rating: 4,
      title: "Naturally caramelized fruit sugar",
      comment: "Soaks into a tender, jam-like texture overnight. Excellent for post-dinner sweet craving.",
      daysAgo: 19,
    },
    {
      userName: "Devendra Fadnavis",
      rating: 5,
      title: "Airtight fresh seal",
      comment: "Figs stayed soft and moist throughout the month. Zero dust or hard stems.",
      daysAgo: 28,
    },
    {
      userName: "Rashmi Thackeray",
      rating: 5,
      title: "Clean garland disc figs",
      comment: "Hand-sorted and free of sand or gritty particles. The best anjeer online.",
      daysAgo: 37,
    },
    {
      userName: "Jayant Sinha",
      rating: 5,
      title: "Delicious natural sweetness",
      comment: "Great fiber source. Plump and moist without artificial sugar coating.",
      daysAgo: 45,
    },
    {
      userName: "Sushma Swaraj",
      rating: 4,
      title: "Great for digestive health",
      comment: "Two soaked figs in the morning have worked wonders for gut health. Very pleased.",
      daysAgo: 55,
    },
    {
      userName: "Kishore Biyani",
      rating: 5,
      title: "Grade A Kandahar export crop",
      comment: "Authentic Afghan garland anjeer. Beautiful pale amber color.",
      daysAgo: 64,
    },
    {
      userName: "Geeta Phogat",
      rating: 5,
      title: "Athletic stamina booster",
      comment: "Natural carbs and iron for intense training sessions. Highly recommended.",
      daysAgo: 72,
    },
    {
      userName: "Harsh Goenka",
      rating: 5,
      title: "Exquisite honeyed flavor",
      comment: "The fruit sugars are caramelized to perfection. Fresh and delicious.",
      daysAgo: 82,
    },
  ],

  "royal-medjool-dates": [
    {
      userName: "Tariq Mansoor",
      rating: 5,
      title: "King size Medjool — melts in mouth!",
      comment: "Super jumbo size with paper-thin skin and a thick, fudge-like caramel center. The fruit of kings indeed.",
      daysAgo: 3,
    },
    {
      userName: "Sara Ali",
      rating: 5,
      title: "Rich caramel & brown sugar notes",
      comment: "Tastes like gourmet caramel confectionery, yet 100% natural fruit. Perfect pre-workout fuel.",
      daysAgo: 8,
    },
    {
      userName: "Ibrahim Qureshi",
      rating: 5,
      title: "Plump, moist and zero crystallisation",
      comment: "Fresh crop with soft moist flesh. Stored under cold lock so there is zero hard sugar crust.",
      daysAgo: 16,
    },
    {
      userName: "Zoya Akhtar",
      rating: 5,
      title: "Stuffed with walnuts — heavenly!",
      comment: "Split open a Medjool date and insert a Kashmiri walnut half. The ultimate healthy dessert.",
      daysAgo: 24,
    },
    {
      userName: "Kabir Bedi",
      rating: 4,
      title: "Large jumbo Jericho dates",
      comment: "Extremely satisfying size. Just 2 dates provide long-lasting natural energy.",
      daysAgo: 32,
    },
    {
      userName: "Nargis Fakhri",
      rating: 5,
      title: "High iron & instant vitality",
      comment: "Soft texture and rich aroma. Outstanding quality packaging box.",
      daysAgo: 40,
    },
    {
      userName: "Arbaaz Merchant",
      rating: 5,
      title: "Luxurious royal presentation",
      comment: "Ordered 5 boxes for Ramadan gifting. Every recipient called to ask where I bought them.",
      daysAgo: 49,
    },
    {
      userName: "Fatima Sana",
      rating: 5,
      title: "Zero additives, 100% natural",
      comment: "No glucose coating or artificial shine. Pure authentic Medjool king dates.",
      daysAgo: 58,
    },
    {
      userName: "Yusuf Pathan",
      rating: 4,
      title: "Rich energy for sports",
      comment: "Chewy, caramel-rich, packed with potassium and natural fructose. Top class.",
      daysAgo: 66,
    },
    {
      userName: "Salma Agha",
      rating: 5,
      title: "Best dates available in India",
      comment: "Large, soft, and moist. Truly feels like royalty.",
      daysAgo: 75,
    },
    {
      userName: "Naseeruddin Shah",
      rating: 5,
      title: "Plump, natural caramel sweetness",
      comment: "No sugar syrup or processing. Pure pristine sun-ripened Medjool dates.",
      daysAgo: 85,
    },
  ],

  "afghan-green-raisins": [
    {
      userName: "Urmila Matondkar",
      rating: 5,
      title: "Extra-long slender berries",
      comment: "Shade dried in traditional rooms. Vivid green color with sweet & tangy balance. Zero seeds.",
      daysAgo: 4,
    },
    {
      userName: "Girish Karnad",
      rating: 5,
      title: "Tart and sweet harmony",
      comment: "Not overly sugary like dark raisins. The natural acidity makes them incredibly refreshing.",
      daysAgo: 11,
    },
    {
      userName: "Asha Bhosle",
      rating: 5,
      title: "Soft chew without stickiness",
      comment: "Pristine green raisins, clean and free of stems. Wonderful in homemade kheer and pulao.",
      daysAgo: 19,
    },
    {
      userName: "Nitin Gadkari",
      rating: 4,
      title: "High iron content",
      comment: "Soaked in water overnight for daily blood wellness. Very good quality and clean.",
      daysAgo: 28,
    },
    {
      userName: "Rekha Ganesan",
      rating: 5,
      title: "Shade-dried green hue",
      comment: "Natural pale jade green without sulfur bleaching. True Afghani origin.",
      daysAgo: 38,
    },
    {
      userName: "Sunil Gavaskar",
      rating: 5,
      title: "Energy booster on the go",
      comment: "Carry a small pouch during golf rounds. Instant clean glucose and hydration.",
      daysAgo: 47,
    },
    {
      userName: "Madhuri Dixit",
      rating: 5,
      title: "Plump long raisins",
      comment: "Uniform slender shape and delightful sweet flavor. Very pleased with Viśvam.",
      daysAgo: 57,
    },
    {
      userName: "Anil Kumble",
      rating: 4,
      title: "Great culinary quality",
      comment: "Adds an elegant royal touch to festive biryani and dessert platters.",
      daysAgo: 67,
    },
    {
      userName: "Sharmila Tagore",
      rating: 5,
      title: "Exceptional purity",
      comment: "Sweet, juicy, and delicate skin. Excellent Afghan kishmish.",
      daysAgo: 76,
    },
    {
      userName: "Pankaj Udhas",
      rating: 5,
      title: "Delightful natural snack",
      comment: "Great quality zip lock pouch ensures zero drying out. 5 stars.",
      daysAgo: 84,
    },
    {
      userName: "Kailash Kher",
      rating: 5,
      title: "Sweet and tangy delight",
      comment: "Long slender raisins with fresh fruity taste. Superb accompaniment to tea.",
      daysAgo: 91,
    },
  ],

  "wild-dried-berries-mix": [
    {
      userName: "Tara Sutaria",
      rating: 5,
      title: "Succulent whole cranberries & wild blueberries!",
      comment: "Vibrant ruby cranberries and dark wild blueberries. Lightly sweetened with apple juice, not heavy corn syrup.",
      daysAgo: 2,
    },
    {
      userName: "Karan Johar",
      rating: 5,
      title: "High antioxidant immunity boost",
      comment: "Add a spoonful to Greek yogurt and granola every morning. Delicious tart flavor.",
      daysAgo: 9,
    },
    {
      userName: "Jacqueline Fernandez",
      rating: 5,
      title: "Juicy burst of natural berry juice",
      comment: "Plump whole berries that do not feel dry or leathery. Outstanding quality.",
      daysAgo: 17,
    },
    {
      userName: "Manish Pandey",
      rating: 4,
      title: "Great salad topping",
      comment: "Pairs wonderfully with goat cheese, walnuts, and baby spinach salad. Very versatile.",
      daysAgo: 26,
    },
    {
      userName: "Kiara Advani",
      rating: 5,
      title: "Urinary & skin health support",
      comment: "Pure wild harvest without artificial colors or preservatives. Tastes like real fresh berries.",
      daysAgo: 35,
    },
    {
      userName: "Sid Malhotra",
      rating: 5,
      title: "Pre-workout energy punch",
      comment: "Toss in trail mix before morning run. Fast, natural, antioxidant-rich fuel.",
      daysAgo: 45,
    },
    {
      userName: "Sonam Kapoor",
      rating: 5,
      title: "Clean packaging, plump berries",
      comment: "Glass jar looks chic and keeps moisture locked. Zero sticky clumps.",
      daysAgo: 54,
    },
    {
      userName: "Anand Ahuja",
      rating: 4,
      title: "Very refreshing tangy berry mix",
      comment: "Natural ruby tones, deep blueberry flavor. Will repurchase regularly.",
      daysAgo: 63,
    },
    {
      userName: "Kriti Sanon",
      rating: 5,
      title: "Favorite healthy sweet treat",
      comment: "Satisfies post-lunch sugar cravings without guilt. Highly recommended.",
      daysAgo: 72,
    },
    {
      userName: "Varun Dhawan",
      rating: 5,
      title: "Top quality Pacific Northwest berries",
      comment: "Fresh, juicy, and rich in natural polyphenols. Top tier.",
      daysAgo: 81,
    },
    {
      userName: "Shraddha Kapoor",
      rating: 5,
      title: "Bright and flavorful",
      comment: "The combination of cranberries and blueberries is delicious on morning oatmeal.",
      daysAgo: 89,
    },
  ],

  "queensland-macadamia-nuts": [
    {
      userName: "Chef Sanjeev Kapoor",
      rating: 5,
      title: "Silky buttery crunch — Style 1 whole kernels!",
      comment: "Macadamias are the world's most luxurious nut. These Australian Style 1 whole kernels are ultra-buttery and fresh.",
      daysAgo: 5,
    },
    {
      userName: "Rhea Chakraborty",
      rating: 5,
      title: "Keto holy grail nut",
      comment: "High in healthy monounsaturated fats and low carb. The rich, velvety texture is pure indulgence.",
      daysAgo: 12,
    },
    {
      userName: "Chef Vikas Khanna",
      rating: 5,
      title: "Subterranean Australian soil sweetness",
      comment: "Lightly cream-colored with zero bitter notes. A rare culinary treasure.",
      daysAgo: 21,
    },
    {
      userName: "Dia Mirza",
      rating: 5,
      title: "Cold-shelled perfection",
      comment: "Cold shelling preserves the fragile oil structure. Truly remarkable mouthfeel.",
      daysAgo: 31,
    },
    {
      userName: "Ranveer Singh",
      rating: 4,
      title: "Pure decadence",
      comment: "Super rich, buttery, and filling. Just 4-5 nuts give you a massive energy boost.",
      daysAgo: 41,
    },
    {
      userName: "Deepika Padukone",
      rating: 5,
      title: "Exotic and premium quality",
      comment: "Flawlessly packed in heavy glass jar. Premium gifting quality.",
      daysAgo: 51,
    },
    {
      userName: "Nikhil Kamath",
      rating: 5,
      title: "Best macadamias in India",
      comment: "Clean sourcing, unbroken whole spheres. Worth the premium price.",
      daysAgo: 61,
    },
    {
      userName: "Rohit Shetty",
      rating: 4,
      title: "Smooth, velvety texture",
      comment: "Very high natural fat content. Great with dark roast espresso.",
      daysAgo: 70,
    },
    {
      userName: "Mira Rajput",
      rating: 5,
      title: "Unrivaled luxury snack",
      comment: "Kids and elders both loved the smooth creamy bite. 10/10.",
      daysAgo: 79,
    },
    {
      userName: "Shahid Kapoor",
      rating: 5,
      title: "Clean healthy fats",
      comment: "Best fuel for intermittent fasting windows. Top quality.",
      daysAgo: 88,
    },
    {
      userName: "Farah Khan",
      rating: 5,
      title: "Heavenly rich taste",
      comment: "Ultra creamy and fresh. Easily the best macadamia nuts in the country.",
      daysAgo: 94,
    },
  ],

  "7-in-1-superseeds-mix": [
    {
      userName: "Milind Soman",
      rating: 5,
      title: "The daily health powerhouse!",
      comment: "Pumpkin, Sunflower, Flax, Chia, Sesame, Watermelon and Hemp seeds dry-roasted without oil. High zinc & plant protein.",
      daysAgo: 1,
    },
    {
      userName: "Ankita Konwar",
      rating: 5,
      title: "Light pink salt crunch",
      comment: "Zero oily residue. Just clean, light roasted seeds with a delicate salty crunch. Sprinkled over smoothie bowls daily.",
      daysAgo: 6,
    },
    {
      userName: "Shilpa Shetty",
      rating: 5,
      title: "Complete 7-seed synergy",
      comment: "Getting all 7 superseeds in one balanced mix saves so much kitchen prep time. Great for hair and skin health.",
      daysAgo: 14,
    },
    {
      userName: "Sunil Grover",
      rating: 4,
      title: "Crispy and guilt-free",
      comment: "Keep a pouch on my work desk. Whenever I want to munch, this is healthy and satisfying.",
      daysAgo: 22,
    },
    {
      userName: "Mandira Bedi",
      rating: 5,
      title: "High magnesium & omega 3",
      comment: "Noticeable boost in recovery after workouts. Top quality seed harvest.",
      daysAgo: 32,
    },
    {
      userName: "Rajkummar Rao",
      rating: 5,
      title: "Fresh roast, zero bitterness",
      comment: "Flax and hemp seeds are notoriously hard to roast without turning bitter; Viśvam nailed the roasting time.",
      daysAgo: 42,
    },
    {
      userName: "Patralekhaa",
      rating: 5,
      title: "Great on avocado toast",
      comment: "Adds a fantastic texture and nutty crunch to morning sourdough toasts.",
      daysAgo: 52,
    },
    {
      userName: "Abhinav Bindra",
      rating: 4,
      title: "Clean nutritional profile",
      comment: "Excellent plant protein source with rich zinc profile. Very clean.",
      daysAgo: 62,
    },
    {
      userName: "Sania Mirza",
      rating: 5,
      title: "Freshness locked pouch",
      comment: "No stale seed oil odor. Remains fragrant and crisp for weeks.",
      daysAgo: 72,
    },
    {
      userName: "Mary Kom",
      rating: 5,
      title: "Champion wellness snack",
      comment: "Nutrient dense and energetic. 5 stars from me.",
      daysAgo: 82,
    },
    {
      userName: "Bhaichung Bhutia",
      rating: 5,
      title: "Superb daily stamina blend",
      comment: "Great quality seeds, crunchy and roasted to perfection.",
      daysAgo: 92,
    },
  ],

  "royal-heritage-gift-box": [
    {
      userName: "Mukesh Ambani",
      rating: 5,
      title: "Opulent executive corporate gifting",
      comment: "Ordered 50 boxes for our executive partners. The emerald & gold presentation, magnetic closure, and airtight-sealed dry fruits made a lasting impression.",
      daysAgo: 4,
    },
    {
      userName: "Nita Ambani",
      rating: 5,
      title: "Exquisite craftsmanship & ribboning",
      comment: "Every compartment featuring Jumbo Almonds, W240 Cashews, Kashmiri Walnuts, and Roasted Pistachios was pristine.",
      daysAgo: 10,
    },
    {
      userName: "Adar Poonawalla",
      rating: 5,
      title: "Gold standard Diwali gifting",
      comment: "The highest grade nuts presented with true royal dignity. Arrived flawlessly packed.",
      daysAgo: 18,
    },
    {
      userName: "Natasha Poonawalla",
      rating: 5,
      title: "Stunning keepsake gift box",
      comment: "The box itself is a work of art. The recipients were blown away by the quality of the nuts inside.",
      daysAgo: 27,
    },
    {
      userName: "Kumar Mangalam Birla",
      rating: 5,
      title: "Flawless packaging and freshness",
      comment: "Vacuum sealed compartments ensure the nuts taste as fresh as the day they were harvested.",
      daysAgo: 37,
    },
    {
      userName: "Ananya Birla",
      rating: 5,
      title: "Pure luxury gift experience",
      comment: "The unboxing experience is magnificent. Highly recommended for weddings and VIP client gifts.",
      daysAgo: 48,
    },
    {
      userName: "Ratan Tata",
      rating: 5,
      title: "Dignified quality and care",
      comment: "Exemplary attention to detail in sourcing and presentation. Truly royal.",
      daysAgo: 58,
    },
    {
      userName: "Azim Premji",
      rating: 4,
      title: "Splendid assortment of royal nuts",
      comment: "Generous portions in each section. Delivered on time with premium courier care.",
      daysAgo: 68,
    },
    {
      userName: "Roshni Nadar",
      rating: 5,
      title: "VIP client gifting perfection",
      comment: "Our board members and clients were thoroughly delighted. Will be our permanent annual gift partner.",
      daysAgo: 78,
    },
    {
      userName: "Kiran Mazumdar Shaw",
      rating: 5,
      title: "Unmatched elegance and taste",
      comment: "Five stars across the board for aesthetics, freshness, and heritage quality.",
      daysAgo: 88,
    },
    {
      userName: "Gautam Adani",
      rating: 5,
      title: "Exceptional corporate gift",
      comment: "Unmatched presentation and freshness. Perfect for festive celebrations.",
      daysAgo: 95,
    },
  ],

  "festive-nut-berry-celebration": [
    {
      userName: "Shashi Tharoor",
      rating: 5,
      title: "A confluence of artisanal excellence",
      comment: "An opulent octagonal presentation featuring Mamra almonds, Wild Berries, King Dates, and Macadamia nuts. Exquisite in every sense.",
      daysAgo: 3,
    },
    {
      userName: "Priyanka Chopra",
      rating: 5,
      title: "The centerpiece of our festive table",
      comment: "The combination of vibrant berries and royal nuts looks stunning when entertaining guests. Everyone loved it.",
      daysAgo: 11,
    },
    {
      userName: "Nick Jonas",
      rating: 5,
      title: "Incredible flavor variety",
      comment: "The sweet Medjool dates and savory roasted nuts pair so well together. Best gift platter ever.",
      daysAgo: 20,
    },
    {
      userName: "Anil Ambani",
      rating: 4,
      title: "Grand festive presentation",
      comment: "Generous 1kg assortment. Beautiful ribbon and personalized gift card included.",
      daysAgo: 30,
    },
    {
      userName: "Tina Ambani",
      rating: 5,
      title: "Royal heritage aesthetics",
      comment: "The warm gold and sand tones on the box are timeless. Freshness was intact across all 6 compartments.",
      daysAgo: 40,
    },
    {
      userName: "Gauri Khan",
      rating: 5,
      title: "Designer grade dry fruit hamper",
      comment: "The aesthetic harmony and tactile quality of the box are unmatched in the Indian market.",
      daysAgo: 50,
    },
    {
      userName: "Shah Rukh Khan",
      rating: 5,
      title: "Pure royal indulgence",
      comment: "Each item reflects supreme quality. A gift fit for royalty.",
      daysAgo: 60,
    },
    {
      userName: "Karan Adani",
      rating: 5,
      title: "Top tier festive collection",
      comment: "Impeccable vacuum sealing and fast delivery. Very satisfied.",
      daysAgo: 70,
    },
    {
      userName: "Parineeti Chopra",
      rating: 4,
      title: "Wonderful gourmet variety",
      comment: "The wild berries and macadamia nuts make this platter stand out from regular gift boxes.",
      daysAgo: 80,
    },
    {
      userName: "Raghav Chadha",
      rating: 5,
      title: "Unrivaled quality and taste",
      comment: "Extremely fresh and delicious. A staple for all family celebrations.",
      daysAgo: 90,
    },
    {
      userName: "Kareena Kapoor Khan",
      rating: 5,
      title: "Exquisite festive hamper",
      comment: "Luxurious arrangement, delicious nuts, and stunning gift box.",
      daysAgo: 96,
    },
  ],
};

export async function seedReviews() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/visvam_harvest";
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
    console.log("🌱 Seeding Reviews for all products...");

    // Clear existing reviews to ensure clean state
    await Review.deleteMany({});

    const products = await Product.find({});
    let totalReviewsCreated = 0;

    for (const product of products) {
      const templates = reviewsByProduct[product.slug] || reviewsByProduct["california-jumbo-almonds"];

      const reviewsToInsert = templates.map((tmpl) => {
        const reviewDate = new Date();
        reviewDate.setDate(reviewDate.getDate() - tmpl.daysAgo);

        return {
          user: new mongoose.Types.ObjectId(),
          product: product._id,
          productSlug: product.slug,
          userName: tmpl.userName,
          rating: tmpl.rating,
          title: tmpl.title,
          comment: tmpl.comment,
          createdAt: reviewDate,
          updatedAt: reviewDate,
        };
      });

      await Review.insertMany(reviewsToInsert);
      totalReviewsCreated += reviewsToInsert.length;

      // Update Product rating & numReviews
      const avgRating =
        Math.round(
          (reviewsToInsert.reduce((sum, r) => sum + r.rating, 0) / reviewsToInsert.length) * 10
        ) / 10;

      product.rating = avgRating;
      product.numReviews = reviewsToInsert.length;
      await product.save();

      console.log(
        `⭐ [${product.slug}] Seeded ${reviewsToInsert.length} reviews (Avg Rating: ${avgRating} / 5.0)`
      );
    }

    console.log(`\n🎉 Reviews Seed Complete! Total reviews inserted: ${totalReviewsCreated}`);
  } catch (err: any) {
    console.error("❌ Error seeding reviews:", err.message);
  }
}

// Allow standalone execution: npx tsx src/scripts/seedReviews.ts
if (process.argv[1]?.endsWith("seedReviews.ts") || process.argv[1]?.endsWith("seedReviews.js")) {
  seedReviews().then(() => mongoose.disconnect());
}
