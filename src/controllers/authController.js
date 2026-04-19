import crypto from "crypto";
import User from "../models/User.js";
import { sendTokenResponse } from "../utils/jwt.js";
import { sendWelcomeEmail, sendPasswordResetEmail } from "../utils/email.js";

/* ─── REGISTER ─────────────────────────────────────────────────────────────── */
export const register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already registered." });
  }

  const user = await User.create({ firstName, lastName, email, password, phone });

  try {
    await sendWelcomeEmail(user);
  } catch (_) {
    // Don't fail registration if email fails
  }

  sendTokenResponse(user, 201, res);
};

/* ─── LOGIN ─────────────────────────────────────────────────────────────────── */
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required." });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid email or password." });
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
};

/* ─── LOGOUT ────────────────────────────────────────────────────────────────── */
export const logout = (req, res) => {
  res.cookie("token", "none", { expires: new Date(Date.now() + 5 * 1000), httpOnly: true });
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

/* ─── GET PROFILE ───────────────────────────────────────────────────────────── */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist", "name price images badge");
  res.status(200).json({ success: true, user });
};

/* ─── UPDATE PROFILE ────────────────────────────────────────────────────────── */
export const updateProfile = async (req, res) => {
  const allowed = ["firstName", "lastName", "phone", "avatar", "newsletterSubscribed"];
  const updates = {};
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, user });
};

/* ─── CHANGE PASSWORD ───────────────────────────────────────────────────────── */
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: "Both passwords are required." });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: "Current password is incorrect." });
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
};

/* ─── FORGOT PASSWORD ───────────────────────────────────────────────────────── */
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    // Don't reveal whether email exists
    return res.status(200).json({ success: true, message: "If that email exists, a reset link has been sent." });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  try {
    await sendPasswordResetEmail(user, resetUrl);
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res.status(500).json({ success: false, message: "Email sending failed. Try again." });
  }

  res.status(200).json({ success: true, message: "Password reset link sent to your email." });
};

/* ─── RESET PASSWORD ────────────────────────────────────────────────────────── */
export const resetPassword = async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
};

/* ─── MANAGE ADDRESSES ──────────────────────────────────────────────────────── */
export const addAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ success: true, addresses: user.addresses });
};

export const updateAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  const addr = user.addresses.id(req.params.addressId);
  if (!addr) return res.status(404).json({ success: false, message: "Address not found." });

  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(addr, req.body);
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
};

export const deleteAddress = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.pull({ _id: req.params.addressId });
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
};
