import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
} else {
  console.log('✅ Stripe API Key loaded');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-02-24.acacia',
});

// Test Stripe connection
stripe.balance
  .retrieve()
  .then(() => {
    console.log('✅ Stripe Connected Successfully');
  })
  .catch((error) => {
    console.error('❌ Stripe Connection Failed:', error.message);
  });
