import Stripe from 'stripe';
import { Resend } from 'resend';
import { parseBody } from './lib/parse-body.js';
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

  try {
    const body = (await parseBody(req)) as Record<string, unknown>;
    const { payment_intent_id, product_id, product_name, price, customer_email, image_urls } = body;

    // Validate required fields (product_id optional for backward compat)
    if (!payment_intent_id || !product_name || !price || !customer_email || !image_urls) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify payment intent status
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(String(payment_intent_id));
    
    if (paymentIntent.status !== 'succeeded') {
      return new Response(
        JSON.stringify({ error: `Payment not completed. Status: ${paymentIntent.status}` }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createServerClient();
    const imageUrlsArray = Array.isArray(image_urls) ? image_urls : JSON.parse(String(image_urls));

    // Create order in database
    const productIdStr = String(product_id ?? '');
    const productIdUuid = productIdStr.length === 36 ? productIdStr : null;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email,
        package_id: null,
        package_name: String(product_name), // Keep column name for backward compat
        product_id: productIdUuid,
        price: typeof price === 'number' ? price : parseFloat(String(price)),
        status: 'processing',
        stripe_payment_intent_id: String(payment_intent_id),
        stripe_checkout_session_id: null,
      })
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // Insert uploaded images
    if (imageUrlsArray.length > 0) {
      const imageRecords = imageUrlsArray.map((url: string) => ({
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
    if (customer_email) {
      try {
        await resend.emails.send({
          from: process.env.ADMIN_EMAIL || 'noreply@vignettelab.com',
          to: String(customer_email),
          subject: 'Order Confirmed - VignetteLab Studio',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #8B4513;">Order Confirmed!</h1>
                <p>Thank you for your order. We've received your payment and will start processing your portraits shortly.</p>
                
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="margin-top: 0;">Order Details</h2>
                  <p><strong>Order ID:</strong> ${order.id}</p>
                  <p><strong>Product:</strong> ${product_name}</p>
                  <p><strong>Amount:</strong> $${order.price.toFixed(2)}</p>
                  <p><strong>Status:</strong> Processing</p>
                </div>
                
                <p>We'll send you another email with download links once your portraits are ready (typically within 24 hours).</p>
                
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

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error confirming payment:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to confirm payment',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
