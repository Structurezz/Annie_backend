import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { initializePayment, verifyPayment, toKobo } from "../utils/paystack.js";
import { sendOrderConfirmationEmail, sendShippingUpdateEmail } from "../utils/email.js";
import { v4 as uuid } from "uuid";

// Shipping cost logic (NGN)
const getShippingCost = (method, state) => {
  if (method === "pickup") return 0;
  const lagosCities = ["Lagos"];
  if (lagosCities.includes(state) && method === "standard") return 2500;
  if (lagosCities.includes(state) && method === "express") return 5000;
  if (method === "standard") return 4000;
  return 8000; // express nationwide
};

/* ─── CREATE ORDER + INIT PAYMENT ──────────────────────────────────────────── */
export const createOrder = async (req, res) => {
  const { shippingAddress, shippingMethod = "standard", paymentMethod = "paystack", notes } = req.body;

  // Get items from cart or request body
  let items = [];
  let couponCode, discount = 0;

  if (req.user) {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }
    items = cart.items;
    couponCode = cart.couponCode;
    discount = cart.discount || 0;
  } else {
    // Guest order: items must be in body
    items = req.body.items;
    couponCode = req.body.couponCode;
    discount = req.body.discount || 0;
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: "No items in order." });
  }

  // Validate products & calculate subtotal
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const productId = item.product || item.productId;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(400).json({ success: false, message: `Product ${productId} is unavailable.` });
    }

    // Reduce stock
    if (product.sizes.length > 0 && item.size) {
      const sizeObj = product.sizes.find((s) => s.size === item.size);
      if (sizeObj) {
        if (sizeObj.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name} in size ${item.size}.`,
          });
        }
        sizeObj.stock -= item.quantity;
        product.soldCount = (product.soldCount || 0) + item.quantity;
        await product.save();
      }
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      price: product.price,
      quantity: item.quantity,
      size: item.size || "Free Size",
      color: item.color,
    });
  }

  const shippingCost = getShippingCost(shippingMethod, shippingAddress.state);
  const total = subtotal - discount + shippingCost;

  // Create order
  const order = await Order.create({
    user: req.user?._id,
    items: orderItems,
    shippingAddress,
    shippingMethod,
    shippingCost,
    subtotal,
    discount,
    couponCode,
    total,
    paymentMethod,
    notes,
  });

  // Update coupon usage
  if (couponCode) {
    await Coupon.findOneAndUpdate(
      { code: couponCode },
      {
        $inc: { usedCount: 1 },
        ...(req.user ? { $push: { usedBy: req.user._id } } : {}),
      }
    );
  }

  // Clear cart after order
  if (req.user) {
    await Cart.findOneAndDelete({ user: req.user._id });
  }

  // Paystack payment
  let paymentData = null;
  if (paymentMethod === "paystack") {
    const reference = `AP-${uuid().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
    try {
      paymentData = await initializePayment({
        email: shippingAddress.email,
        amount: toKobo(total),
        reference,
        metadata: {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        },
        callbackUrl: `${process.env.CLIENT_URL}/orders/${order._id}?payment=success`,
      });
      order.paystackReference = reference;
      await order.save();
    } catch (err) {
      console.error("Paystack init failed:", err.message);
    }
  } else {
    // Bank transfer / COD — auto-confirm
    order.status = "confirmed";
    await order.save();

    try {
      await sendOrderConfirmationEmail(order);
    } catch (_) {}
  }

  res.status(201).json({
    success: true,
    data: order,
    paymentUrl: paymentData?.authorization_url || null,
  });
};

/* ─── VERIFY PAYMENT ────────────────────────────────────────────────────────── */
export const verifyOrderPayment = async (req, res) => {
  const { reference } = req.params;

  const paystackData = await verifyPayment(reference);

  if (paystackData.status !== "success") {
    return res.status(400).json({ success: false, message: "Payment not successful." });
  }

  const order = await Order.findOne({ paystackReference: reference });
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  if (order.paymentStatus === "paid") {
    return res.status(200).json({ success: true, message: "Already verified.", data: order });
  }

  order.paymentStatus = "paid";
  order.paidAt = new Date();
  order.status = "confirmed";
  order.paystackData = paystackData;
  await order.save();

  try {
    await sendOrderConfirmationEmail(order);
  } catch (_) {}

  res.status(200).json({ success: true, data: order });
};

/* ─── GET USER ORDERS ───────────────────────────────────────────────────────── */
export const getUserOrders = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("items.product", "name images"),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
};

/* ─── GET SINGLE ORDER ──────────────────────────────────────────────────────── */
export const getOrder = async (req, res) => {
  const filter = { _id: req.params.id };
  if (req.user?.role !== "admin") filter.user = req.user._id;

  const order = await Order.findOne(filter).populate("items.product", "name images price");
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  res.status(200).json({ success: true, data: order });
};

/* ─── CANCEL ORDER ──────────────────────────────────────────────────────────── */
export const cancelOrder = async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  if (!["pending", "confirmed"].includes(order.status)) {
    return res.status(400).json({ success: false, message: `Cannot cancel an order that is ${order.status}.` });
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancelReason = req.body.reason || "Customer requested cancellation";
  await order.save();

  // Restore stock
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, "sizes.size": item.size },
      { $inc: { "sizes.$.stock": item.quantity, soldCount: -item.quantity } }
    );
  }

  res.status(200).json({ success: true, data: order });
};

/* ─── ADMIN: GET ALL ORDERS ─────────────────────────────────────────────────── */
export const adminGetOrders = async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const filter = status ? { status } : {};
  const skip = (Number(page) - 1) * Number(limit);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "firstName lastName email"),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
};

/* ─── ADMIN: UPDATE ORDER STATUS ────────────────────────────────────────────── */
export const adminUpdateOrderStatus = async (req, res) => {
  const { status, trackingNumber, trackingUrl, adminNotes } = req.body;
  const order = await Order.findById(req.params.id).populate("user", "firstName lastName email");
  if (!order) return res.status(404).json({ success: false, message: "Order not found." });

  const prevStatus = order.status;
  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (adminNotes) order.adminNotes = adminNotes;
  if (status === "delivered") order.deliveredAt = new Date();

  await order.save();

  // Send shipping email when status changes to shipped
  if (prevStatus !== "shipped" && status === "shipped") {
    try {
      await sendShippingUpdateEmail(order);
    } catch (_) {}
  }

  res.status(200).json({ success: true, data: order });
};

/* ─── ADMIN: DASHBOARD STATS ────────────────────────────────────────────────── */
export const adminStats = async (req, res) => {
  const [
    totalOrders,
    pendingOrders,
    totalRevenue,
    todayOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: { $in: ["pending", "confirmed", "processing"] } }),
    Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      pendingOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayOrders,
    },
  });
};
