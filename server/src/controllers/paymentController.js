// Mock payment gateway. No real Stripe/PayPal keys required.
// In a production build, swap this for a real Stripe PaymentIntent flow -
// the request/response shape below is intentionally Stripe-like so that
// swap is mostly a drop-in later.

// POST /api/payments/mock-charge
// { amount, cardNumber } -> simulates a charge and returns a reference
async function mockCharge(req, res) {
  const { amount, cardNumber } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ message: "A valid amount is required." });

  // Simulate a basic failure case so the flow feels real (e.g. test card ending in 0000 fails)
  const failing = typeof cardNumber === "string" && cardNumber.replace(/\s/g, "").endsWith("0000");
  if (failing) {
    return res.status(402).json({ status: "failed", message: "Card declined (mock)." });
  }

  const reference = `MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  res.json({ status: "paid", reference, amount });
}

module.exports = { mockCharge };
