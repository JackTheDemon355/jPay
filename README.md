# 💳 jPay — Tap to Pay Control Panel 💳

jPay is a Stripe Terminal powered backend + web UI for managing products and
creating PaymentIntents for Tap-to-Pay on iOS and Android.

## 🔍 Features 🔍

- jPay product manager (add / edit / delete)
- Create PaymentIntent for:
  - jPay product
  - custom amount
- Platform selector (iOS / Android)
- Works with Stripe Terminal SDK

## 🔒 Security 🔒

- **Never commit real Stripe keys.**
- `server/.env` is ignored by Git (see `.gitignore`).
- Only `server/.env.example` is committed to show required variables.
- Set `STRIPE_SECRET_KEY` locally or via deployment environment variables.

## ⚙️ Setup ⚙️

```bash
cd server
npm install
cp .env.example .env   # then edit .env with your real STRIPE_SECRET_KEY
npm start
