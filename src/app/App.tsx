import { useState, useEffect, useRef } from "react";
import {
  ShoppingCart, Plus, Minus, X, ChevronRight, Star, Flame,
  CreditCard, Clock, CheckCircle, Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Theme constants ───────────────────────────────────────────────────────────

const T = {
  bg: "#FFF8F0",
  card: "#FFFFFF",
  fg: "#2C1A0E",
  muted: "#7B5E4A",
  border: "rgba(212,80,26,0.15)",
  inputBg: "#F5EDE4",
  primary: "#D4501A",
  primaryGrad: "linear-gradient(135deg, #D4501A, #A83B12)",
  gold: "#E8960A",
  headerBg: "rgba(255,248,240,0.94)",
};

// ─── Data ──────────────────────────────────────────────────────────────────────

const MENU = [
  {
    id: 1, name: "Birria Tacos", subtitle: "Slow-braised beef consommé",
    description: "12-hour braised beef cheeks in guajillo-ancho chile broth, served on handmade corn tortillas with diced white onion, fresh cilantro, and a side of rich consommé for dipping.",
    price: 16.5, tag: "Chef's Pick", spice: 2,
    image: "https://images.unsplash.com/photo-1700625916627-16ad4fb0553c?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 2, name: "Red Enchiladas", subtitle: "House red chile sauce",
    description: "Three hand-rolled corn tortillas stuffed with shredded chicken and Oaxacan cheese, smothered in our house-made guajillo-pasilla sauce and topped with crema and cotija.",
    price: 14.0, tag: "Classic", spice: 1,
    image: "https://images.unsplash.com/photo-1786052599180-aea3127970b6?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 3, name: "Tamales de Rajas", subtitle: "Poblano & cheese",
    description: "Steamed masa dough filled with roasted poblano strips and Chihuahua cheese, wrapped in corn husks and finished with a light tomatillo salsa verde.",
    price: 12.0, tag: "Vegetarian", spice: 0,
    image: "https://images.unsplash.com/photo-1599334521854-ee2c9e535f6b?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 4, name: "Guacamole & Totopos", subtitle: "Table-side preparation",
    description: "Stone-ground molcajete guacamole made fresh to order with Hass avocados, serrano chile, white onion, lime, and cilantro. Served with house-fried totopos.",
    price: 11.0, tag: "Shareable", spice: 1,
    image: "https://images.unsplash.com/photo-1661182260393-a3918d4e8571?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 5, name: "Street Tacos Al Pastor", subtitle: "Achiote-marinated pork",
    description: "Thin-sliced pork marinated in achiote and dried chiles, cooked on a vertical spit with pineapple. Served two per order on small corn tortillas with pico de gallo.",
    price: 13.5, tag: "Fan Favorite", spice: 2,
    image: "https://images.unsplash.com/photo-1698854633001-39d4e6806316?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 6, name: "Churros con Cajeta", subtitle: "Goat milk caramel",
    description: "Crispy fried dough piped in a star shape, rolled in cinnamon sugar, served alongside a warm pot of house-made cajeta — a rich, slow-cooked goat milk caramel.",
    price: 9.0, tag: "Dessert", spice: 0,
    image: "https://images.unsplash.com/photo-1694495275309-269e3ea6f21e?w=800&h=600&fit=crop&auto=format",
  },
];

const LIFESTYLE = [
  { id: 1, url: "https://images.unsplash.com/photo-1653084019129-1f2303bb5bc0?w=1200&h=800&fit=crop&auto=format", caption: "Where every evening is a fiesta" },
  { id: 2, url: "https://images.unsplash.com/photo-1779333203369-29b1a4892c0d?w=1200&h=800&fit=crop&auto=format", caption: "Neon nights & fresh bites" },
  { id: 3, url: "https://images.unsplash.com/photo-1700625914939-30bf5479e3bc?w=1200&h=800&fit=crop&auto=format", caption: "Family recipes, modern table" },
  { id: 4, url: "https://images.unsplash.com/photo-1693193433392-da83457dff20?w=1200&h=800&fit=crop&auto=format", caption: "Handmade tortillas, every day" },
];

// ─── Types ──────────────────────────────────────────────────────────────────────

interface CartItem { id: number; name: string; price: number; quantity: number; image: string; }
interface OrderDetails { number: string; waitMinutes: number; name: string; items: CartItem[]; total: number; }

// ─── Helpers ───────────────────────────────────────────────────────────────────

const fmtCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const fmtExpiry = (v: string) => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
const genOrderNum = () => "GC-" + Math.random().toString(36).slice(2, 8).toUpperCase();

// ─── Tag Badge ─────────────────────────────────────────────────────────────────

function TagBadge({ tag }: { tag: string }) {
  const styles: Record<string, { background: string; color: string }> = {
    "Chef's Pick": { background: "#D4501A", color: "#fff" },
    Classic:       { background: "#2A3D2B", color: "#C8E6C9" },
    Vegetarian:    { background: "#2A3D2B", color: "#C8E6C9" },
    Shareable:     { background: "rgba(232,150,10,0.15)", color: "#B8720A" },
    "Fan Favorite":{ background: "#D4501A", color: "#fff" },
    Dessert:       { background: "rgba(44,26,14,0.08)", color: "#7B5E4A" },
  };
  const s = styles[tag] ?? { background: "rgba(44,26,14,0.1)", color: "#7B5E4A" };
  return (
    <span className="text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full" style={s}>
      {tag}
    </span>
  );
}

// ─── Spice indicator ───────────────────────────────────────────────────────────

function SpiceLevel({ level }: { level: number }) {
  return (
    <span className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <Flame key={i} size={11} fill={i < level ? "#D4501A" : "transparent"} className={i < level ? "text-[#D4501A]" : "text-black/20"} />
      ))}
    </span>
  );
}

// ─── Input field ───────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = "text", maxLength, error }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; maxLength?: number; error?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold tracking-wider uppercase" style={{ color: T.muted }}>{label}</label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength}
        className="w-full px-4 py-2.5 text-sm outline-none transition-all rounded-[20px]"
        style={{
          background: T.inputBg,
          border: `1.5px solid ${error ? "#C62828" : T.border}`,
          color: T.fg,
        }}
      />
      {error && <p className="text-[#C62828] text-xs">{error}</p>}
    </div>
  );
}

// ─── Menu Card ─────────────────────────────────────────────────────────────────

function MenuCard({ item, qty, onAdd, onRemove }: {
  item: (typeof MENU)[0]; qty: number; onAdd: () => void; onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl transition-shadow duration-300"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        boxShadow: hovered ? "0 8px 32px rgba(212,80,26,0.10)" : "0 1px 4px rgba(44,26,14,0.06)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden" style={{ aspectRatio: "4/3", background: T.inputBg }}>
        <img
          src={item.image} alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3"><TagBadge tag={item.tag} /></div>
        <div className="absolute top-3 right-3"><SpiceLevel level={item.spice} /></div>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <h3 className="font-semibold leading-tight" style={{ fontSize: "1.1rem", color: T.fg }}>{item.name}</h3>
          <p className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: T.muted }}>{item.subtitle}</p>
        </div>
        <p className="text-sm leading-relaxed flex-1" style={{ color: T.muted }}>{item.description}</p>
        <div className="flex items-center justify-between pt-2 mt-1" style={{ borderTop: `1px solid ${T.border}` }}>
          <span className="font-semibold text-lg" style={{ color: T.primary }}>${item.price.toFixed(2)}</span>
          {qty === 0 ? (
            <button onClick={onAdd} className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-1.5 rounded-[20px] transition-opacity hover:opacity-85 active:scale-95" style={{ background: T.primary }}>
              <Plus size={14} /> Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center rounded-[20px] border transition-colors hover:bg-[#F5EDE4]" style={{ borderColor: T.border, color: T.fg }}><Minus size={13} /></button>
              <span className="font-semibold w-4 text-center text-sm" style={{ color: T.fg }}>{qty}</span>
              <button onClick={onAdd} className="w-7 h-7 flex items-center justify-center rounded-[20px] text-white transition-opacity hover:opacity-85" style={{ background: T.primary }}><Plus size={13} /></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ───────────────────────────────────────────────────────────────

function CartDrawer({ items, onClose, onAdd, onRemove, onCheckout }: {
  items: CartItem[]; onClose: () => void; onAdd: (id: number) => void;
  onRemove: (id: number) => void; onCheckout: () => void;
}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-sm flex flex-col h-full shadow-2xl"
        style={{ background: T.card, borderLeft: `1px solid ${T.border}` }}
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <h2 className="text-xl font-semibold" style={{ color: T.fg }}>Your Order</h2>
          <button onClick={onClose} className="p-1.5 rounded-[20px] hover:bg-[#F5EDE4] transition-colors" style={{ color: T.muted }}><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 && <p className="text-sm text-center mt-16" style={{ color: T.muted }}>Your cart is empty — add something delicious!</p>}
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0" style={{ background: T.inputBg }}>
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight truncate" style={{ color: T.fg }}>{item.name}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: T.primary }}>${(item.price * item.quantity).toFixed(2)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onRemove(item.id)} className="w-6 h-6 flex items-center justify-center rounded-[20px] border hover:bg-[#F5EDE4] transition-colors" style={{ borderColor: T.border, color: T.fg }}><Minus size={11} /></button>
                  <span className="text-sm w-4 text-center font-semibold" style={{ color: T.fg }}>{item.quantity}</span>
                  <button onClick={() => onAdd(item.id)} className="w-6 h-6 flex items-center justify-center rounded-[20px] text-white hover:opacity-85 transition-opacity" style={{ background: T.primary }}><Plus size={11} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="px-5 py-4 space-y-3" style={{ borderTop: `1px solid ${T.border}` }}>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: T.muted }}>Subtotal</span>
              <span className="font-bold text-lg" style={{ color: T.fg }}>${subtotal.toFixed(2)}</span>
            </div>
            <button onClick={onCheckout} className="w-full text-white font-semibold py-3 rounded-[20px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ background: T.primaryGrad }}>
              Checkout <ChevronRight size={16} />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Checkout Modal ────────────────────────────────────────────────────────────

function CheckoutModal({ items, onClose, onConfirm }: {
  items: CartItem[]; onClose: () => void; onConfirm: (d: OrderDetails) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", card: "", expiry: "", cvv: "", zip: "" });
  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const tax = subtotal * 0.08875;
  const total = subtotal + tax;
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.card.replace(/\s/g, "").length < 16) e.card = "Enter a 16-digit card number";
    if (form.expiry.length < 5) e.expiry = "Enter MM/YY";
    if (form.cvv.length < 3) e.cvv = "3-digit CVV";
    if (form.zip.length < 5) e.zip = "Enter ZIP code";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setProcessing(true);
    setTimeout(() => {
      onConfirm({ number: genOrderNum(), waitMinutes: Math.floor(Math.random() * 16) + 20, name: form.name.split(" ")[0], items, total });
    }, 2200);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 backdrop-blur-md" style={{ background: "rgba(255,248,240,0.88)" }} onClick={!processing ? onClose : undefined} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ background: T.card, border: `1px solid ${T.border}` }}
        initial={{ y: 36, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 36, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 240 }}
      >
        {processing ? (
          <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
            <motion.div
              className="w-12 h-12 rounded-full border-4 mb-6"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              style={{ borderColor: `${T.border} ${T.border} ${T.border} ${T.primary}` }}
            />
            <p className="font-semibold text-xl" style={{ color: T.fg }}>Processing your order…</p>
            <p className="text-sm mt-2" style={{ color: T.muted }}>Prototype mode — no real charge is made.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 rounded-t-2xl" style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2">
                <CreditCard size={18} style={{ color: T.primary }} />
                <h2 className="text-xl font-semibold" style={{ color: T.fg }}>Checkout</h2>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-[20px] hover:bg-[#F5EDE4] transition-colors" style={{ color: T.muted }}><X size={18} /></button>
            </div>

            <div className="p-6 grid md:grid-cols-[1fr_272px] gap-6">
              {/* Form */}
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold tracking-[0.15em] uppercase mb-3" style={{ color: T.primary }}>Contact Info</p>
                  <div className="space-y-3">
                    <Field label="Full Name" value={form.name} onChange={set("name")} placeholder="Jane Doe" error={errors.name} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Email" value={form.email} onChange={set("email")} placeholder="jane@email.com" type="email" error={errors.email} />
                      <Field label="Phone (optional)" value={form.phone} onChange={set("phone")} placeholder="(555) 000-0000" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: T.primary }}>Payment</p>
                    <span className="flex items-center gap-1 text-xs" style={{ color: T.muted }}><Lock size={10} /> Prototype — no real charge</span>
                  </div>

                  {/* Card preview */}
                  <div className="relative rounded-2xl p-5 mb-4 overflow-hidden select-none" style={{ background: "linear-gradient(135deg,#D4501A 0%,#8B1A00 60%,#3D0F00 100%)", aspectRatio: "1.586" }}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 80% 20%,#F0A500,transparent 60%)" }} />
                    <p className="text-white/50 text-xs tracking-widest uppercase">Graciela&apos;s Cocina</p>
                    <p className="text-white text-xl font-mono tracking-[0.18em] mt-4">{(form.card || "•••• •••• •••• ••••").padEnd(19, "•").slice(0, 19)}</p>
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-white/40 text-[10px] uppercase tracking-wider">Card Holder</p>
                        <p className="text-white text-sm font-medium">{form.name || "YOUR NAME"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/40 text-[10px] uppercase tracking-wider">Expires</p>
                        <p className="text-white text-sm font-mono">{form.expiry || "MM/YY"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Field label="Card Number" value={form.card} onChange={(v) => set("card")(fmtCard(v))} placeholder="1234 5678 9012 3456" maxLength={19} error={errors.card} />
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Expiry" value={form.expiry} onChange={(v) => set("expiry")(fmtExpiry(v))} placeholder="MM/YY" maxLength={5} error={errors.expiry} />
                      <Field label="CVV" value={form.cvv} onChange={set("cvv")} placeholder="•••" type="password" maxLength={4} error={errors.cvv} />
                      <Field label="ZIP Code" value={form.zip} onChange={set("zip")} placeholder="10001" maxLength={5} error={errors.zip} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="space-y-4">
                <p className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: T.primary }}>Order Summary</p>
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                  {items.map((item, i) => (
                    <div key={item.id} className="flex items-center gap-3 p-3" style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: T.fg }}>{item.name}</p>
                        <p className="text-xs" style={{ color: T.muted }}>×{item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold shrink-0" style={{ color: T.primary }}>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="px-3 py-3 space-y-1.5" style={{ borderTop: `1px solid ${T.border}`, background: "#FFF8F0" }}>
                    <div className="flex justify-between text-xs" style={{ color: T.muted }}>
                      <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: T.muted }}>
                      <span>Tax (8.875%)</span><span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold pt-1.5" style={{ borderTop: `1px solid ${T.border}`, color: T.fg }}>
                      <span>Total</span>
                      <span style={{ color: T.primary }}>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl p-3 text-xs" style={{ background: "#FFF3E0", border: "1px solid rgba(232,150,10,0.25)", color: T.muted }}>
                  <p className="font-bold mb-1" style={{ color: T.primary }}>Prototype Mode</p>
                  <p>Use any fake info — no real payment is processed.</p>
                  <p className="mt-1 font-mono text-[11px]">4111 1111 1111 1111 · 12/26 · 123</p>
                </div>
              </div>
            </div>

            <div className="px-6 pb-6">
              <button onClick={handleSubmit} className="w-full text-white font-semibold py-3.5 rounded-[20px] flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.985] transition-all" style={{ background: T.primaryGrad }}>
                <Lock size={14} /> Place Order · ${total.toFixed(2)}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Order Confirmation ────────────────────────────────────────────────────────

function OrderConfirmation({ order, onClose }: { order: OrderDetails; onClose: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = order.waitMinutes * 60;

  useEffect(() => {
    ref.current = setInterval(() => setElapsed((e) => Math.min(e + 1, total)), 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [total]);

  const progress = Math.min(elapsed / total, 1);
  const remaining = Math.max(order.waitMinutes - Math.floor(elapsed / 60), 0);
  const circ = 2 * Math.PI * 44;

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: T.bg }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.div
        className="w-full max-w-md rounded-2xl p-8 text-center shadow-xl"
        style={{ background: T.card, border: `1px solid ${T.border}` }}
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 200, delay: 0.08 }}
      >
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: T.primaryGrad }}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 220, delay: 0.25 }}
        >
          <CheckCircle size={30} className="text-white" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-1" style={{ color: T.primary }}>Order Confirmed</p>
          <h2 className="text-3xl font-bold mb-1" style={{ color: T.fg }}>¡Gracias, {order.name}!</h2>
          <p className="text-sm" style={{ color: T.muted }}>Order #{order.number} · ${order.total.toFixed(2)}</p>
        </motion.div>

        {/* Countdown ring */}
        <motion.div className="my-8 flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" stroke={T.border} />
              <circle cx="50" cy="50" r="44" fill="none" strokeWidth="6" stroke={T.primary} strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Clock size={15} style={{ color: T.primary }} className="mb-1" />
              <p className="text-2xl font-bold" style={{ color: T.fg }}>{remaining}</p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: T.muted }}>min left</p>
            </div>
          </div>
          <p className="text-sm mt-3" style={{ color: T.muted }}>
            Estimated pickup in <span className="font-bold" style={{ color: T.fg }}>{order.waitMinutes} minutes</span>
          </p>
        </motion.div>

        {/* Item list */}
        <div className="rounded-2xl overflow-hidden mb-6 text-left" style={{ border: `1px solid ${T.border}` }}>
          {order.items.map((item, i) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderTop: i > 0 ? `1px solid ${T.border}` : "none" }}>
              <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
              <p className="text-sm flex-1 truncate font-medium" style={{ color: T.fg }}>{item.name}</p>
              <p className="text-xs" style={{ color: T.muted }}>×{item.quantity}</p>
            </div>
          ))}
        </div>

        <button onClick={onClose} className="w-full text-white font-semibold py-3 rounded-[20px] hover:opacity-90 transition-opacity" style={{ background: T.primaryGrad }}>
          Back to Menu
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderDetails | null>(null);
  const [activeLifestyle, setActiveLifestyle] = useState(0);

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const addToCart = (item: (typeof MENU)[0]) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === item.id);
      if (ex) return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const ex = prev.find((c) => c.id === id);
      if (!ex) return prev;
      if (ex.quantity === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const qtyOf = (id: number) => cart.find((c) => c.id === id)?.quantity ?? 0;

  const handleConfirm = (details: OrderDetails) => {
    setConfirmedOrder(details);
    setCheckoutOpen(false);
    setCartOpen(false);
    setCart([]);
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.fg, fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-md" style={{ background: T.headerBg, borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xl font-bold leading-none" style={{ color: T.fg }}>Graciela&apos;s Cocina</p>
            <p className="text-xs tracking-widest uppercase mt-0.5" style={{ color: T.muted }}>Mexican Kitchen & Catering</p>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 text-white px-4 py-2 rounded-[20px] font-semibold text-sm hover:opacity-90 transition-opacity"
            style={{ background: T.primary }}
          >
            <ShoppingCart size={15} />
            Order
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center" style={{ background: T.gold, color: "#fff" }}>
                {totalQty}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <p className="text-xs tracking-[0.2em] uppercase font-semibold" style={{ color: T.primary }}>Est. 2009 · Family Recipes</p>
            <h2 className="leading-[1.08] text-5xl md:text-6xl font-bold" style={{ color: T.fg }}>
              Authentic flavors,<br />
              <em className="not-italic" style={{ color: T.primary }}>handmade</em><br />
              with love.
            </h2>
            <p className="text-base max-w-sm leading-relaxed" style={{ color: T.muted }}>
              Every dish starts with Abuela&apos;s recipes, fresh masa ground in-house, and chiles sourced directly from Oaxaca.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })}
                className="text-white px-6 py-2.5 rounded-[20px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                style={{ background: T.primary }}
              >
                View Menu <ChevronRight size={16} />
              </button>
              <div className="flex items-center gap-1 text-sm" style={{ color: T.muted }}>
                {[...Array(5)].map((_, i) => <Star key={i} size={13} fill={T.gold} style={{ color: T.gold }} />)}
                <span className="ml-1.5">4.9 on Google</span>
              </div>
            </div>
          </div>

          <div className="relative h-80 md:h-96 hidden md:block">
            <div className="absolute top-0 right-0 w-3/4 h-4/5 rounded-2xl overflow-hidden shadow-lg" style={{ border: `1px solid ${T.border}` }}>
              <img src="https://images.unsplash.com/photo-1700625916627-16ad4fb0553c?w=800&h=600&fit=crop&auto=format" alt="Birria tacos" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-2xl overflow-hidden shadow-xl" style={{ border: `1px solid ${T.border}` }}>
              <img src="https://images.unsplash.com/photo-1694495275309-269e3ea6f21e?w=600&h=400&fit=crop&auto=format" alt="Churros" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-[20px]" style={{ background: T.gold, color: "#fff" }}>
              Today&apos;s Special
            </div>
          </div>
        </div>
      </section>

      {/* ── Menu Grid ── */}
      <section id="menu" className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: T.primary }}>What We&apos;re Cooking</p>
            <h2 className="text-4xl font-bold" style={{ color: T.fg }}>The Menu</h2>
          </div>
          <p className="text-sm hidden md:block" style={{ color: T.muted }}>All dishes made to order</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MENU.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07, duration: 0.4 }}>
              <MenuCard item={item} qty={qtyOf(item.id)} onAdd={() => addToCart(item)} onRemove={() => removeFromCart(item.id)} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Lifestyle Gallery ── */}
      <section className="py-16" style={{ borderTop: `1px solid ${T.border}` }}>
        <div className="max-w-6xl mx-auto px-5 mb-8">
          <p className="text-xs tracking-[0.2em] uppercase font-semibold mb-2" style={{ color: T.primary }}>Come As You Are</p>
          <h2 className="text-4xl font-bold" style={{ color: T.fg }}>The Experience</h2>
        </div>

        <div className="max-w-6xl mx-auto px-5 mb-4">
          <div className="relative overflow-hidden rounded-2xl shadow-md" style={{ aspectRatio: "21/9", background: T.inputBg, border: `1px solid ${T.border}` }}>
            <AnimatePresence mode="wait">
              <motion.img key={activeLifestyle} src={LIFESTYLE[activeLifestyle].url} alt={LIFESTYLE[activeLifestyle].caption} className="w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
            <p className="absolute bottom-6 left-8 text-white text-2xl font-semibold italic">
              {LIFESTYLE[activeLifestyle].caption}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 grid grid-cols-4 gap-3">
          {LIFESTYLE.map((img, i) => (
            <button key={img.id} onClick={() => setActiveLifestyle(i)}
              className="relative overflow-hidden rounded-xl transition-all duration-200"
              style={{ aspectRatio: "4/3", border: `2px solid ${i === activeLifestyle ? T.primary : T.border}`, boxShadow: i === activeLifestyle ? `0 0 0 3px rgba(212,80,26,0.18)` : "none" }}
            >
              <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
              {i === activeLifestyle && <div className="absolute inset-0 bg-[#D4501A]/10" />}
            </button>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10" style={{ borderTop: `1px solid ${T.border}` }}>
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p className="font-bold text-lg" style={{ color: T.fg }}>Graciela&apos;s Cocina</p>
            <p className="text-sm mt-1" style={{ color: T.muted }}>Catering · Pickup · Family Meals</p>
          </div>
          <div className="text-sm space-y-1" style={{ color: T.muted }}>
            <p>📍 Available for pickup &amp; catering orders</p>
            <p>💳 Payment via Zelle before pickup confirmation</p>
          </div>
          <p className="text-xs" style={{ color: T.muted }}>© {new Date().getFullYear()} Graciela&apos;s Cocina.</p>
        </div>
      </footer>

      {/* ── Cart Drawer ── */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            items={cart}
            onClose={() => setCartOpen(false)}
            onAdd={(id) => { const item = MENU.find((m) => m.id === id); if (item) addToCart(item); }}
            onRemove={removeFromCart}
            onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
          />
        )}
      </AnimatePresence>

      {/* ── Checkout Modal ── */}
      <AnimatePresence>
        {checkoutOpen && (
          <CheckoutModal items={cart} onClose={() => setCheckoutOpen(false)} onConfirm={handleConfirm} />
        )}
      </AnimatePresence>

      {/* ── Order Confirmation ── */}
      <AnimatePresence>
        {confirmedOrder && <OrderConfirmation order={confirmedOrder} onClose={() => setConfirmedOrder(null)} />}
      </AnimatePresence>

      {/* ── Mobile cart pill ── */}
      <AnimatePresence>
        {totalQty > 0 && !cartOpen && !checkoutOpen && !confirmedOrder && (
          <motion.button
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-30 text-white px-6 py-3 rounded-[20px] font-semibold flex items-center gap-3 shadow-xl"
            style={{ background: T.primaryGrad }}
          >
            <ShoppingCart size={16} />
            {totalQty} item{totalQty > 1 ? "s" : ""} · <span style={{ color: "#FFD580" }}>${totalPrice.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
