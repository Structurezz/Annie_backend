import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

dotenv.config();

/* ================= HELPERS ================= */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/* ================= SCALE ================= */

const COUNT = 5500; // ~71,500 total products
const BATCH_SIZE = 2000;

/* ================= CORE DATA ================= */

const BADGES = [null, "NEW", "BESTSELLER", "SALE"];

const FABRICS = [
  "Ankara","Aso-oke","Adire","Kente","Lace","Linen",
  "Silk","Chiffon","Brocade","Velvet","Cotton"
];

const ADJ = ["Luxurious","Elegant","Bold","Modern","Classic","Chic"];

const DESIGNERS = ["Annie Patricia","AP Couture","Studio AP"];

/* ================= PRICE MAP ================= */

const PRICE = {
  Dresses: [35000, 180000],
  Bubus: [30000, 120000],
  "Kimono and pant sets": [40000, 130000],
  Asoeke: [25000, 90000],
  "Aso Ebi": [30000, 150000],
  Jumpsuits: [32000, 110000],
  Skirts: [18000, 75000],
  Tops: [15000, 55000],
  Trousers: [18000, 70000],
  Agbada: [60000, 280000],
  Kaftan: [30000, 150000],
  Bags: [20000, 120000],
  Accessories: [5000, 45000],
};

const makePrice = (cat) => {
  const [min, max] = PRICE[cat] || [20000, 80000];
  return rInt(min / 1000, max / 1000) * 1000;
};

const comparePrice = (price, badge) =>
  badge === "SALE"
    ? Math.round(price * rInt(110, 150) / 100 / 1000) * 1000
    : 0;

/* ================= STOCK ================= */

const womenSizes = () => [
  { size: "XS", stock: rInt(0, 5) },
  { size: "S", stock: rInt(2, 10) },
  { size: "M", stock: rInt(3, 12) },
  { size: "L", stock: rInt(2, 10) },
  { size: "XL", stock: rInt(0, 6) },
];

const menSizes = () => [
  { size: "S", stock: rInt(1, 6) },
  { size: "M", stock: rInt(3, 12) },
  { size: "L", stock: rInt(4, 15) },
  { size: "XL", stock: rInt(2, 10) },
  { size: "XXL", stock: rInt(0, 5) },
];

const freeSize = () => [
  { size: "Free Size", stock: rInt(5, 30) },
];

/* ================= NAME ================= */

const name = (cat, i) =>
  `${pick(ADJ)} ${pick(FABRICS)} ${cat} ${String(i).padStart(5, "0")}`;

const desc = (n) =>
  `${n} crafted from premium ${pick(FABRICS)}.`;

/* ================= BUILD PRODUCT ================= */

function build(cat, gender, sizeFn, i) {
  const badge = pick(BADGES);
  const price = makePrice(cat);
  const sizes = sizeFn();

  const totalStock = sizes.reduce((s, x) => s + (x.stock || 0), 0);

  const n = name(cat, i);

  return {
    name: n,
    slug: `${n.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${i}`,
    category: cat,
    description: desc(n),
    shortDescription: `${cat} in ${pick(FABRICS)}`,

    price,
    comparePrice: comparePrice(price, badge),

    images: [],

    badge,
    gender,
    sizes,
    totalStock,
    inStock: totalStock > 0,

    designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: [cat.toLowerCase(), gender.toLowerCase()],
    soldCount: rInt(0, 200),

    rating: 0,
    numReviews: 0,
    reviews: [],
  };
}

/* ================= GUARANTEED CATEGORY COVERAGE ================= */

const WOMEN_CATEGORIES = [
  "Dresses",
  "Bubus",
  "Kimono and pant sets",
  "Asoeke",
  "Aso Ebi",
  "Jumpsuits",
  "Skirts",
  "Tops",
  "Trousers",
];

const MEN_CATEGORIES = [
  "Agbada",
  "Kaftan",
];

const UNISEX_CATEGORIES = [
  "Bags",
  "Accessories",
];

/* ================= GENERATE ================= */

const products = [];

/* WOMEN */
for (const cat of WOMEN_CATEGORIES) {
  for (let i = 1; i <= COUNT; i++) {
    products.push(build(cat, "WOMEN", womenSizes, i));
  }
}

/* MEN */
for (const cat of MEN_CATEGORIES) {
  for (let i = 1; i <= COUNT; i++) {
    products.push(build(cat, "MEN", menSizes, i));
  }
}

/* UNISEX */
for (const cat of UNISEX_CATEGORIES) {
  for (let i = 1; i <= COUNT; i++) {
    products.push(build(cat, "UNISEX", freeSize, i));
  }
}

console.log(`📦 TOTAL GENERATED: ${products.length} (~70k+)`);

/* ================= SEED ================= */

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("📡 Connected");

    await Product.deleteMany({});
    console.log("🧹 Cleared products");

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      await Product.insertMany(batch, { ordered: false });
      console.log(`Inserted ${i + batch.length}/${products.length}`);
    }

    console.log("✅ Products inserted");

    await Coupon.deleteMany({});
    await Coupon.insertMany([
      { code: "WELCOME10", type: "percentage", value: 10 },
      { code: "FLAT5K", type: "fixed", value: 5000 },
    ]);

    console.log("🎟 Coupons seeded");

    const adminEmail = "admin@anniepatricia.com";

    const exists = await User.findOne({ email: adminEmail });

    if (!exists) {
      await User.create({
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
        password: "Admin@123",
        role: "admin",
      });
    }

    console.log("🎉 DONE — ALL CATEGORIES COVERED + 70K+ PRODUCTS");
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();