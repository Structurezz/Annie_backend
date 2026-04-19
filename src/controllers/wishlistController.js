import User from "../models/User.js";
import Product from "../models/Product.js";

/* ─── GET WISHLIST ──────────────────────────────────────────────────────────── */
export const getWishlist = async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "wishlist",
    "name price images badge inStock slug category"
  );
  res.status(200).json({ success: true, data: user.wishlist });
};

/* ─── ADD TO WISHLIST ───────────────────────────────────────────────────────── */
export const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  const user = await User.findById(req.user._id);
  if (user.wishlist.includes(productId)) {
    return res.status(200).json({ success: true, message: "Already in wishlist." });
  }

  user.wishlist.push(productId);
  await user.save();

  res.status(200).json({ success: true, message: "Added to wishlist.", count: user.wishlist.length });
};

/* ─── REMOVE FROM WISHLIST ──────────────────────────────────────────────────── */
export const removeFromWishlist = async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { wishlist: req.params.productId },
  });
  res.status(200).json({ success: true, message: "Removed from wishlist." });
};

/* ─── TOGGLE WISHLIST ───────────────────────────────────────────────────────── */
export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  const user = await User.findById(req.user._id);
  const isInWishlist = user.wishlist.includes(productId);

  if (isInWishlist) {
    user.wishlist.pull(productId);
  } else {
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    user.wishlist.push(productId);
  }

  await user.save();
  res.status(200).json({
    success: true,
    inWishlist: !isInWishlist,
    count: user.wishlist.length,
  });
};
