import Stripe from 'stripe';
import { Resend } from 'resend';
import { getRawBody, getHeader } from '../lib/parse-body.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

function createServerClient() {
  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Lazy initialization to ensure env vars are loaded
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey || stripeSecretKey === 'sk_test_your_stripe_secret_key') {
      throw new Error('STRIPE_SECRET_KEY is not configured. Please set it in your .env file.');
    }
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2026-01-28.clover',
    });
  }
  return stripeInstance;
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const signature = getHeader(req, 'stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await getRawBody(req);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Helper function to create order from payment data
  async function createOrderFromPayment(
    paymentIntentId: string,
    customerEmail: string,
    productName: string,
    productId: string | null,
    price: number,
    imageUrls: string[]
  ) {
    const supabase = createServerClient();

    // Check if order already exists
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (existingOrder) {
      console.log('Order already exists for payment intent:', paymentIntentId);
      return existingOrder;
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        package_id: null,
        package_name: productName, // Denormalized for display
        product_id: productId,
        price,
        status: 'processing',
        stripe_payment_intent_id: paymentIntentId,
        stripe_checkout_session_id: null,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Insert uploaded images
    if (imageUrls.length > 0) {
      const imageRecords = imageUrls.map((url: string) => ({
        order_id: order.id,
        image_url: url,
        type: 'uploaded' as const,
      }));

      const { error: imagesError } = await supabase
        .from('order_images')
        .insert(imageRecords);

      if (imagesError) {
        console.error('Failed to insert images:', imagesError);
        // Don't throw - order is created, images can be added later
      }
    }

    // Send confirmation email
    if (customerEmail) {
      try {
        await resend.emails.send({
          from: process.env.ADMIN_EMAIL || 'noreply@vignettelab.com',
          to: customerEmail,
          subject: 'Maternity Portrait Order Confirmed - VignetteLab Studio',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #8B4513;">Maternity Portrait Order Confirmed!</h1>
                <p>Thank you for your order. We've received your payment and will start processing your beautiful maternity portraits shortly.</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="margin-top: 0;">Order Details</h2>
                  <p><strong>Order ID:</strong> ${order.id}</p>
                  <p><strong>Product:</strong> ${productName}</p>
                  <p><strong>Amount:</strong> $${order.price.toFixed(2)}</p>
                  <p><strong>Status:</strong> Processing</p>
                </div>
                
                <p>We'll send you another email with download links once your maternity portraits are ready (typically within 24 hours).</p>
                
                <p>If you have any questions, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>The VignetteLab Studio Team</p>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Don't throw - order is created, email can be sent later
      }
    }

    return order;
  }

  // Handle the checkout.session.completed event (legacy flow)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const metadata = session.metadata || {};
      const productId = metadata.product_id || metadata.package_id;
      const productName = metadata.product_name || metadata.package_name;
      const imageUrls = metadata.image_urls;

      if (!productName || !imageUrls) {
        throw new Error('Missing metadata in session');
      }

      const imageUrlsArray = JSON.parse(imageUrls as string);
      const customerEmail = session.customer_email || session.customer_details?.email || '';

      const order = await createOrderFromPayment(
        session.payment_intent as string,
        customerEmail,
        productName,
        productId || null,
        (session.amount_total || 0) / 100,
        imageUrlsArray
      );

      return new Response(
        JSON.stringify({ received: true, orderId: order.id }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to process webhook',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Handle the payment_intent.succeeded event (new direct payment flow)
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      const metadata = paymentIntent.metadata || {};
      const productId = metadata.product_id || metadata.package_id;
      const productName = metadata.product_name || metadata.package_name;
      const customerEmail = metadata.customer_email;
      const imageUrls = metadata.image_urls;

      if (!productName || !customerEmail || !imageUrls) {
        console.log('Missing metadata in payment intent, skipping order creation');
        // Return success but don't create order - frontend will handle it
        return new Response(
          JSON.stringify({ received: true, skipped: 'Missing metadata' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const imageUrlsArray = JSON.parse(imageUrls as string);
      const price = (paymentIntent.amount || 0) / 100;

      const order = await createOrderFromPayment(
        paymentIntent.id,
        customerEmail,
        productName,
        productId || null,
        price,
        imageUrlsArray
      );

      return new Response(
        JSON.stringify({ received: true, orderId: order.id }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } catch (error) {
      console.error('Error processing payment_intent.succeeded webhook:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to process webhook',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // Return success for other event types
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
