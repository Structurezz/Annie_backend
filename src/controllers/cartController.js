import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";

// Helper: get cart by user or session
const getCartQuery = (req) =>
  req.user ? { user: req.user._id } : { sessionId: req.headers["x-session-id"] };

/* ─── GET CART ──────────────────────────────────────────────────────────────── */
export const getCart = async (req, res) => {
  const cart = await Cart.findOne(getCartQuery(req)).populate(
    "items.product",
    "name images price inStock sizes"
  );

  if (!cart) {
    return res.status(200).json({ success: true, data: { items: [], subtotal: 0, itemCount: 0 } });
  }

  res.status(200).json({ success: true, data: cart });
};

/* ─── ADD TO CART ───────────────────────────────────────────────────────────── */
export const addToCart = async (req, res) => {
  const { productId, quantity = 1, size = "Free Size", color } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }
  if (!product.inStock) {
    return res.status(400).json({ success: false, message: "Product is out of stock." });
  }

  // Check size stock
  if (product.sizes.length > 0) {
    const sizeObj = product.sizes.find((s) => s.size === size);
    if (sizeObj && sizeObj.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${sizeObj.stock} left in size ${size}.` });
    }
  }

  let cart = await Cart.findOne(getCartQuery(req));

  if (!cart) {
    cart = new Cart({
      ...(req.user ? { user: req.user._id } : { sessionId: req.headers["x-session-id"] }),
      items: [],
    });
  }

  // Check if item already in cart
  const existing = cart.items.find(
    (i) => i.product.toString() === productId && i.size === size
  );

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
      size,
      color,
      price: product.price,
      name: product.name,
      image: product.images[0]?.url || "",
    });
  }

  await cart.save();
  await cart.populate("items.product", "name images price inStock");

  res.status(200).json({ success: true, data: cart });
};

/* ─── UPDATE CART ITEM ──────────────────────────────────────────────────────── */
export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne(getCartQuery(req));

  if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: "Item not found in cart." });

  if (Number(quantity) <= 0) {
    cart.items.pull({ _id: req.params.itemId });
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  await cart.populate("items.product", "name images price inStock");

  res.status(200).json({ success: true, data: cart });
};

/* ─── REMOVE FROM CART ──────────────────────────────────────────────────────── */
export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne(getCartQuery(req));
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

  cart.items.pull({ _id: req.params.itemId });
  await cart.save();

  res.status(200).json({ success: true, data: cart });
};

/* ─── CLEAR CART ────────────────────────────────────────────────────────────── */
export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete(getCartQuery(req));
  res.status(200).json({ success: true, message: "Cart cleared." });
};

/* ─── APPLY COUPON ──────────────────────────────────────────────────────────── */
export const applyCoupon = async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne(getCartQuery(req));
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code." });

  if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
    return res.status(400).json({ success: false, message: "This coupon has expired." });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ success: false, message: "Coupon usage limit reached." });
  }

  const subtotal = cart.subtotal;
  if (subtotal < coupon.minOrderAmount) {
    return res.status(400).json({
      success: false,
      message: `Minimum order of ₦${coupon.minOrderAmount.toLocaleString()} required.`,
    });
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  } else {
    discount = Math.min(coupon.value, subtotal);
  }

  cart.couponCode = coupon.code;
  cart.discount = discount;
  await cart.save();

  res.status(200).json({
    success: true,
    message: `Coupon applied! You saved ₦${discount.toLocaleString()}`,
    discount,
    data: cart,
  });
};

/* ─── REMOVE COUPON ─────────────────────────────────────────────────────────── */
export const removeCoupon = async (req, res) => {
  const cart = await Cart.findOne(getCartQuery(req));
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found." });

  cart.couponCode = undefined;
  cart.discount = 0;
  await cart.save();

  res.status(200).json({ success: true, data: cart });
};
