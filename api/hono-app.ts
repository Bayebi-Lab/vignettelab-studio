import { Hono } from 'hono';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const app = new Hono().basePath('/api');

// ---------------------------------------------------------------------------
// Shared helpers (lazy-initialized so env vars are available at call time)
// ---------------------------------------------------------------------------

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === 'sk_test_your_stripe_secret_key') {
      throw new Error('STRIPE_SECRET_KEY is not configured.');
    }
    stripeInstance = new Stripe(key, { apiVersion: '2026-01-28.clover' });
  }
  return stripeInstance;
}

function createServerClient() {
  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function adminFrom() {
  return process.env.ADMIN_EMAIL || 'noreply@vignettelab.com';
}

// ---------------------------------------------------------------------------
// GET /api/health
// ---------------------------------------------------------------------------

app.get('/health', (c) => {
  return c.json({ status: 'ok', api: true });
});

// ---------------------------------------------------------------------------
// POST /api/create-payment-intent  (raw fetch to Stripe – no SDK)
// ---------------------------------------------------------------------------

app.post('/create-payment-intent', async (c) => {
  console.log('[create-payment-intent] invoked POST');

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey || stripeSecretKey === 'sk_test_your_stripe_secret_key') {
    return c.json({ error: 'STRIPE_SECRET_KEY is not configured' }, 500);
  }

  try {
    const body = await c.req.json<Record<string, unknown>>();
    const { product_id, product_name, price, customer_email, image_urls } = body;

    if (!product_id || !product_name || !price || !customer_email || !image_urls) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(customer_email))) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    if (!Array.isArray(image_urls) || image_urls.length < 1 || image_urls.length > 3) {
      return c.json({ error: 'Please upload between 1 and 3 images' }, 400);
    }

    const priceAmount = typeof price === 'number' ? price : parseFloat(String(price));
    if (isNaN(priceAmount) || priceAmount <= 0) {
      return c.json({ error: 'Invalid price' }, 400);
    }

    console.log('[create-payment-intent] calling Stripe API via fetch');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const formBody = new URLSearchParams({
      amount: String(Math.round(priceAmount * 100)),
      currency: 'usd',
      'metadata[product_id]': String(product_id),
      'metadata[product_name]': String(product_name),
      'metadata[customer_email]': String(customer_email),
      'metadata[image_urls]': JSON.stringify(image_urls),
      receipt_email: String(customer_email),
    });

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2026-01-28.clover',
      },
      body: formBody.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = (await stripeRes.json()) as {
      id?: string;
      client_secret?: string;
      error?: { message?: string };
    };

    if (!stripeRes.ok || data.error) {
      console.error('[create-payment-intent] Stripe error:', data);
      return c.json(
        { error: 'Failed to create payment intent', message: data.error?.message ?? stripeRes.statusText },
        500,
      );
    }

    return c.json({ client_secret: data.client_secret, payment_intent_id: data.id });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[create-payment-intent] Stripe API timeout');
      return c.json(
        { error: 'Request timed out', message: 'The payment service did not respond in time. Please try again.' },
        504,
      );
    }
    console.error('[create-payment-intent] error:', error);
    return c.json(
      { error: 'Failed to create payment intent', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /api/confirm-payment
// ---------------------------------------------------------------------------

app.post('/confirm-payment', async (c) => {
  try {
    const body = await c.req.json<Record<string, unknown>>();
    const { payment_intent_id, product_id, product_name, price, customer_email, image_urls } = body;

    if (!payment_intent_id || !product_name || !price || !customer_email || !image_urls) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.retrieve(String(payment_intent_id));

    if (paymentIntent.status !== 'succeeded') {
      return c.json({ error: `Payment not completed. Status: ${paymentIntent.status}` }, 400);
    }

    const supabase = createServerClient();
    const imageUrlsArray = Array.isArray(image_urls) ? image_urls : JSON.parse(String(image_urls));

    const productIdStr = String(product_id ?? '');
    const productIdUuid = productIdStr.length === 36 ? productIdStr : null;

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email,
        package_id: null,
        package_name: String(product_name),
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

    if (imageUrlsArray.length > 0) {
      const imageRecords = imageUrlsArray.map((url: string) => ({
        order_id: order.id,
        image_url: url,
        type: 'uploaded' as const,
      }));

      const { error: imagesError } = await supabase.from('order_images').insert(imageRecords);
      if (imagesError) {
        console.error('Failed to insert images:', imagesError);
      }
    }

    if (customer_email) {
      try {
        const resend = getResend();
        await resend.emails.send({
          from: adminFrom(),
          to: String(customer_email),
          subject: 'Order Confirmed - VignetteLab Studio',
          html: `
            <!DOCTYPE html>
            <html>
              <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
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
      }
    }

    return c.json({ success: true, order_id: order.id, order });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return c.json(
      { error: 'Failed to confirm payment', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /api/create-checkout-session
// ---------------------------------------------------------------------------

app.post('/create-checkout-session', async (c) => {
  try {
    const body = await c.req.json<Record<string, unknown>>();
    const { product_id, product_name, price, customer_email, image_urls } = body;

    if (!product_id || !product_name || !price || !customer_email || !image_urls) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(customer_email))) {
      return c.json({ error: 'Invalid email address' }, 400);
    }

    if (!Array.isArray(image_urls) || image_urls.length < 1 || image_urls.length > 3) {
      return c.json({ error: 'Please upload between 1 and 3 images' }, 400);
    }

    const appUrl =
      process.env.VITE_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:8080');

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: String(product_name),
              description: 'AI-generated maternity portrait product',
            },
            unit_amount: Math.round(Number(price) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: String(customer_email),
      metadata: {
        product_id: String(product_id),
        product_name: String(product_name),
        image_urls: JSON.stringify(image_urls),
      },
      success_url: `${appUrl}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout-cancel`,
    });

    return c.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return c.json(
      { error: 'Failed to create checkout session', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /api/send-email
// ---------------------------------------------------------------------------

app.post('/send-email', async (c) => {
  try {
    const body = await c.req.json<Record<string, unknown>>();
    const { to, subject, template_type, data } = body;

    if (!to || !subject || !template_type) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    let html = '';

    if (template_type === 'download_ready') {
      const { orderId, packageName, downloadLinks } = (data ?? {}) as {
        orderId: string;
        packageName: string;
        downloadLinks: string[];
      };
      html = `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #8B4513;">Your Portraits Are Ready!</h1>
            <p>Great news! Your ${packageName} portraits have been processed and are ready for download.</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Package:</strong> ${packageName}</p>
            </div>
            <div style="margin: 30px 0;">
              <a href="${downloadLinks[0]}" style="display: inline-block; background-color: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Download Your Portraits
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              <strong>Note:</strong> This download link will expire in 7 days. Please download your portraits soon.
            </p>
            <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
            <p>Best regards,<br>The VignetteLab Studio Team</p>
          </body>
        </html>
      `;
    } else {
      html = (data as { html?: string })?.html ?? '<p>No content provided</p>';
    }

    const resend = getResend();
    const result = await resend.emails.send({
      from: adminFrom(),
      to: String(to),
      subject: String(subject),
      html,
    });

    return c.json({ success: true, id: result.data?.id });
  } catch (error) {
    console.error('Error sending email:', error);
    return c.json(
      { error: 'Failed to send email', message: error instanceof Error ? error.message : 'Unknown error' },
      500,
    );
  }
});

// ---------------------------------------------------------------------------
// POST /api/webhooks/stripe
// ---------------------------------------------------------------------------

async function createOrderFromPayment(
  paymentIntentId: string,
  customerEmail: string,
  productName: string,
  productId: string | null,
  price: number,
  imageUrls: string[],
) {
  const supabase = createServerClient();

  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (existingOrder) {
    console.log('Order already exists for payment intent:', paymentIntentId);
    return existingOrder;
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_email: customerEmail,
      package_id: null,
      package_name: productName,
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

  if (imageUrls.length > 0) {
    const imageRecords = imageUrls.map((url: string) => ({
      order_id: order.id,
      image_url: url,
      type: 'uploaded' as const,
    }));

    const { error: imagesError } = await supabase.from('order_images').insert(imageRecords);
    if (imagesError) {
      console.error('Failed to insert images:', imagesError);
    }
  }

  if (customerEmail) {
    try {
      const resend = getResend();
      await resend.emails.send({
        from: adminFrom(),
        to: customerEmail,
        subject: 'Maternity Portrait Order Confirmed - VignetteLab Studio',
        html: `
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
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
    }
  }

  return order;
}

app.post('/webhooks/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');
  if (!signature) {
    return c.json({ error: 'No signature' }, 400);
  }

  // Read raw body for Stripe signature verification
  const rawBody = await c.req.text();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return c.json({ error: 'Webhook secret not configured' }, 500);
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return c.json({ error: 'Webhook signature verification failed' }, 400);
  }

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
        imageUrlsArray,
      );

      return c.json({ received: true, orderId: order.id });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return c.json(
        { error: 'Failed to process webhook', message: error instanceof Error ? error.message : 'Unknown error' },
        500,
      );
    }
  }

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
        return c.json({ received: true, skipped: 'Missing metadata' });
      }

      const imageUrlsArray = JSON.parse(imageUrls as string);
      const price = (paymentIntent.amount || 0) / 100;

      const order = await createOrderFromPayment(
        paymentIntent.id,
        customerEmail,
        productName,
        productId || null,
        price,
        imageUrlsArray,
      );

      return c.json({ received: true, orderId: order.id });
    } catch (error) {
      console.error('Error processing payment_intent.succeeded webhook:', error);
      return c.json(
        { error: 'Failed to process webhook', message: error instanceof Error ? error.message : 'Unknown error' },
        500,
      );
    }
  }

  return c.json({ received: true });
});

export { app };
export default app;
