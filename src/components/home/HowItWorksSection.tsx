import { motion } from "framer-motion";
import { Sparkles, Image, Heart } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    number: "01",
    title: "Choose Your Portrait Experience",
    description: "Find the perfect fit for your pregnancy journey—from a few cherished portraits to a full collection you’ll treasure forever.",
  },
  {
    icon: Image,
    number: "02",
    title: "Share Your Bump Photos",
    description: "Upload 1–3 photos where you love how you look. Selfies, casual snapshots—our AI celebrates your unique glow. Max 10MB each.",
  },
  {
    icon: Heart,
    number: "03",
    title: "Receive Your Portraits",
    description: "Check out securely, then relax. Your studio-quality maternity portraits arrive in your inbox within 24 hours.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Your Journey
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Celebrate your pregnancy glow in three simple steps—choose your portraits, share your photos from home, and receive your beautiful images. No appointments, no studio visits.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-border" />
              )}

              {/* Icon Container */}
              <div className="relative mx-auto w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-primary/10 rounded-full" />
                <div className="absolute inset-3 bg-background rounded-full shadow-soft flex items-center justify-center">
                  <step.icon size={32} className="text-primary" />
                </div>
                <span className="absolute -top-2 -right-2 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-serif font-medium text-sm">
                  {step.number}
                </span>
              </div>

              <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}