const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config();
const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // ✅ Make sure this is your secret key

app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { name, price } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name }, // ✅ required for inline product
          unit_amount: Math.round(price * 100), // ✅ convert dollars to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/confirm`,
      cancel_url: `${process.env.FRONTEND_URL}/store`,
    });

    res.json({ url: session.url }); // ✅ return full URL, not just session ID
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));