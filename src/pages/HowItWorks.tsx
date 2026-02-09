import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Package, Upload, CreditCard, Sparkles, Check, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-family.jpg";

const steps = [
  {
    icon: Package,
    number: "01",
    title: "Pick a Package",
    description: "Choose the perfect package for your needs. From our Starter package with 5 portraits to our Professional package with 50 portraits, we have options for everyone.",
    tips: [
      "Compare features and pricing",
      "Select the package that fits your needs",
      "All packages include high-quality AI portraits",
    ],
  },
  {
    icon: Upload,
    number: "02",
    title: "Upload Your Images",
    description: "Upload your favorite photos. Selfies, casual snapshots, or any images where you love how you look work perfectly. Our AI will use these to create your portraits. Each image should be under 10MB.",
    tips: [
      "Use well-lit photos for best results",
      "Include different angles and expressions",
      "Both close-ups and full-body shots work great",
    ],
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Pay Securely",
    description: "Complete your payment securely with our integrated checkout. Your payment is processed safely and you'll receive an immediate confirmation email.",
    tips: [
      "Secure payment processing",
      "Instant order confirmation",
      "Multiple payment methods accepted",
    ],
  },
  {
    icon: Sparkles,
    number: "04",
    title: "AI Processing & Delivery",
    description: "Our advanced AI goes to work, analyzing your photos and creating stunning studio-quality portraits. You'll receive your portraits via email within 24 hours (or faster with premium packages).",
    tips: [
      "Processing takes 15-30 minutes",
      "AI preserves your unique features",
      "Download links sent to your email",
    ],
  },
];

const HowItWorks = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Portrait photography"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
              The Process
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              How VignetteLab Works
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Creating beautiful portraits has never been easier. Pick your package, upload your photos, pay securely, and let our AI create stunning portraits for you.
            </p>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/pricing">
                Start Your Session
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 bg-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-12 lg:gap-16 items-center`}
              >
                {/* Visual */}
                <div className="flex-1 w-full">
                  <div className="relative">
                    <div className="aspect-square max-w-md mx-auto bg-background rounded-3xl shadow-elevated p-8 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                          <step.icon size={48} className="text-primary" />
                        </div>
                        <span className="font-serif text-6xl text-primary/20">{step.number}</span>
                      </div>
                    </div>
                    {/* Connector */}
                    {index < steps.length - 1 && (
                      <div className="hidden lg:block absolute left-1/2 -bottom-24 w-px h-24 bg-border" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <span className="text-primary font-medium text-sm uppercase tracking-widest mb-2 block">
                    Step {step.number}
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-3">
                        <Check size={20} className="text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-primary-foreground mb-6">
              Ready to Create Your Portraits?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Start your journey today and see the magic for yourself.
            </p>
            <Button 
              variant="warm" 
              size="xl" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link to="/pricing">
                Get Started Now
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;