import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Base template wrapper
const template = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Georgia', serif; background: #FAF6F0; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #0C0B09; padding: 32px; text-align: center; }
    .header h1 { color: #C9A96E; font-size: 24px; letter-spacing: 4px; margin: 0; }
    .header p { color: #8C7B6B; font-size: 11px; letter-spacing: 3px; margin: 6px 0 0; }
    .body { padding: 40px 32px; color: #1A1208; line-height: 1.7; }
    .body h2 { color: #0C0B09; font-size: 20px; }
    .cta { display: inline-block; background: #C9A96E; color: #0C0B09; text-decoration: none;
           padding: 14px 32px; font-size: 12px; letter-spacing: 3px; font-weight: bold;
           margin: 24px 0; }
    .footer { background: #0C0B09; padding: 24px; text-align: center; color: #8C7B6B; font-size: 11px; }
    .divider { border: none; border-top: 1px solid #C9A96E40; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ANNIE PATRICIA</h1>
      <p>LUXURY NIGERIAN FASHION</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} Annie Patricia. All rights reserved.<br>
      Lagos, Nigeria &nbsp;·&nbsp; <a href="mailto:hello@anniepatricia.ng" style="color:#C9A96E;">hello@anniepatricia.ng</a>
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "Annie Patricia <noreply@anniepatricia.ng>",
    to,
    subject,
    html,
  });
};

export const sendWelcomeEmail = (user) =>
  sendEmail({
    to: user.email,
    subject: "Welcome to Annie Patricia ✨",
    html: template(`
      <h2>Welcome, ${user.firstName}!</h2>
      <p>Thank you for joining Annie Patricia — where Nigerian heritage meets luxury fashion.</p>
      <p>Explore our latest collections and find pieces that tell your story.</p>
      <a href="${process.env.CLIENT_URL}/category" class="cta">SHOP NOW</a>
      <hr class="divider">
      <p style="font-size:13px;color:#8C7B6B;">
        You are now part of an exclusive community that celebrates African fashion.
      </p>
    `),
  });

export const sendOrderConfirmationEmail = (order) => {
  const itemRows = order.items
    .map(
      (i) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0ebe3;">${i.name} ${i.size ? `(${i.size})` : ""}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0ebe3;text-align:center;">×${i.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0ebe3;text-align:right;">₦${(i.price * i.quantity).toLocaleString()}</td>
    </tr>`
    )
    .join("");

  return sendEmail({
    to: order.shippingAddress.email,
    subject: `Order Confirmed — ${order.orderNumber}`,
    html: template(`
      <h2>Order Confirmed! 🎉</h2>
      <p>Hi ${order.shippingAddress.firstName},</p>
      <p>Your order <strong>${order.orderNumber}</strong> has been confirmed and is being processed.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <thead>
          <tr style="font-size:11px;letter-spacing:2px;color:#8C7B6B;text-transform:uppercase;">
            <th style="text-align:left;padding-bottom:8px;">Item</th>
            <th style="text-align:center;padding-bottom:8px;">Qty</th>
            <th style="text-align:right;padding-bottom:8px;">Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>

      <div style="text-align:right;padding:12px 0;border-top:2px solid #C9A96E;">
        <strong style="font-size:18px;color:#0C0B09;">Total: ₦${order.total.toLocaleString()}</strong>
      </div>

      <p><strong>Shipping to:</strong><br>
      ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}</p>

      <a href="${process.env.CLIENT_URL}/orders" class="cta">TRACK YOUR ORDER</a>
    `),
  });
};

export const sendPasswordResetEmail = (user, resetUrl) =>
  sendEmail({
    to: user.email,
    subject: "Reset Your Password — Annie Patricia",
    html: template(`
      <h2>Password Reset Request</h2>
      <p>Hi ${user.firstName},</p>
      <p>You requested a password reset. Click the button below to set a new password.</p>
      <a href="${resetUrl}" class="cta">RESET PASSWORD</a>
      <hr class="divider">
      <p style="font-size:12px;color:#8C7B6B;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    `),
  });

export const sendShippingUpdateEmail = (order) =>
  sendEmail({
    to: order.shippingAddress.email,
    subject: `Your Order Is On Its Way! — ${order.orderNumber}`,
    html: template(`
      <h2>Your order has been shipped! 📦</h2>
      <p>Hi ${order.shippingAddress.firstName},</p>
      <p>Great news — your order <strong>${order.orderNumber}</strong> is on its way!</p>
      ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ""}
      <a href="${process.env.CLIENT_URL}/orders" class="cta">TRACK ORDER</a>
    `),
  });
