import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { ShoppingCart, Package, Menu as MenuIcon } from 'lucide-react';
import { getMenu, getBranding, getGallery, placeOrder } from '../utils/api';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CartDrawer } from './CartDrawer';
import { CheckoutDialog } from './CheckoutDialog';
import { FAQSection } from './FAQSection';
import { toast } from 'sonner@2.0.3';
import svgPaths from '../imports/svg-2gjo4daah7';
import { HeroCarousel } from './HeroCarousel';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isSpecial: boolean;
  specialDays: string[];
  available: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  imageUrl?: string;
}

export interface Branding {
  businessName?: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
  logo?: string;
  heroImage?: string;
  carouselImages?: string[]; // Array of image/video URLs for carousel
}

interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  createdAt: string;
  type?: 'image' | 'video';
}

interface CustomerViewProps {
  onOpenCustomerPortal: () => void;
  onOpenAdmin?: () => void;
}

export function CustomerView({ onOpenCustomerPortal, onOpenAdmin }: CustomerViewProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [branding, setBranding] = useState<Branding>({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [receiptCode, setReceiptCode] = useState<string | null>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');

  useEffect(() => {
    fetchMenuItems();
    fetchBranding();
    fetchGallery();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const result = await getMenu();
      if (result.items) {
        setMenuItems(result.items);
      }
    } catch (error) {
      console.log('Error fetching menu:', error);
    }
  };

  const fetchBranding = async () => {
    try {
      const result = await getBranding();
      if (result.branding) {
        setBranding(result.branding);
      }
    } catch (error) {
      console.log('Error fetching branding:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const result = await getGallery();
      if (result.images) {
        setGallery(result.images);
      }
    } catch (error) {
      console.log('Error fetching gallery:', error);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return currentCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...currentCart, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to cart!`);
  };

  const removeFromCart = (itemId: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmitOrder = async (orderData: any) => {
    try {
      const result = await placeOrder(orderData);
      if (result.success && result.receiptCode) {
        setCart([]);
        setCheckoutOpen(false);
        setReceiptCode(result.receiptCode);
        setReceiptDialogOpen(true);
        toast.success('Order placed successfully!');
      } else {
        toast.error('Failed to place order');
      }
    } catch (error) {
      console.log('Error placing order:', error);
      toast.error('Failed to place order');
    }
  };

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const businessName = branding.businessName || 'Menú Mexicano';
  const tagline = branding.tagline || 'Authentic Mexican Cuisine';
  const heroImage = branding.heroImage;
  const customLogo = branding.logo;
  const carouselImages = branding.carouselImages || (heroImage ? [heroImage] : []);
  
  // Floral decorations
  const floralTopLeft = 'floral-top-left.png';
  const floralTopRight = 'floral-top-right.png';

  return (
    <div className="bg-white relative min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-2">
          {/* Logo and Business Name */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {customLogo && (
              <img 
                src={customLogo} 
                alt="Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
              />
            )}
            <div className="flex flex-col min-w-0">
              <h1 className="text-base sm:text-xl text-[#0f766e] leading-tight truncate">{businessName}</h1>
              <p className="text-xs text-gray-600 hidden sm:block truncate">{tagline}</p>
            </div>
          </div>
          
          {/* Desktop Navigation Buttons */}
          <div className="hidden md:flex gap-3 relative z-50">
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="bg-[rgb(3,187,154)] h-8 rounded-md border border-[rgba(0,166,244,0.2)] shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-1.5 px-3 text-[#1A237E]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <g clipPath="url(#clip0_cart)">
                  <path d={svgPaths.p22b32180} stroke="#1A237E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  <path d={svgPaths.pceec000} stroke="#1A237E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  <path d={svgPaths.p2ecc1400} stroke="#1A237E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                </g>
                <defs>
                  <clipPath id="clip0_cart">
                    <rect fill="#1A237E" height="16" width="16" />
                  </clipPath>
                </defs>
              </svg>
              <span className="text-sm text-[#1A237E]">({getTotalItems()})</span>
              <span className="text-sm text-[#1A237E]">Cart</span>
            </button>
            
            {/* Track Order Button */}
            <button
              onClick={onOpenCustomerPortal}
              className="bg-white h-8 rounded-md border border-[rgba(233,30,99,0.2)] shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2 px-3"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                <g>
                  <path d={svgPaths.p399eca00} stroke="#1A237E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  <path d={svgPaths.pc93b400} stroke="#1A237E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                </g>
              </svg>
              <span className="text-sm text-[#1a237e]">Track Order</span>
            </button>
          </div>

          {/* Mobile Navigation - Cart + Hamburger Menu */}
          <div className="flex md:hidden gap-2 items-center shrink-0">
            {/* Cart Button (Mobile) */}
            <button
              onClick={() => setCartOpen(true)}
              className="bg-[rgb(3,187,154)] h-9 w-9 rounded-md border border-[rgba(0,166,244,0.2)] shadow-sm hover:shadow-md transition-shadow flex items-center justify-center relative"
            >
              <ShoppingCart className="w-5 h-5 text-[#1A237E]" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* Hamburger Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="bg-white h-9 w-9 rounded-md border border-gray-300 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                  <MenuIcon className="w-5 h-5 text-[#1A237E]" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]" aria-describedby="mobile-menu-description">
                <SheetHeader>
                  <SheetTitle className="text-[#0f766e]">Menu</SheetTitle>
                </SheetHeader>
                <span id="mobile-menu-description" className="sr-only">Navigation menu and order tracking</span>
                <div className="flex flex-col gap-3 mt-6">
                  {/* Track Order */}
                  <button
                    onClick={onOpenCustomerPortal}
                    className="bg-white h-12 rounded-lg border border-[rgba(233,30,99,0.2)] shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 px-4 w-full"
                  >
                    <Package className="w-5 h-5 text-[#1A237E]" />
                    <span className="text-[#1a237e]">Track My Order</span>
                  </button>

                  {/* Quick Nav */}
                  <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('menu');
                        // Close the sheet
                        document.body.click();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      Menu
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('gallery');
                        document.body.click();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      Gallery
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('faq');
                        document.body.click();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                    >
                      FAQ & Info
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Hero Carousel Section with Floral Decorations - Flush with header, no gaps */}
      <div className="relative h-96 overflow-hidden">
        {/* Carousel */}
        {carouselImages.length > 0 ? (
          <HeroCarousel images={carouselImages} />
        ) : (
          <div className="relative h-96 bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#14b8a6]" />
        )}
        
        {/* Top Left Floral Decoration - Flush to top, overlaid on carousel */}
        <img 
          src={floralTopLeft} 
          alt="" 
          className="absolute top-0 left-0 w-80 h-73 object-contain pointer-events-none z-20"
        />
        
        {/* Top Right Floral Decoration - Flush to top, overlaid on carousel */}
        <img 
          src={floralTopRight} 
          alt="" 
          className="absolute top-0 right-0 w-80 h-73 object-contain pointer-events-none z-20"
        />
        
        {/* Text Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 z-30 bg-black/30">
          <h2 className="text-white text-center text-3xl drop-shadow-lg">Order Your Favorite Dishes</h2>
          <p className="text-white text-center text-lg drop-shadow-md">Fresh, authentic Mexican food made with love</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-20">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-6 sm:mb-10">
              <TabsList className="bg-white border border-gray-200 p-1 rounded-lg h-10 grid grid-cols-3 w-fit shadow-sm">
                <TabsTrigger
                  value="menu"
                  className="data-[state=active]:bg-[#0f766e] data-[state=active]:text-white rounded-md h-8 px-4 sm:px-6 text-sm text-gray-700 transition-all"
                >
                  Menu
                </TabsTrigger>
                <TabsTrigger
                  value="gallery"
                  className="data-[state=active]:bg-[#0f766e] data-[state=active]:text-white rounded-md h-8 px-4 sm:px-6 text-sm text-gray-700 transition-all"
                >
                  Gallery
                </TabsTrigger>
                <TabsTrigger
                  value="faq"
                  className="data-[state=active]:bg-[#0f766e] data-[state=active]:text-white rounded-md h-8 px-4 sm:px-6 text-sm text-gray-700 transition-all"
                >
                  FAQ
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Menu Tab */}
            <TabsContent value="menu" className="space-y-8">
              {/* Category Filters */}
              <div className="flex gap-2 flex-wrap justify-center">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`h-9 px-5 rounded-lg capitalize transition-all ${
                      selectedCategory === category
                        ? 'bg-[#0f766e] text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#0f766e] hover:text-[#0f766e]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => (
                  <Card
                    key={item.id}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow flex flex-col"
                  >
                    {/* Image */}
                    <div className="relative h-52 bg-gray-100">
                      {item.imageUrl ? (
                        <ImageWithFallback
                          src={item.imageUrl}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      {/* Title and Price */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg text-gray-900 flex-1">{item.name}</h3>
                        <p className="text-lg text-[#0f766e] shrink-0">${item.price.toFixed(2)}</p>
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 flex-1">
                          {item.description}
                        </p>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-[#0f766e] hover:bg-[#0d9488] text-white rounded-lg h-10 mt-auto flex items-center justify-center gap-2 transition-colors"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No items available in this category</p>
                </div>
              )}
            </TabsContent>

            {/* Gallery Tab */}
            <TabsContent value="gallery">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gallery.map(item => (
                  <Card key={item.id} className="overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="relative h-64 bg-gray-100">
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="absolute inset-0 w-full h-full object-cover"
                          controls
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        <ImageWithFallback
                          src={item.url}
                          alt={item.caption}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {item.caption && (
                      <div className="p-4">
                        <p className="text-sm text-gray-700">{item.caption}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
              {gallery.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No gallery items yet</p>
                </div>
              )}
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq">
              <FAQSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer with Floral Decorations */}
      <div className="bg-white border-t border-gray-200 py-8 relative overflow-hidden">
        {/* Bottom Left Floral - mirrored */}
        <img 
          src={floralTopLeft} 
          alt="" 
          className="absolute bottom-0 left-0 w-56 h-56 object-contain pointer-events-none transform scale-y-[-1] opacity-30"
        />
        
        {/* Bottom Right Floral - mirrored */}
        <img 
          src={floralTopRight} 
          alt="" 
          className="absolute bottom-0 right-0 w-56 h-56 object-contain pointer-events-none transform scale-y-[-1] opacity-30"
        />
        
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              © 2024 {businessName}. All rights reserved.
            </p>
            
            {/* Admin Button in Footer */}
            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="bg-white h-8 rounded-md border border-[rgba(233,30,99,0.2)] shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-2 px-3"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                  <g>
                    <path d={svgPaths.p14890d00} stroke="#1A237E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p28db2b80} stroke="#1A237E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                </svg>
                <span className="text-sm text-[#1a237e]">Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart}
        onRemoveItem={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Dialog */}
      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        items={cart}
        onSubmit={handleSubmitOrder}
      />

      {/* Receipt Code Success Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Order Placed Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Save your 5-digit receipt code to access the Customer Portal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-[#0f766e]/10 border-2 border-[#0f766e] rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-2">Your 5-Digit Receipt Code</p>
              <p className="text-4xl tracking-widest text-[#0f766e] mb-2">{receiptCode}</p>
              <p className="text-xs text-gray-500">
                Write this down or take a screenshot
              </p>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-center">Use this code in the Customer Portal to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Track your order progress in real-time</li>
                <li>View estimated pickup time</li>
                <li>See your full order details and receipt</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={onOpenCustomerPortal} 
                className="w-full bg-[#0f766e] hover:bg-[#0d9488]"
              >
                Track My Order Now
              </Button>
              <Button 
                onClick={() => setReceiptDialogOpen(false)} 
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}