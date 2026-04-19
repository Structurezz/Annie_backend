/**
 * Annie Patricia — Database Seed Script
 * Run: node src/utils/seed.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";

dotenv.config();

const PRODUCTS = [
  // DRESSES
  { name: "Lagos Gold Kaftan Dress", category: "Dresses", price: 65000, badge: "BESTSELLER", gender: "WOMEN", description: "Luxurious gold kaftan with hand-embroidered neckline detailing. Perfect for special occasions.", images: [{ url: "https://images.unsplash.com/photo-1515886657613-9f3519b396dd?w=800", alt: "Lagos Gold Kaftan" }], sizes: [{ size: "S", stock: 5 }, { size: "M", stock: 8 }, { size: "L", stock: 6 }, { size: "XL", stock: 3 }], isFeatured: true },
  { name: "Ankara Wrap Midi Dress", category: "Dresses", price: 48000, badge: "NEW", gender: "WOMEN", description: "Bold ankara print wrap dress with a flattering silhouette. Made from premium wax fabric.", images: [{ url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800", alt: "Ankara Wrap Dress" }], sizes: [{ size: "XS", stock: 4 }, { size: "S", stock: 9 }, { size: "M", stock: 7 }, { size: "L", stock: 5 }], isFeatured: true },
  { name: "Adire Linen Shift Dress", category: "Dresses", price: 38000, badge: "NEW", gender: "WOMEN", description: "Handcrafted adire tie-dye pattern on premium linen. Effortlessly chic for any occasion.", images: [{ url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800", alt: "Adire Shift Dress" }], sizes: [{ size: "S", stock: 6 }, { size: "M", stock: 10 }, { size: "L", stock: 4 }] },
  { name: "Aso-oke Evening Gown", category: "Dresses", price: 125000, badge: "FEATURED", gender: "WOMEN", description: "Regal aso-oke evening gown with metallic thread weave. Statement piece for celebrations.", images: [{ url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800", alt: "Aso-oke Gown" }], sizes: [{ size: "S", stock: 3 }, { size: "M", stock: 4 }, { size: "L", stock: 2 }], isFeatured: true },

  // SETS
  { name: "Kente Two-Piece Set", category: "Sets", price: 72000, badge: "BESTSELLER", gender: "WOMEN", description: "Vibrant kente-inspired two-piece co-ord. Cropped top and wide-leg trousers.", images: [{ url: "https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=800", alt: "Kente Set" }], sizes: [{ size: "S", stock: 5 }, { size: "M", stock: 7 }, { size: "L", stock: 5 }], isFeatured: true },
  { name: "Agbada Matching Set", category: "Sets", price: 95000, badge: "NEW", gender: "MEN", description: "Traditional agbada reimagined in modern tailored cut. Complete 3-piece set.", images: [{ url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800", alt: "Agbada Set" }], sizes: [{ size: "M", stock: 6 }, { size: "L", stock: 8 }, { size: "XL", stock: 4 }, { size: "XXL", stock: 3 }] },
  { name: "Buba & Iro Set", category: "Sets", price: 58000, badge: "BESTSELLER", gender: "WOMEN", description: "Elegant buba and iro combination in hand-woven aso-oke fabric with matching gele headwrap.", images: [{ url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800", alt: "Buba Iro Set" }], sizes: [{ size: "S", stock: 4 }, { size: "M", stock: 6 }, { size: "L", stock: 5 }] },

  // TOPS
  { name: "Embroidered Kaftan Blouse", category: "Tops", price: 28000, badge: "NEW", gender: "WOMEN", description: "Lightweight kaftan blouse with gold chain embroidery. Versatile day-to-evening piece.", images: [{ url: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800", alt: "Kaftan Blouse" }], sizes: [{ size: "XS", stock: 8 }, { size: "S", stock: 12 }, { size: "M", stock: 10 }, { size: "L", stock: 6 }] },
  { name: "Dashiki Print Oversized Shirt", category: "Tops", price: 22000, gender: "MEN", description: "Classic dashiki print in a relaxed modern fit. Premium cotton blend.", images: [{ url: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800", alt: "Dashiki Shirt" }], sizes: [{ size: "S", stock: 7 }, { size: "M", stock: 10 }, { size: "L", stock: 8 }, { size: "XL", stock: 5 }] },

  // TROUSERS
  { name: "Wide-Leg Ankara Trousers", category: "Trousers", price: 35000, badge: "NEW", gender: "WOMEN", description: "Statement wide-leg trousers in vibrant ankara print. High-waisted and flow-forward.", images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=800", alt: "Ankara Trousers" }], sizes: [{ size: "XS", stock: 5 }, { size: "S", stock: 8 }, { size: "M", stock: 7 }, { size: "L", stock: 4 }] },
  { name: "Linen Wide-Leg Pants", category: "Trousers", price: 29000, gender: "MEN", description: "Premium linen trousers in natural tones. Easy tailored fit for smart-casual occasions.", images: [{ url: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800", alt: "Linen Trousers" }], sizes: [{ size: "S", stock: 6 }, { size: "M", stock: 9 }, { size: "L", stock: 7 }, { size: "XL", stock: 4 }] },

  // ACCESSORIES
  { name: "Beaded Waist Chain", category: "Accessories", price: 12000, badge: "BESTSELLER", gender: "WOMEN", description: "Hand-beaded waist chain in traditional Nigerian style. Adjustable fit.", images: [{ url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800", alt: "Waist Chain" }], sizes: [{ size: "Free Size", stock: 25 }] },
  { name: "Gold Cuff Bracelet", category: "Accessories", price: 18000, badge: "NEW", gender: "WOMEN", description: "Bold statement cuff bracelet inspired by Yoruba brass metalwork.", images: [{ url: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800", alt: "Gold Cuff" }], sizes: [{ size: "Free Size", stock: 15 }] },
  { name: "Ankara Head Wrap", category: "Accessories", price: 8500, gender: "WOMEN", description: "Versatile ankara head wrap in a range of vibrant prints. Pre-styled or customisable.", images: [{ url: "https://images.unsplash.com/photo-1590736969596-fece08f00a88?w=800", alt: "Head Wrap" }], sizes: [{ size: "Free Size", stock: 30 }] },

  // BAGS
  { name: "Woven Raffia Tote", category: "Bags", price: 42000, badge: "BESTSELLER", gender: "WOMEN", description: "Handcrafted raffia tote by Lagos artisans. Spacious, structured, and sustainable.", images: [{ url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", alt: "Raffia Tote" }], sizes: [{ size: "Free Size", stock: 10 }], isFeatured: true },
  { name: "Leather Crossbody Bag", category: "Bags", price: 68000, badge: "NEW", gender: "WOMEN", description: "Premium Nigerian leather crossbody with brass hardware. Compact yet functional.", images: [{ url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800", alt: "Leather Crossbody" }], sizes: [{ size: "Free Size", stock: 7 }] },
  { name: "Beaded Evening Clutch", category: "Bags", price: 32000, badge: "FEATURED", gender: "WOMEN", description: "Intricately beaded evening clutch. Each piece is uniquely handcrafted.", images: [{ url: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800", alt: "Beaded Clutch" }], sizes: [{ size: "Free Size", stock: 12 }] },

  // KNITWEAR
  { name: "Aso-oke Knit Cardigan", category: "Knitwear", price: 54000, badge: "NEW", gender: "WOMEN", description: "Contemporary cardigan knit in aso-oke thread patterns. Luxury meets everyday wearability.", images: [{ url: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800", alt: "Knit Cardigan" }], sizes: [{ size: "S", stock: 5 }, { size: "M", stock: 7 }, { size: "L", stock: 4 }] },
  { name: "Ankara Patchwork Jacket", category: "Knitwear", price: 78000, badge: "FEATURED", gender: "WOMEN", description: "Statement jacket made from patchwork ankara panels. Bold, wearable art.", images: [{ url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800", alt: "Patchwork Jacket" }], sizes: [{ size: "S", stock: 4 }, { size: "M", stock: 6 }, { size: "L", stock: 3 }], isFeatured: true },
];

const COUPONS = [
  { code: "WELCOME10", type: "percentage", value: 10, minOrderAmount: 20000, description: "10% off for new customers", usageLimit: 500 },
  { code: "LAGOS20", type: "percentage", value: 20, minOrderAmount: 50000, maxDiscount: 20000, description: "20% off orders over ₦50,000", usageLimit: 100 },
  { code: "FLAT5K", type: "fixed", value: 5000, minOrderAmount: 30000, description: "₦5,000 off orders over ₦30,000", usageLimit: 200 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 Connected to MongoDB");

    // Clear existing
    await Promise.all([
      Product.deleteMany({}),
      Coupon.deleteMany({}),
    ]);
    console.log("🗑️  Cleared existing products and coupons");

    // Seed products
    await Product.insertMany(PRODUCTS);
    console.log(`✅ Seeded ${PRODUCTS.length} products`);

    // Seed coupons
    await Coupon.insertMany(COUPONS);
    console.log(`✅ Seeded ${COUPONS.length} coupons`);

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || "admin@anniepatricia.com" });
    if (!adminExists) {
      await User.create({
        firstName: "Annie",
        lastName: "Patricia",
        email: process.env.ADMIN_EMAIL || "admin@anniepatricia.com",
        password: process.env.ADMIN_PASSWORD || "Admin@2025!",
        role: "admin",
        phone: "+2341234567890",
      });
      console.log("👤 Created admin user");
    } else {
      console.log("👤 Admin user already exists");
    }

    console.log("\n🎉 Database seeded successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📦 Products: ${PRODUCTS.length}`);
    console.log(`🎫 Coupons: ${COUPONS.length}`);
    console.log(`🔑 Admin: ${process.env.ADMIN_EMAIL || "admin@anniepatricia.com"}`);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
