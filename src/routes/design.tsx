import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import {
  Sparkles,
  Zap,
  Camera,
  Activity,
  Flame,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Globe2,
  Target,
  Play,
  Check,
  Star,
  MessageCircle,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/design")({
  head: () => ({
    meta: [
      { title: "FitBharat AI — Next-Gen AI Fitness & Nutrition Ecosystem" },
      {
        name: "description",
        content: "Experience FitBharat AI: Real-time camera posture correction for Asanas & Gym, instant macro photo scanner for Indian food, and 24/7 Hinglish AI Voice Coach.",
      },
      { property: "og:title", content: "FitBharat AI — AI Fitness App for India" },
      { property: "og:description", content: "AI-powered workout pose correction and Indian diet tracking." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://visvam.in/design" },
    ],
    links: [{ rel: "canonical", href: "https://visvam.in/design" }],
  }),
  component: FitBharatAIDesignPage,
});

// Sample Indian Food Scanning Data
const INDIAN_FOODS = [
  {
    id: "roti-paneer",
    name: "2 Roti + Paneer Butter Masala (150g)",
    calories: 480,
    protein: "22g",
    carbs: "54g",
    fats: "18g",
    score: "92/100 • Optimal Post-Workout",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "masala-dosa",
    name: "Crispy Masala Dosa + Sambar & Chutney",
    calories: 390,
    protein: "9g",
    carbs: "68g",
    fats: "11g",
    score: "85/100 • High Carb Energy",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "dal-chawal",
    name: "Yellow Dal Tadka + Basmati Rice (1 Cup)",
    calories: 340,
    protein: "14g",
    carbs: "62g",
    fats: "5g",
    score: "89/100 • Balanced Protein",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "tandoori-chicken",
    name: "Tandoori Chicken Breast + Mint Chutney",
    calories: 320,
    protein: "42g",
    carbs: "4g",
    fats: "12g",
    score: "98/100 • Lean Muscle Fuel",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80",
  },
];

// Sample AI Workout Poses
const AI_POSES = [
  {
    id: "surya-namaskar",
    name: "Surya Namaskar (Sun Salutation)",
    type: "Yoga Asana",
    accuracy: "98.6%",
    feedback: "Spine curvature optimal. Extend arms 5° further upwards.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "barbell-squat",
    name: "Barbell Back Squat",
    type: "Strength",
    accuracy: "96.4%",
    feedback: "Depth achieved (Parallel 90°). Keep chest upright on ascend.",
    image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "bhujangasana",
    name: "Bhujangasana (Cobra Pose)",
    type: "Flexibility & Core",
    accuracy: "99.1%",
    feedback: "Perfect pelvis contact. Shoulders relaxed away from ears.",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80",
  },
];

// Marquee Brand Logos
const TRUSTED_BRANDS = [
  "CULT.FIT",
  "GOLD'S GYM INDIA",
  "ANYTIME FITNESS",
  "MUSCLEBLAZE",
  "HEALTHIFYME ALUMNI",
  "FITPAGE",
  "SPORTS AUTHORITY OF INDIA",
  "FITINDIA MOVEMENT",
];

function FitBharatAIDesignPage() {
  const [selectedFood, setSelectedFood] = useState(INDIAN_FOODS[0]);
  const [selectedPose, setSelectedPose] = useState(AI_POSES[0]);
  const [isScanning, setIsScanning] = useState(false);

  // Macro Calculator State
  const [weight, setWeight] = useState(70);
  const [goal, setGoal] = useState<"loss" | "muscle" | "maintenance">("muscle");
  const [dietType, setDietType] = useState<"veg" | "nonveg" | "jain">("veg");

  const calculateTarget = () => {
    let calories = weight * 30;
    if (goal === "loss") calories -= 400;
    if (goal === "muscle") calories += 350;
    const protein = Math.round(weight * (goal === "muscle" ? 1.8 : 1.4));
    return { calories, protein };
  };

  const targets = calculateTarget();

  const handleScanClick = (food: typeof INDIAN_FOODS[0]) => {
    setIsScanning(true);
    setSelectedFood(food);
    setTimeout(() => setIsScanning(false), 500);
  };

  return (
    <SiteLayout>
      {/* Inline Animation Styles for Marquee & Glow Effects */}
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-infinite {
          display: flex;
          width: max-content;
          animation: marqueeScroll 20s linear infinite;
        }
        .animate-marquee-infinite:hover {
          animation-play-state: paused;
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }
        .animate-glow-pulse {
          animation: pulseGlow 6s ease-in-out infinite;
        }
      `}</style>

      <div className="bg-[#030712] text-slate-100 min-h-screen font-sans selection:bg-violet-500 selection:text-white relative overflow-hidden">
        {/* Ambient Cosmic Background Lights */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-violet-600/20 via-indigo-600/10 to-transparent rounded-full blur-[150px] pointer-events-none animate-glow-pulse" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-2/3 left-0 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Hero Section */}
        <section className="relative pt-20 pb-20 md:pt-28 md:pb-28">
          <div className="max-w-[1280px] mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold tracking-wide backdrop-blur-md">
                <Sparkles size={14} className="text-cyan-400 animate-spin" />
                <span>🇮🇳 India&apos;s 1st AI Fitness & Nutrition Ecosystem</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                Transform Your Body with AI Built For{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
                  Indian Diets & Workouts
                </span>.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
                Instant AR photo scanner for Roti, Paneer & Dal. Real-time camera posture correction for Yoga & Gym, backed by vernacular AI voice coaches in 6 Indian languages.
              </p>

              {/* New Futuristic Pill Button Layout */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-5">
                <a
                  href="#scanner-demo"
                  className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-95 text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_35px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] flex items-center justify-center gap-3 text-sm tracking-wide group"
                >
                  <span>Try Live AI Scanner</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </a>

                <a
                  href="#pricing"
                  className="w-full sm:w-auto px-9 py-4 bg-slate-900/80 hover:bg-slate-800 border border-violet-500/30 hover:border-cyan-400/50 text-slate-200 font-medium rounded-full transition-all duration-300 backdrop-blur-md text-sm flex items-center justify-center gap-2.5"
                >
                  <Play size={15} className="fill-current text-cyan-400" />
                  <span>Watch 1-Min Demo</span>
                </a>
              </div>

              {/* Micro Metrics */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-8 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400" />
                  <span className="text-slate-200 font-medium">1.2M+ Active Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-violet-400" />
                  <span className="text-slate-200 font-medium">50,000+ Indian Dishes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-fuchsia-400" />
                  <span className="text-slate-200 font-medium">98.6% Pose Correction</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Trusted By Infinite Horizontal Scrolling Marquee */}
        <section className="py-10 border-y border-slate-800/60 bg-slate-950/40 relative overflow-hidden">
          <div className="max-w-[1280px] mx-auto px-6 mb-4 text-center">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
              Trusted by 1.2M+ Athletes & Leading Fitness Chains Across India
            </p>
          </div>

          <div className="relative w-full overflow-hidden flex items-center">
            {/* Gradient Fades for Left and Right Edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030712] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030712] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee-infinite flex items-center gap-12 sm:gap-16 text-slate-400 font-bold text-sm tracking-wider font-mono">
              {[...TRUSTED_BRANDS, ...TRUSTED_BRANDS].map((brand, idx) => (
                <div key={idx} className="flex items-center gap-3 shrink-0 hover:text-cyan-400 transition-colors">
                  <span className="text-violet-500 text-xs">◆</span>
                  <span>{brand}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 1: AI Food Vision Engine (Fluid Layout - No Cards) */}
        <section id="scanner-demo" className="py-24 relative">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="max-w-3xl mb-16 space-y-4">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Snap Any Indian Plate. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
                  Get Instant AR Macros.
                </span>
              </h2>
              <p className="text-base text-slate-400 leading-relaxed">
                Traditional calorie apps fail on Indian thalis, curry oil, and ghee. FitBharat AI uses multi-spectral vision trained on 50,000+ Indian household recipes.
              </p>
            </div>

            {/* Fluid Split Showcase (No Boxed Cards) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Fluid Interactive Selection */}
              <div className="lg:col-span-5 space-y-4">
                {INDIAN_FOODS.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleScanClick(food)}
                    className={`p-5 rounded-2xl transition-all cursor-pointer border-l-4 ${
                      selectedFood.id === food.id
                        ? "border-l-cyan-400 bg-gradient-to-r from-violet-950/40 via-slate-900/60 to-transparent text-white"
                        : "border-l-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-100">{food.name}</h3>
                      <ChevronRight size={18} className={selectedFood.id === food.id ? "text-cyan-400" : "text-slate-600"} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{food.score}</p>
                  </div>
                ))}
              </div>

              {/* Right Column: Fluid Camera Scanner Preview */}
              <div className="lg:col-span-7 relative">
                <div className="relative rounded-3xl overflow-hidden border border-violet-500/30 bg-slate-950 aspect-video sm:aspect-[16/10] shadow-[0_0_60px_rgba(139,92,246,0.15)] flex items-center justify-center">
                  <img
                    src={selectedFood.image}
                    alt={selectedFood.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isScanning ? "opacity-30" : "opacity-85"}`}
                  />

                  {/* Scanning Reticle & Floating HUD */}
                  <div className="absolute inset-0 m-6 border border-cyan-400/40 rounded-2xl pointer-events-none p-5 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-xs font-mono text-cyan-300 bg-slate-950/80 px-3 py-1.5 rounded-full border border-cyan-400/30 self-start backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2 inline-block" />
                      AI VISION CAMERA ACTIVE
                    </div>

                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] animate-bounce" />
                    )}

                    {/* HUD Macro Output */}
                    <div className="self-end bg-slate-950/90 backdrop-blur-xl border border-violet-500/30 p-5 rounded-2xl max-w-sm text-left shadow-2xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{selectedFood.name}</span>
                        <span className="text-[10px] bg-violet-500/20 text-violet-300 font-mono px-2 py-0.5 rounded border border-violet-500/30">
                          {selectedFood.score}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-3 text-center pt-3 border-t border-slate-800">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">Calories</p>
                          <p className="text-sm font-bold font-mono text-white">{selectedFood.calories}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">Protein</p>
                          <p className="text-sm font-bold font-mono text-violet-400">{selectedFood.protein}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">Carbs</p>
                          <p className="text-sm font-bold font-mono text-fuchsia-400">{selectedFood.carbs}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">Fats</p>
                          <p className="text-sm font-bold font-mono text-cyan-400">{selectedFood.fats}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Real-time AI Workout & Yoga Pose Tracking */}
        <section className="py-24 relative border-t border-slate-800/60">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column Text */}
              <div className="lg:col-span-5 space-y-6">
                <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                  Zero Injury. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400">
                    Perfect Form on Asanas & Lifts.
                  </span>
                </h2>
                <p className="text-base text-slate-400 leading-relaxed">
                  Place your phone on the floor. FitBharat AI tracks 33 skeletal joints at 60 FPS. Receive instant audio feedback in Hindi or English if your knees cave during squats or your back arch breaks in Surya Namaskar.
                </p>

                {/* Pose Selection List */}
                <div className="space-y-3 pt-2">
                  {AI_POSES.map((pose) => (
                    <div
                      key={pose.id}
                      onClick={() => setSelectedPose(pose)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        selectedPose.id === pose.id
                          ? "bg-slate-900/90 border-cyan-400/80 shadow-lg text-white"
                          : "bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold">{pose.name}</span>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{pose.accuracy} Acc</span>
                      </div>
                      <p className="text-xs text-slate-400">{pose.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column Skeleton Tracking Visual */}
              <div className="lg:col-span-7">
                <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-950 aspect-video shadow-[0_0_60px_rgba(6,182,212,0.15)] flex items-center justify-center">
                  <img
                    src={selectedPose.image}
                    alt={selectedPose.name}
                    className="w-full h-full object-cover opacity-60"
                  />

                  {/* Holographic AI Joint Points */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[35%] left-[45%] w-3.5 h-3.5 bg-cyan-400 rounded-full animate-ping" />
                    <div className="absolute top-[48%] left-[40%] w-3.5 h-3.5 bg-cyan-400 rounded-full" />
                    <div className="absolute top-[48%] left-[50%] w-3.5 h-3.5 bg-cyan-400 rounded-full" />
                    <div className="absolute top-[68%] left-[38%] w-3.5 h-3.5 bg-cyan-400 rounded-full" />
                    <div className="absolute top-[68%] left-[52%] w-3.5 h-3.5 bg-cyan-400 rounded-full" />

                    <svg className="absolute inset-0 w-full h-full stroke-cyan-400/80 stroke-2 fill-none">
                      <line x1="45%" y1="35%" x2="40%" y2="48%" strokeDasharray="4" />
                      <line x1="45%" y1="35%" x2="50%" y2="48%" strokeDasharray="4" />
                      <line x1="40%" y1="48%" x2="38%" y2="68%" />
                      <line x1="50%" y1="48%" x2="52%" y2="68%" />
                    </svg>
                  </div>

                  {/* Voice Feedback HUD */}
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 backdrop-blur-xl border border-cyan-400/40 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Zap size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">AI Voice Nudge (Hinglish):</p>
                        <p className="text-xs text-cyan-300 font-mono">&quot;Boht badiya! Keep chest open and hold pose for 5 seconds.&quot;</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950 px-2.5 py-1 rounded-md border border-cyan-400/30">
                      99% FORM
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Engineered For The Indian Household (Borderless Feature Rows) */}
        <section className="py-24 border-t border-slate-800/60 relative">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="max-w-2xl mb-16">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight">
                Engineered For The <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  Indian Household
                </span>
              </h2>
            </div>

            {/* Borderless Horizontal Feature Rows */}
            <div className="divide-y divide-slate-800/80">
              <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:px-4 transition-all duration-300 rounded-2xl hover:bg-slate-900/40">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
                    <Flame size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Ghar Ka Khana Macro Engine</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-xl">
                      Trained on authentic cooking methods including ghee measure, tadka oil calculation, and homemade grain types (Gehu, Jowar, Bajra, Ragi).
                    </p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-slate-600 group-hover:text-violet-400 group-hover:translate-x-2 transition-all hidden md:block" />
              </div>

              <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:px-4 transition-all duration-300 rounded-2xl hover:bg-slate-900/40">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center shrink-0 border border-fuchsia-500/20">
                    <Globe2 size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Vernacular AI Voice Coach</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-xl">
                      Switch seamlessly between Hindi, English, Hinglish, Tamil, Telugu, and Kannada. Get personalized encouragement in your preferred native voice.
                    </p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-slate-600 group-hover:text-fuchsia-400 group-hover:translate-x-2 transition-all hidden md:block" />
              </div>

              <div className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:px-4 transition-all duration-300 rounded-2xl hover:bg-slate-900/40">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
                    <MessageCircle size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">WhatsApp Nudges & Meal Reminders</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-xl">
                      No need to open the app constantly. Receive automated workout reminders, water logging & meal notifications directly on WhatsApp.
                    </p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-2 transition-all hidden md:block" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Interactive Daily Macro Calculator */}
        <section className="py-24 border-t border-slate-800/60 relative">
          <div className="max-w-[1100px] mx-auto px-6">
            <div className="mb-12 text-center max-w-xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Calculate Your Daily Indian Macro Target
              </h2>
              <p className="text-sm text-slate-400">Instant AI recommendation for your daily body composition goals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Your Body Weight (kg):</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value) || 60)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-full px-5 py-3.5 text-sm text-white font-mono outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Fitness Goal:</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-full px-5 py-3.5 text-sm text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="muscle">Muscle Gain & Strength</option>
                  <option value="loss">Fat Loss & Toning</option>
                  <option value="maintenance">General Health & Yoga</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Diet Type:</label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as any)}
                  className="w-full bg-slate-900/80 border border-slate-800 rounded-full px-5 py-3.5 text-sm text-white outline-none focus:border-cyan-400 transition"
                >
                  <option value="veg">Pure Vegetarian (Paneer, Soya, Dal)</option>
                  <option value="nonveg">Non-Veg (Eggs, Chicken, Fish)</option>
                  <option value="jain">Jain Diet (No Onion/Garlic)</option>
                </select>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-violet-950/40 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2">Recommended Daily AI Targets:</p>
                <div className="flex items-center gap-8">
                  <div>
                    <span className="text-4xl font-extrabold font-mono text-white">{targets.calories}</span>
                    <span className="text-xs text-slate-400 ml-1.5">kcal/day</span>
                  </div>
                  <div className="h-10 w-px bg-slate-800" />
                  <div>
                    <span className="text-4xl font-extrabold font-mono text-cyan-400">{targets.protein}g</span>
                    <span className="text-xs text-slate-400 ml-1.5">Protein Target</span>
                  </div>
                </div>
              </div>

              <a
                href="#pricing"
                className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold rounded-full transition-all duration-300 shadow-[0_0_25px_rgba(139,92,246,0.4)] text-center shrink-0 uppercase tracking-wider"
              >
                Get Custom AI Meal Plan
              </a>
            </div>
          </div>
        </section>

        {/* Section 5: Transparent Pricing */}
        <section id="pricing" className="py-24 border-t border-slate-800/60 relative">
          <div className="max-w-[1280px] mx-auto px-6">
            <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
                Start Your Transformation Today
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Plan 1 */}
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Starter Free</h3>
                  <p className="text-xs text-slate-400 mt-1">For casual fitness enthusiasts</p>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-white">₹0</span>
                    <span className="text-xs text-slate-400 ml-1">/ forever</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> 3 AI Food Scans per day</li>
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> Manual Macro Logging</li>
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> Basic Workout Library</li>
                  </ul>
                </div>
                <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-full font-semibold text-xs transition">
                  Download App Free
                </button>
              </div>

              {/* Plan 2 Featured */}
              <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950/60 border-2 border-violet-500 shadow-[0_0_50px_rgba(139,92,246,0.3)] flex flex-col justify-between space-y-6 relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-cyan-400 text-black px-4 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider">
                  MOST POPULAR IN INDIA
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Pro Transformation</h3>
                  <p className="text-xs text-slate-400 mt-1">Full AI Vision & Voice Coaching</p>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-cyan-400">₹399</span>
                    <span className="text-xs text-slate-400 ml-1">/ month</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-xs text-slate-200">
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> Unlimited AI Food Photo Scans</li>
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> Unlimited Camera Pose Correction</li>
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> WhatsApp Nudges & Reminders</li>
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> 6 Vernacular Voice AI Coaches</li>
                  </ul>
                </div>
                <button className="w-full py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:opacity-95 text-white font-bold rounded-full text-xs tracking-wider shadow-lg transition">
                  Start 14-Day Free Trial
                </button>
              </div>

              {/* Plan 3 */}
              <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">AI + Certified Coach</h3>
                  <p className="text-xs text-slate-400 mt-1">Personal Human Dietitian + AI System</p>
                  <div className="mt-6">
                    <span className="text-4xl font-extrabold text-white">₹1,299</span>
                    <span className="text-xs text-slate-400 ml-1">/ month</span>
                  </div>
                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> Everything in Pro Plan</li>
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> Weekly Call with Certified Dietitian</li>
                    <li className="flex items-center gap-2.5"><Check size={16} className="text-cyan-400" /> Customized Medical/PCOS Diets</li>
                  </ul>
                </div>
                <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-full font-semibold text-xs transition">
                  Book Consult Call
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
