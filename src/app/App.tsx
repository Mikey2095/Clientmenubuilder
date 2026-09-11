import { useState } from "react";
import { ShoppingCart, Plus, Minus, X, ChevronRight, Star, Flame } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Data ──────────────────────────────────────────────────────────────────────

const MENU = [
  {
    id: 1,
    name: "Birria Tacos",
    subtitle: "Slow-braised beef consommé",
    description:
      "12-hour braised beef cheeks in guajillo-ancho chile broth, served on handmade corn tortillas with diced white onion, fresh cilantro, and a side of rich consommé for dipping.",
    price: 16.5,
    tag: "Chef's Pick",
    spice: 2,
    image:
      "https://images.unsplash.com/photo-1700625916627-16ad4fb0553c?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Red Enchiladas",
    subtitle: "House red chile sauce",
    description:
      "Three hand-rolled corn tortillas stuffed with shredded chicken and Oaxacan cheese, smothered in our house-made guajillo-pasilla sauce and topped with crema and cotija.",
    price: 14.0,
    tag: "Classic",
    spice: 1,
    image:
      "https://images.unsplash.com/photo-1786052599180-aea3127970b6?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Tamales de Rajas",
    subtitle: "Poblano & cheese",
    description:
      "Steamed masa dough filled with roasted poblano strips and Chihuahua cheese, wrapped in corn husks and finished with a light tomatillo salsa verde.",
    price: 12.0,
    tag: "Vegetarian",
    spice: 0,
    image:
      "https://images.unsplash.com/photo-1599334521854-ee2c9e535f6b?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "Guacamole & Totopos",
    subtitle: "Table-side preparation",
    description:
      "Stone-ground molcajete guacamole made fresh to order with Hass avocados, serrano chile, white onion, lime, and cilantro. Served with house-fried totopos.",
    price: 11.0,
    tag: "Shareable",
    spice: 1,
    image:
      "https://images.unsplash.com/photo-1661182260393-a3918d4e8571?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Street Tacos Al Pastor",
    subtitle: "Achiote-marinated pork",
    description:
      "Thin-sliced pork marinated in achiote and dried chiles, cooked on a vertical spit with pineapple. Served two per order on small corn tortillas with pico de gallo.",
    price: 13.5,
    tag: "Fan Favorite",
    spice: 2,
    image:
      "https://images.unsplash.com/photo-1698854633001-39d4e6806316?w=800&h=600&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Churros con Cajeta",
    subtitle: "Goat milk caramel",
    description:
      "Crispy fried dough piped in a star shape, rolled in cinnamon sugar, and served alongside a warm pot of house-made cajeta — a rich, slow-cooked goat milk caramel.",
    price: 9.0,
    tag: "Dessert",
    spice: 0,
    image:
      "https://images.unsplash.com/photo-1694495275309-269e3ea6f21e?w=800&h=600&fit=crop&auto=format",
  },
];

const LIFESTYLE = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1653084019129-1f2303bb5bc0?w=1200&h=800&fit=crop&auto=format",
    caption: "Where every evening is a fiesta",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1779333203369-29b1a4892c0d?w=1200&h=800&fit=crop&auto=format",
    caption: "Neon nights & fresh bites",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1700625914939-30bf5479e3bc?w=1200&h=800&fit=crop&auto=format",
    caption: "Family recipes, modern table",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1693193433392-da83457dff20?w=1200&h=800&fit=crop&auto=format",
    caption: "Handmade tortillas, every day",
  },
];

// ─── Types ──────────────────────────────────────────────────────────────────────

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// ─── Small components ──────────────────────────────────────────────────────────

function SpiceLevel({ level }: { level: number }) {
  return (
    <span className="flex gap-0.5 items-center">
      {[0, 1, 2].map((i) => (
        <Flame
          key={i}
          size={11}
          className={i < level ? "text-[#F0A500]" : "text-white/20"}
          fill={i < level ? "#F0A500" : "transparent"}
        />
      ))}
    </span>
  );
}

function TagBadge({ tag }: { tag: string }) {
  const colors: Record<string, string> = {
    "Chef's Pick": "bg-[#D4501A]/90 text-[#F5E6D3]",
    Classic: "bg-[#2A3D2B]/90 text-[#C8E6C9]",
    Vegetarian: "bg-[#2A3D2B]/90 text-[#C8E6C9]",
    Shareable: "bg-[#F0A500]/20 text-[#F0A500]",
    "Fan Favorite": "bg-[#D4501A]/90 text-[#F5E6D3]",
    Dessert: "bg-white/10 text-white/70",
  };
  return (
    <span
      className={`text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-sm ${colors[tag] ?? "bg-white/10 text-white/60"}`}
    >
      {tag}
    </span>
  );
}

// ─── Menu Card ─────────────────────────────────────────────────────────────────

function MenuCard({
  item,
  onAdd,
  qty,
  onRemove,
}: {
  item: (typeof MENU)[0];
  onAdd: () => void;
  qty: number;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-sm bg-card border border-border cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#2C1A0E]" style={{ aspectRatio: "4/3" }}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out"
          style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <TagBadge tag={item.tag} />
        </div>
        <div className="absolute top-3 right-3">
          <SpiceLevel level={item.spice} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <h3
            className="text-foreground font-semibold leading-tight"
            style={{ fontFamily: "'Fraunces', serif", fontSize: "1.1rem" }}
          >
            {item.name}
          </h3>
          <p className="text-[#A08060] text-xs mt-0.5 uppercase tracking-wider">{item.subtitle}</p>
        </div>
        <p className="text-[#A08060] text-sm leading-relaxed flex-1">{item.description}</p>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-2 border-t border-border mt-1">
          <span
            className="text-[#F0A500] font-semibold text-lg"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            ${item.price.toFixed(2)}
          </span>

          {qty === 0 ? (
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 bg-[#D4501A] text-[#F5E6D3] text-sm font-medium px-3 py-1.5 rounded-sm transition-all duration-150 hover:bg-[#B8431A] active:scale-95"
            >
              <Plus size={14} />
              Add
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onRemove}
                className="w-7 h-7 flex items-center justify-center rounded-sm border border-border text-foreground hover:bg-muted transition-colors"
              >
                <Minus size={13} />
              </button>
              <span className="text-foreground font-semibold w-4 text-center text-sm">{qty}</span>
              <button
                onClick={onAdd}
                className="w-7 h-7 flex items-center justify-center rounded-sm bg-[#D4501A] text-[#F5E6D3] hover:bg-[#B8431A] transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cart Drawer ───────────────────────────────────────────────────────────────

function CartDrawer({
  items,
  onClose,
  onAdd,
  onRemove,
  onClear,
}: {
  items: CartItem[];
  onClose: () => void;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onClear: () => void;
}) {
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-sm bg-card border-l border-border flex flex-col h-full"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 260 }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2
            className="text-foreground text-xl font-semibold"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Your Order
          </h2>
          <button
            onClick={onClose}
            className="text-[#A08060] hover:text-foreground transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 && (
            <p className="text-[#A08060] text-sm text-center mt-12">
              Your cart is empty — add something delicious!
            </p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 items-start">
              <div className="w-14 h-14 rounded-sm overflow-hidden bg-muted shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-foreground text-sm font-medium leading-tight"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {item.name}
                </p>
                <p className="text-[#F0A500] text-sm mt-0.5">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-sm border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="text-foreground text-sm w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => onAdd(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-sm bg-[#D4501A] text-[#F5E6D3] hover:bg-[#B8431A] transition-colors"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[#A08060] text-sm">Subtotal</span>
              <span
                className="text-foreground font-semibold text-lg"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                ${total.toFixed(2)}
              </span>
            </div>
            <button className="w-full bg-[#D4501A] text-[#F5E6D3] font-medium py-3 rounded-sm flex items-center justify-center gap-2 hover:bg-[#B8431A] transition-colors">
              Checkout <ChevronRight size={16} />
            </button>
            <button
              onClick={onClear}
              className="w-full text-[#A08060] text-sm py-1 hover:text-foreground transition-colors"
            >
              Clear order
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeLifestyle, setActiveLifestyle] = useState(0);

  const totalQty = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const addToCart = (item: (typeof MENU)[0]) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing)
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      return [
        ...prev,
        { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image },
      ];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => (c.id === id ? { ...c, quantity: c.quantity - 1 } : c));
    });
  };

  const qtyOf = (id: number) => cart.find((c) => c.id === id)?.quantity ?? 0;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <div>
            <p
              className="text-foreground text-xl font-bold leading-none"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Graciela&apos;s Cocina
            </p>
            <p className="text-[#A08060] text-xs tracking-widest uppercase mt-0.5">
              Mexican Kitchen & Catering
            </p>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 bg-[#D4501A] text-[#F5E6D3] px-4 py-2 rounded-sm font-medium text-sm hover:bg-[#B8431A] transition-colors"
          >
            <ShoppingCart size={15} />
            Order
            {totalQty > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#F0A500] text-[#140A05] text-xs font-bold rounded-full flex items-center justify-center">
                {totalQty}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="max-w-6xl mx-auto px-5 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <p className="text-[#F0A500] text-xs tracking-[0.2em] uppercase font-medium">
              Est. 2009 · Family Recipes
            </p>
            <h2
              className="text-foreground leading-[1.1] text-5xl md:text-6xl font-bold"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Authentic flavors,
              <br />
              <em className="text-[#D4501A] not-italic">handmade</em>
              <br />
              with love.
            </h2>
            <p className="text-[#A08060] text-base max-w-sm leading-relaxed">
              Every dish starts with Abuela&apos;s recipes, fresh masa ground in-house, and chiles
              sourced directly from Oaxaca.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={() =>
                  document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-[#D4501A] text-[#F5E6D3] px-6 py-2.5 rounded-sm font-medium hover:bg-[#B8431A] transition-colors flex items-center gap-2"
              >
                View Menu <ChevronRight size={16} />
              </button>
              <div className="flex items-center gap-1 text-[#A08060] text-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} fill="#F0A500" className="text-[#F0A500]" />
                ))}
                <span className="ml-1.5">4.9 on Google</span>
              </div>
            </div>
          </div>

          {/* Collage */}
          <div className="relative h-80 md:h-96 hidden md:block">
            <div className="absolute top-0 right-0 w-3/4 h-4/5 rounded-sm overflow-hidden bg-muted border border-border">
              <img
                src="https://images.unsplash.com/photo-1700625916627-16ad4fb0553c?w=800&h=600&fit=crop&auto=format"
                alt="Birria tacos"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 rounded-sm overflow-hidden bg-muted border border-border shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1694495275309-269e3ea6f21e?w=600&h=400&fit=crop&auto=format"
                alt="Churros con cajeta"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-4 left-4 bg-[#F0A500]/90 text-[#140A05] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-sm">
              Today&apos;s Special
            </div>
          </div>
        </div>
      </section>

      {/* ── Menu Grid ── */}
      <section id="menu" className="max-w-6xl mx-auto px-5 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[#F0A500] text-xs tracking-[0.2em] uppercase font-medium mb-2">
              What We&apos;re Cooking
            </p>
            <h2
              className="text-foreground text-4xl font-bold"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              The Menu
            </h2>
          </div>
          <p className="text-[#A08060] text-sm hidden md:block">All dishes made to order</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MENU.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <MenuCard
                item={item}
                qty={qtyOf(item.id)}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item.id)}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Lifestyle Gallery ── */}
      <section className="border-t border-border py-16">
        <div className="max-w-6xl mx-auto px-5 mb-8">
          <p className="text-[#F0A500] text-xs tracking-[0.2em] uppercase font-medium mb-2">
            Come As You Are
          </p>
          <h2
            className="text-foreground text-4xl font-bold"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            The Experience
          </h2>
        </div>

        {/* Featured image */}
        <div className="max-w-6xl mx-auto px-5 mb-4">
          <div
            className="relative overflow-hidden rounded-sm bg-muted border border-border"
            style={{ aspectRatio: "21/9" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={activeLifestyle}
                src={LIFESTYLE[activeLifestyle].url}
                alt={LIFESTYLE[activeLifestyle].caption}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p
              className="absolute bottom-6 left-8 text-white text-2xl font-semibold italic"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {LIFESTYLE[activeLifestyle].caption}
            </p>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="max-w-6xl mx-auto px-5 grid grid-cols-4 gap-3">
          {LIFESTYLE.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveLifestyle(i)}
              className={`relative overflow-hidden rounded-sm bg-muted border transition-all duration-200 ${
                i === activeLifestyle
                  ? "border-[#F0A500] ring-1 ring-[#F0A500]"
                  : "border-border hover:border-[#F0A500]/50"
              }`}
              style={{ aspectRatio: "4/3" }}
            >
              <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
              {i === activeLifestyle && (
                <div className="absolute inset-0 bg-[#F0A500]/10" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <p
              className="text-foreground font-bold text-lg"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Graciela&apos;s Cocina
            </p>
            <p className="text-[#A08060] text-sm mt-1">Catering · Pickup · Family Meals</p>
          </div>
          <div className="text-[#A08060] text-sm space-y-1">
            <p>📍 Available for pickup &amp; catering orders</p>
            <p>📞 Payment via Zelle before pickup confirmation</p>
          </div>
          <p className="text-[#A08060] text-xs">
            © {new Date().getFullYear()} Graciela&apos;s Cocina. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── Cart Drawer ── */}
      <AnimatePresence>
        {cartOpen && (
          <CartDrawer
            items={cart}
            onClose={() => setCartOpen(false)}
            onAdd={(id) => {
              const item = MENU.find((m) => m.id === id);
              if (item) addToCart(item);
            }}
            onRemove={removeFromCart}
            onClear={() => setCart([])}
          />
        )}
      </AnimatePresence>

      {/* ── Floating cart pill (mobile) ── */}
      <AnimatePresence>
        {totalQty > 0 && !cartOpen && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => setCartOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 md:hidden z-30 bg-[#D4501A] text-[#F5E6D3] px-6 py-3 rounded-full font-semibold flex items-center gap-3 shadow-2xl"
          >
            <ShoppingCart size={16} />
            View Order · {totalQty} item{totalQty > 1 ? "s" : ""}
            <span className="text-[#F0A500] font-bold">${totalPrice.toFixed(2)}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
