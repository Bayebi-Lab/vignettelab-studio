import { motion } from "framer-motion";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { ArrowLeftRight } from "lucide-react";
// Using existing images as placeholders - replace with actual before/after images
import before2 from "@/assets/category-maternity.jpg";
import after2 from "@/assets/hero-family.jpg";

const transformations = [
  {
    id: 1,
    before: before2,
    after: after2,
    category: "Maternity Portrait",
    description: "Everyday pregnancy photo transformed into elegant studio portrait",
  },
  {
    id: 2,
    before: before2,
    after: after2,
    category: "Maternity Glow",
    description: "Casual bump photo elevated to timeless artwork",
  },
  {
    id: 3,
    before: before2,
    after: after2,
    category: "Maternity Session",
    description: "Simple snapshot refined into beautiful maternity portrait",
  },
];

export function TransformationSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            See The Difference
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            From Pregnancy Photo to Maternity Portrait
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch everyday pregnancy photos transform into stunning maternity portraits with our AI-powered studio enhancement.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {transformations.map((transformation, index) => (
            <TransformationCard key={transformation.id} transformation={transformation} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TransformationCard({
  transformation,
  index,
}: {
  transformation: (typeof transformations)[0];
  index: number;
}) {
  const [sliderValue, setSliderValue] = useState([50]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="bg-card rounded-2xl p-6 shadow-lg">
        <div className="mb-4">
          <span className="text-rose-gold-light text-sm font-medium">{transformation.category}</span>
          <p className="text-muted-foreground text-sm mt-1">{transformation.description}</p>
        </div>

        <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 bg-charcoal">
          {/* Before Image (Background) */}
          <div className="absolute inset-0">
            <img
              src={transformation.before}
              alt="Before"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-charcoal/80 backdrop-blur-sm px-3 py-1.5 rounded-md">
              <span className="text-primary-foreground text-xs font-medium">Before</span>
            </div>
          </div>

          {/* After Image (Overlay with clip-path) */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 ${100 - sliderValue[0]}% 0 0)`,
            }}
          >
            <img
              src={transformation.after}
              alt="After"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-rose-gold/90 backdrop-blur-sm px-3 py-1.5 rounded-md">
              <span className="text-primary-foreground text-xs font-medium">After</span>
            </div>
          </div>

          {/* Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-rose-gold-light pointer-events-none z-10"
            style={{ left: `${sliderValue[0]}%` }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-gold-light rounded-full p-1.5 shadow-lg">
              <ArrowLeftRight size={16} className="text-charcoal" />
            </div>
          </div>
        </div>

        {/* Slider Control */}
        <div className="space-y-2">
          <Slider
            value={sliderValue}
            onValueChange={setSliderValue}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Drag to compare</span>
            <span>{sliderValue[0]}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
