import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-background rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-background rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-primary-foreground/10 rounded-full">
            <Heart size={16} className="text-primary-foreground" />
            <span className="text-primary-foreground text-sm font-medium">Start Creating Today</span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-primary-foreground mb-6">
            Ready to Capture Your <br className="hidden md:block" />
            <span className="italic">Pregnancy Glow?</span>
          </h2>

          <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">
            Join over 50,000 expecting mothers who've discovered the joy of beautiful, 
            studio-quality maternity portraits without leaving home.
          </p>

          <div className="flex justify-center">
            <Button 
              variant="warm" 
              size="xl" 
              className="group bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              asChild
            >
              <Link to="/shop">
                Discover Your Glow
                <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>

          <p className="text-primary-foreground/60 text-sm mt-8">
            No credit card required • Free trial available
          </p>
        </motion.div>
      </div>
    </section>
  );
}