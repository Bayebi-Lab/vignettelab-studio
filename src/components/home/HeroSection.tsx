import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-family.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Mother holding newborn baby in warm studio setting"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 lg:px-8 py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full border border-primary-foreground/20">
              <Sparkles size={16} className="text-rose-gold-light" />
              <span className="text-sm text-primary-foreground font-medium">AI Maternity Photography Studio</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-primary-foreground leading-tight mb-6"
          >
            Beautiful Bump Photos{" "}
            <span className="italic text-rose-gold-light">Without Leaving Home</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed mb-8 max-w-xl"
          >
            Transform your pregnancy photos into stunning studio-quality maternity portraits. 
            Capture your pregnancy glow effortlessly from the comfort of your home.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/shop">
                Discover Your Glow
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex items-center gap-8"
          >
            <div className="text-center">
              <p className="font-serif text-3xl text-primary-foreground font-medium">500+</p>
              <p className="text-sm text-primary-foreground/60">Expecting Mothers</p>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20" />
            <div className="text-center">
              <p className="font-serif text-3xl text-primary-foreground font-medium">4.9★</p>
              <p className="text-sm text-primary-foreground/60">Customer Rating</p>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20" />
            <div className="text-center">
              <p className="font-serif text-3xl text-primary-foreground font-medium">1K+</p>
              <p className="text-sm text-primary-foreground/60">Maternity Portraits Created</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}