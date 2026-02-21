import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import maternityImg from "@/assets/category-maternity.jpg";

export function PackagesSection() {
  const { products, loading, error } = useProducts();
  const displayProducts = products.slice(0, 6);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Our Offers
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Service Packages
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every package captures your bump in 3 stunning styles, creating portraits as unique as your pregnancy journey.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-muted/50 animate-pulse"
              >
                <div className="aspect-[4/5] bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-6 bg-muted rounded w-2/3" />
                  <div className="h-5 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-cream rounded-2xl"
          >
            <p className="text-muted-foreground mb-4">Unable to load packages.</p>
            <Button variant="outline" asChild>
              <Link to="/shop">View Shop</Link>
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product, index) => {
              const imageUrl = product.images?.[0] || maternityImg;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="bg-background rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                    <Link to={`/products/${product.slug}`} className="block">
                      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                        <img
                          src={typeof imageUrl === "string" ? imageUrl : maternityImg}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="inline-flex items-center gap-2 text-rose-gold-light text-sm font-medium">
                            View Package
                            <ArrowRight size={16} />
                          </span>
                        </div>
                        {product.compare_at_price &&
                          product.compare_at_price > product.price && (
                            <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded">
                              Sale
                            </span>
                          )}
                      </div>
                    </Link>
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
                          {product.compare_at_price &&
                            product.compare_at_price > product.price && (
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
                        asChild
                      >
                        <Link to={`/checkout?product=${product.slug}&quantity=1&step=1`}>
                          <ArrowRight size={16} className="mr-2" />
                          Choose This Package
                        </Link>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="warm" size="lg" asChild>
              <Link to="/shop">
                View All Packages
                <ArrowRight size={18} className="ml-2" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
