import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <section className="pt-24 pb-16 min-h-screen bg-cream">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="prose prose-neutral dark:prose-invert max-w-none"
          >
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground text-lg mb-8">VignetteLab Studio</p>

            <p className="text-muted-foreground text-sm mb-12">
              <strong>Effective Date:</strong> January 1, 2026
            </p>

            <p className="text-muted-foreground mb-8">
              At VignetteLab Studio, your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              When you use our website or services, we may collect:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li><strong>Personal information:</strong> Name, email, phone number, pregnancy stage (weeks), and photos you upload.</li>
              <li><strong>Payment information:</strong> Credit/debit card or other payment details (processed securely by our payment partners).</li>
              <li><strong>Usage data:</strong> IP address, browser type, pages visited on our website.</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use your information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>Create your AI maternity portraits</li>
              <li>Communicate with you about your orders or updates</li>
              <li>Improve our services and website experience</li>
              <li>Send marketing emails if you've opted in</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">3. Sharing Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your data. We may share information with:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>Service providers (AI processing, payment processors) for order fulfillment</li>
              <li>Legal authorities if required by law</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">4. Photos & Portraits</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>Any photos you upload are used exclusively to generate your AI portraits.</li>
              <li>We may feature client portraits on our website or Instagram only with consent.</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You can:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li>Request a copy of your personal data</li>
              <li>Ask us to delete your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              To exercise your rights,{" "}
              <Link to="/contact" className="text-primary hover:underline">
                contact us
              </Link>.
            </p>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">6. Data Security</h2>
            <p className="text-muted-foreground mb-8">
              We use appropriate technical and organizational measures to protect your data, including secure storage and encryption.
            </p>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">7. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-12">
              We may update this policy occasionally. Updates will be posted on this page with a revised effective date.
            </p>
          </motion.article>
        </div>
      </section>
    </Layout>
  );
}
