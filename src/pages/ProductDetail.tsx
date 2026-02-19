import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loader2, Minus, Plus, Share2, ChevronLeft, Check } from "lucide-react";
import { useProduct } from "@/hooks/useProducts";
import maternityImg from "@/assets/category-maternity.jpg";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { product, loading, error } = useProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [recipientName, setRecipientName] = useState("");
  const [greetingMessage, setGreetingMessage] = useState("");
  const [fromName, setFromName] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [customName, setCustomName] = useState("");

  const handleAddToCart = () => {
    // Navigate to checkout with product
    navigate(`/checkout?product=${product?.slug}&quantity=${quantity}&step=1`);
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
              <Link to="/shop">Back to Shop</Link>
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
            Back to Shop
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
              <span className="text-primary text-sm font-medium uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mt-2 mb-4">
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

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-r-none"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus size={18} />
                  </Button>
                  <span className="px-6 py-3 min-w-[3rem] text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-l-none"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={18} />
                  </Button>
                </div>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1 h-12 font-semibold"
                  onClick={handleAddToCart}
                >
                  Add to Cart — ${(product.price * quantity).toFixed(2)}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-8">
                Shipping calculated at checkout.
              </p>

              {/* Description */}
              <div className="prose prose-neutral dark:prose-invert max-w-none mb-8">
                <h3 className="font-serif text-xl text-foreground mb-4">
                  {product.description}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Why this is a unique experience:
                </p>
                <ul className="space-y-2 mb-0">
                  {product.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={18} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Share */}
              <Button variant="outline" size="sm" onClick={handleShare} className="mb-8">
                <Share2 size={16} className="mr-2" />
                Share
              </Button>

              {/* Personalization (Loly Gift style) */}
              <div className="border-t border-border pt-8 space-y-6">
                <h3 className="font-serif text-xl text-foreground">Personalize your order</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient name</Label>
                    <Input
                      id="recipient"
                      placeholder="Name of the recipient"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      maxLength={50}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {recipientName.length}/50
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="message">Your message</Label>
                    <Textarea
                      id="message"
                      placeholder="This message will be printed on the greeting card."
                      value={greetingMessage}
                      onChange={(e) => setGreetingMessage(e.target.value)}
                      maxLength={200}
                      rows={3}
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {greetingMessage.length}/200
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="from">From (optional)</Label>
                    <Input
                      id="from"
                      placeholder="Your name"
                      value={fromName}
                      onChange={(e) => setFromName(e.target.value)}
                      maxLength={50}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="custom">Name for personalization</Label>
                    <Input
                      id="custom"
                      placeholder="This name will be printed on the product."
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      maxLength={20}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instructions">Special instructions (optional)</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Any specific requests for your portraits"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      maxLength={150}
                      rows={2}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Button variant="hero" size="lg" className="w-full" onClick={handleAddToCart}>
                  Add to Cart — ${(product.price * quantity).toFixed(2)}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductDetail;
