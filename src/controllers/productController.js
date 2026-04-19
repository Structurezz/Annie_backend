import Product from "../models/Product.js";

/* ─── GET ALL PRODUCTS ──────────────────────────────────────────────────────── */
export const getProducts = async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    badge,
    gender,
    minPrice,
    maxPrice,
    sort = "createdAt",
    order = "desc",
    search,
    inStock,
    isFeatured,
  } = req.query;

  const filter = { isActive: true };

  if (category && category !== "ALL") filter.category = category;
  if (badge) filter.badge = badge;
  if (gender) filter.gender = gender.toUpperCase();
  if (inStock === "true") filter.inStock = true;
  if (isFeatured === "true") filter.isFeatured = true;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Full-text search
  if (search) {
    filter.$text = { $search: search };
  }

  const sortObj = {};
  const allowedSorts = ["price", "createdAt", "rating", "soldCount", "name"];
  if (allowedSorts.includes(sort)) sortObj[sort] = order === "asc" ? 1 : -1;
  else sortObj.createdAt = -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortObj).skip(skip).limit(Number(limit)).select("-reviews"),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
};

/* ─── GET SINGLE PRODUCT ────────────────────────────────────────────────────── */
export const getProduct = async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[a-fA-F0-9]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
    isActive: true,
  }).populate("reviews.user", "firstName lastName avatar");

  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found." });
  }

  res.status(200).json({ success: true, data: product });
};

/* ─── GET FEATURED PRODUCTS ─────────────────────────────────────────────────── */
export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .sort({ soldCount: -1 })
    .limit(12)
    .select("-reviews");

  res.status(200).json({ success: true, data: products });
};

/* ─── GET RELATED PRODUCTS ──────────────────────────────────────────────────── */
export const getRelatedProducts = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(8)
    .select("-reviews");

  res.status(200).json({ success: true, data: related });
};

/* ─── GET CATEGORIES ────────────────────────────────────────────────────────── */
export const getCategories = async (req, res) => {
  const categories = await Product.distinct("category", { isActive: true });
  const withCounts = await Promise.all(
    categories.map(async (cat) => ({
      name: cat,
      count: await Product.countDocuments({ category: cat, isActive: true }),
    }))
  );
  res.status(200).json({ success: true, data: withCounts });
};

/* ─── ADD REVIEW ────────────────────────────────────────────────────────────── */
export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ success: false, message: "Product not found." });

  // Check already reviewed
  const already = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (already) {
    return res.status(400).json({ success: false, message: "You have already reviewed this product." });
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.fullName,
    rating: Number(rating),
    comment,
  });
  product.updateRating();
  await product.save();

  res.status(201).json({ success: true, data: product.reviews });
};

/* ─── ADMIN: CREATE PRODUCT ─────────────────────────────────────────────────── */
export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
};

/* ─── ADMIN: UPDATE PRODUCT ─────────────────────────────────────────────────── */
export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  res.status(200).json({ success: true, data: product });
};

/* ─── ADMIN: DELETE PRODUCT ─────────────────────────────────────────────────── */
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!product) return res.status(404).json({ success: false, message: "Product not found." });
  res.status(200).json({ success: true, message: "Product deactivated." });
};

/* ─── ADMIN: GET ALL (including inactive) ───────────────────────────────────── */
export const adminGetProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).select("-reviews");
  res.status(200).json({ success: true, data: products });
};
