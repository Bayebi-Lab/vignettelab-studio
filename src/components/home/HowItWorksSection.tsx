import { motion } from "framer-motion";
import { Package, Upload, CreditCard } from "lucide-react";

const steps = [
  {
    icon: Package,
    number: "01",
    title: "Pick a Package",
    description: "Choose the perfect product for your needs. We have options for every expecting mother.",
  },
  {
    icon: Upload,
    number: "02",
    title: "Upload Your Images",
    description: "Upload 1-3 photos showing your beautiful bump (max 10MB each). Selfies, casual snapshots, or any images where you love how you look work perfectly.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Pay",
    description: "Complete your payment securely. Your portraits will be processed and delivered via email within 24 hours.",
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
            Simple Process
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get stunning maternity portraits in three simple steps: pick a product, upload your bump photos, and pay. No appointments, no hassle.
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