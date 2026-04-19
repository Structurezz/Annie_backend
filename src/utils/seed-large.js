/**
 * Annie Patricia — Large Database Seed (4000+ products)
 * Run: node src/utils/seed-large.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import User from "../models/User.js";

dotenv.config();

/* ═══════════════════════════════════════════════════════
   PRODUCT TEMPLATES
═══════════════════════════════════════════════════════ */

const UNSPLASH_WOMEN = [
  "https://images.unsplash.com/photo-1515886657613-9f3519b396dd?w=600&q=75",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=75",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=75",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=75",
  "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=75",
  "https://images.unsplash.com/photo-1594938298603-c8148c4b4571?w=600&q=75",
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=75",
  "https://images.unsplash.com/photo-1590736969596-fece08f00a88?w=600&q=75",
  "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=75",
  "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=75",
  "https://images.unsplash.com/photo-1603189343302-e603f7add05a?w=600&q=75",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=75",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=75",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=75",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=75",
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=75",
  "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=75",
  "https://images.unsplash.com/photo-1562572159-4efd90cfd7f9?w=600&q=75",
  "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600&q=75",
  "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&q=75",
];

const UNSPLASH_MEN = [
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=75",
  "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=600&q=75",
  "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=75",
  "https://images.unsplash.com/photo-1591400073680-d4a22e58efd8?w=600&q=75",
  "https://images.unsplash.com/photo-1523380677598-64d85d2c2e3f?w=600&q=75",
  "https://images.unsplash.com/photo-1601472544215-3b52a2fd8e3b?w=600&q=75",
  "https://images.unsplash.com/photo-1536766820879-059fec98ec0a?w=600&q=75",
  "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&q=75",
  "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=600&q=75",
  "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=600&q=75",
];

const UNSPLASH_BAGS = [
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=75",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=75",
  "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=75",
  "https://images.unsplash.com/photo-1590739293931-2a8b79efa6e1?w=600&q=75",
  "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600&q=75",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=75",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=75",
  "https://images.unsplash.com/photo-1612831455740-e3a498e3f5ea?w=600&q=75",
];

const UNSPLASH_ACC = [
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=75",
  "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&q=75",
  "https://images.unsplash.com/photo-1590736969596-fece08f00a88?w=600&q=75",
  "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=75",
  "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&q=75",
  "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&q=75",
];

/* helpers */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const BADGES = [null, null, null, "NEW", "NEW", "BESTSELLER", "SALE"];

const womenSizes = (base = 5) => [
  { size: "XS", stock: rInt(0, base) },
  { size: "S",  stock: rInt(2, base + 5) },
  { size: "M",  stock: rInt(3, base + 8) },
  { size: "L",  stock: rInt(2, base + 5) },
  { size: "XL", stock: rInt(0, base) },
];
const menSizes = (base = 5) => [
  { size: "S",   stock: rInt(1, base) },
  { size: "M",   stock: rInt(3, base + 5) },
  { size: "L",   stock: rInt(4, base + 8) },
  { size: "XL",  stock: rInt(2, base + 5) },
  { size: "XXL", stock: rInt(0, base) },
];
const freeSize = () => [{ size: "Free Size", stock: rInt(5, 30) }];

/* ─── WOMEN PRODUCTS ─── */

const FABRICS   = ["Ankara", "Aso-oke", "Adire", "Kente", "Lace", "Linen", "Silk", "Chiffon", "Brocade", "Organza", "Velvet", "Jacquard", "George", "Faux Satin", "Cotton", "Aso Ebi", "Batik", "Dashiki", "Tie-dye", "Damask"];
const COLORS    = ["Gold", "Royal Blue", "Burgundy", "Emerald", "Ivory", "Blush", "Chocolate", "Terracotta", "Forest Green", "Coral", "Cobalt", "Sage", "Mint", "Navy", "Plum", "Rose Gold", "Ochre", "Mustard", "Black", "White", "Cream", "Teal", "Orange", "Fuchsia", "Lilac"];
const OCCASIONS = ["evening", "bridal", "casual", "work", "occasion", "resort", "formal", "traditional", "aso-ebi", "cocktail", "garden party", "beach", "cruise", "wedding guest"];
const DETAILS   = ["hand-embroidered neckline", "beaded hem", "gold thread detailing", "ruffled sleeve", "puff sleeve", "cold shoulder", "off-shoulder", "wrap style", "asymmetric hem", "tiered skirt", "high slit", "boat neckline", "square neck", "deep V-neck", "pleated waist", "smocked bodice", "cutout back", "lace trim", "fringe detail", "peplum waist"];
const ADJECTIVES = ["Luxurious", "Elegant", "Bold", "Flowing", "Structured", "Draped", "Tailored", "Embellished", "Statement", "Classic", "Contemporary", "Regal", "Chic", "Effortless", "Sophisticated", "Vibrant", "Timeless", "Modern", "Artisanal", "Couture"];
const DESIGNERS  = ["Annie Patricia", "Studio AP", "AP Couture", "Lagos Edit by AP", "AP Artisan"];

function makeDressName(i) {
  return `${pick(ADJECTIVES)} ${pick(FABRICS)} ${pick(["Midi Dress","Maxi Dress","Mini Dress","Shift Dress","Wrap Dress","Column Dress","A-line Dress","Bodycon Dress","Shirt Dress","Off-shoulder Dress","Kaftan Dress","Evening Gown","Occasion Dress","Statement Dress"])} ${String(i).padStart(3,"0")}`;
}
function makeDressDesc(name) {
  return `${name} featuring ${pick(DETAILS)}. Crafted for ${pick(OCCASIONS)} occasions in ${pick(FABRICS)} fabric. ${pick(["A true statement piece.","Versatile and elegant.","Inspired by Nigerian heritage.","Perfect for any celebration.","Where tradition meets modernity."])}`;
}

function makeTopName(i) {
  return `${pick(ADJECTIVES)} ${pick(FABRICS)} ${pick(["Blouse","Crop Top","Peplum Top","Kaftan Top","Shell Top","Wrap Top","Bandeau Top","Bodysuit","Tube Top","Off-shoulder Top","Asymmetric Top","Button-down Top","Bralette","Corset Top"])} ${String(i).padStart(3,"0")}`;
}
function makeSkirtName(i) {
  return `${pick(ADJECTIVES)} ${pick(FABRICS)} ${pick(["Midi Skirt","Maxi Skirt","Mini Skirt","Wrap Skirt","Pleated Skirt","Pencil Skirt","A-line Skirt","Tiered Skirt","High-low Skirt","Asymmetric Skirt","Circle Skirt","Slit Skirt"])} ${String(i).padStart(3,"0")}`;
}
function makeJumpName(i) {
  return `${pick(ADJECTIVES)} ${pick(FABRICS)} ${pick(["Wide-leg Jumpsuit","Slim Jumpsuit","Halter Jumpsuit","Off-shoulder Jumpsuit","Sleeveless Jumpsuit","Utility Jumpsuit","Romper","Palazzo Jumpsuit"])} ${String(i).padStart(3,"0")}`;
}
function makeBubuName(i) {
  return `${pick(ADJECTIVES)} ${pick(FABRICS)} ${pick(["Bubu","Free-flowing Bubu","Kaftan Bubu","Wide Sleeve Bubu","Embellished Bubu","Embroidered Bubu","Contemporary Bubu","Evening Bubu"])} ${String(i).padStart(3,"0")}`;
}
function makeAsoEkeName(i) {
  return `${pick(COLORS)} ${pick(["Aso-oke","Asoeke","Woven Aso-oke","Premium Aso-oke","Hand-woven Aso-oke"])} ${pick(["Set","Fabric","Piece","Collection","Bundle"])} ${String(i).padStart(3,"0")}`;
}
function makeKimonoName(i) {
  return `${pick(ADJECTIVES)} ${pick(FABRICS)} ${pick(["Kimono & Pant Set","Kimono Duster & Pants","Open Kimono with Trousers","Kimono Coord Set","Printed Kimono Set"])} ${String(i).padStart(3,"0")}`;
}
function makeAsoEbiName(i) {
  return `${pick(COLORS)} ${pick(FABRICS)} ${pick(["Aso Ebi Dress","Aso Ebi Blouse","Aso Ebi Skirt Set","Aso Ebi Co-ord","Aso Ebi Gown","Aso Ebi Jumpsuit"])} ${String(i).padStart(3,"0")}`;
}
function makeTrouserWomenName(i) {
  return `${pick(ADJECTIVES)} ${pick(FABRICS)} ${pick(["Wide-leg Trousers","Palazzo Pants","Flared Pants","Tailored Trousers","Jogger Pants","Culotte Pants","Straight-leg Trousers","High-waist Trousers"])} ${String(i).padStart(3,"0")}`;
}

/* MEN */
const MEN_DETAILS  = ["machine-embroidered collar", "hand-stitched pattern", "tassel drawstring", "open-weave sleeve", "contrast trim", "brocade panel", "matching cap", "soutache embroidery", "gold piping", "wide sleeve"];
const MEN_ADJECTIVES = ["Regal", "Classic", "Premium", "Traditional", "Tailored", "Refined", "Bold", "Modern", "Distinguished", "Artisanal"];

function makeAgbadaName(i) {
  return `${pick(MEN_ADJECTIVES)} ${pick(FABRICS)} ${pick(["Agbada","3-piece Agbada","Senator Agbada","Contemporary Agbada","Grand Boubou","Flowing Agbada","Royal Agbada","Complete Agbada Set"])} ${String(i).padStart(3,"0")}`;
}
function makeKaftanName(i) {
  return `${pick(MEN_ADJECTIVES)} ${pick(FABRICS)} ${pick(["Kaftan","Long Kaftan","Short Kaftan","Native Kaftan","Senator Kaftan","Embroidered Kaftan","Traditional Kaftan","Modern Kaftan","Aso-oke Kaftan"])} ${String(i).padStart(3,"0")}`;
}
function makeMenTopName(i) {
  return `${pick(MEN_ADJECTIVES)} ${pick(FABRICS)} ${pick(["Dashiki Shirt","Short Dashiki","Embroidered Shirt","Print Shirt","Native Shirt","Casual Shirt","Brocade Shirt","Long-sleeve Shirt"])} ${String(i).padStart(3,"0")}`;
}
function makeMenTrouserName(i) {
  return `${pick(MEN_ADJECTIVES)} ${pick(FABRICS)} ${pick(["Trousers","Wide-leg Pants","Palazzo Pants","Brocade Trousers","Linen Trousers","Drawstring Pants","Native Trousers","Straight-cut Pants"])} ${String(i).padStart(3,"0")}`;
}

/* BAGS */
const BAG_TYPES  = ["Tote","Clutch","Crossbody","Shoulder Bag","Mini Bag","Bucket Bag","Satchel","Backpack","Evening Bag","Market Tote","Woven Bag","Beaded Bag","Straw Bag","Raffia Bag","Leather Bag","Chain Bag","Structured Bag","Saddle Bag"];
const BAG_MATS   = ["Raffia","Woven","Leather","Beaded","Ankara","Adire","Fabric","Croc-effect","Suede","Canvas","Metallic","Kente","Snakeskin-effect","Python-effect","Crocodile-print"];
function makeBagName(i) {
  return `${pick(ADJECTIVES)} ${pick(BAG_MATS)} ${pick(BAG_TYPES)} ${String(i).padStart(3,"0")}`;
}

/* ACCESSORIES */
const ACC_TYPES  = ["Necklace","Earrings","Cuff Bracelet","Waist Chain","Head Wrap","Fascinator","Bangle Set","Ring","Anklet","Belt","Hair Pin","Brooch","Choker","Layered Necklace","Stud Earrings","Drop Earrings","Hoop Earrings","Headband","Gele","Aso-oke Head Tie"];
const ACC_MATS   = ["Beaded","Gold-plated","Silver-tone","Brass","Ankara","Hand-knotted","Cowrie","Coral","Crystal","Enamel","Oxidized","Woven","Resin","Acrylic","Shell","Wooden","Leather","Fabric"];
function makeAccName(i) {
  return `${pick(ACC_MATS)} ${pick(ACC_TYPES)} ${String(i).padStart(3,"0")}`;
}

/* price helpers */
const PRICE_RANGES = {
  Dresses:               [35000, 180000],
  Bubus:                 [30000, 120000],
  "Kimono and pant sets": [40000, 130000],
  Asoeke:                [25000,  90000],
  "Aso Ebi":             [30000, 150000],
  Jumpsuits:             [32000, 110000],
  Skirts:                [18000,  75000],
  Tops:                  [15000,  55000],
  Trousers:              [18000,  70000],
  Agbada:                [60000, 280000],
  Kaftan:                [30000, 150000],
  Bags:                  [20000, 120000],
  Accessories:           [5000,   45000],
};

function makePrice(cat) {
  const [min, max] = PRICE_RANGES[cat] || [15000, 80000];
  return rInt(min / 1000, max / 1000) * 1000;
}

function makeComparePrice(price, badge) {
  if (badge === "SALE") return Math.round(price * rInt(110, 150) / 100 / 1000) * 1000;
  return 0;
}

/* ═══════════════════════════════════════════════════════
   GENERATE PRODUCTS
═══════════════════════════════════════════════════════ */

const products = [];

// Dresses — 500
for (let i = 1; i <= 500; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Dresses");
  products.push({
    name: makeDressName(i), category: "Dresses",
    description: makeDressDesc(makeDressName(i)),
    shortDescription: `${pick(ADJECTIVES)} ${pick(FABRICS)} dress for ${pick(OCCASIONS)} occasions.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Dress ${i}` }],
    badge, gender: "WOMEN",
    sizes: womenSizes(rInt(3, 10)),
    isFeatured: i <= 15, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["dress", "women", pick(FABRICS).toLowerCase(), pick(OCCASIONS)],
    soldCount: rInt(0, 200),
  });
}

// Bubus — 300
for (let i = 1; i <= 300; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Bubus");
  products.push({
    name: makeBubuName(i), category: "Bubus",
    description: `${pick(MEN_DETAILS)} details on this ${pick(ADJECTIVES).toLowerCase()} bubu. Crafted for ${pick(OCCASIONS)} occasions.`,
    shortDescription: `${pick(ADJECTIVES)} Nigerian bubu in premium fabric.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Bubu ${i}` }],
    badge, gender: "WOMEN",
    sizes: womenSizes(),
    isFeatured: i <= 8, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["bubu", "women", "traditional"],
    soldCount: rInt(0, 150),
  });
}

// Kimono and pant sets — 250
for (let i = 1; i <= 250; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Kimono and pant sets");
  products.push({
    name: makeKimonoName(i), category: "Kimono and pant sets",
    description: `${pick(ADJECTIVES)} kimono co-ord set with matching trousers in ${pick(FABRICS)}. ${pick(DETAILS)} details throughout.`,
    shortDescription: `Kimono and pant set in ${pick(FABRICS)}.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Kimono Set ${i}` }],
    badge, gender: "WOMEN",
    sizes: womenSizes(),
    isFeatured: i <= 6, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["kimono", "set", "co-ord", "women"],
    soldCount: rInt(0, 120),
  });
}

// Asoeke — 200
for (let i = 1; i <= 200; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Asoeke");
  products.push({
    name: makeAsoEkeName(i), category: "Asoeke",
    description: `Handwoven aso-oke fabric from master weavers. ${pick(["Traditional","Premium","Authentic","Hand-crafted"])} quality.`,
    shortDescription: `Premium hand-woven aso-oke in ${pick(COLORS)}.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Aso-oke ${i}` }],
    badge, gender: "WOMEN",
    sizes: freeSize(),
    isFeatured: i <= 5, designer: "Annie Patricia",
    material: "Aso-oke",
    tags: ["aso-oke", "traditional", "fabric", "women"],
    soldCount: rInt(0, 100),
  });
}

// Aso Ebi — 250
for (let i = 1; i <= 250; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Aso Ebi");
  products.push({
    name: makeAsoEbiName(i), category: "Aso Ebi",
    description: `${pick(ADJECTIVES)} aso ebi piece crafted for special occasions. ${pick(DETAILS)}.`,
    shortDescription: `Aso Ebi ${pick(["dress","set","blouse"])} for ${pick(OCCASIONS)} occasions.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Aso Ebi ${i}` }],
    badge, gender: "WOMEN",
    sizes: womenSizes(),
    isFeatured: i <= 5, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["aso-ebi", "women", "occasion"],
    soldCount: rInt(0, 180),
  });
}

// Jumpsuits — 200
for (let i = 1; i <= 200; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Jumpsuits");
  products.push({
    name: makeJumpName(i), category: "Jumpsuits",
    description: `${pick(ADJECTIVES)} jumpsuit with ${pick(DETAILS)}. Perfect for ${pick(OCCASIONS)} occasions.`,
    shortDescription: `${pick(FABRICS)} jumpsuit in ${pick(COLORS)}.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Jumpsuit ${i}` }],
    badge, gender: "WOMEN",
    sizes: womenSizes(),
    isFeatured: i <= 6, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["jumpsuit", "women", pick(FABRICS).toLowerCase()],
    soldCount: rInt(0, 130),
  });
}

// Skirts — 200
for (let i = 1; i <= 200; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Skirts");
  products.push({
    name: makeSkirtName(i), category: "Skirts",
    description: `${pick(ADJECTIVES)} skirt with ${pick(DETAILS)}. Wear for ${pick(OCCASIONS)} occasions.`,
    shortDescription: `${pick(ADJECTIVES)} ${pick(FABRICS)} skirt.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Skirt ${i}` }],
    badge, gender: "WOMEN",
    sizes: womenSizes(),
    isFeatured: i <= 5, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["skirt", "women"],
    soldCount: rInt(0, 100),
  });
}

// Tops (Women) — 300
for (let i = 1; i <= 300; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Tops");
  products.push({
    name: makeTopName(i), category: "Tops",
    description: `${pick(ADJECTIVES)} top with ${pick(DETAILS)}. Easy day-to-evening styling.`,
    shortDescription: `${pick(FABRICS)} women's top in ${pick(COLORS)}.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Women Top ${i}` }],
    badge, gender: "WOMEN",
    sizes: womenSizes(),
    isFeatured: i <= 8, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["top", "women", "blouse"],
    soldCount: rInt(0, 160),
  });
}

// Trousers (Women) — 200
for (let i = 1; i <= 200; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Trousers");
  products.push({
    name: makeTrouserWomenName(i), category: "Trousers",
    description: `${pick(ADJECTIVES)} trousers with ${pick(DETAILS)}. ${pick(FABRICS)} fabric for all-day comfort.`,
    shortDescription: `${pick(ADJECTIVES)} ${pick(FABRICS)} women's trousers.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_WOMEN), alt: `Women Trouser ${i}` }],
    badge, gender: "WOMEN",
    sizes: womenSizes(),
    isFeatured: i <= 5, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["trousers", "women", "pants"],
    soldCount: rInt(0, 110),
  });
}

// Agbada (Men) — 400
for (let i = 1; i <= 400; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Agbada");
  products.push({
    name: makeAgbadaName(i), category: "Agbada",
    description: `${pick(MEN_ADJECTIVES)} agbada set with ${pick(MEN_DETAILS)}. In premium ${pick(FABRICS)} fabric.`,
    shortDescription: `${pick(MEN_ADJECTIVES)} agbada in ${pick(FABRICS)}.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_MEN), alt: `Agbada ${i}` }],
    badge, gender: "MEN",
    sizes: menSizes(),
    isFeatured: i <= 10, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["agbada", "men", "traditional"],
    soldCount: rInt(0, 180),
  });
}

// Kaftan (Men) — 400
for (let i = 1; i <= 400; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Kaftan");
  products.push({
    name: makeKaftanName(i), category: "Kaftan",
    description: `${pick(MEN_ADJECTIVES)} kaftan with ${pick(MEN_DETAILS)}. Tailored for modern traditional dressing.`,
    shortDescription: `${pick(MEN_ADJECTIVES)} ${pick(FABRICS)} kaftan.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_MEN), alt: `Kaftan ${i}` }],
    badge, gender: "MEN",
    sizes: menSizes(),
    isFeatured: i <= 10, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["kaftan", "men", "traditional"],
    soldCount: rInt(0, 200),
  });
}

// Tops (Men) — 200
for (let i = 1; i <= 200; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Tops");
  products.push({
    name: makeMenTopName(i), category: "Tops",
    description: `${pick(MEN_ADJECTIVES)} men's top with ${pick(MEN_DETAILS)}. Casual or semi-formal wear.`,
    shortDescription: `${pick(MEN_ADJECTIVES)} ${pick(FABRICS)} men's shirt.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_MEN), alt: `Men Top ${i}` }],
    badge, gender: "MEN",
    sizes: menSizes(),
    isFeatured: i <= 5, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["shirt", "men", "top"],
    soldCount: rInt(0, 120),
  });
}

// Trousers (Men) — 200
for (let i = 1; i <= 200; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Trousers");
  products.push({
    name: makeMenTrouserName(i), category: "Trousers",
    description: `${pick(MEN_ADJECTIVES)} trousers in ${pick(FABRICS)}. ${pick(MEN_DETAILS)} accents.`,
    shortDescription: `${pick(MEN_ADJECTIVES)} ${pick(FABRICS)} trousers for men.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_MEN), alt: `Men Trouser ${i}` }],
    badge, gender: "MEN",
    sizes: menSizes(),
    isFeatured: i <= 4, designer: pick(DESIGNERS),
    material: pick(FABRICS),
    tags: ["trousers", "men", "pants"],
    soldCount: rInt(0, 90),
  });
}

// Bags — 300
for (let i = 1; i <= 300; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Bags");
  products.push({
    name: makeBagName(i), category: "Bags",
    description: `${pick(ADJECTIVES).toLowerCase()} bag handcrafted by ${pick(["Lagos","Kano","Abuja","Owerri","Port Harcourt"])} artisans. ${pick(["Spacious and practical.","Compact and stylish.","Perfect for day or evening.","Lightweight and durable."])}`,
    shortDescription: `${pick(BAG_MATS)} ${pick(BAG_TYPES)} in ${pick(COLORS)}.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_BAGS), alt: `Bag ${i}` }],
    badge, gender: pick(["WOMEN","WOMEN","WOMEN","UNISEX"]),
    sizes: freeSize(),
    isFeatured: i <= 8, designer: pick(DESIGNERS),
    material: pick(BAG_MATS),
    tags: ["bag", "accessories", pick(BAG_MATS).toLowerCase()],
    soldCount: rInt(0, 150),
  });
}

// Accessories — 350
for (let i = 1; i <= 350; i++) {
  const badge = pick(BADGES);
  const price = makePrice("Accessories");
  products.push({
    name: makeAccName(i), category: "Accessories",
    description: `Handcrafted ${pick(ACC_MATS).toLowerCase()} ${pick(ACC_TYPES).toLowerCase()}. Each piece is uniquely made by Nigerian artisans.`,
    shortDescription: `${pick(ACC_MATS)} ${pick(ACC_TYPES)}.`,
    price, comparePrice: makeComparePrice(price, badge),
    images: [{ url: pick(UNSPLASH_ACC), alt: `Accessory ${i}` }],
    badge, gender: pick(["WOMEN","WOMEN","WOMEN","UNISEX","MEN"]),
    sizes: freeSize(),
    isFeatured: i <= 8, designer: pick(DESIGNERS),
    material: pick(ACC_MATS),
    tags: ["accessories", "jewelry", pick(ACC_MATS).toLowerCase()],
    soldCount: rInt(0, 300),
  });
}

/* total count check */
console.log(`📊 Generated ${products.length} products`);

/* ═══════════════════════════════════════════════════════
   COUPONS
═══════════════════════════════════════════════════════ */
const COUPONS = [
  { code: "WELCOME10",  type: "percentage", value: 10, minOrderAmount: 20000,  description: "10% off for new customers",        usageLimit: 1000, isActive: true },
  { code: "LAGOS20",    type: "percentage", value: 20, minOrderAmount: 50000,  maxDiscount: 25000, description: "20% off orders over ₦50k", usageLimit: 200, isActive: true },
  { code: "FLAT5K",     type: "fixed",      value: 5000, minOrderAmount: 30000, description: "₦5,000 off orders over ₦30k",    usageLimit: 500, isActive: true },
  { code: "NEWSEASON",  type: "percentage", value: 15, minOrderAmount: 40000,  description: "15% off new season picks",         usageLimit: 300, isActive: true },
  { code: "VIP25",      type: "percentage", value: 25, minOrderAmount: 80000,  maxDiscount: 50000, description: "VIP 25% discount",        usageLimit: 50, isActive: true },
  { code: "FLAT10K",    type: "fixed",      value: 10000, minOrderAmount: 60000, description: "₦10,000 off luxury orders",      usageLimit: 100, isActive: true },
  { code: "FREESHIP",   type: "fixed",      value: 2500, minOrderAmount: 15000, description: "Free shipping discount",          usageLimit: 1000, isActive: true },
];

/* ═══════════════════════════════════════════════════════
   SEED
═══════════════════════════════════════════════════════ */
const BATCH_SIZE = 500;

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 Connected to MongoDB");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert in batches
    let inserted = 0;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE);
      await Product.insertMany(batch, { ordered: false });
      inserted += batch.length;
      console.log(`  ✓ Inserted ${inserted}/${products.length} products`);
    }

    // Seed coupons
    await Coupon.deleteMany({});
    await Coupon.insertMany(COUPONS);
    console.log(`✅ Seeded ${COUPONS.length} coupons`);

    // Admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@anniepatricia.com";
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({
        firstName: "Annie",
        lastName: "Patricia",
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || "Admin@2025!",
        role: "admin",
        phone: "+2348000000000",
      });
      console.log(`👤 Created admin: ${adminEmail}`);
    } else {
      console.log(`👤 Admin already exists: ${adminEmail}`);
    }

    console.log(`\n🎉 Seeded ${inserted} products, ${COUPONS.length} coupons`);
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
