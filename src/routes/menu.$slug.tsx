import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useCart, formatPrice } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { getProductBySlug, products, categories, type Product } from "@/lib/products";
import { fetchProductBySlugFromBackend, fetchProductReviews, submitReview } from "@/lib/api";
import { Check, ShieldCheck, MapPin, Award, ArrowRight, Star, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlugFromBackend(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.product.name} — Viśvam`
          : "Viśvam Selection",
      },
      {
        name: "description",
        content:
          loaderData?.product.description ??
          "Handpicked single-origin dry fruits and premium nuts at Viśvam.",
      },
      {
        property: "og:title",
        content: loaderData ? `${loaderData.product.name} — Viśvam` : "Viśvam",
      },
      {
        property: "og:description",
        content: loaderData?.product.description ?? "Cold-stored, handpicked dry fruits and nuts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MenuItemPage,
});

// Star Rating Component
function StarRating({ rating, size = 14, interactive = false, onChange }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
        >
          <Star
            size={size}
            className={`${
              star <= (hovered || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-border"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function MenuItemPage() {
  const { product: initialProduct } = Route.useLoaderData();
  const [product, setProduct] = useState<Product>(initialProduct);
  const { add } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [active, setActive] = useState(0);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Sync state when route params change (e.g. clicking another product card)
  useEffect(() => {
    setProduct(initialProduct);
    setActive(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialProduct]);

  // Merge backend stats safely
  useEffect(() => {
    let isMounted = true;
    if (initialProduct?.slug) {
      fetchProductBySlugFromBackend(initialProduct.slug).then((data) => {
        if (isMounted && data) {
          setProduct((prev) => {
            const hasLocalImages = prev.images && prev.images.length > 0 && !prev.images[0].startsWith("http");
            return {
              ...prev,
              ...data,
              price: prev.price > 100 && data.price < 100 ? prev.price : data.price,
              images: hasLocalImages ? prev.images : (data.images && data.images.length > 0 ? data.images : prev.images),
            };
          });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [initialProduct?.slug]);

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, [product.slug]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await fetchProductReviews(product.slug);
      if (res.success) {
        setReviews(res.data || []);
        setAvgRating(res.avgRating || 0);
      }
    } catch { /* silent */ }
    finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle.trim() || !reviewComment.trim()) {
      return toast.error("Please fill in the review title and comment");
    }
    if (!isAuthenticated && !reviewerName.trim()) {
      return toast.error("Please enter your name");
    }
    setReviewSubmitting(true);
    try {
      const res = await submitReview({
        productSlug: product.slug,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        reviewerName: isAuthenticated ? user?.name : reviewerName,
      });
      if (res.success) {
        toast.success("Review submitted successfully!");
        setReviewTitle("");
        setReviewComment("");
        setReviewerName("");
        setReviewRating(5);
        setShowReviewForm(false);
        loadReviews();
      } else {
        toast.error(res.message || "Failed to submit review");
      }
    } catch {
      toast.error("Error submitting review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);
  const categoryLabel =
    categories.find((c) => c.slug === product.category)?.label ?? product.category;

  const hasUserReviewed = reviews.some((r: any) => r.user === user?._id);

  return (
    <SiteLayout>
      <div className="max-w-[1200px] mx-auto px-6 pt-24">
        <nav className="text-[10px] tracked text-muted-foreground flex gap-2 items-center">
          <Link to="/" className="hover:text-clay">Home</Link>
          <span>/</span>
          <Link to={`/${product.category}` as "/nuts"} className="hover:text-clay">
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-ink font-medium">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-[1200px] mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-14 items-start">
        {/* Left Column: Product Image Gallery */}
        <div className="max-w-lg mx-auto w-full">
          <div className="bg-cream relative overflow-hidden aspect-square border border-border/40 max-h-[460px] rounded-lg">
            {product.badge && (
              <span
                className={`absolute top-4 left-4 z-10 text-[9px] tracked px-2.5 py-1 font-semibold uppercase rounded-full ${
                  product.isNew || product.badge === "Superfood"
                    ? "bg-ink text-white"
                    : "bg-white/90 backdrop-blur-sm text-ink border border-border"
                }`}
              >
                {product.badge}
              </span>
            )}
            <img
              key={active}
              src={product.images[active]}
              alt={`${product.name} — photo ${active + 1}`}
              width={600}
              height={600}
              className="w-full h-full object-cover animate-fade-in"
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-2.5 mt-2.5">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`aspect-square overflow-hidden bg-cream border rounded-md transition-colors ${
                    i === active ? "border-ink" : "border-transparent hover:border-border"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} thumbnail ${i + 1}`}
                    width={200}
                    height={200}
                    loading="eager"
                    className={`w-full h-full object-cover transition-opacity ${
                      i === active ? "opacity-100" : "opacity-70 hover:opacity-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Action */}
        <div className="flex flex-col max-w-lg">
          <p className="text-[9.5px] tracked text-muted-foreground mb-1.5 uppercase tracking-widest">{categoryLabel}</p>
          <h1 className="font-display italic text-3xl lg:text-4xl mb-2 leading-tight">
            {product.name}
          </h1>
          <p className="text-[10.5px] tracked text-muted-foreground mb-3 font-medium">{product.tagline}</p>

          {/* Rating summary */}
          {!reviewsLoading && (
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={Math.round(avgRating)} size={14} />
              <span className="text-xs text-muted-foreground">
                {avgRating > 0 ? `${avgRating} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}` : 'No reviews yet'}
              </span>
            </div>
          )}
          
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-2xl font-display italic tabular-nums text-ink">{formatPrice(product.price)}</span>
            <span className="text-[10.5px] tracked text-muted-foreground">({product.serving})</span>
          </div>

          <div className="grid grid-cols-2 gap-3 border-y border-border/70 py-3.5 mb-5 text-[10.5px] tracked">
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-clay" />
              <span>Origin: <strong>{product.origin}</strong></span>
            </div>
            {product.grade && (
              <div className="flex items-center gap-2">
                <Award size={13} className="text-clay" />
                <span>Grade: <strong>{product.grade}</strong></span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-5">
            {product.description}
          </p>

          {product.benefits && product.benefits.length > 0 && (
            <div className="mb-6">
              <h5 className="text-[9.5px] tracked font-semibold text-muted-foreground uppercase mb-2">Key Wellness Benefits</h5>
              <div className="flex flex-wrap gap-1.5">
                {product.benefits.map((b) => (
                  <span key={b} className="text-[10px] bg-sand/60 px-2.5 py-1 text-ink border border-border/50 rounded-full flex items-center gap-1">
                    <Check size={11} className="text-clay" /> {b}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => add(product)}
            disabled={product.stock !== undefined && product.stock <= 0}
            className="group inline-flex items-center gap-3 text-ink text-[12px] font-medium tracked uppercase tracking-widest py-2.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 mb-6 self-start disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{product.stock !== undefined && product.stock <= 0 ? 'Out of Stock' : `Add to Viśvam Bag — ${formatPrice(product.price)}`}</span>
            <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
          </button>

          <ul className="space-y-2 border-t border-border/70 pt-5">
            {[
              "100% Handpicked & Cold-Stored Harvest",
              "Nitrogen-Flushed Airtight Packaging",
              "Free Express Courier Shipping over ₹999",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 text-[11px] items-center text-muted-foreground">
                <ShieldCheck size={13} className="text-clay shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-14 border-t border-border">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display italic text-2xl lg:text-3xl flex items-center gap-3">
              <MessageSquare size={22} className="text-clay" />
              Customer Reviews
            </h2>
            {!reviewsLoading && reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <StarRating rating={Math.round(avgRating)} size={16} />
                <span className="text-sm text-muted-foreground">
                  {avgRating} out of 5 · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          {!hasUserReviewed && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 border border-ink text-ink px-5 py-2.5 text-[11px] font-semibold tracked uppercase hover:bg-ink hover:text-white transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <form
            onSubmit={handleSubmitReview}
            className="bg-cream/40 border border-border p-6 mb-8 space-y-4 max-w-2xl"
          >
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink border-b border-border pb-2">
              Share Your Experience
            </h4>
            {!isAuthenticated && (
              <div>
                <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  maxLength={60}
                  className="w-full px-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] tracked text-muted-foreground uppercase mb-2">
                Your Rating
              </label>
              <StarRating rating={reviewRating} size={22} interactive onChange={setReviewRating} />
            </div>
            <div>
              <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">
                Review Title *
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="e.g. Absolutely fresh and flavourful!"
                maxLength={120}
                className="w-full px-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] tracked text-muted-foreground uppercase mb-1">
                Your Review *
              </label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your thoughts about this product..."
                rows={4}
                maxLength={1000}
                className="w-full px-3 py-2 text-xs border border-border focus:border-clay outline-none bg-transparent resize-none"
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="inline-flex items-center gap-2 bg-ink text-white px-5 py-2.5 text-[11px] font-semibold tracked uppercase hover:bg-clay transition-colors disabled:opacity-50"
              >
                {reviewSubmitting ? (
                  <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                ) : (
                  "Submit Review"
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="text-[11px] text-muted-foreground underline hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="py-10 text-center">
            <Loader2 size={18} className="animate-spin text-clay mx-auto" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="space-y-6 max-w-2xl">
            {reviews.map((review: any) => (
              <div
                key={review._id}
                className="border-b border-border/60 pb-5 last:border-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-clay/10 text-clay grid place-items-center text-xs font-semibold">
                      {(review.userName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink">{review.userName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} size={12} />
                </div>
                <h5 className="text-xs font-semibold text-ink mb-1">{review.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-14 border-t border-border mt-8">
          <h2 className="font-display italic text-2xl lg:text-3xl mb-8">Pairs perfectly with</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
