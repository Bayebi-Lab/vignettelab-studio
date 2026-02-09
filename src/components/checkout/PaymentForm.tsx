import { useState, FormEvent } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentFormProps {
  clientSecret: string;
  packageName: string;
  price: number;
  customerEmail: string;
  imageUrls: string[];
  packageId: string;
  paymentIntentId: string;
  onSuccess: (orderId: string) => void;
}

export function PaymentForm({
  clientSecret,
  packageName,
  price,
  customerEmail,
  imageUrls,
  packageId,
  paymentIntentId,
  onSuccess,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
        },
        redirect: 'if_required', // Only redirect if required (3D Secure)
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      // If payment succeeded, confirm with backend and create order
      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const response = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_intent_id: paymentIntentId,
            package_id: packageId,
            package_name: packageName,
            price,
            customer_email: customerEmail,
            image_urls: imageUrls,
          }),
        });

        if (!response.ok) {
          let errorMessage = 'Failed to confirm payment';
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            // If response is not JSON, use status text
            errorMessage = response.statusText || `HTTP ${response.status}`;
          }
          throw new Error(errorMessage);
        }

        const { order_id } = await response.json();
        toast.success('Payment successful! Order created.');
        onSuccess(order_id);
      } else {
        setError('Payment was not completed. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-cream rounded-lg p-6">
        <h3 className="font-serif text-xl mb-4">Payment Details</h3>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Package</span>
          <span className="font-semibold">{packageName}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Images</span>
          <span className="font-semibold">{imageUrls.length} uploaded</span>
        </div>
        <div className="flex items-center justify-between text-lg font-semibold pt-4 border-t">
          <span>Total</span>
          <span className="font-serif text-2xl">${price.toFixed(2)}</span>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={!stripe || !elements || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          `Pay $${price.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secure and encrypted. By completing this purchase, you agree to our terms of service.
      </p>
    </form>
  );
}
