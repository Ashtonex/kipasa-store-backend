const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config();
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// ✅ POST: Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  const { name, price } = req.body;

  if (!name || !price || typeof price !== 'number') {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name },
            unit_amount: price, // already in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/confirm`,
      cancel_url: `${process.env.FRONTEND_URL}/store`,
    });

    console.log('Stripe session created:', session.id);
    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Optional: Catch-all GET route for debugging
app.use((req, res) => {
  res.status(404).send('Route not found. Use POST /create-checkout-session.');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));