import axios from "axios";

const paystackAPI = axios.create({
  baseURL: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

/**
 * Initialise a Paystack transaction
 * @param {object} params
 * @param {string} params.email - customer email
 * @param {number} params.amount - amount in KOBO (NGN × 100)
 * @param {string} params.reference - unique ref
 * @param {object} params.metadata - order metadata
 * @param {string} params.callbackUrl - redirect after payment
 */
export const initializePayment = async ({ email, amount, reference, metadata = {}, callbackUrl }) => {
  const { data } = await paystackAPI.post("/transaction/initialize", {
    email,
    amount, // kobo
    reference,
    metadata,
    callback_url: callbackUrl,
    channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
  });
  return data.data; // { authorization_url, access_code, reference }
};

/**
 * Verify a Paystack transaction by reference
 */
export const verifyPayment = async (reference) => {
  const { data } = await paystackAPI.get(`/transaction/verify/${reference}`);
  return data.data; // { status, amount, customer, ... }
};

/**
 * List banks in Nigeria
 */
export const listBanks = async () => {
  const { data } = await paystackAPI.get("/bank?country=nigeria");
  return data.data;
};

/**
 * Resolve account number
 */
export const resolveAccount = async (accountNumber, bankCode) => {
  const { data } = await paystackAPI.get(
    `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
  );
  return data.data;
};

// Convert NGN to kobo
export const toKobo = (naira) => Math.round(naira * 100);
// Convert kobo to NGN
export const toNaira = (kobo) => kobo / 100;
