import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail } from 'lucide-react';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const sessionId = searchParams.get('session_id'); // Legacy support

  // Determine which identifier to use for order status
  const orderIdentifier = orderId || sessionId;

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
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle size={48} className="text-primary" />
              </div>
            </div>

            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. We've received your payment and will start processing your
              portraits shortly.
            </p>

            {orderId && (
              <div className="bg-cream rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-sm font-semibold">{orderId}</p>
              </div>
            )}

            <div className="bg-cream rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
                <Mail size={16} />
                <span className="text-sm">Check your email</span>
              </div>
              <p className="text-sm text-foreground">
                We've sent a confirmation email with your order details. You'll receive another
                email with download links once your portraits are ready.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <Link to="/">Back to Home</Link>
              </Button>
              {orderIdentifier && (
                <Button asChild>
                  <Link
                    to={`/order-status${
                      orderId
                        ? `?order_id=${orderId}`
                        : sessionId
                        ? `?session_id=${sessionId}`
                        : ''
                    }`}
                  >
                    View Order Status
                  </Link>
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
