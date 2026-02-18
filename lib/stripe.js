import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const getStripePrices = async () => {
  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product'],
  });

  return prices.data.map(price => ({
    id: price.id,
    productId: price.product.id,
    name: price.product.name,
    description: price.product.description,
    price: price.unit_amount / 100,
    currency: price.currency,
    interval: price.recurring?.interval,
    interval_count: price.recurring?.interval_count,
  }));
};

export const createCheckoutSession = async (userId, priceId, successUrl, cancelUrl) => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  });

  return session;
};

export const createPortalSession = async (customerId, returnUrl) => {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
};