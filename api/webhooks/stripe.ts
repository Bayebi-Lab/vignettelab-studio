import Stripe from 'stripe';
import { Resend } from 'resend';
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response(JSON.stringify({ error: 'No signature' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let event: Stripe.Event;

  try {
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

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const supabase = createServerClient();
      const { package_id, package_name, image_urls } = session.metadata || {};

      if (!package_id || !package_name || !image_urls) {
        throw new Error('Missing metadata in session');
      }

      const imageUrlsArray = JSON.parse(image_urls as string);

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_email: session.customer_email || session.customer_details?.email,
          package_id: null, // We'll store package name instead
          package_name,
          price: (session.amount_total || 0) / 100, // Convert from cents
          status: 'processing',
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_checkout_session_id: session.id,
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
      const customerEmail = session.customer_email || session.customer_details?.email;
      if (customerEmail) {
        try {
          await resend.emails.send({
            from: process.env.ADMIN_EMAIL || 'noreply@vignettelab.com',
            to: customerEmail,
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
                    <p><strong>Package:</strong> ${package_name}</p>
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

  // Return success for other event types
  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
