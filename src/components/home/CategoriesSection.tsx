import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import maternityImg from "@/assets/category-maternity.jpg";
import newbornImg from "@/assets/category-newborn.jpg";
import familyImg from "@/assets/category-family.jpg";
import professionalImg from "@/assets/category-professional.jpg";
import birthdayImg from "@/assets/category-birthday.jpg";
import holidayImg from "@/assets/category-holiday.jpg";

const categories = [
  {
    id: "maternity",
    title: "Maternity",
    description: "Celebrate the journey of motherhood",
    image: maternityImg,
    featured: true,
  },
  {
    id: "newborn",
    title: "Newborn",
    description: "Capture those precious first moments",
    image: newbornImg,
    featured: true,
  },
  {
    id: "family",
    title: "Family",
    description: "Preserve your family's unique bond",
    image: familyImg,
    featured: false,
  },
  {
    id: "professional",
    title: "Professional",
    description: "Elevate your professional presence",
    image: professionalImg,
    featured: false,
  },
  {
    id: "birthday",
    title: "Birthdays",
    description: "Mark every milestone celebration",
    image: birthdayImg,
    featured: false,
  },
  {
    id: "holiday",
    title: "Holidays",
    description: "Create festive family memories",
    image: holidayImg,
    featured: false,
  },
];

export function CategoriesSection() {
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
            Explore Collections
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-4">
            Portrait Categories
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From life's grand milestones to everyday magic, find the perfect portrait style for your story.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl ${
                category.featured ? "md:row-span-2" : ""
              }`}
            >
              <Link to={`/gallery?category=${category.id}`} className="block">
                <div className={`relative overflow-hidden ${category.featured ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="font-serif text-2xl md:text-3xl text-primary-foreground mb-2">
                      {category.title}
                    </h3>
                    <p className="text-primary-foreground/80 text-sm mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-2 text-rose-gold-light font-medium text-sm group-hover:gap-3 transition-all">
                      <span>Explore</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}