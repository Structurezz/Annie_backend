import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
  },
  { timestamps: true }
);

const sizeVariantSchema = new mongoose.Schema({
  size: { type: String, required: true }, // XS, S, M, L, XL, XXL or Free Size
  stock: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true, maxlength: 5000 },
    shortDescription: { type: String, maxlength: 300 },
    price: { type: Number, required: true, min: 0 }, // in NGN kobo
    comparePrice: { type: Number, default: 0 }, // original price for SALE
    images: [{ url: String, publicId: String, alt: String }],
    category: {
      type: String,
      required: true,
      enum: [
        "Bubus",
        "Kimono and pant sets",
        "Asoeke",
        "Dresses",
        "Bags",
        "Accessories",
        "Aso Ebi",
        "Agbada",
        "Kaftan",
        "Jumpsuits",
        "Skirts",
        "Tops",
        "Trousers",
      ],
    },
    subcategory: String,
    badge: { type: String, enum: ["NEW", "BESTSELLER", "SALE", null], default: null },
    designer: { type: String, default: "Annie Patricia" },
    material: String,
    careInstructions: [String],
    colors: [{ name: String, hex: String }],
    sizes: [sizeVariantSchema],
    inStock: { type: Boolean, default: true },
    totalStock: { type: Number, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    weight: Number, // grams, for shipping calc
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    gender: { type: String, enum: ["WOMEN", "MEN", "UNISEX"], default: "WOMEN" },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    this.slug = `${base}-${this._id}`.slice(0, 100);
  }
  // Sync inStock with totalStock
  this.totalStock = this.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
  this.inStock = this.totalStock > 0;
  next();
});

// Update rating when reviews change
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    this.rating =
      this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
};

// Text index for search
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, badge: 1, price: 1, rating: -1 });

const Product = mongoose.model("Product", productSchema);
export default Product;
