import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import maternityImg from "@/assets/category-maternity.jpg";
import newbornImg from "@/assets/category-newborn.jpg";
import familyImg from "@/assets/category-family.jpg";
import professionalImg from "@/assets/category-professional.jpg";
import birthdayImg from "@/assets/category-birthday.jpg";
import holidayImg from "@/assets/category-holiday.jpg";
import heroImg from "@/assets/hero-family.jpg";

const categories = ["All", "Maternity", "Newborn", "Family", "Professional", "Birthday", "Holiday"];

const galleryItems = [
  { id: 1, category: "Maternity", image: maternityImg, title: "Expecting Joy" },
  { id: 2, category: "Newborn", image: newbornImg, title: "First Days" },
  { id: 3, category: "Family", image: familyImg, title: "Together" },
  { id: 4, category: "Professional", image: professionalImg, title: "Career Ready" },
  { id: 5, category: "Birthday", image: birthdayImg, title: "Celebrate" },
  { id: 6, category: "Holiday", image: holidayImg, title: "Festive Spirit" },
  { id: 7, category: "Family", image: heroImg, title: "New Beginnings" },
  { id: 8, category: "Maternity", image: maternityImg, title: "Radiant" },
  { id: 9, category: "Newborn", image: newbornImg, title: "Sweet Dreams" },
];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-24 pb-16 bg-cream">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
              Our Portrait Gallery
            </h1>
            <p className="text-muted-foreground text-lg">
              Explore our collection of AI-generated portraits. Each image tells a unique story of love, connection, and celebration.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="py-8 bg-background border-b border-border sticky top-16 lg:top-20 z-40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "warm"}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-rose-gold-light text-sm font-medium">{item.category}</span>
                  <h3 className="font-serif text-xl text-primary-foreground">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;