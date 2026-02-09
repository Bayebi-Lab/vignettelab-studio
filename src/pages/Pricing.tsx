import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { usePackages } from "@/hooks/usePackages";

const Pricing = () => {
  const { packages, loading, error } = usePackages();

  // Generate descriptions based on package name
  const getDescription = (name: string, portraits: number) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('starter')) {
      return "Perfect for trying out VignetteLab";
    } else if (lowerName.includes('family')) {
      return "Our most popular package for families";
    } else if (lowerName.includes('professional')) {
      return "Complete portrait solution for special occasions";
    }
    return `Get ${portraits} AI-generated portraits`;
  };

  if (loading) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading packages...</p>
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
            <p className="text-destructive mb-4">Error loading packages</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (packages.length === 0) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">No packages available</p>
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose the package that fits your needs. No hidden fees, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((plan, index) => {
              const description = getDescription(plan.name, plan.portraits);
              const packageSlug = plan.name.toLowerCase();
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative rounded-3xl p-8 ${
                    plan.popular 
                      ? "bg-primary text-primary-foreground shadow-elevated scale-105" 
                      : "bg-cream"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-rose-gold rounded-full">
                      <Sparkles size={16} />
                      <span className="text-sm font-medium text-primary-foreground">Most Popular</span>
                    </div>
                  )}

                  <div className="mb-8">
                    <h3 className="font-serif text-2xl mb-2">{plan.name}</h3>
                    <p className={`text-sm ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {description}
                    </p>
                  </div>

                  <div className="mb-8">
                    <span className="font-serif text-5xl">${plan.price}</span>
                    <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                      /package
                    </span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check size={20} className={`mt-0.5 flex-shrink-0 ${plan.popular ? "text-rose-gold-light" : "text-primary"}`} />
                        <span className={plan.popular ? "text-primary-foreground/90" : "text-foreground"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.popular ? "warm" : "hero"}
                    size="lg"
                    className={`w-full ${plan.popular ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90" : ""}`}
                    asChild
                  >
                    <Link to={`/checkout?package=${packageSlug}&step=1`}>
                      Choose {plan.name}
                    </Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-16 bg-cream-dark">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
            Have Questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Check out our FAQ page for answers to common questions.
          </p>
          <Button variant="outline" size="lg">
            View FAQ
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;