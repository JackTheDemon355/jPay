require("dotenv").config();
const express = require("express");
const Stripe = require("stripe");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// jPay product list (in-memory)
let products = [
  { id: "jp1", name: "jPay Sample A", amount: 1500, currency: "aud" },
  { id: "jp2", name: "jPay Sample B", amount: 2500, currency: "aud" }
];

// ---------- jPay PRODUCTS CRUD ----------

app.get("/products", (req, res) => {
  res.json(products);
});

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

app.delete("/products/:id", (req, res) => {
  const { id } = req.params;
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Product not found" });
  const removed = products.splice(idx, 1)[0];
  res.json(removed);
});

// ---------- jPay PAYMENT INTENTS ----------

app.post("/create-intent/product", async (req, res) => {
  try {
    const { productId } = req.body;
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const intent = await stripe.paymentIntents.create({
      amount: product.amount,
      currency: product.currency,
      payment_method_types: ["card_present"],
      capture_method: "automatic"
    });

    res.json({ client_secret: intent.client_secret, brand: "jPay" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

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
      capture_method: "automatic"
    });

    res.json({ client_secret: intent.client_secret, brand: "jPay" });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`jPay backend running on ${port}`));
