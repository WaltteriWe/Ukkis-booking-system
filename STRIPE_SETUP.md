# Stripe Integration Setup Guide

## ✅ What's Been Completed

1. **Database Schema Updated** - Added payment tracking fields to the Booking model:
   - `paymentIntentId` - Stores the Stripe Payment Intent ID
   - `paymentStatus` - Tracks payment status (pending, processing, succeeded, failed, canceled)
   - `paymentMethod` - Stores the payment method used (card, wallet, etc.)
2. **Backend Components Created**:
   - ✅ Payment controller updated to link bookings with payment intents
   - ✅ Webhook controller to handle Stripe events
   - ✅ Webhook routes registered
3. **Frontend Components Created**:
   - ✅ `StripeCheckout` component for payment processing
   - ✅ Booking confirmation page
   - ✅ Stripe packages already installed

## 🔧 Setup Steps (You Need to Do These)

### Step 1: Get Your Stripe API Keys

**I NEED YOUR STRIPE API KEYS NOW:**

1. Go to your Stripe Dashboard: https://dashboard.stripe.com/test/apikeys
2. Copy these keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### Step 2: Configure Backend Environment Variables

Create or update `backend/.env` with:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### Step 3: Configure Frontend Environment Variables

Create or update `frontend/.env.local` with:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

### Step 4: Run Database Migration

```powershell
cd backend
npm run prisma:migrate
# or
npx prisma migrate dev --name add_payment_fields
```

### Step 5: Set Up Stripe Webhook (For Production)

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/webhook/stripe`
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `payment_intent.processing`
5. Copy the webhook signing secret (starts with `whsec_...`)
6. Add it to your backend `.env` as `STRIPE_WEBHOOK_SECRET`

### Step 6: Test with Stripe Test Cards

Use these test card numbers in sandbox mode:

- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0027 6000 3184`
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC

## 🔄 Payment Flow

1. User selects tour and enters details
2. User clicks "Confirm Booking"
3. Backend creates booking with `paymentStatus: "pending"`
4. Backend creates Stripe Payment Intent
5. Frontend shows Stripe payment form
6. User enters card details
7. Stripe processes payment
8. Webhook receives payment confirmation
9. Backend updates booking to `paymentStatus: "succeeded"` and `status: "confirmed"`
10. User sees confirmation page

## 📝 What You Need to Provide Next

Please provide your Stripe API keys:

1. **Publishable Key** (pk*test*...)
2. **Secret Key** (sk*test*...)

Once you provide these, I'll help you:

- Configure the environment variables
- Run the database migration
- Test the payment flow
- Set up webhooks for local development using Stripe CLI

## 🧪 Local Webhook Testing

For local development, you can use Stripe CLI to forward webhook events:

```powershell
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3001/api/webhook/stripe
```

This will give you a webhook secret for local testing.
