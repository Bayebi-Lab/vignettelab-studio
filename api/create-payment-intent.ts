/**
 * Create Stripe Payment Intent using raw fetch() - no Stripe SDK.
 * This avoids cold-start issues with the Stripe package on Vercel serverless.
 */
export const maxDuration = 60;

async function parseBody(req: Request): Promise<unknown> {
  if (typeof req.json === 'function') return req.json();
  return {};
}

export default async function handler(req: Request): Promise<Response> {
  console.log('[create-payment-intent] invoked', req.method);
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey || stripeSecretKey === 'sk_test_your_stripe_secret_key') {
    return new Response(
      JSON.stringify({ error: 'STRIPE_SECRET_KEY is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = (await parseBody(req)) as Record<string, unknown>;
    const { product_id, product_name, price, customer_email, image_urls } = body;

    if (!product_id || !product_name || !price || !customer_email || !image_urls) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(customer_email))) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!Array.isArray(image_urls) || image_urls.length < 1 || image_urls.length > 3) {
      return new Response(JSON.stringify({ error: 'Please upload between 1 and 3 images' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const priceAmount = typeof price === 'number' ? price : parseFloat(String(price));
    if (isNaN(priceAmount) || priceAmount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid price' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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

    const data = (await stripeRes.json()) as { id?: string; client_secret?: string; error?: { message?: string } };
    if (!stripeRes.ok || data.error) {
      console.error('[create-payment-intent] Stripe error:', data);
      return new Response(
        JSON.stringify({
          error: 'Failed to create payment intent',
          message: data.error?.message ?? stripeRes.statusText,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        client_secret: data.client_secret,
        payment_intent_id: data.id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[create-payment-intent] Stripe API timeout');
      return new Response(
        JSON.stringify({
          error: 'Request timed out',
          message: 'The payment service did not respond in time. Please try again.',
        }),
        { status: 504, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.error('[create-payment-intent] error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
