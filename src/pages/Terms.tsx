import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function Terms() {
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
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-lg mb-8">VignetteLab Studio</p>

            <p className="text-muted-foreground text-sm mb-12">
              <strong>Effective Date:</strong> January 1, 2026
            </p>

            <p className="text-muted-foreground mb-12">
              By using VignetteLab Studio services, you agree to the following terms:
            </p>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">1. Services</h2>
            <p className="text-muted-foreground mb-8">
              We provide AI-generated maternity portraits based on photos you submit. All deliveries are digital.
            </p>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">2. Orders & Payment</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>Prices are listed on our website.</li>
              <li>Payment is required at the time of order.</li>
              <li>Once payment is processed, your order will be generated and delivered digitally.</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">3. Delivery</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>All portrait packages are delivered within 24 hours unless otherwise specified.</li>
              <li>Delivery is digital via email or secure download link.</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">4. Revisions</h2>
            <p className="text-muted-foreground mb-4">Revision policies depend on your package:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
              <li><strong>Essential Glow</strong> – no revisions</li>
              <li><strong>Signature Glow</strong> – 2 revision rounds</li>
              <li><strong>Luxury Portraits</strong> – unlimited revisions</li>
            </ul>
            <p className="text-muted-foreground mb-8">
              Requests must be made within 7 days of receiving portraits.
            </p>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">5. Intellectual Property</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>You retain full rights to the final portraits.</li>
              <li>We retain rights to use AI-generated images for marketing only with your consent.</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">6. User Responsibilities</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>You must provide accurate information and photos.</li>
              <li>You are responsible for any content you submit.</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">7. Refunds & Cancellations</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>Orders are non-refundable once delivery is complete.</li>
              <li>Refunds may be issued at our discretion for technical errors or failure to deliver.</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">8. Limitation of Liability</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-8">
              <li>We are not liable for indirect, incidental, or consequential damages.</li>
              <li>Our maximum liability is limited to the purchase price of your order.</li>
            </ul>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">9. Changes to Terms</h2>
            <p className="text-muted-foreground mb-8">
              We may update these terms periodically. Updates will be posted on this page with a revised effective date.
            </p>

            <h2 className="font-serif text-2xl text-foreground mt-12 mb-4">10. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              Questions about these terms or our services?
            </p>
            <p className="text-muted-foreground mb-1">
              <strong>Email:</strong>{" "}
              <a href="mailto:hello@vignettelab.studio" className="text-primary hover:underline">
                hello@vignettelab.studio
              </a>
            </p>
            <p className="text-muted-foreground mb-8">
              <strong>Address:</strong> 08222, Terrassa, Spain
            </p>
            <p className="text-muted-foreground">
              You can also{" "}
              <Link to="/contact" className="text-primary hover:underline">
                reach us through our contact form
              </Link>.
            </p>
          </motion.article>
        </div>
      </section>
    </Layout>
  );
}
