import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search, ShoppingCart, Heart, User, MapPin, Menu, X, Star, ChevronRight,
  ChevronLeft, Zap, Truck, ShieldCheck, RotateCcw, Plus, Minus, Trash2,
  Check, CreditCard, Filter, ArrowLeft, Tag, Clock, Package, Home,
  Phone, Mail, Facebook, Instagram, Twitter, Youtube, ChevronDown, Sparkles,
  Lock, LayoutDashboard, Boxes, ClipboardList, Edit3, LogOut, Database,
  Save, UploadCloud, ShoppingBag, DollarSign, Image as ImageIcon
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc,
  doc, setDoc, query, orderBy, serverTimestamp
} from "firebase/firestore";

/* ============================================================
   FIREBASE — replace the placeholders below with your real
   project keys from the Firebase Console (Project Settings →
   General → Your apps → Web app → SDK config).
   The app works in "Demo mode" (in-memory) until real keys are
   added — no localStorage is ever used.
   ============================================================ */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const ADMIN_PIN = "202612570";

const FIREBASE_READY =
  firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes("YOUR_") &&
  !firebaseConfig.projectId.includes("YOUR_");

let db = null;
if (FIREBASE_READY) {
  try {
    const fbApp = initializeApp(firebaseConfig);
    db = getFirestore(fbApp);
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
}

/* Normalize a Firestore product doc into the shape the UI expects */
const normalizeProduct = (id, data) => ({
  id,
  name: data.name || "Untitled product",
  brand: data.brand || "Generic",
  category: data.category || "mobiles",
  price: Number(data.price) || 0,
  oldPrice: Number(data.oldPrice) || Number(data.price) || 0,
  rating: data.rating != null ? Number(data.rating) : 4.5,
  reviews: data.reviews != null ? Number(data.reviews) : 0,
  emoji: data.emoji || "📦",
  grad: Array.isArray(data.grad) && data.grad.length === 2 ? data.grad : ["#3a3f4a", "#181b22"],
  tags: Array.isArray(data.tags) ? data.tags : [],
  specs: Array.isArray(data.specs) ? data.specs : [],
  image: data.image || "",
});

/* ============================================================
   ZEON ELECTRONICS — UAE Marketplace (Dubai · Abu Dhabi)
   Single-file React storefront. AED pricing, express delivery,
   flash deals, full cart + checkout. No external deps beyond
   lucide-react. In-memory state only.
   ============================================================ */

const BRAND = {
  yellow: "#FEEE00",
  yellowDark: "#F3D000",
  ink: "#2B2F38",
  inkSoft: "#6E7484",
  line: "#E6E8EE",
  bg: "#F6F7FB",
  blue: "#3866DF",
  green: "#1AA15D",
  red: "#E63946",
};

const fontInject = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
* { -webkit-tap-highlight-color: transparent; }
.zn-body { font-family:'Plus Jakarta Sans', system-ui, sans-serif; }
.zn-head { font-family:'Sora', system-ui, sans-serif; }
@keyframes znFade { from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:none} }
.zn-fade { animation: znFade .45s ease both; }
@keyframes znPop { 0%{transform:scale(.92)} 60%{transform:scale(1.04)} 100%{transform:scale(1)} }
.zn-pop { animation: znPop .25s ease; }
.zn-scroll::-webkit-scrollbar{height:6px} .zn-scroll::-webkit-scrollbar-thumb{background:#ccc;border-radius:9px}
.zn-card:hover{ box-shadow:0 12px 30px rgba(43,47,56,.12); transform:translateY(-3px); }
.zn-card{ transition: all .22s cubic-bezier(.2,.7,.3,1); }
`;

/* ---------------- Catalogue ---------------- */
const CATEGORIES = [
  { id: "mobiles", name: "Mobiles & Tablets", icon: "📱", grad: ["#4F8DFD", "#1E4FD6"] },
  { id: "laptops", name: "Laptops", icon: "💻", grad: ["#8A5BFF", "#5B2CD6"] },
  { id: "tv", name: "TV & Audio", icon: "📺", grad: ["#FF7A59", "#E03B3B"] },
  { id: "gaming", name: "Gaming", icon: "🎮", grad: ["#23C16B", "#0E8F4D"] },
  { id: "wearables", name: "Wearables", icon: "⌚", grad: ["#FF5DA2", "#C81E7E"] },
  { id: "cameras", name: "Cameras", icon: "📷", grad: ["#3BC9DB", "#0C8FA3"] },
  { id: "audio", name: "Headphones", icon: "🎧", grad: ["#F4A82C", "#D67E0A"] },
  { id: "appliances", name: "Home Appliances", icon: "🔌", grad: ["#7C8595", "#4A515E"] },
];

const P = (id, name, brand, category, price, oldPrice, rating, reviews, emoji, grad, tags = [], specs = []) =>
  ({ id, name, brand, category, price, oldPrice, rating, reviews, emoji, grad, tags, specs });

const PRODUCTS = [
  P(1, "Galaxy S24 Ultra 5G 256GB Titanium", "Samsung", "mobiles", 3899, 5199, 4.7, 2841, "📱", ["#3a3a52","#11111c"], ["express","bestseller"],
    ["6.8\" Dynamic AMOLED 2X","200MP Camera","Snapdragon 8 Gen 3","5000mAh, 45W"]),
  P(2, "iPhone 15 Pro Max 256GB Natural Titanium", "Apple", "mobiles", 4699, 5099, 4.9, 5120, "📱", ["#6e6e73","#1d1d1f"], ["express","bestseller"],
    ["6.7\" Super Retina XDR","A17 Pro chip","48MP Main Camera","Titanium design"]),
  P(3, "iPad Air 11\" M2 128GB Wi-Fi", "Apple", "mobiles", 2499, 2799, 4.8, 932, "📱", ["#9fb4d6","#5b7bb0"], ["express"],
    ["11\" Liquid Retina","Apple M2 chip","12MP camera","Touch ID"]),
  P(4, "MacBook Air 13\" M3 8GB 256GB", "Apple", "laptops", 4199, 4699, 4.9, 1840, "💻", ["#c9c9ce","#8e8e93"], ["express","bestseller"],
    ["13.6\" Liquid Retina","Apple M3","18hr battery","Fanless silent"]),
  P(5, "ROG Strix G16 i9 RTX 4070 16GB", "ASUS", "laptops", 6899, 7999, 4.6, 612, "💻", ["#1f2530","#0a0d14"], ["express"],
    ["16\" 240Hz QHD","Core i9-13980HX","RTX 4070 8GB","1TB SSD"]),
  P(6, "Galaxy Book4 Pro 14\" Ultra 7", "Samsung", "laptops", 5299, 5999, 4.5, 288, "💻", ["#4a5468","#262d3b"], [],
    ["14\" AMOLED 3K","Intel Ultra 7","16GB RAM","Ultra-light 1.2kg"]),
  P(7, "OLED 65\" 4K Smart TV C4 Series", "LG", "tv", 4599, 6299, 4.8, 1503, "📺", ["#2a2a2a","#0d0d0d"], ["express","bestseller"],
    ["65\" Self-lit OLED","α9 AI Processor","144Hz Gaming","webOS 24"]),
  P(8, "Neo QLED 55\" 4K Smart TV QN90D", "Samsung", "tv", 3299, 4499, 4.7, 980, "📺", ["#222831","#0b0e12"], ["express"],
    ["55\" Neo QLED","Quantum Matrix","Anti-glare","Tizen OS"]),
  P(9, "PlayStation 5 Slim Disc Edition", "Sony", "gaming", 1799, 2099, 4.9, 7321, "🎮", ["#1b2a4a","#0a1428"], ["express","bestseller"],
    ["1TB SSD","4K 120fps","DualSense","Ray tracing"]),
  P(10, "Xbox Series X 1TB Console", "Microsoft", "gaming", 1699, 1999, 4.8, 4102, "🎮", ["#0e3d20","#04210f"], ["express"],
    ["1TB SSD","12 TFLOPs","4K 120Hz","Quick Resume"]),
  P(11, "Watch Series 9 GPS 45mm", "Apple", "wearables", 1599, 1899, 4.8, 2210, "⌚", ["#e94f7d","#b51e54"], ["express","bestseller"],
    ["45mm Retina","S9 SiP","Double tap","Crash detection"]),
  P(12, "Galaxy Watch7 44mm LTE", "Samsung", "wearables", 1199, 1499, 4.5, 640, "⌚", ["#3b4a6b","#1c2740"], [],
    ["Sapphire glass","BioActive sensor","Wear OS","IP68"]),
  P(13, "EOS R8 Mirrorless + 24-50mm", "Canon", "cameras", 5799, 6499, 4.7, 421, "📷", ["#2c2c2c","#101010"], ["express"],
    ["24.2MP Full-frame","4K 60p","Dual Pixel AF","Lightweight"]),
  P(14, "Alpha A7 IV Body 33MP", "Sony", "cameras", 8499, 9299, 4.9, 388, "📷", ["#26313d","#0d141c"], [],
    ["33MP Full-frame","4K 60p 10-bit","759 AF points","5-axis IBIS"]),
  P(15, "WH-1000XM5 Noise Cancelling", "Sony", "audio", 1149, 1599, 4.8, 3540, "🎧", ["#3a3f4a","#181b22"], ["express","bestseller"],
    ["Industry-leading ANC","30hr battery","Multipoint","LDAC Hi-Res"]),
  P(16, "AirPods Pro 2 USB-C", "Apple", "audio", 799, 999, 4.9, 6120, "🎧", ["#e8e8ec","#b9b9c0"], ["express"],
    ["Adaptive Audio","2x ANC","USB-C case","Find My"]),
  P(17, "Bose QuietComfort Ultra", "Bose", "audio", 1399, 1799, 4.7, 910, "🎧", ["#2b2f38","#11141a"], [],
    ["Immersive Audio","CustomTune","24hr battery","Aware mode"]),
  P(18, "Inverter Fridge 600L French Door", "LG", "appliances", 4299, 5499, 4.6, 502, "🧊", ["#5d6b7d","#2d3744"], [],
    ["600L capacity","DoorCooling+","Inverter Linear","Smart diagnosis"]),
  P(19, "Front Load Washer 10kg AI", "Samsung", "appliances", 2199, 2899, 4.5, 388, "🌀", ["#4a5568","#232b38"], ["express"],
    ["10kg load","AI EcoBubble","1400 RPM","SmartThings"]),
  P(20, "Robot Vacuum X2 Omni LiDAR", "Roborock", "appliances", 3199, 3899, 4.7, 1260, "🤖", ["#2f3a4a","#121922"], ["express","bestseller"],
    ["Auto-empty dock","LiDAR mapping","8000Pa suction","Mop self-clean"]),
  P(21, "Pixel 8 Pro 256GB Obsidian", "Google", "mobiles", 2999, 3699, 4.6, 712, "📱", ["#3a3f47","#15171b"], ["express"],
    ["6.7\" LTPO OLED","Tensor G3","Magic Editor","7yr updates"]),
  P(22, "Dell XPS 15 OLED i7 RTX 4050", "Dell", "laptops", 6299, 7199, 4.6, 410, "💻", ["#363c47","#1a1e25"], [],
    ["15.6\" 3.5K OLED","Core i7","RTX 4050","CNC aluminium"]),
  P(23, "Soundbar Q990D 11.1.4ch", "Samsung", "tv", 1899, 2499, 4.7, 540, "🔊", ["#23262d","#0c0e12"], ["express"],
    ["11.1.4 channels","Dolby Atmos","Wireless sub","Q-Symphony"]),
  P(24, "Meta Quest 3 512GB VR", "Meta", "gaming", 1999, 2399, 4.6, 1820, "🕶️", ["#2a3550","#121a30"], ["express"],
    ["Mixed Reality","4K+ Infinite","Snapdragon XR2","Touch Plus"]),
];

const HERO = [
  { title: "Mega Tech Days", sub: "Up to 60% OFF on top brands", cta: "Shop Deals", emoji: "⚡", bg: ["#2B2F38", "#11141a"] },
  { title: "iPhone 15 Pro Max", sub: "Now with 0% installments via Tabby", cta: "Buy Now", emoji: "📱", bg: ["#1d1d1f", "#000000"] },
  { title: "Gaming Carnival", sub: "PS5 · Xbox · Quest 3 in stock", cta: "Explore", emoji: "🎮", bg: ["#0E8F4D", "#04210f"] },
];

const AED = (n) => "AED " + n.toLocaleString("en-AE");
const off = (p) => Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);

/* ---------------- Small UI bits ---------------- */
function Stars({ value, size = 13 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size}
          fill={i <= Math.round(value) ? BRAND.yellowDark : "none"}
          color={i <= Math.round(value) ? BRAND.yellowDark : "#c9ccd4"} />
      ))}
    </span>
  );
}

function ProductTile({ p, big }) {
  const grad = Array.isArray(p.grad) && p.grad.length === 2 ? p.grad : ["#3a3f4a", "#181b22"];
  return (
    <div style={{
      background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`,
      borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
      width: "100%", aspectRatio: big ? "1.3/1" : "1/1", position: "relative", overflow: "hidden",
    }}>
      {p.image ? (
        <img src={p.image} alt={p.name} loading="lazy"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 70% 20%, rgba(255,255,255,.18), transparent 55%)" }} />
          <span style={{ fontSize: big ? 96 : 60, filter: "drop-shadow(0 8px 16px rgba(0,0,0,.35))" }}>{p.emoji}</span>
        </>
      )}
      <span className="zn-head" style={{
        position: "absolute", bottom: 8, left: 10, color: "rgba(255,255,255,.95)",
        fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
        textShadow: "0 1px 4px rgba(0,0,0,.5)", zIndex: 2
      }}>{p.brand}</span>
    </div>
  );
}

/* ---------------- Cards ---------------- */
function ProductCard({ p, onOpen, onAdd, onWish, wished }) {
  return (
    <div className="zn-card zn-fade" onClick={() => onOpen(p)} style={{
      background: "#fff", borderRadius: 16, padding: 10, cursor: "pointer",
      border: `1px solid ${BRAND.line}`, position: "relative", display: "flex", flexDirection: "column"
    }}>
      <button onClick={(e) => { e.stopPropagation(); onWish(p); }} style={{
        position: "absolute", top: 14, right: 14, zIndex: 3, background: "#fff",
        border: `1px solid ${BRAND.line}`, borderRadius: 999, width: 32, height: 32,
        display: "grid", placeItems: "center", cursor: "pointer"
      }}>
        <Heart size={16} fill={wished ? BRAND.red : "none"} color={wished ? BRAND.red : BRAND.inkSoft} />
      </button>
      {off(p) > 0 && (
        <span style={{
          position: "absolute", top: 14, left: 14, zIndex: 3, background: BRAND.red, color: "#fff",
          fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 8
        }}>-{off(p)}%</span>
      )}
      <ProductTile p={p} />
      <div style={{ padding: "10px 4px 4px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.ink, lineHeight: 1.35, minHeight: 36,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {p.name}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Stars value={p.rating} />
          <span style={{ fontSize: 11, color: BRAND.inkSoft }}>({p.reviews.toLocaleString()})</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
          <span className="zn-head" style={{ fontSize: 17, fontWeight: 800, color: BRAND.ink }}>{AED(p.price)}</span>
          {p.oldPrice > p.price && (
            <span style={{ fontSize: 12, color: BRAND.inkSoft, textDecoration: "line-through" }}>{AED(p.oldPrice)}</span>
          )}
        </div>
        {p.tags.includes("express") && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start",
            background: "#EAF0FF", color: BRAND.blue, fontWeight: 800, fontSize: 10,
            padding: "3px 8px", borderRadius: 6 }}>
            <Zap size={11} fill={BRAND.blue} /> express
          </span>
        )}
        <button onClick={(e) => { e.stopPropagation(); onAdd(p); }} style={{
          marginTop: "auto", background: BRAND.yellow, color: BRAND.ink, border: "none",
          borderRadius: 10, padding: "9px 0", fontWeight: 800, fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6
        }}>
          <ShoppingCart size={15} /> Add to Cart
        </button>
      </div>
    </div>
  );
}

/* ---------------- Header ---------------- */
function Header({ cartCount, wishCount, onNav, onSearch, query, setQuery, city, setCity }) {
  const [open, setOpen] = useState(false);
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ background: BRAND.yellow }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "12px 14px", display: "flex", alignItems: "center", gap: 14 }}>
          <div onClick={() => onNav("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span className="zn-head" style={{ fontSize: 24, fontWeight: 800, color: BRAND.ink, letterSpacing: -1 }}>zeon</span>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: BRAND.ink, marginTop: 10 }} />
          </div>

          <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
            <Search size={18} color={BRAND.inkSoft} style={{ position: "absolute", left: 12, top: 11 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
              placeholder="Search for products, brands..."
              className="zn-body"
              style={{ width: "100%", border: "none", borderRadius: 10, padding: "10px 12px 10px 38px",
                fontSize: 14, outline: "none" }} />
          </div>

          <button onClick={onSearch} style={{ background: BRAND.ink, color: "#fff", border: "none",
            borderRadius: 10, padding: "10px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>
            Search
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => onNav("wishlist")} style={iconBtn}>
              <Heart size={21} color={BRAND.ink} />
              {wishCount > 0 && <Badge n={wishCount} />}
            </button>
            <button onClick={() => onNav("cart")} style={iconBtn}>
              <ShoppingCart size={21} color={BRAND.ink} />
              {cartCount > 0 && <Badge n={cartCount} />}
            </button>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: `1px solid ${BRAND.line}` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => setOpen(!open)} style={{ ...catLink, fontWeight: 800, color: BRAND.ink }}>
            <Menu size={16} /> Categories <ChevronDown size={14} />
          </button>
          <div className="zn-scroll" style={{ display: "flex", gap: 2, overflowX: "auto", flex: 1 }}>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => onNav("category", c.id)} style={catLink}>{c.name}</button>
            ))}
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 5, color: BRAND.inkSoft, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            <MapPin size={14} color={BRAND.blue} />
            <select value={city} onChange={(e) => setCity(e.target.value)}
              style={{ border: "none", background: "transparent", fontWeight: 700, color: BRAND.ink, fontSize: 12, outline: "none", cursor: "pointer" }}>
              {["Dubai", "Abu Dhabi", "Sharjah", "Ajman"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </span>
        </div>
        {open && (
          <div className="zn-fade" style={{ borderTop: `1px solid ${BRAND.line}`, background: "#fff" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: 14, display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => { onNav("category", c.id); setOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10,
                    border: `1px solid ${BRAND.line}`, background: BRAND.bg, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: BRAND.ink }}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
const iconBtn = { position: "relative", background: "transparent", border: "none", cursor: "pointer", padding: 8 };
const catLink = { display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none",
  padding: "12px 10px", fontSize: 13, fontWeight: 600, color: BRAND.inkSoft, whiteSpace: "nowrap", cursor: "pointer" };
function Badge({ n }) {
  return <span style={{ position: "absolute", top: 2, right: 2, background: BRAND.red, color: "#fff",
    fontSize: 10, fontWeight: 800, minWidth: 17, height: 17, borderRadius: 99, display: "grid",
    placeItems: "center", padding: "0 4px" }}>{n}</span>;
}

/* ---------------- Hero ---------------- */
function Hero({ onShop }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => (x + 1) % HERO.length), 4500); return () => clearInterval(t); }, []);
  const h = HERO[i];
  return (
    <div style={{ maxWidth: 1200, margin: "16px auto 0", padding: "0 14px" }}>
      <div style={{ borderRadius: 20, overflow: "hidden", position: "relative",
        background: `linear-gradient(115deg, ${h.bg[0]}, ${h.bg[1]})`, minHeight: 220 }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 85% 30%, rgba(254,238,0,.22), transparent 50%)" }} />
        <div className="zn-fade" key={i} style={{ position: "relative", padding: "34px 26px", display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ maxWidth: 420 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: BRAND.yellow,
              color: BRAND.ink, fontWeight: 800, fontSize: 11, padding: "4px 10px", borderRadius: 99, letterSpacing: 1 }}>
              <Sparkles size={12} /> LIMITED OFFER
            </span>
            <h1 className="zn-head" style={{ color: "#fff", fontSize: 34, fontWeight: 800, margin: "12px 0 6px", lineHeight: 1.1 }}>{h.title}</h1>
            <p style={{ color: "rgba(255,255,255,.82)", fontSize: 15, margin: "0 0 16px" }}>{h.sub}</p>
            <button onClick={onShop} style={{ background: BRAND.yellow, color: BRAND.ink, border: "none",
              borderRadius: 12, padding: "12px 22px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>{h.cta} →</button>
          </div>
          <span style={{ fontSize: 120, filter: "drop-shadow(0 12px 30px rgba(0,0,0,.4))" }}>{h.emoji}</span>
        </div>
        <div style={{ position: "absolute", bottom: 14, left: 26, display: "flex", gap: 6 }}>
          {HERO.map((_, k) => <span key={k} onClick={() => setI(k)} style={{ width: k === i ? 22 : 8, height: 8,
            borderRadius: 99, background: k === i ? BRAND.yellow : "rgba(255,255,255,.4)", cursor: "pointer", transition: "all .3s" }} />)}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Trust strip ---------------- */
function TrustBar() {
  const items = [
    { icon: <Truck size={20} color={BRAND.blue} />, t: "Free Delivery", s: "On orders over AED 100" },
    { icon: <ShieldCheck size={20} color={BRAND.green} />, t: "100% Authentic", s: "Genuine warranty" },
    { icon: <RotateCcw size={20} color={BRAND.red} />, t: "Easy Returns", s: "15-day return policy" },
    { icon: <CreditCard size={20} color={BRAND.ink} />, t: "Secure Payment", s: "Tabby · Tamara · COD" },
  ];
  return (
    <div style={{ maxWidth: 1200, margin: "16px auto 0", padding: "0 14px" }}>
      <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BRAND.line}`, padding: 14,
        display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
        {items.map((it, k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: BRAND.bg, display: "grid", placeItems: "center" }}>{it.icon}</div>
            <div><div style={{ fontWeight: 800, fontSize: 13, color: BRAND.ink }}>{it.t}</div>
              <div style={{ fontSize: 11, color: BRAND.inkSoft }}>{it.s}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Category chips ---------------- */
function CategoryRow({ onNav }) {
  return (
    <div style={{ maxWidth: 1200, margin: "22px auto 0", padding: "0 14px" }}>
      <h2 className="zn-head" style={sectionTitle}>Shop by Category</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(96px,1fr))", gap: 10, marginTop: 12 }}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => onNav("category", c.id)} className="zn-card" style={{
            background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 16, padding: "14px 6px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", fontSize: 26,
              background: `linear-gradient(135deg, ${c.grad[0]}, ${c.grad[1]})` }}>{c.icon}</div>
            <span style={{ fontSize: 11, fontWeight: 700, color: BRAND.ink, textAlign: "center", lineHeight: 1.2 }}>{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
const sectionTitle = { fontSize: 20, fontWeight: 800, color: BRAND.ink, margin: 0 };

/* ---------------- Flash deals with countdown ---------------- */
function FlashDeals({ products, onOpen, onAdd, onWish, wishlist }) {
  const [t, setT] = useState(7 * 3600 + 42 * 60 + 18);
  useEffect(() => { const id = setInterval(() => setT((x) => (x > 0 ? x - 1 : 0)), 1000); return () => clearInterval(id); }, []);
  const hh = String(Math.floor(t / 3600)).padStart(2, "0");
  const mm = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const ss = String(t % 60).padStart(2, "0");
  const deals = products.filter((p) => off(p) >= 18).slice(0, 8);
  return (
    <div style={{ maxWidth: 1200, margin: "26px auto 0", padding: "0 14px" }}>
      <div style={{ background: "linear-gradient(115deg,#2B2F38,#11141a)", borderRadius: 18, padding: "16px 16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <h2 className="zn-head" style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Zap size={20} fill={BRAND.yellow} color={BRAND.yellow} /> Flash Deals
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "rgba(255,255,255,.7)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Clock size={14} /> Ends in</span>
            {[hh, mm, ss].map((v, k) => (
              <span key={k} style={{ background: BRAND.yellow, color: BRAND.ink, fontWeight: 800, fontSize: 14,
                borderRadius: 8, padding: "5px 9px", fontFamily: "Sora" }}>{v}</span>
            ))}
          </div>
        </div>
        <div className="zn-scroll" style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(170px,1fr)",
          gap: 12, overflowX: "auto", marginTop: 14, paddingBottom: 4 }}>
          {deals.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} onWish={onWish} wished={wishlist.includes(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Grid section ---------------- */
function Grid({ title, products, onOpen, onAdd, onWish, wishlist, onMore }) {
  return (
    <div style={{ maxWidth: 1200, margin: "26px auto 0", padding: "0 14px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 className="zn-head" style={sectionTitle}>{title}</h2>
        {onMore && <button onClick={onMore} style={{ background: "transparent", border: "none", color: BRAND.blue,
          fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>View all <ChevronRight size={15} /></button>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginTop: 14 }}>
        {products.map((p) => (
          <ProductCard key={p.id} p={p} onOpen={onOpen} onAdd={onAdd} onWish={onWish} wished={wishlist.includes(p.id)} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Product detail ---------------- */
function ProductView({ p, onBack, onAdd, onWish, wished, related, onOpen, wishlist }) {
  const [qty, setQty] = useState(1);
  return (
    <div className="zn-fade" style={{ maxWidth: 1200, margin: "0 auto", padding: "14px" }}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={16} /> Back</button>
      <div style={{ background: "#fff", borderRadius: 18, border: `1px solid ${BRAND.line}`, padding: 16,
        display: "grid", gridTemplateColumns: "1fr", gap: 18, marginTop: 12 }} className="zn-detail">
        <div style={{ display: "grid", gap: 18, gridTemplateColumns: "minmax(260px,1fr) 1fr" }}>
          <div>
            <ProductTile p={p} big />
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              {[0, 1, 2].map((k) => (
                <div key={k} style={{ flex: 1, borderRadius: 10, border: `1px solid ${BRAND.line}`,
                  aspectRatio: "1/1", display: "grid", placeItems: "center", fontSize: 26,
                  background: `linear-gradient(135deg,${p.grad[0]},${p.grad[1]})`, opacity: .55 + k * .15 }}>{p.emoji}</div>
              ))}
            </div>
          </div>
          <div>
            <span style={{ fontSize: 12, fontWeight: 800, color: BRAND.blue, letterSpacing: 1 }}>{p.brand.toUpperCase()}</span>
            <h1 className="zn-head" style={{ fontSize: 22, fontWeight: 800, color: BRAND.ink, margin: "6px 0 10px", lineHeight: 1.25 }}>{p.name}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Stars value={p.rating} size={16} />
              <span style={{ fontSize: 13, color: BRAND.inkSoft }}>{p.rating} · {p.reviews.toLocaleString()} ratings</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span className="zn-head" style={{ fontSize: 30, fontWeight: 800, color: BRAND.ink }}>{AED(p.price)}</span>
              {p.oldPrice > p.price && <span style={{ fontSize: 15, color: BRAND.inkSoft, textDecoration: "line-through" }}>{AED(p.oldPrice)}</span>}
              {off(p) > 0 && <span style={{ background: "#FDECEC", color: BRAND.red, fontWeight: 800, fontSize: 12, padding: "3px 8px", borderRadius: 7 }}>Save {off(p)}%</span>}
            </div>
            <p style={{ fontSize: 12, color: BRAND.inkSoft, margin: "0 0 14px" }}>Inclusive of VAT · or 4 payments of {AED(Math.round(p.price / 4))} with Tabby</p>

            <div style={{ background: BRAND.bg, borderRadius: 12, padding: 12, marginBottom: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: BRAND.ink, marginBottom: 8 }}>Key Specs</div>
              <div style={{ display: "grid", gap: 6 }}>
                {p.specs.map((s, k) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: BRAND.ink }}>
                    <Check size={15} color={BRAND.green} /> {s}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: BRAND.ink }}>Quantity</span>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${BRAND.line}`, borderRadius: 10 }}>
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={qBtn}><Minus size={15} /></button>
                <span style={{ width: 36, textAlign: "center", fontWeight: 800 }}>{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} style={qBtn}><Plus size={15} /></button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => onAdd(p, qty)} style={{ flex: 1, background: BRAND.yellow, color: BRAND.ink,
                border: "none", borderRadius: 12, padding: "13px 0", fontWeight: 800, fontSize: 15, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button onClick={() => onWish(p)} style={{ width: 52, background: "#fff", border: `1px solid ${BRAND.line}`,
                borderRadius: 12, display: "grid", placeItems: "center", cursor: "pointer" }}>
                <Heart size={20} fill={wished ? BRAND.red : "none"} color={wished ? BRAND.red : BRAND.inkSoft} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 14, marginTop: 16, flexWrap: "wrap" }}>
              {p.tags.includes("express") && <Pill icon={<Zap size={14} fill={BRAND.blue} color={BRAND.blue} />} text="Express delivery available" />}
              <Pill icon={<ShieldCheck size={14} color={BRAND.green} />} text="1 Year warranty" />
              <Pill icon={<RotateCcw size={14} color={BRAND.red} />} text="15-day returns" />
            </div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <Grid title="You may also like" products={related} onOpen={onOpen} onAdd={(pp) => onAdd(pp, 1)} onWish={onWish} wishlist={wishlist} />
      )}
    </div>
  );
}
const qBtn = { background: "transparent", border: "none", padding: 10, cursor: "pointer", color: BRAND.ink };
const backBtn = { display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${BRAND.line}`,
  borderRadius: 10, padding: "8px 14px", fontWeight: 700, fontSize: 13, color: BRAND.ink, cursor: "pointer" };
function Pill({ icon, text }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: BRAND.ink }}>{icon}{text}</span>;
}

/* ---------------- Category / Search listing ---------------- */
function Listing({ title, products, onBack, onOpen, onAdd, onWish, wishlist }) {
  const [sort, setSort] = useState("pop");
  const [brand, setBrand] = useState("all");
  const brands = ["all", ...Array.from(new Set(products.map((p) => p.brand)))];
  let list = brand === "all" ? products : products.filter((p) => p.brand === brand);
  list = [...list].sort((a, b) =>
    sort === "low" ? a.price - b.price : sort === "high" ? b.price - a.price :
    sort === "rate" ? b.rating - a.rating : b.reviews - a.reviews);
  return (
    <div className="zn-fade" style={{ maxWidth: 1200, margin: "0 auto", padding: 14 }}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={16} /> Back</button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
        <h1 className="zn-head" style={{ fontSize: 22, fontWeight: 800, color: BRAND.ink, margin: 0 }}>
          {title} <span style={{ fontSize: 14, color: BRAND.inkSoft, fontWeight: 600 }}>({list.length})</span></h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Select icon={<Filter size={14} />} value={brand} onChange={setBrand}
            opts={brands.map((b) => ({ v: b, l: b === "all" ? "All Brands" : b }))} />
          <Select icon={<Tag size={14} />} value={sort} onChange={setSort}
            opts={[{ v: "pop", l: "Most Popular" }, { v: "low", l: "Price: Low to High" }, { v: "high", l: "Price: High to Low" }, { v: "rate", l: "Top Rated" }]} />
        </div>
      </div>
      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: BRAND.inkSoft }}>
          <Package size={40} /><p>No products found.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginTop: 16 }}>
          {list.map((p) => <ProductCard key={p.id} p={p} onOpen={onOpen} onAdd={(pp) => onAdd(pp, 1)} onWish={onWish} wished={wishlist.includes(p.id)} />)}
        </div>
      )}
    </div>
  );
}
function Select({ icon, value, onChange, opts }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: `1px solid ${BRAND.line}`,
      borderRadius: 10, padding: "7px 12px", color: BRAND.ink }}>
      {icon}
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ border: "none", background: "transparent",
        fontWeight: 700, fontSize: 13, color: BRAND.ink, outline: "none", cursor: "pointer" }}>
        {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </span>
  );
}

/* ---------------- Cart ---------------- */
function Cart({ items, onBack, onQty, onRemove, onCheckout, onOpen }) {
  const sub = items.reduce((s, it) => s + it.price * it.qty, 0);
  const ship = sub > 100 || sub === 0 ? 0 : 15;
  const total = sub + ship;
  if (items.length === 0) {
    return (
      <Empty icon={<ShoppingCart size={48} color={BRAND.inkSoft} />} title="Your cart is empty"
        sub="Browse our deals and add something you love." onBack={onBack} cta="Continue Shopping" />
    );
  }
  return (
    <div className="zn-fade" style={{ maxWidth: 1100, margin: "0 auto", padding: 14 }}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={16} /> Continue Shopping</button>
      <h1 className="zn-head" style={{ fontSize: 24, fontWeight: 800, color: BRAND.ink, margin: "14px 0" }}>Shopping Cart ({items.length})</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="zn-cart-grid">
        <div style={{ display: "grid", gap: 10 }}>
          {items.map((it) => (
            <div key={it.id} style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 12,
              display: "flex", gap: 12, alignItems: "center" }}>
              <div onClick={() => onOpen(it)} style={{ width: 84, flexShrink: 0, cursor: "pointer" }}><ProductTile p={it} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div onClick={() => onOpen(it)} style={{ fontSize: 13, fontWeight: 700, color: BRAND.ink, cursor: "pointer",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{it.name}</div>
                <div style={{ fontSize: 11, color: BRAND.inkSoft, margin: "2px 0 6px" }}>{it.brand}</div>
                <span className="zn-head" style={{ fontSize: 16, fontWeight: 800, color: BRAND.ink }}>{AED(it.price)}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", border: `1px solid ${BRAND.line}`, borderRadius: 9 }}>
                    <button onClick={() => onQty(it.id, it.qty - 1)} style={qBtn}><Minus size={13} /></button>
                    <span style={{ width: 30, textAlign: "center", fontWeight: 800, fontSize: 13 }}>{it.qty}</span>
                    <button onClick={() => onQty(it.id, it.qty + 1)} style={qBtn}><Plus size={13} /></button>
                  </div>
                  <button onClick={() => onRemove(it.id)} style={{ display: "flex", alignItems: "center", gap: 4,
                    background: "transparent", border: "none", color: BRAND.red, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Summary sub={sub} ship={ship} total={total} cta="Proceed to Checkout" onClick={onCheckout} />
      </div>
    </div>
  );
}
function Summary({ sub, ship, total, cta, onClick }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 16, alignSelf: "start" }}>
      <h3 className="zn-head" style={{ fontSize: 16, fontWeight: 800, color: BRAND.ink, margin: "0 0 12px" }}>Order Summary</h3>
      <Row l="Subtotal" r={AED(sub)} />
      <Row l="Shipping" r={ship === 0 ? "FREE" : AED(ship)} green={ship === 0} />
      <Row l="VAT (incl.)" r="—" />
      <div style={{ height: 1, background: BRAND.line, margin: "10px 0" }} />
      <Row l="Total" r={AED(total)} bold />
      <button onClick={onClick} style={{ width: "100%", background: BRAND.yellow, color: BRAND.ink, border: "none",
        borderRadius: 12, padding: "13px 0", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 14 }}>{cta}</button>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 10, color: BRAND.inkSoft, fontSize: 11 }}>
        <ShieldCheck size={13} color={BRAND.green} /> Secure checkout · Tabby · Tamara · COD
      </div>
    </div>
  );
}
function Row({ l, r, bold, green }) {
  return <div style={{ display: "flex", justifyContent: "space-between", fontSize: bold ? 17 : 13,
    fontWeight: bold ? 800 : 600, color: green ? BRAND.green : BRAND.ink, padding: "4px 0",
    fontFamily: bold ? "Sora" : "inherit" }}><span style={{ color: bold ? BRAND.ink : BRAND.inkSoft }}>{l}</span><span>{r}</span></div>;
}

/* ---------------- Checkout ---------------- */
function Checkout({ items, onBack, onDone, city }) {
  const [step, setStep] = useState(1);
  const [pay, setPay] = useState("card");
  const [f, setF] = useState({ name: "", phone: "", addr: "", area: city, email: "" });
  const sub = items.reduce((s, it) => s + it.price * it.qty, 0);
  const ship = sub > 100 ? 0 : 15;
  const total = sub + ship;
  const valid = f.name && f.phone.length >= 7 && f.addr;
  return (
    <div className="zn-fade" style={{ maxWidth: 900, margin: "0 auto", padding: 14 }}>
      <button onClick={onBack} style={backBtn}><ArrowLeft size={16} /> Back to Cart</button>
      <div style={{ display: "flex", gap: 8, margin: "16px 0", justifyContent: "center" }}>
        {["Delivery", "Payment", "Confirm"].map((s, k) => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 99, display: "grid", placeItems: "center",
              fontWeight: 800, fontSize: 12, background: step >= k + 1 ? BRAND.yellow : BRAND.line, color: BRAND.ink }}>{k + 1}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: step >= k + 1 ? BRAND.ink : BRAND.inkSoft }}>{s}</span>
            {k < 2 && <ChevronRight size={16} color={BRAND.inkSoft} />}
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 16, padding: 18 }}>
        {step === 1 && (
          <div style={{ display: "grid", gap: 12 }}>
            <h3 className="zn-head" style={chkTitle}>Delivery Address</h3>
            <Input label="Full Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} ph="Ahmed Khan" />
            <Input label="Phone Number" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} ph="+971 50 123 4567" />
            <Input label="Email (optional)" value={f.email} onChange={(v) => setF({ ...f, email: v })} ph="you@email.com" />
            <Input label="Address" value={f.addr} onChange={(v) => setF({ ...f, addr: v })} ph="Building, Street, Area" />
            <div>
              <label style={lbl}>Emirate</label>
              <select value={f.area} onChange={(e) => setF({ ...f, area: e.target.value })} style={{ ...inp, cursor: "pointer" }}>
                {["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button disabled={!valid} onClick={() => setStep(2)} style={{ ...primaryBtn, opacity: valid ? 1 : .5, cursor: valid ? "pointer" : "not-allowed" }}>Continue to Payment</button>
          </div>
        )}
        {step === 2 && (
          <div style={{ display: "grid", gap: 12 }}>
            <h3 className="zn-head" style={chkTitle}>Payment Method</h3>
            {[
              { id: "card", t: "Credit / Debit Card", s: "Visa, Mastercard", icon: "💳" },
              { id: "tabby", t: "Tabby", s: "Pay in 4 interest-free payments", icon: "🟢" },
              { id: "tamara", t: "Tamara", s: "Split in 3, no interest", icon: "🟣" },
              { id: "cod", t: "Cash on Delivery", s: "Pay when you receive", icon: "💵" },
            ].map((m) => (
              <button key={m.id} onClick={() => setPay(m.id)} style={{ display: "flex", alignItems: "center", gap: 12,
                padding: 14, borderRadius: 12, cursor: "pointer", textAlign: "left",
                border: `2px solid ${pay === m.id ? BRAND.yellowDark : BRAND.line}`, background: pay === m.id ? "#FFFDF0" : "#fff" }}>
                <span style={{ fontSize: 22 }}>{m.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14, color: BRAND.ink }}>{m.t}</div>
                  <div style={{ fontSize: 12, color: BRAND.inkSoft }}>{m.s}</div></div>
                <span style={{ width: 20, height: 20, borderRadius: 99, border: `2px solid ${pay === m.id ? BRAND.yellowDark : BRAND.line}`,
                  display: "grid", placeItems: "center" }}>{pay === m.id && <span style={{ width: 10, height: 10, borderRadius: 99, background: BRAND.yellowDark }} />}</span>
              </button>
            ))}
            <button onClick={() => setStep(3)} style={primaryBtn}>Review Order</button>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: "grid", gap: 12 }}>
            <h3 className="zn-head" style={chkTitle}>Confirm Order</h3>
            <div style={{ background: BRAND.bg, borderRadius: 12, padding: 14, fontSize: 13, color: BRAND.ink, lineHeight: 1.6 }}>
              <b>{f.name}</b><br />{f.phone}<br />{f.addr}, {f.area}<br />
              <span style={{ color: BRAND.inkSoft }}>Payment: {pay.toUpperCase()}</span>
            </div>
            <div style={{ display: "grid", gap: 6 }}>
              {items.map((it) => (
                <div key={it.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: BRAND.ink }}>
                  <span>{it.qty} × {it.name.slice(0, 28)}{it.name.length > 28 ? "…" : ""}</span>
                  <span style={{ fontWeight: 700 }}>{AED(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: BRAND.line }} />
            <Row l="Shipping" r={ship === 0 ? "FREE" : AED(ship)} green={ship === 0} />
            <Row l="Total" r={AED(total)} bold />
            <button onClick={() => onDone({ items, total, customer: f, payment: pay, city: f.area })} style={{ ...primaryBtn, background: BRAND.green, color: "#fff" }}>
              <Check size={18} style={{ marginRight: 6, verticalAlign: -3 }} /> Place Order · {AED(total)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
const chkTitle = { fontSize: 18, fontWeight: 800, color: BRAND.ink, margin: 0 };
const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: BRAND.ink, marginBottom: 5 };
const inp = { width: "100%", border: `1px solid ${BRAND.line}`, borderRadius: 10, padding: "11px 12px", fontSize: 14, outline: "none", fontFamily: "Plus Jakarta Sans" };
const primaryBtn = { background: BRAND.yellow, color: BRAND.ink, border: "none", borderRadius: 12, padding: "13px 0", fontWeight: 800, fontSize: 15, cursor: "pointer", marginTop: 6 };
function Input({ label, value, onChange, ph }) {
  return <div><label style={lbl}>{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} style={inp} /></div>;
}

/* ---------------- Order success ---------------- */
function Success({ total, onHome }) {
  return (
    <div className="zn-fade" style={{ maxWidth: 520, margin: "40px auto", padding: 14, textAlign: "center" }}>
      <div className="zn-pop" style={{ width: 86, height: 86, borderRadius: 99, background: "#E7F8EE", margin: "0 auto",
        display: "grid", placeItems: "center" }}><Check size={44} color={BRAND.green} /></div>
      <h1 className="zn-head" style={{ fontSize: 26, fontWeight: 800, color: BRAND.ink, margin: "18px 0 6px" }}>Order Placed! 🎉</h1>
      <p style={{ color: BRAND.inkSoft, fontSize: 15 }}>Your order of <b style={{ color: BRAND.ink }}>{AED(total)}</b> is confirmed.<br />Order ID: <b>ZN{Math.floor(Math.random() * 9e5 + 1e5)}</b></p>
      <div style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 16, margin: "18px 0",
        display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
        <Truck size={28} color={BRAND.blue} />
        <div><div style={{ fontWeight: 800, fontSize: 14, color: BRAND.ink }}>Express Delivery</div>
          <div style={{ fontSize: 12, color: BRAND.inkSoft }}>Arriving tomorrow before 10 PM</div></div>
      </div>
      <button onClick={onHome} style={{ ...primaryBtn, width: "100%" }}>Back to Home</button>
    </div>
  );
}
function Empty({ icon, title, sub, onBack, cta }) {
  return (
    <div className="zn-fade" style={{ maxWidth: 520, margin: "40px auto", padding: 14, textAlign: "center" }}>
      <div style={{ width: 90, height: 90, borderRadius: 99, background: BRAND.bg, margin: "0 auto", display: "grid", placeItems: "center" }}>{icon}</div>
      <h1 className="zn-head" style={{ fontSize: 22, fontWeight: 800, color: BRAND.ink, margin: "18px 0 6px" }}>{title}</h1>
      <p style={{ color: BRAND.inkSoft, fontSize: 14, margin: "0 0 18px" }}>{sub}</p>
      <button onClick={onBack} style={{ ...primaryBtn, width: 240 }}>{cta}</button>
    </div>
  );
}

/* ---------------- Footer ---------------- */
function Footer({ onNav, onAdmin }) {
  const cols = [
    { h: "Shop", links: CATEGORIES.slice(0, 5).map((c) => c.name) },
    { h: "Customer Service", links: ["Track Order", "Returns & Refunds", "Shipping Info", "Contact Us", "FAQ"] },
    { h: "About Zeon", links: ["About Us", "Careers", "Sell on Zeon", "Press", "Terms & Conditions"] },
  ];
  return (
    <footer style={{ background: BRAND.ink, color: "#fff", marginTop: 40 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 14px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 24 }}>
          <div>
            <div className="zn-head" style={{ fontSize: 26, fontWeight: 800, color: BRAND.yellow }}>zeon•</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.6)", marginTop: 8, lineHeight: 1.6 }}>UAE's destination for authentic electronics. Dubai · Abu Dhabi · Sharjah.</p>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {[Facebook, Instagram, Twitter, Youtube].map((I, k) => (
                <span key={k} style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.1)", display: "grid", placeItems: "center", cursor: "pointer" }}><I size={16} /></span>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <div className="zn-head" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{c.h}</div>
              {c.links.map((l) => <div key={l} onClick={() => onNav("home")} style={{ fontSize: 13, color: "rgba(255,255,255,.6)", padding: "5px 0", cursor: "pointer" }}>{l}</div>)}
            </div>
          ))}
          <div>
            <div className="zn-head" style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Contact</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)", display: "grid", gap: 8 }}>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Phone size={14} /> 800-ZEON (9366)</span>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><Mail size={14} /> care@zeon.ae</span>
              <span style={{ display: "flex", gap: 8, alignItems: "center" }}><MapPin size={14} /> Dubai, UAE</span>
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", marginTop: 24, paddingTop: 16, display: "flex",
          justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12, color: "rgba(255,255,255,.5)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
            © 2026 Zeon Electronics LLC. All rights reserved.
            <button onClick={onAdmin} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,.08)",
              border: "1px solid rgba(255,255,255,.15)", color: "rgba(255,255,255,.7)", borderRadius: 8,
              padding: "5px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              <Lock size={12} /> Admin Panel
            </button>
          </span>
          <span style={{ display: "flex", gap: 8 }}>💳 Visa · Mastercard · Tabby · Tamara · COD</span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   ADMIN — PIN gate + Dashboard (Products CRUD + Orders)
   ============================================================ */
function AdminPin({ onSuccess, onExit }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  const submit = () => {
    if (pin === ADMIN_PIN) onSuccess();
    else { setErr(true); setPin(""); }
  };
  return (
    <div className="zn-fade" style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 14 }}>
      <div style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 18, padding: 28, width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: BRAND.yellow, margin: "0 auto 16px", display: "grid", placeItems: "center" }}>
          <Lock size={28} color={BRAND.ink} />
        </div>
        <h2 className="zn-head" style={{ fontSize: 22, fontWeight: 800, color: BRAND.ink, margin: "0 0 4px" }}>Admin Access</h2>
        <p style={{ fontSize: 13, color: BRAND.inkSoft, margin: "0 0 18px" }}>Enter your admin PIN to continue.</p>
        <input
          type="password" value={pin} autoFocus
          onChange={(e) => { setPin(e.target.value); setErr(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          placeholder="••••••"
          style={{ ...inp, textAlign: "center", letterSpacing: 6, fontSize: 18, fontWeight: 800,
            borderColor: err ? BRAND.red : BRAND.line }} />
        {err && <div style={{ color: BRAND.red, fontSize: 12, fontWeight: 700, marginTop: 8 }}>Incorrect PIN. Try again.</div>}
        <button onClick={submit} style={{ ...primaryBtn, width: "100%", marginTop: 16 }}>Unlock Dashboard</button>
        <button onClick={onExit} style={{ background: "transparent", border: "none", color: BRAND.inkSoft, fontWeight: 700, fontSize: 13, cursor: "pointer", marginTop: 12 }}>← Back to store</button>
      </div>
    </div>
  );
}

const blankProduct = () => ({ name: "", brand: "", category: "mobiles", price: "", oldPrice: "", image: "", express: false, bestseller: false });

function ProductForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial);
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const valid = f.name.trim() && Number(f.price) > 0;
  const save = () => {
    if (!valid) return;
    const cat = CATEGORIES.find((c) => c.id === f.category);
    const tags = [];
    if (f.express) tags.push("express");
    if (f.bestseller) tags.push("bestseller");
    onSave({
      name: f.name.trim(),
      brand: f.brand.trim() || "Generic",
      category: f.category,
      price: Number(f.price),
      oldPrice: Number(f.oldPrice) > Number(f.price) ? Number(f.oldPrice) : Number(f.price),
      image: f.image.trim(),
      emoji: cat ? cat.icon : "📦",
      grad: cat ? cat.grad : ["#3a3f4a", "#181b22"],
      rating: initial.rating != null ? initial.rating : 4.6,
      reviews: initial.reviews != null ? initial.reviews : 0,
      specs: Array.isArray(initial.specs) ? initial.specs : [],
      tags,
    });
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,22,28,.55)", zIndex: 200, display: "grid", placeItems: "center", padding: 14 }}>
      <div className="zn-pop" style={{ background: "#fff", borderRadius: 18, padding: 20, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 className="zn-head" style={{ fontSize: 18, fontWeight: 800, color: BRAND.ink, margin: 0 }}>{initial.id ? "Edit Product" : "Add Product"}</h3>
          <button onClick={onCancel} style={{ background: BRAND.bg, border: "none", borderRadius: 9, padding: 7, cursor: "pointer" }}><X size={16} /></button>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          <Input label="Title *" value={f.name} onChange={(v) => set("name", v)} ph="e.g. Galaxy S24 Ultra 256GB" />
          <Input label="Brand" value={f.brand} onChange={(v) => set("brand", v)} ph="Samsung" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Price (AED) *" value={f.price} onChange={(v) => set("price", v.replace(/[^0-9.]/g, ""))} ph="3899" />
            <Input label="Old Price" value={f.oldPrice} onChange={(v) => set("oldPrice", v.replace(/[^0-9.]/g, ""))} ph="5199" />
          </div>
          <div>
            <label style={lbl}>Category *</label>
            <select value={f.category} onChange={(e) => set("category", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Input label="Image URL" value={f.image} onChange={(v) => set("image", v)} ph="https://...jpg (optional)" />
          {f.image && (
            <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${BRAND.line}`, height: 110 }}>
              <img src={f.image} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ display: "flex", gap: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: BRAND.ink, cursor: "pointer" }}>
              <input type="checkbox" checked={f.express} onChange={(e) => set("express", e.target.checked)} /> Express
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: BRAND.ink, cursor: "pointer" }}>
              <input type="checkbox" checked={f.bestseller} onChange={(e) => set("bestseller", e.target.checked)} /> Best Seller
            </label>
          </div>
          <button onClick={save} disabled={!valid} style={{ ...primaryBtn, opacity: valid ? 1 : .5, cursor: valid ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Save size={17} /> {initial.id ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ products, orders, ready, onAdd, onUpdate, onDelete, onSeed, onOrderStatus, onExit }) {
  const [tab, setTab] = useState("dashboard");
  const [editing, setEditing] = useState(null); // object or null
  const [busy, setBusy] = useState("");

  const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const stats = [
    { icon: <Boxes size={20} color={BRAND.blue} />, label: "Products", value: products.length },
    { icon: <ClipboardList size={20} color={BRAND.green} />, label: "Orders", value: orders.length },
    { icon: <DollarSign size={20} color={BRAND.yellowDark} />, label: "Revenue", value: AED(revenue) },
  ];

  const handleSave = async (data) => {
    setBusy("Saving...");
    if (editing && editing.id) await onUpdate(editing.id, data);
    else await onAdd(data);
    setBusy(""); setEditing(null);
  };
  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This removes it from the live store.`)) return;
    await onDelete(p.id);
  };
  const handleSeed = async () => {
    if (!window.confirm("Upload the 24 sample products to Firestore?")) return;
    setBusy("Seeding catalogue..."); await onSeed(); setBusy("");
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { id: "products", label: "Products", icon: <Boxes size={16} /> },
    { id: "orders", label: "Orders", icon: <ClipboardList size={16} /> },
  ];

  return (
    <div className="zn-fade" style={{ maxWidth: 1100, margin: "0 auto", padding: 14 }}>
      {/* Top bar */}
      <div style={{ background: BRAND.ink, borderRadius: 16, padding: "14px 16px", display: "flex",
        alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="zn-head" style={{ color: BRAND.yellow, fontSize: 20, fontWeight: 800 }}>zeon•</span>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>Admin Dashboard</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700,
            color: ready ? "#7CF0AE" : "#FFD86B", background: "rgba(255,255,255,.08)", padding: "5px 10px", borderRadius: 8 }}>
            <Database size={13} /> {ready ? "Firestore connected" : "Demo mode"}
          </span>
          <button onClick={onExit} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: BRAND.yellow,
            color: BRAND.ink, border: "none", borderRadius: 9, padding: "7px 12px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            <LogOut size={15} /> Exit
          </button>
        </div>
      </div>

      {!ready && (
        <div style={{ background: "#FFF8E1", border: "1px solid #F4D67A", borderRadius: 12, padding: 12, marginTop: 12,
          fontSize: 13, color: "#7A5C00", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <UploadCloud size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Running in demo mode (changes stay in memory). Add your Firebase keys at the top of the file, then use <b>Seed Catalogue</b> in the Products tab to push data live.</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 7,
            padding: "9px 16px", borderRadius: 10, fontWeight: 800, fontSize: 13, cursor: "pointer",
            border: `1px solid ${tab === t.id ? BRAND.ink : BRAND.line}`,
            background: tab === t.id ? BRAND.ink : "#fff", color: tab === t.id ? "#fff" : BRAND.ink }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {busy && <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: BRAND.blue }}>{busy}</div>}

      {/* Dashboard */}
      {tab === "dashboard" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 16 }}>
          {stats.map((s, k) => (
            <div key={k} style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 16, padding: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: BRAND.bg, display: "grid", placeItems: "center" }}>{s.icon}</div>
              <div className="zn-head" style={{ fontSize: 26, fontWeight: 800, color: BRAND.ink, marginTop: 12 }}>{s.value}</div>
              <div style={{ fontSize: 13, color: BRAND.inkSoft, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      {tab === "products" && (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
            <h3 className="zn-head" style={{ fontSize: 18, fontWeight: 800, color: BRAND.ink, margin: 0 }}>Products ({products.length})</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleSeed} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff",
                border: `1px solid ${BRAND.line}`, color: BRAND.ink, borderRadius: 10, padding: "9px 14px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                <UploadCloud size={15} /> Seed Catalogue
              </button>
              <button onClick={() => setEditing(blankProduct())} style={{ display: "flex", alignItems: "center", gap: 6, background: BRAND.yellow,
                border: "none", color: BRAND.ink, borderRadius: 10, padding: "9px 14px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {products.length === 0 && <div style={{ color: BRAND.inkSoft, fontSize: 14, padding: 20, textAlign: "center" }}>No products yet. Add one or seed the catalogue.</div>}
            {products.map((p) => (
              <div key={p.id} style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 12, padding: 10,
                display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 56, height: 56, flexShrink: 0 }}><ProductTile p={p} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: BRAND.inkSoft }}>{p.brand} · {CATEGORIES.find((c) => c.id === p.category)?.name || p.category}</div>
                  <div className="zn-head" style={{ fontSize: 14, fontWeight: 800, color: BRAND.ink, marginTop: 2 }}>{AED(p.price)}</div>
                </div>
                <button onClick={() => setEditing(p)} style={adminIcon(BRAND.blue)}><Edit3 size={15} /></button>
                <button onClick={() => handleDelete(p)} style={adminIcon(BRAND.red)}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      {tab === "orders" && (
        <div style={{ marginTop: 16 }}>
          <h3 className="zn-head" style={{ fontSize: 18, fontWeight: 800, color: BRAND.ink, margin: "0 0 12px" }}>Orders ({orders.length})</h3>
          {orders.length === 0 ? (
            <div style={{ color: BRAND.inkSoft, fontSize: 14, padding: 30, textAlign: "center", background: "#fff", borderRadius: 14, border: `1px solid ${BRAND.line}` }}>
              <ShoppingBag size={34} color={BRAND.inkSoft} /><div style={{ marginTop: 8 }}>No orders yet.</div>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {orders.map((o) => (
                <div key={o.id} style={{ background: "#fff", border: `1px solid ${BRAND.line}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: BRAND.ink }}>{o.customer?.name || "Guest"} · <span style={{ color: BRAND.inkSoft, fontWeight: 600 }}>{o.id.toString().slice(0, 8)}</span></div>
                      <div style={{ fontSize: 12, color: BRAND.inkSoft }}>{o.customer?.phone} · {o.customer?.addr}, {o.city}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="zn-head" style={{ fontSize: 17, fontWeight: 800, color: BRAND.ink }}>{AED(Number(o.total) || 0)}</div>
                      <div style={{ fontSize: 11, color: BRAND.inkSoft, textTransform: "uppercase", fontWeight: 700 }}>{o.payment}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: BRAND.ink, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${BRAND.line}` }}>
                    {(o.items || []).map((it, i) => (
                      <span key={i}>{it.qty}× {it.name}{i < (o.items.length - 1) ? " · " : ""}</span>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: BRAND.inkSoft }}>Status</span>
                    <select value={o.status || "Pending"} onChange={(e) => onOrderStatus(o.id, e.target.value)}
                      style={{ border: `1px solid ${BRAND.line}`, borderRadius: 8, padding: "6px 10px", fontWeight: 700, fontSize: 12, color: BRAND.ink, cursor: "pointer" }}>
                      {["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {editing && <ProductForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} />}
    </div>
  );
}
const adminIcon = (color) => ({ width: 36, height: 36, flexShrink: 0, borderRadius: 9, border: `1px solid ${BRAND.line}`,
  background: "#fff", color, display: "grid", placeItems: "center", cursor: "pointer" });

/* ============================================================
   APP
   ============================================================ */
export default function App() {
  const [view, setView] = useState("home");
  const [catId, setCatId] = useState(null);
  const [active, setActive] = useState(null);
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [city, setCity] = useState("Dubai");
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [lastTotal, setLastTotal] = useState(0);
  const [toast, setToast] = useState("");
  const [products, setProducts] = useState(PRODUCTS);
  const [orders, setOrders] = useState([]);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const topRef = useRef(null);

  /* ---- Real-time Firestore subscriptions (products + orders) ---- */
  useEffect(() => {
    if (!FIREBASE_READY || !db) return; // demo mode: keep seed products in memory
    const unsubP = onSnapshot(collection(db, "products"), (snap) => {
      if (snap.empty) { setProducts([]); return; }
      setProducts(snap.docs.map((d) => normalizeProduct(d.id, d.data())));
    }, (e) => console.error("products snapshot:", e));

    let unsubO = () => {};
    try {
      unsubO = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }, (e) => console.error("orders snapshot:", e));
    } catch (e) { console.error(e); }

    return () => { unsubP(); unsubO(); };
  }, []);

  /* ---- CRUD (writes to Firestore if connected, else in-memory) ---- */
  const addProduct = async (data) => {
    if (FIREBASE_READY && db) {
      await addDoc(collection(db, "products"), data);
    } else {
      setProducts((p) => [...p, { ...normalizeProduct("local_" + Date.now(), data) }]);
    }
    setToast("Product added");
  };
  const updateProduct = async (id, data) => {
    if (FIREBASE_READY && db) {
      await updateDoc(doc(db, "products", id), data);
    } else {
      setProducts((p) => p.map((it) => (it.id === id ? normalizeProduct(id, { ...it, ...data }) : it)));
    }
    setToast("Product updated");
  };
  const deleteProduct = async (id) => {
    if (FIREBASE_READY && db) {
      await deleteDoc(doc(db, "products", id));
    } else {
      setProducts((p) => p.filter((it) => it.id !== id));
    }
    setToast("Product deleted");
  };
  const seedCatalogue = async () => {
    if (FIREBASE_READY && db) {
      for (const p of PRODUCTS) {
        const { id, ...rest } = p;
        await setDoc(doc(db, "products", String(id)), rest);
      }
    } else {
      setProducts(PRODUCTS);
    }
    setToast("Catalogue seeded");
  };
  const setOrderStatus = async (id, status) => {
    if (FIREBASE_READY && db) {
      await updateDoc(doc(db, "orders", id), { status });
    } else {
      setOrders((o) => o.map((it) => (it.id === id ? { ...it, status } : it)));
    }
  };
  const placeOrder = async (order) => {
    const record = {
      items: order.items.map((it) => ({ id: it.id, name: it.name, price: it.price, qty: it.qty })),
      total: order.total,
      customer: order.customer,
      payment: order.payment,
      city: order.city,
      status: "Pending",
    };
    try {
      if (FIREBASE_READY && db) {
        await addDoc(collection(db, "orders"), { ...record, createdAt: serverTimestamp() });
      } else {
        setOrders((o) => [{ id: "local_" + Date.now(), ...record, createdAt: Date.now() }, ...o]);
      }
    } catch (e) { console.error("order save failed:", e); }
    setLastTotal(order.total);
    setCart([]);
    setView("success");
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [view, active, catId]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 1800); return () => clearTimeout(t); }, [toast]);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);

  const nav = (v, id) => { setView(v); if (id) setCatId(id); };
  const openProduct = (p) => { setActive(p); setView("product"); };
  const addToCart = (p, qty = 1) => {
    setCart((c) => {
      const ex = c.find((it) => it.id === p.id);
      if (ex) return c.map((it) => it.id === p.id ? { ...it, qty: it.qty + qty } : it);
      return [...c, { ...p, qty }];
    });
    setToast(`Added to cart`);
  };
  const setQty = (id, q) => { if (q < 1) return setCart((c) => c.filter((it) => it.id !== id)); setCart((c) => c.map((it) => it.id === id ? { ...it, qty: q } : it)); };
  const removeItem = (id) => setCart((c) => c.filter((it) => it.id !== id));
  const toggleWish = (p) => { setWishlist((w) => w.includes(p.id) ? w.filter((x) => x !== p.id) : [...w, p.id]); };
  const runSearch = () => { setSearched(query); setView("search"); };

  const searchResults = useMemo(() => {
    const q = searched.toLowerCase().trim();
    if (!q) return [];
    return products.filter((p) => (p.name + " " + p.brand + " " + p.category).toLowerCase().includes(q));
  }, [searched, products]);

  const catProducts = products.filter((p) => p.category === catId);
  const catName = CATEGORIES.find((c) => c.id === catId)?.name || "Products";
  const related = active ? products.filter((p) => p.category === active.category && p.id !== active.id).slice(0, 5) : [];
  const wishItems = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="zn-body" ref={topRef} style={{ background: BRAND.bg, minHeight: "100vh", color: BRAND.ink }}>
      <style>{fontInject}</style>
      <style>{`
        @media(max-width:760px){ .zn-detail > div:first-child{ grid-template-columns:1fr !important } }
        @media(min-width:761px){ .zn-cart-grid{ grid-template-columns: 1fr 320px !important } }
      `}</style>

      <Header cartCount={cartCount} wishCount={wishlist.length} onNav={nav} onSearch={runSearch}
        query={query} setQuery={setQuery} city={city} setCity={setCity} />

      {view === "home" && (
        <>
          <Hero onShop={() => nav("category", "mobiles")} />
          <TrustBar />
          <CategoryRow onNav={nav} />
          <FlashDeals products={products} onOpen={openProduct} onAdd={addToCart} onWish={toggleWish} wishlist={wishlist} />
          <Grid title="Best Sellers" products={products.filter((p) => p.tags.includes("bestseller"))}
            onOpen={openProduct} onAdd={addToCart} onWish={toggleWish} wishlist={wishlist} />
          <Grid title="Smartphones" products={products.filter((p) => p.category === "mobiles")}
            onOpen={openProduct} onAdd={addToCart} onWish={toggleWish} wishlist={wishlist} onMore={() => nav("category", "mobiles")} />
          <Grid title="Laptops & Computing" products={products.filter((p) => p.category === "laptops")}
            onOpen={openProduct} onAdd={addToCart} onWish={toggleWish} wishlist={wishlist} onMore={() => nav("category", "laptops")} />
          <Grid title="Audio & Headphones" products={products.filter((p) => p.category === "audio")}
            onOpen={openProduct} onAdd={addToCart} onWish={toggleWish} wishlist={wishlist} onMore={() => nav("category", "audio")} />
        </>
      )}

      {view === "category" && (
        <Listing title={catName} products={catProducts} onBack={() => nav("home")} onOpen={openProduct}
          onAdd={addToCart} onWish={toggleWish} wishlist={wishlist} />
      )}

      {view === "search" && (
        <Listing title={`Results for "${searched}"`} products={searchResults} onBack={() => nav("home")}
          onOpen={openProduct} onAdd={addToCart} onWish={toggleWish} wishlist={wishlist} />
      )}

      {view === "product" && active && (
        <ProductView p={active} onBack={() => nav("home")} onAdd={addToCart} onWish={toggleWish}
          wished={wishlist.includes(active.id)} related={related} onOpen={openProduct} wishlist={wishlist} />
      )}

      {view === "wishlist" && (
        wishItems.length === 0
          ? <Empty icon={<Heart size={46} color={BRAND.inkSoft} />} title="Your wishlist is empty"
              sub="Tap the heart on any product to save it here." onBack={() => nav("home")} cta="Discover Products" />
          : <Listing title="My Wishlist" products={wishItems} onBack={() => nav("home")} onOpen={openProduct}
              onAdd={addToCart} onWish={toggleWish} wishlist={wishlist} />
      )}

      {view === "cart" && (
        <Cart items={cart} onBack={() => nav("home")} onQty={setQty} onRemove={removeItem}
          onCheckout={() => setView("checkout")} onOpen={openProduct} />
      )}

      {view === "checkout" && (
        <Checkout items={cart} city={city} onBack={() => setView("cart")} onDone={placeOrder} />
      )}

      {view === "success" && <Success total={lastTotal} onHome={() => nav("home")} />}

      {view === "admin-pin" && (
        <AdminPin onSuccess={() => { setAdminAuthed(true); setView("admin"); }} onExit={() => nav("home")} />
      )}

      {view === "admin" && adminAuthed && (
        <AdminPanel products={products} orders={orders} ready={!!(FIREBASE_READY && db)}
          onAdd={addProduct} onUpdate={updateProduct} onDelete={deleteProduct} onSeed={seedCatalogue}
          onOrderStatus={setOrderStatus} onExit={() => nav("home")} />
      )}

      <Footer onNav={nav} onAdmin={() => setView(adminAuthed ? "admin" : "admin-pin")} />

      {toast && (
        <div className="zn-pop" style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)",
          background: BRAND.ink, color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 700, fontSize: 14,
          display: "flex", alignItems: "center", gap: 8, zIndex: 100, boxShadow: "0 10px 30px rgba(0,0,0,.3)" }}>
          <Check size={18} color={BRAND.yellow} /> {toast}
        </div>
      )}
    </div>
  );
}
