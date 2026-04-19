import Newsletter from "../models/Newsletter.js";
import { sendEmail } from "../utils/email.js";

/* ─── SUBSCRIBE ─────────────────────────────────────────────────────────────── */
export const subscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const existing = await Newsletter.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.isActive) {
      return res.status(200).json({ success: true, message: "You are already subscribed." });
    }
    // Re-activate
    existing.isActive = true;
    await existing.save();
    return res.status(200).json({ success: true, message: "Welcome back! You've been re-subscribed." });
  }

  await Newsletter.create({ email: email.toLowerCase() });

  // Send welcome email (best-effort)
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Annie Patricia's Inner Circle",
      html: `
        <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;padding:48px 32px;background:#0C0B09;color:#FAF6F0;">
          <h1 style="font-size:28px;letter-spacing:0.2em;margin-bottom:8px;">ANNIE PATRICIA</h1>
          <div style="width:40px;height:1px;background:#C9A96E;margin-bottom:32px;"></div>
          <h2 style="font-size:20px;font-weight:normal;color:#C9A96E;margin-bottom:16px;">You're In.</h2>
          <p style="font-size:14px;line-height:1.8;color:#FAF6F0cc;margin-bottom:24px;">
            Thank you for joining the Annie Patricia Inner Circle. You'll be the first to hear about
            new collections, private sales, and styling notes from Lagos.
          </p>
          <a href="${process.env.CLIENT_URL}/category" style="display:inline-block;border:1px solid #C9A96E;color:#C9A96E;padding:14px 32px;text-decoration:none;font-size:11px;letter-spacing:0.25em;font-family:Arial,sans-serif;">
            SHOP THE COLLECTION
          </a>
        </div>
      `,
    });
  } catch (_) {}

  res.status(201).json({ success: true, message: "Subscribed successfully! Welcome to the inner circle." });
};

/* ─── UNSUBSCRIBE ───────────────────────────────────────────────────────────── */
export const unsubscribe = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required." });
  }

  const subscriber = await Newsletter.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isActive: false },
    { new: true }
  );

  if (!subscriber) {
    return res.status(404).json({ success: false, message: "Email not found." });
  }

  res.status(200).json({ success: true, message: "You have been unsubscribed." });
};

/* ─── ADMIN: GET ALL SUBSCRIBERS ───────────────────────────────────────────── */
export const adminGetSubscribers = async (req, res) => {
  const { page = 1, limit = 50, active } = req.query;
  const filter = {};
  if (active === "true") filter.isActive = true;
  if (active === "false") filter.isActive = false;

  const skip = (Number(page) - 1) * Number(limit);
  const [subscribers, total] = await Promise.all([
    Newsletter.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Newsletter.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: subscribers,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
};

/* ─── ADMIN: SEND BROADCAST ─────────────────────────────────────────────────── */
export const adminBroadcast = async (req, res) => {
  const { subject, html } = req.body;
  if (!subject || !html) {
    return res.status(400).json({ success: false, message: "Subject and html body are required." });
  }

  const subscribers = await Newsletter.find({ isActive: true }).select("email");
  if (subscribers.length === 0) {
    return res.status(200).json({ success: true, message: "No active subscribers.", sent: 0 });
  }

  let sent = 0;
  let failed = 0;
  for (const sub of subscribers) {
    try {
      await sendEmail({ to: sub.email, subject, html });
      sent++;
    } catch (_) {
      failed++;
    }
  }

  res.status(200).json({ success: true, sent, failed, total: subscribers.length });
};
