import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { useCart, formatPrice } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { getProductBySlug, products, categories, type Product, type IProductVariant } from "@/lib/products";
import { fetchProductBySlugFromBackend, fetchProductReviews, submitReview } from "@/lib/api";
import { Check, ShieldCheck, MapPin, Award, ArrowRight, Star, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/menu/$slug")({
  loader: async ({ params }) => {
    const product = await fetchProductBySlugFromBackend(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const product = loaderData?.product;
    const title = product ? `${product.name} — Viśvam` : "Viśvam Selection";
    const description =
      product?.description ??
      "Handpicked single-origin dry fruits and premium nuts at Viśvam.";
    const imageUrl =
      product?.images && product.images.length > 0
        ? product.images[0]
        : "https://visvam.in/Visvam-Logo.png";
    const canonicalUrl = product
      ? `https://visvam.in/menu/${product.slug}`
      : "https://visvam.in/nuts";

    const productSchema = product
      ? {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": product.images && product.images.length > 0 ? product.images : [imageUrl],
          "description": product.description,
          "sku": product.slug,
          "mpn": product.slug,
          "brand": {
            "@type": "Brand",
            "name": "Viśvam"
          },
          "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "INR",
            "price": product.price,
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "seller": {
              "@type": "Organization",
              "name": "Viśvam"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "84"
          }
        }
      : null;

    const breadcrumbSchema = product
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://visvam.in/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": product.category ? product.category.toUpperCase() : "Collection",
              "item": `https://visvam.in/${product.category || "nuts"}`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": product.name,
              "item": canonicalUrl
            }
          ]
        }
      : null;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `${product?.name || "dry fruit"}, buy ${product?.name || "nuts"} online, Viśvam ${product?.category || "dry fruits"}, cold stored dry fruits India`,
        },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: imageUrl },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: imageUrl },
      ],
      links: [{ rel: "canonical", href: canonicalUrl }],
      scripts: [
        ...(productSchema
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify(productSchema),
              },
            ]
          : []),
        ...(breadcrumbSchema
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify(breadcrumbSchema),
              },
            ]
          : []),
      ],
    };
  },
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

  // Variant & Customizations selection state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    if (initialProduct?.hasVariants && initialProduct.variants && initialProduct.variants.length > 0) {
      const def = initialProduct.variants.find((v) => v.isDefault) || initialProduct.variants[0];
      if (def?.options) return { ...def.options };
    }
    if (initialProduct?.variantAttributes) {
      initialProduct.variantAttributes.forEach((attr) => {
        if (attr.values && attr.values[0]) {
          initial[attr.name] = attr.values[0];
        }
      });
    }
    return initial;
  });

  // Active Variant Memo
  const activeVariant: IProductVariant | null = useMemo(() => {
    if (!product?.hasVariants || !product?.variants || product.variants.length === 0) {
      return null;
    }
    const matched = product.variants.find((v) => {
      if (!v.options) return false;
      return Object.entries(selectedOptions).every(([key, val]) => v.options[key] === val);
    });
    return matched || product.variants.find((v) => v.isDefault) || product.variants[0] || null;
  }, [product, selectedOptions]);

  const effectivePrice = activeVariant ? activeVariant.price : product.price;
  const effectiveMrp = activeVariant ? activeVariant.mrp : undefined;
  const effectiveStock = activeVariant ? activeVariant.stock : product.stock;

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
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Sync state when route params change (e.g. clicking another product card)
  useEffect(() => {
    setProduct(initialProduct);
    setActive(0);
    setShowAllReviews(false);
    if (initialProduct?.hasVariants && initialProduct.variants && initialProduct.variants.length > 0) {
      const def = initialProduct.variants.find((v) => v.isDefault) || initialProduct.variants[0];
      if (def?.options) {
        setSelectedOptions({ ...def.options });
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [initialProduct]);




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

  const FREQUENT_SLUGS = [
    "kashmiri-snow-walnuts",
    "california-jumbo-almonds",
    "king-w240-cashews",
  ];

  const frequentlyBoughtTogether = [
    ...FREQUENT_SLUGS.filter((s) => s !== product.slug)
      .map((s) => products.find((p) => p.slug === s))
      .filter((p): p is Product => Boolean(p)),
    ...products.filter((p) => p.slug !== product.slug && !FREQUENT_SLUGS.includes(p.slug)),
  ].slice(0, 3);

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 3);

  const categoryLabel =
    categories.find((c) => c.slug === product.category)?.label ?? product.category;

  const hasUserReviewed = reviews.some((r: any) => r.user === user?._id);

  return (
    <SiteLayout>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
        <nav className="text-[10px] tracked text-muted-foreground flex gap-2 items-center flex-wrap">
          <Link to="/" className="hover:text-clay">Home</Link>
          <span>/</span>
          <Link to={`/${product.category}` as "/nuts"} className="hover:text-clay">
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-ink font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
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
          
          <div className="flex items-baseline gap-3 mb-4 flex-wrap">
            <span className="text-2xl font-display italic tabular-nums text-ink">{formatPrice(effectivePrice)}</span>
            {effectiveMrp && effectiveMrp > effectivePrice && (
              <span className="text-sm font-display line-through text-muted-foreground tabular-nums">
                {formatPrice(effectiveMrp)}
              </span>
            )}
            {effectiveMrp && effectiveMrp > effectivePrice && (
              <span className="text-[10px] font-mono uppercase bg-clay/10 text-clay px-2 py-0.5 rounded font-semibold">
                Save {Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 100)}%
              </span>
            )}
            <span className="text-[10.5px] tracked text-muted-foreground">
              ({activeVariant?.title || product.serving})
            </span>
          </div>

          {/* Variant / Customization Options Selector */}
          {product.hasVariants && product.variantAttributes && product.variantAttributes.length > 0 && (
            <div className="space-y-4 mb-5 border-y border-border/70 py-4">
              {product.variantAttributes.map((attr) => {
                const currentVal = selectedOptions[attr.name] || attr.values[0];
                return (
                  <div key={attr.name} className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="font-semibold uppercase tracking-wider text-ink">
                        {attr.name}: <span className="text-clay font-normal">{currentVal}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {attr.values.map((val) => {
                        const isSelected = currentVal === val;
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() =>
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [attr.name]: val,
                              }))
                            }
                            className={`px-3.5 py-1.5 text-xs font-mono tracking-tight transition-all duration-200 border rounded ${
                              isSelected
                                ? "bg-ink text-sand border-ink font-semibold shadow-xs"
                                : "bg-cream/50 text-ink/80 border-border/80 hover:border-ink/50 hover:bg-sand/40"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!product.hasVariants && (
            <div className="flex items-center gap-6 border-y border-border/70 py-3 mb-5 text-[10.5px] tracked text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={13} className="text-clay" />
                <span>Single Origin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check size={13} className="text-clay" />
                <span>Hand-Selected</span>
              </div>
            </div>
          )}

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

          {/* Stock availability notice */}
          {effectiveStock !== undefined && effectiveStock > 0 && effectiveStock <= 10 && (
            <p className="text-[11px] font-mono text-amber-800 mb-3 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Only {effectiveStock} units left in stock — order soon
            </p>
          )}

          <button
            onClick={() => add(product, true, activeVariant || undefined)}
            disabled={effectiveStock !== undefined && effectiveStock <= 0}
            className="group inline-flex items-center gap-3 text-ink text-[12px] font-medium tracked uppercase tracking-widest py-2.5 border-b-2 border-ink hover:text-clay hover:border-clay transition-all duration-300 mb-6 self-start disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>
              {effectiveStock !== undefined && effectiveStock <= 0
                ? "Out of Stock"
                : `Add to Viśvam Bag — ${formatPrice(effectivePrice)}`}
            </span>
            <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300 text-clay" />
          </button>

          <ul className="space-y-2 border-t border-border/70 pt-5">
            {[
              "Direct Single-Origin Sourcing",
              "Bespoke Presentation Packaging",
              "Free shipping on orders above ₹3,499",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 text-[11px] items-center text-muted-foreground">
                <ShieldCheck size={13} className="text-clay shrink-0" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Frequently Bought Together Section */}
      {frequentlyBoughtTogether.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 py-12 border-t border-border">
          <div className="mb-6">
            <p className="text-[10px] tracked font-semibold uppercase text-clay mb-1">Recommended Pairings</p>
            <h2 className="font-display italic text-2xl lg:text-3xl text-ink">
              Frequently Bought Together
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {frequentlyBoughtTogether.map((item) => (
              <div
                key={item.slug}
                className="bg-cream/40 border border-border/60 p-4 flex items-center gap-4 group hover:border-clay transition-all duration-300"
              >
                <Link to="/menu/$slug" params={{ slug: item.slug }} className="shrink-0">
                  <img
                    src={item.images?.[0] || ""}
                    alt={item.name}
                    className="w-16 h-20 object-cover bg-background border border-border/40 group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to="/menu/$slug"
                    params={{ slug: item.slug }}
                    className="text-xs font-semibold text-ink hover:text-clay transition-colors block truncate"
                  >
                    {item.name}
                  </Link>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.serving}</p>
                  <p className="text-xs font-semibold text-ink mt-2 tabular-nums">{formatPrice(item.price)}</p>
                </div>
                <button
                  onClick={() => add(item)}
                  className="px-3 py-2 border border-ink text-[10px] tracked font-semibold uppercase hover:bg-ink hover:text-white transition-colors shrink-0 cursor-pointer"
                >
                  Add +
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

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
          {!showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="inline-flex items-center gap-2 border border-ink text-ink px-5 py-2.5 text-[11px] font-semibold tracked uppercase hover:bg-ink hover:text-white transition-colors cursor-pointer"
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
            {(showAllReviews ? reviews : reviews.slice(0, 2)).map((review: any) => (
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

            {reviews.length > 2 && (
              <div className="pt-2">
                <button
                  onClick={() => setShowAllReviews((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-clay hover:text-ink transition-colors uppercase tracking-wider underline cursor-pointer"
                >
                  {showAllReviews
                    ? "Show less reviews"
                    : `Show more reviews (${reviews.length - 2} more)`}
                </button>
              </div>
            )}
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
