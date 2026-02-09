import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Elements } from '@stripe/react-stripe-js';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { ImageUpload } from '@/components/checkout/ImageUpload';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { Check, ArrowLeft, ArrowRight, Package as PackageIcon, Upload, CreditCard, Loader2 } from 'lucide-react';
import { uploadImages } from '@/lib/storage';
import { toast } from 'sonner';
import { stripePromise } from '@/lib/stripe';
import { usePackages, type Package } from '@/hooks/usePackages';

const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type Step = 1 | 2 | 3;

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { packages, loading: packagesLoading, error: packagesError } = usePackages();
  const initialPackageSlug = searchParams.get('package') || '';
  const initialStep = parseInt(searchParams.get('step') || '1', 10) as Step;

  const [currentStep, setCurrentStep] = useState<Step>(initialStep);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
    },
  });

  // Set initial package when packages are loaded
  useEffect(() => {
    if (packages.length > 0 && !selectedPackage) {
      const pkg = initialPackageSlug
        ? packages.find((p) => p.name.toLowerCase() === initialPackageSlug.toLowerCase())
        : null;
      setSelectedPackage(pkg || packages[0]);
    }
  }, [packages, initialPackageSlug, selectedPackage]);

  // Update URL when step changes
  useEffect(() => {
    if (selectedPackage) {
      const params = new URLSearchParams(searchParams);
      params.set('package', selectedPackage.name.toLowerCase());
      params.set('step', currentStep.toString());
      navigate(`/checkout?${params.toString()}`, { replace: true });
    }
  }, [currentStep, selectedPackage, navigate, searchParams]);

  const handlePackageSelect = (packageId: string) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
    }
  };

  if (packagesLoading) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading packages...</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (packagesError || packages.length === 0) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading packages</p>
            <p className="text-muted-foreground text-sm">{packagesError || 'No packages available'}</p>
            <Button asChild className="mt-4">
              <Link to="/pricing">Back to Pricing</Link>
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  if (!selectedPackage) {
    return (
      <Layout>
        <section className="pt-24 pb-16 min-h-screen bg-cream flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </section>
      </Layout>
    );
  }

  const handleStep2Next = async (values: CheckoutFormValues) => {
    if (images.length < 1) {
      toast.error('Please upload at least 1 image');
      return;
    }

    if (images.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    setIsUploading(true);

    try {
      // Upload images to Supabase Storage
      const uploadResults = await uploadImages(images);
      const urls = uploadResults.map((result) => result.url);
      setImageUrls(urls);

      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: selectedPackage.id,
          package_name: selectedPackage.name,
          price: selectedPackage.price,
          customer_email: values.email,
          image_urls: urls,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create payment intent';
        try {
          const error = await response.json();
          errorMessage = error.message || error.error || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const { client_secret, payment_intent_id } = await response.json();
      setClientSecret(client_secret);
      setPaymentIntentId(payment_intent_id);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaymentSuccess = (orderId: string) => {
    navigate(`/checkout-success?order_id=${orderId}`);
  };

  const steps = [
    {
      number: 1,
      title: 'Select Package',
      icon: PackageIcon,
    },
    {
      number: 2,
      title: 'Upload Images',
      icon: Upload,
    },
    {
      number: 3,
      title: 'Payment',
      icon: CreditCard,
    },
  ];

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
              Follow these simple steps to get your AI-generated portraits.
            </p>

            {/* Step Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => {
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.number} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground border-primary'
                              : isCompleted
                              ? 'bg-primary/10 text-primary border-primary'
                              : 'bg-background text-muted-foreground border-muted-foreground'
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={20} />
                          ) : (
                            <StepIcon size={20} />
                          )}
                        </div>
                        <span
                          className={`text-xs mt-2 font-medium ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 ${
                            isCompleted ? 'bg-primary' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <h2 className="font-serif text-2xl">Select Your Package</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      {packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => handlePackageSelect(pkg.id)}
                          className={`p-6 rounded-lg border-2 text-left transition-all ${
                            selectedPackage.id === pkg.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{pkg.name}</h3>
                              <p className="text-muted-foreground text-sm">
                                {pkg.portraits} portraits
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-serif text-2xl">${pkg.price}</p>
                            </div>
                          </div>
                          <ul className="space-y-2">
                            {pkg.features.slice(0, 3).map((feature) => (
                              <li key={feature} className="flex items-start gap-2 text-sm">
                                <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={() => setCurrentStep(2)} size="lg">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl mb-2">Upload Your Photos</h2>
                      <p className="text-muted-foreground">
                        Upload 1-3 photos to get started with your {selectedPackage.name} package.
                      </p>
                    </div>

                    {/* Package Summary */}
                    <div className="bg-cream rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{selectedPackage.name}</h3>
                          <p className="text-muted-foreground text-sm">
                            {selectedPackage.portraits} AI-generated portraits
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-serif text-xl">${selectedPackage.price}</p>
                        </div>
                      </div>
                    </div>

                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleStep2Next)}
                        className="space-y-6"
                      >
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

                        <div>
                          <ImageUpload
                            images={images}
                            onImagesChange={setImages}
                            maxImages={3}
                            minImages={1}
                          />
                        </div>

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                          >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                          </Button>
                          <Button
                            type="submit"
                            size="lg"
                            className="flex-1"
                            disabled={isUploading || images.length < 1}
                          >
                            {isUploading ? (
                              <>
                                <span className="mr-2">Uploading...</span>
                              </>
                            ) : (
                              <>
                                Continue to Payment
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && clientSecret && paymentIntentId && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-serif text-2xl mb-2">Complete Payment</h2>
                      <p className="text-muted-foreground">
                        Enter your payment details to complete your order.
                      </p>
                    </div>

                    <Elements
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                        },
                      }}
                    >
                      <PaymentForm
                        clientSecret={clientSecret}
                        packageName={selectedPackage.name}
                        price={selectedPackage.price}
                        customerEmail={form.getValues('email')}
                        imageUrls={imageUrls}
                        packageId={selectedPackage.id}
                        paymentIntentId={paymentIntentId}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Upload
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
