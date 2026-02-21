import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Sparkles, Image, CreditCard, Heart, Check, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-family.jpg";

const steps = [
  {
    icon: Sparkles,
    number: "01",
    title: "Choose Your Portrait Experience",
    description: "Discover the perfect fit for your pregnancy journey—from a few cherished portraits to a full collection you’ll treasure forever. From Essential Glow (5 portraits) to Complete Collection (50 portraits).",
    tips: [
      "Compare features and what each experience includes",
      "Pick the one that matches your vision",
      "All include high-quality AI maternity portraits",
    ],
  },
  {
    icon: Image,
    number: "02",
    title: "Share Your Bump Photos",
    description: "Upload photos where you love how you look. Selfies, casual snapshots—our AI celebrates your unique glow and transforms them into stunning portraits. Each image under 10MB.",
    tips: [
      "Showcase your bump prominently",
      "Use well-lit photos to capture your glow",
      "Different angles work great—close-ups and full-body",
    ],
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Check Out Securely",
    description: "Complete your payment safely with our integrated checkout. You’ll receive an immediate confirmation email so you can relax and look forward to your portraits.",
    tips: [
      "Secure payment processing",
      "Instant order confirmation",
      "Multiple payment methods accepted",
    ],
  },
  {
    icon: Heart,
    number: "04",
    title: "Receive Your Portraits",
    description: "Our AI creates studio-quality maternity portraits that preserve your unique features and pregnancy glow. Your images arrive via email within 24 hours (faster with premium).",
    tips: [
      "Processing typically takes 15–30 minutes",
      "AI honors your natural beauty and glow",
      "Download links sent straight to your inbox",
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
              Your Journey
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              How We Capture Your Pregnancy Glow
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Creating beautiful maternity portraits has never been easier. Choose your portrait experience, share your bump photos from home, and receive studio-quality images—all without appointments or hassle.
            </p>
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/shop">
                Start Your Portraits
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
              Ready to Capture Your Pregnancy Glow?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of expecting mothers who’ve discovered the joy of beautiful maternity portraits—from the comfort of home.
            </p>
            <Button 
              variant="warm" 
              size="xl" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link to="/shop">
                Start Your Portraits
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;