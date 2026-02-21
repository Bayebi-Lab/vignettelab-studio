import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { TransformationSection } from "@/components/home/TransformationSection";
import { PackagesSection } from "@/components/home/PackagesSection";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { InstagramGallerySection } from "@/components/home/InstagramGallerySection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorksSection />
      <TransformationSection />
      <PackagesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <InstagramGallerySection />
      <CTASection />
    </Layout>
  );
};

export default Index;