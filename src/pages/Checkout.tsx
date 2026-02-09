import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageUpload } from '@/components/checkout/ImageUpload';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { uploadImages } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const packages = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    portraits: 5,
    features: [
      '5 AI-generated portraits',
      '1 portrait style',
      'Standard resolution',
      '24-hour delivery',
      'Basic retouching',
    ],
  },
  {
    id: 'family',
    name: 'Family',
    price: 79,
    portraits: 20,
    features: [
      '20 AI-generated portraits',
      '3 portrait styles',
      'High resolution',
      '12-hour priority delivery',
      'Advanced retouching',
      '2 revision rounds',
      'Print-ready files',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    portraits: 50,
    features: [
      '50 AI-generated portraits',
      'Unlimited styles',
      'Ultra-high resolution',
      '6-hour express delivery',
      'Premium retouching',
      'Unlimited revisions',
      'Print-ready files',
      'Custom backgrounds',
      'Dedicated support',
    ],
  },
];

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageId = searchParams.get('package') || 'starter';
  const selectedPackage = packages.find((p) => p.id === packageId) || packages[0];

  const [images, setImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleCheckout = async (values: CheckoutFormValues) => {
    if (images.length < 5) {
      toast.error('Please upload at least 5 images');
      return;
    }

    if (images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setIsUploading(true);
    setIsProcessing(true);

    try {
      // Upload images to Supabase Storage
      const uploadResults = await uploadImages(images);
      const imageUrls = uploadResults.map((result) => result.url);

      // Create Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          package_name: selectedPackage.name,
          price: selectedPackage.price,
          customer_email: values.email,
          image_urls: imageUrls,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <section className="pt-24 pb-16 min-h-screen bg-cream">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Pricing
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-background rounded-2xl shadow-lg p-6 md:p-8"
          >
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2">
              Complete Your Order
            </h1>
            <p className="text-muted-foreground mb-8">
              Review your package and upload your photos to get started.
            </p>

            {/* Package Summary */}
            <div className="bg-cream rounded-lg p-6 mb-8">
              <h2 className="font-serif text-xl mb-4">Selected Package</h2>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedPackage.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {selectedPackage.portraits} AI-generated portraits
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-2xl">${selectedPackage.price}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {selectedPackage.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCheckout)} className="space-y-8">
                {/* Email Input */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your.email@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        We'll send your order confirmation and download links to this email.
                      </p>
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div>
                  <Label className="mb-4 block">Upload Your Photos</Label>
                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={10}
                    minImages={5}
                  />
                </div>

                {/* Order Summary */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${selectedPackage.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg font-semibold pt-4 border-t">
                    <span>Total</span>
                    <span className="font-serif text-2xl">${selectedPackage.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isUploading || isProcessing || images.length < 5}
                >
                  {isUploading || isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By proceeding, you agree to our terms of service and privacy policy.
                </p>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
