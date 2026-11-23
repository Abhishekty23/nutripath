import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only: these values never reach the browser (no NEXT_PUBLIC_ prefix).
const keyId = process.env.RAZORPAY_KEY_ID ?? "";
const keySecret = process.env.RAZORPAY_KEY_SECRET ?? "";

export const isRazorpayConfigured = Boolean(keyId && keySecret);
export const razorpayKeyId = keyId; // the key id is public and is needed by Razorpay Checkout

type RazorpayOrder = { id: string; amount: number; currency: string };

// Create an order on Razorpay. Amount is in rupees; Razorpay expects paise.
export async function createRazorpayOrder(amountInRupees: number, receipt: string): Promise<RazorpayOrder> {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
    },
    body: JSON.stringify({ amount: amountInRupees * 100, currency: "INR", receipt }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
  return res.json();
}

// Razorpay signs "order_id|payment_id" with your secret. If it matches, the payment is genuine.
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
