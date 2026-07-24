require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// In-memory product list
let products = [
  { id: "p1", name: "Sample Product A", amount: 1500, currency: "aud" }, // $15.00
  { id: "p2", name: "Sample Product B", amount: 2500, currency: "aud" }, // $25.00
];

// ---------- PRODUCTS CRUD ----------

// Get all products
app.get("/products", (req, res) => {
  res.json(products);
});

// Add product
app.post("/products", (req, res) => {
  const { id, name, amount, currency } = req.body;
  if (!id || !name || !amount || !currency) {
    return res.status(400).json({ error: "id, name, amount, currency required" });
  }
  if (products.find(p => p.id === id)) {
    return res.status(400).json({ error: "Product id already exists" });
  }
  const product = { id, name, amount, currency };
  products.push(product);
  res.json(product);
});

// Edit product
app.put("/products/:id", (req, res) => {
  const { id } = req.params;
  const { name, amount, currency } = req.body;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });

  if (name !== undefined) products[idx].name = name;
  if (amount !== undefined) products[idx].amount = amount;
  if (currency !== undefined) products[idx].currency = currency;

  res.json(products[idx]);
});

// Delete product
app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  const removed = products.splice(idx, 1)[0];
  res.json(removed);
});

// ---------- PAYMENT INTENTS ----------

// Create PaymentIntent from product id
app.post("/create-intent/product", async (req, res) => {
  try {
    const { productId } = req.body;
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const intent = await stripe.paymentIntents.create({
      amount: product.amount,
      currency: product.currency,
      payment_method_types: ["card_present"],
      capture_method: "automatic",
    });

    res.json({ client_secret: intent.client_secret });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

// Create PaymentIntent from custom amount
app.post("/create-intent/amount", async (req, res) => {
  try {
    const { amount, currency } = req.body;
    if (!amount || !currency) {
      return res.status(400).json({ error: "amount and currency required" });
    }

    const intent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: ["card_present"],
      capture_method: "automatic",
    });

    res.json({ client_secret: intent.client_secret });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on ${port}`));
