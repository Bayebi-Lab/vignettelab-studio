import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loader2, Share2, ChevronLeft, Check, Download } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import { filterPackageFeatures } from "@/lib/utils";
import maternityImg from "@/assets/category-maternity.jpg";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(slug);

  const handleChoosePortrait = () => {
    navigate(`/checkout?product=${product?.slug}&quantity=1&step=1`);
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || undefined,
          url: window.location.href,
        });
      } catch (err) {
        navigator.clipboard?.writeText(window.location.href);
      }
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">Product not found</p>
            <p className="text-muted-foreground text-sm">{error || "This product doesn't exist."}</p>
            <Button asChild className="mt-4">
              <Link to="/shop">Explore Portraits</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  const images = product.images?.length > 0
    ? product.images
    : [maternityImg];
  const hasSale = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <Layout>
      <section className="pt-24 pb-16 min-h-screen bg-cream">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Breadcrumb */}
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ChevronLeft size={16} />
            Explore Portraits
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
          >
            {/* Product Images */}
            <div className="relative">
              {images.length > 1 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {images.map((img, i) => (
                      <CarouselItem key={i}>
                        <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                          <img
                            src={img}
                            alt={`${product.name} - ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              ) : (
                <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                  <img
                    src={images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {hasSale && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded">
                  Sale
                </span>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-serif text-3xl text-foreground">
                  ${product.price.toFixed(2)}
                </span>
                {hasSale && (
                  <span className="text-muted-foreground line-through">
                    ${product.compare_at_price!.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Add to Cart - One product per session (digital) */}
              <div className="mb-8">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full sm:w-auto h-12 font-semibold px-8"
                  onClick={handleChoosePortrait}
                >
                  Choose This Package — ${product.price.toFixed(2)}
                </Button>
                <p className="text-sm text-muted-foreground mt-3 flex items-center gap-2">
                  <Download size={14} />
                  Digital delivery within 24 hours
                </p>
              </div>

              {/* Description */}
              <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
                <h3 className="font-serif text-xl text-foreground mb-4">
                  {product.description}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Why this is a unique experience:
                </p>
                <ul className="space-y-2 mb-0">
                  {filterPackageFeatures(product.features).map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share */}
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 size={16} className="mr-2" />
                Share
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;
