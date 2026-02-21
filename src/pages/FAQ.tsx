import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How does VignetteLab work?",
        a: "VignetteLab uses advanced AI technology to transform your pregnancy photos into stunning studio-quality maternity portraits. Simply upload 2-10 photos showing your beautiful bump (max 10MB each), choose your preferred style, and our AI creates beautiful maternity portraits with professional lighting and composition.",
      },
      {
        q: "What kind of photos should I upload?",
        a: "Upload high-quality, well-lit photos of yourself, including clear close-up headshots and full-body shots that show off your beautiful bump and any unique traits like tattoos or birthmarks. To help us bring your vision to life, feel free to include inspiration images of the specific styles, outfits, and poses you love most!",
      },
      {
        q: "How long does it take to receive my portraits?",
        a: "Standard delivery is 24 hours. Glow Package members receive priority 12-hour delivery, while Complete Collection members get express 6-hour delivery. Most orders are completed even faster!",
      },
    ],
  },
  {
    category: "Quality & Results",
    questions: [
      {
        q: "Will my portraits look realistic?",
        a: "Absolutely! Our AI preserves your unique features while enhancing lighting, composition, and overall quality. The results are natural-looking portraits that capture your authentic appearance with professional polish.",
      },
      {
        q: "What if I'm not happy with the results?",
        a: "We want you to love your maternity portraits. If you're not satisfied, we offer revision rounds based on your product. Complete Collection members enjoy unlimited revisions until you're completely happy.",
      },
      {
        q: "What resolution are the final images?",
        a: "Every Package delivers high resolution for large prints and professional use.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        q: "Are my photos kept private?",
        a: "Absolutely. Your privacy is our top priority. All uploaded photos are encrypted and processed securely. We never share your images with third parties, and you can request deletion of your photos at any time.",
      },
      {
        q: "How long do you keep my photos?",
        a: "We retain your uploaded photos for 30 days to allow for revisions and reprocessing if needed. After 30 days, all source images are automatically deleted. Final portraits remain available in your account indefinitely.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes! We use industry-standard encryption and partner with trusted payment processors. We never store your full payment details on our servers.",
      },
    ],
  },
  {
    category: "Pricing & Plans",
    questions: [
      {
        q: "What trimester is best for maternity photos?",
        a: "The best time for maternity photos is typically between 28-36 weeks, when your bump is beautifully visible but you're still comfortable. However, you can capture beautiful photos at any stage of your pregnancy journey.",
      },
      {
        q: "Can I include my partner or other children?",
        a: "Currently, our AI focuses on individual maternity portraits. However, you can order separate sessions for family photos. We're working on adding family maternity options soon!",
      },
      {
        q: "How do I pose for the best bump photos?",
        a: "The best poses showcase your bump naturally. Try side profiles, hands on your bump, or standing poses. Our AI works with any pose you're comfortable with - just upload photos where you love how you look!",
      },
      {
        q: "Can I upgrade my package?",
        a: "Yes! You can upgrade to a higher product at any time. Just pay the difference and enjoy the additional features and portraits.",
      },
      {
        q: "Do you offer refunds?",
        a: "We offer a satisfaction guarantee. If you're not happy with your portraits after using all available revisions, contact our support team to discuss refund options.",
      },
      {
        q: "Are there any hidden fees?",
        a: "No hidden fees, ever. The price you see is the price you pay. Optional add-ons like rush delivery or additional portraits are clearly priced.",
      },
    ],
  },
];

const FAQ = () => {
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
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground text-lg">
              Everything you need to know about VignetteLab maternity photography. Can't find what you're looking for? Reach out to our support team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {faqs.map((section, sectionIndex) => (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
              className="mb-12"
            >
              <h2 className="font-serif text-2xl text-foreground mb-6">
                {section.category}
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {section.questions.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`${sectionIndex}-${index}`}
                    className="bg-cream rounded-xl border-none px-6"
                  >
                    <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-5">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-cream-dark">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <MessageCircle size={48} className="text-primary mx-auto mb-6" />
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Our friendly support team is here to help. Reach out and we'll get back to you within 24 hours.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;