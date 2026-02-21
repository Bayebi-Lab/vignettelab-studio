import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import maternityImg from "@/assets/category-maternity.jpg";

const Shop = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading products</p>
            <p className="text-muted-foreground text-sm">{error}</p>
            <Button asChild className="mt-4">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Shop Maternity Portraits
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose the perfect product for your pregnancy journey. Beautiful AI-generated portraits delivered to your inbox.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((product, index) => {
              const imageUrl = product.images?.[0] || maternityImg;
              const isExternalImage = typeof imageUrl === 'string' && imageUrl.startsWith('http');

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-background rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                    {/* Product Image - links to details */}
                    <Link to={`/products/${product.slug}`} className="block">
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        {isExternalImage ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="inline-flex items-center gap-2 text-rose-gold-light text-sm font-medium">
                            Discover This Portrait
                            <ArrowRight size={16} />
                          </span>
                        </div>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                            Sale
                          </span>
                        )}
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="p-6">
                      <Link to={`/products/${product.slug}`} className="block">
                        <h3 className="font-serif text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="font-serif text-2xl text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.compare_at_price && product.compare_at_price > product.price && (
                            <span className="text-muted-foreground line-through text-sm">
                              ${product.compare_at_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                        onClick={() => navigate(`/checkout?product=${product.slug}&quantity=1&step=1`)}
                      >
                        <ArrowRight size={16} className="mr-2" />
                        Choose This Package
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Shop;
