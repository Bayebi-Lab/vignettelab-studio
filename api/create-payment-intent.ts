import Stripe from 'stripe';

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

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { product_id, product_name, price, customer_email, image_urls } = body;

    // Validate required fields
    if (!product_id || !product_name || !price || !customer_email || !image_urls) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate image URLs
    if (!Array.isArray(image_urls) || image_urls.length < 1 || image_urls.length > 3) {
      return new Response(
        JSON.stringify({ error: 'Please upload between 1 and 3 images' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate price
    const priceAmount = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(priceAmount) || priceAmount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid price' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Stripe Payment Intent
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(priceAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        product_id,
        product_name,
        customer_email,
        image_urls: JSON.stringify(image_urls),
      },
      receipt_email: customer_email,
    });

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to create payment intent',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
