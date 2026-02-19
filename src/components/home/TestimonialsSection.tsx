import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Expecting Mother",
    content: "I was hesitant about maternity photos, but VignetteLab captured my pregnancy glow so beautifully! The bump photos are stunning and I didn't even have to leave my house. Perfect for busy moms-to-be!",
    rating: 5,
  },
  {
    name: "Jessica Martinez",
    role: "New Mom",
    content: "I'm so glad I captured my pregnancy journey with VignetteLab. The maternity portraits are absolutely gorgeous and I love how they preserved my glow. These photos will be treasured forever!",
    rating: 5,
  },
  {
    name: "Emily Thompson",
    role: "Expecting Mother",
    content: "As someone who's not comfortable in front of a camera, I loved how easy it was to get beautiful maternity photos from home. The AI captured my bump perfectly and the results exceeded all my expectations!",
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest mb-4 block">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Loved by Expecting Mothers Everywhere
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of happy expecting mothers who've captured their pregnancy glow with beautiful maternity portraits.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="bg-cream p-8 rounded-2xl relative"
            >
              <Quote size={40} className="text-primary/20 absolute top-6 right-6" />
              
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={18} className="text-primary fill-primary" />
                ))}
              </div>

              <p className="text-foreground leading-relaxed mb-6 relative z-10">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-serif text-primary font-medium">
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}