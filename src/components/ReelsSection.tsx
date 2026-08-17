import { useState, useRef } from "react";
import { Instagram, Play, Volume2, VolumeX, Heart, MessageCircle, ArrowUpRight } from "lucide-react";
import montageVideo from "@/assets/Dry_fruit_craftsmanship_montage_202608061931.mp4";
import heroMp4 from "@/assets/timeline-hero.mp4";
import timelineMov from "@/assets/Timeline 1.mov";

type Reel = {
  id: string;
  video: string;
  type?: string;
  handle: string;
  caption: string;
  likes: string;
  comments: string;
  tag: string;
  instagramUrl?: string;
};

const INSTAGRAM_URL = "https://www.instagram.com/visvam.in?igsh=MWZtM2IyM3hqaTBhMg%3D%3D&utm_source=qr";

const REELS: Reel[] = [
  {
    id: "reel-1",
    video: montageVideo,
    type: "video/mp4",
    handle: "@visvam.in",
    caption: "Handpicking single-origin snow walnuts from high altitude valleys. 🏔️✨",
    likes: "2.8k",
    comments: "142",
    tag: "Viśvam Harvest",
    instagramUrl: INSTAGRAM_URL,
  },
  {
    id: "reel-2",
    video: heroMp4,
    type: "video/mp4",
    handle: "@visvam.in",
    caption: "Inside our 4°C cold-lock facility: Locking in natural oils and royal crunch. ❄️🌰",
    likes: "4.1k",
    comments: "289",
    tag: "Cold Chain Fresh",
    instagramUrl: INSTAGRAM_URL,
  },
  {
    id: "reel-3",
    video: timelineMov,
    type: "video/mp4",
    handle: "@visvam.in",
    caption: "Artisanal dry fruit craftsmanship — Nitrogen sealed presentation boxes. 📦👑",
    likes: "1.9k",
    comments: "98",
    tag: "Craftsmanship",
    instagramUrl: INSTAGRAM_URL,
  },
];

function ReelCard({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      onClick={togglePlay}
      className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-ink/90 shadow-md border border-border/30 group cursor-pointer select-none transition-transform duration-300 hover:scale-[1.01]"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={reel.video}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        className="w-full h-full object-cover rounded-2xl"
      />

      {/* Dark overlay gradients for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      {/* Top Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] text-white font-medium tracking-wide border border-white/10">
          <Instagram size={12} className="text-clay" /> {reel.tag}
        </span>

        {/* Audio Toggle Button */}
        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="pointer-events-auto p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 transition-colors"
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>

      {/* Center Pause/Play Indicator */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
          <div className="p-4 rounded-full bg-black/60 backdrop-blur-md text-white">
            <Play size={24} className="ml-0.5" />
          </div>
        </div>
      )}

      {/* Bottom Information Overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10 text-white space-y-2 pointer-events-none">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide flex items-center gap-1.5">
            {reel.handle}
          </span>
          <a
            href={reel.instagramUrl || "https://instagram.com"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto inline-flex items-center gap-1 text-[10px] font-medium text-white/80 hover:text-white transition-colors bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full"
          >
            <span>View Reel</span>
            <ArrowUpRight size={10} />
          </a>
        </div>

        <p className="text-xs text-white/90 line-clamp-2 leading-relaxed font-sans">
          {reel.caption}
        </p>

        {/* Social Metrics */}
        <div className="flex items-center gap-4 pt-1 text-xs text-white/80">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="pointer-events-auto inline-flex items-center gap-1 hover:text-clay transition-colors"
          >
            <Heart size={14} className={isLiked ? "fill-clay text-clay" : ""} />
            <span>{reel.likes}</span>
          </button>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={14} />
            <span>{reel.comments}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export function ReelsSection() {
  return (
    <section className="py-20 bg-cream/40 border-b border-border/40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-clay uppercase tracked block mb-1 flex items-center gap-1.5">
              <Instagram size={14} /> @visvam.in
            </span>
            <h2 className="font-display italic text-3xl sm:text-4xl lg:text-5xl text-ink">
              Stories from Viśvam
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-ink text-[11px] font-medium tracked uppercase tracking-widest py-1 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 self-start sm:self-auto"
          >
            <span>Follow on Instagram</span>
            <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300 text-clay" />
          </a>
        </div>

        {/* Reels Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {REELS.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      </div>
    </section>
  );
}
