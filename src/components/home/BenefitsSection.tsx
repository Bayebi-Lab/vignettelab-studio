import { motion } from "framer-motion";
import { Clock, Shield, Heart, Palette, Camera, Award } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Save Time",
    description: "No appointments or studio visits needed. Create portraits from the comfort of your home.",
  },
  {
    icon: Shield,
    title: "100% Private",
    description: "Your photos are encrypted and never shared. We take your privacy seriously.",
  },
  {
    icon: Heart,
    title: "Emotional Connection",
    description: "We capture the essence of your relationships, not just appearances.",
  },
  {
    icon: Palette,
    title: "Artistic Quality",
    description: "Professional-grade portraits with beautiful lighting and composition.",
  },
  {
    icon: Camera,
    title: "Unlimited Retakes",
    description: "Not satisfied? We'll regenerate your portraits until you love them.",
  },
  {
    icon: Award,
    title: "Print Ready",
    description: "High-resolution files ready for printing, framing, or digital sharing.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 bg-cream-dark">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Why Choose Us
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            The VignetteLab Difference
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Experience the perfect blend of cutting-edge AI technology and artistic vision.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background p-8 rounded-2xl shadow-soft hover:shadow-card transition-shadow duration-300"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <benefit.icon size={28} className="text-primary" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-3">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}