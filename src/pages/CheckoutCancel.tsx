import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

export default function CheckoutCancel() {
  return (
    <Layout>
      <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-background rounded-2xl shadow-lg p-8 md:p-12 text-center"
          >
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <XCircle size={48} className="text-destructive" />
              </div>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Payment Cancelled
            </h1>
            <p className="text-muted-foreground mb-8">
              Your payment was cancelled. No charges were made. You can try again anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/pricing">View Packages</Link>
              </Button>
              <Button asChild>
                <Link to="/">Back to Home</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
