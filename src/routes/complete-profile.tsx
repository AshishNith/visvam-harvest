import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { User, Phone, MapPin, ArrowRight, Loader2, SkipForward } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/complete-profile")({
  head: () => ({
    meta: [
      { title: "Complete Your Profile — Viśvam" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CompleteProfilePage,
});

function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, completeProfile, skipProfileCompletion } = useAuth();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [saving, setSaving] = useState(false);

  // Pre-fill available data
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      if (user.address) {
        setStreet(user.address.street || "");
        setCity(user.address.city || "");
        setState(user.address.state || "");
        setZipCode(user.address.zipCode || "");
      }
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Redirect if profile already completed
  useEffect(() => {
    if (!isLoading && user?.profileCompleted) {
      navigate({ to: "/" });
    }
  }, [isLoading, user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setSaving(true);
    try {
      const res = await completeProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        address: (street || city || state || zipCode)
          ? { street, city, state, zipCode, country: "India" }
          : undefined,
      });
      if (res.success) {
        toast.success("Profile saved! Welcome to Viśvam.");
        navigate({ to: "/" });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    skipProfileCompletion();
    toast.info("You can complete your profile anytime from the account menu.");
    navigate({ to: "/" });
  };

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-clay" />
        </div>
      </SiteLayout>
    );
  }

  if (!isAuthenticated || !user) return null;

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-28 pb-20 px-4 md:px-8">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-display italic text-4xl sm:text-5xl text-ink mb-3">
              Welcome to Viśvam
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Complete your profile for a seamless checkout experience and personalised recommendations.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1.5 flex items-center gap-1.5">
                <User size={12} className="text-clay" /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                autoFocus
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1.5 flex items-center gap-1.5">
                <Phone size={12} className="text-clay" /> Phone Number
              </label>
              <div className="relative flex">
                <span className="inline-flex items-center px-3 text-xs text-muted-foreground border border-r-0 border-border bg-cream/50 font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="pt-3 border-t border-border/60 space-y-4">
              <h3 className="text-[10px] tracked text-muted-foreground uppercase flex items-center gap-1.5 font-semibold">
                <MapPin size={12} className="text-clay" /> Delivery Address
                <span className="text-muted-foreground/60 font-normal normal-case tracking-normal ml-1">(optional)</span>
              </h3>

              <div>
                <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="House no., Street, Area"
                  className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">Pincode</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="6-digit Pincode"
                  maxLength={6}
                  className="w-full px-3 py-2.5 text-xs border border-border focus:border-clay outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-ink text-white py-3.5 text-xs tracked font-semibold uppercase hover:bg-clay transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <><Loader2 size={14} className="animate-spin" /> Saving...</>
                ) : (
                  <>Save & Continue <ArrowRight size={14} /></>
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="w-full py-3 text-xs text-muted-foreground hover:text-ink border border-border hover:bg-cream/40 transition-colors uppercase tracked flex items-center justify-center gap-2"
              >
                <SkipForward size={13} /> Skip for Now
              </button>
            </div>
          </form>

          <p className="text-[10px] text-center text-muted-foreground mt-6">
            You can update your details anytime from your profile page.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
