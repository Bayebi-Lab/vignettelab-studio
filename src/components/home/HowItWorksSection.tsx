import { motion } from "framer-motion";
import { Upload, Wand2, Download } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Upload Your Photos",
    description: "Simply upload your favorite selfies or casual photos. No studio visit required.",
  },
  {
    icon: Wand2,
    number: "02",
    title: "AI Magic Happens",
    description: "Our AI transforms your photos into stunning studio-quality portraits with perfect lighting.",
  },
  {
    icon: Download,
    number: "03",
    title: "Download & Share",
    description: "Receive your beautiful portraits ready to print, frame, or share with loved ones.",
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
            Get stunning portraits in three simple steps. No appointments, no hassle.
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