'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { menuApi } from '@/lib/api';
import { getCurrencySymbol } from '@/lib/currencies';
import { CartItem, MenuItem, PublicMenuResponse } from '@/types';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import MenuItemCard from '@/components/MenuItemCard';
import CartDrawer from '@/components/CartDrawer';
import ProductDetailModal from '@/components/ProductDetailModal';
import ReviewSection from '@/components/ReviewSection';
import SplashScreen from '@/components/SplashScreen';
import toast from 'react-hot-toast';

export default function MenuPageContent() {
  const { slug } = useParams<{ slug: string }>();

  const [data, setData] = useState<PublicMenuResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [splashDone, setSplashDone] = useState(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  /* '__all__' = show everything, otherwise = filter by category id */
  const [activeCatId, setActiveCatId] = useState<string>('__all__');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('viewMode') as 'list' | 'grid' | null;
      if (saved) setViewMode(saved);
    } catch {}
    menuApi.getMenu(slug)
      .then((d) => { setData(d); })
      .catch(() => setError('تعذّر تحميل القائمة. تحقق من الرابط أو حاول مجدداً.'))
      .finally(() => setLoading(false));
  }, [slug]);

  /* ── Cart helpers ─────────────────────────────────────── */
  const cartKey = (itemId: string, variantName?: string) =>
    variantName ? `${itemId}::${variantName}` : itemId;

  const addToCart = useCallback((item: MenuItem, variantName?: string, variantPrice?: string) => {
    setCart((prev) => {
      const key = cartKey(item.id, variantName);
      const existing = prev.find((ci) => cartKey(ci.item.id, ci.variantName) === key);
      if (existing) {
        return prev.map((ci) =>
          cartKey(ci.item.id, ci.variantName) === key
            ? { ...ci, quantity: ci.quantity + 1 }
            : ci
        );
      }
      return [...prev, { item, quantity: 1, variantName, variantPrice }];
    });
  }, []);

  const addByKeyToCart = useCallback((itemId: string, variantName?: string) => {
    setCart((prev) => {
      const key = cartKey(itemId, variantName);
      return prev.map((ci) =>
        cartKey(ci.item.id, ci.variantName) === key
          ? { ...ci, quantity: ci.quantity + 1 }
          : ci
      );
    });
  }, []);

  const removeFromCart = useCallback((itemId: string, variantName?: string) => {
    setCart((prev) => {
      const key = cartKey(itemId, variantName);
      const existing = prev.find((ci) => cartKey(ci.item.id, ci.variantName) === key);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((ci) => cartKey(ci.item.id, ci.variantName) !== key);
      return prev.map((ci) =>
        cartKey(ci.item.id, ci.variantName) === key
          ? { ...ci, quantity: ci.quantity - 1 }
          : ci
      );
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, ci) => s + ci.quantity, 0);
  const itemEffectivePrice = (ci: CartItem) => parseFloat(ci.variantPrice ?? ci.item.price);
  const cartRawTotal = cart.reduce((s, ci) => s + itemEffectivePrice(ci) * ci.quantity, 0);

  const cartDiscount = (() => {
    if (!data?.offers.length) return 0;
    let discount = 0;
    for (const offer of data.offers) {
      const discValue = parseFloat(offer.discount_value);
      if (offer.applicable_items.length === 0) {
        discount += offer.discount_type === 'percentage'
          ? cartRawTotal * discValue / 100
          : Math.min(discValue, cartRawTotal);
      } else {
        const applicable = new Set(offer.applicable_items);
        const base = cart
          .filter((ci) => applicable.has(ci.item.id))
          .reduce((s, ci) => s + itemEffectivePrice(ci) * ci.quantity, 0);
        discount += offer.discount_type === 'percentage'
          ? base * discValue / 100
          : Math.min(discValue, base);
      }
    }
    return Math.min(discount, cartRawTotal);
  })();

  const cartTotal = cartRawTotal - cartDiscount;

  const openDetail = useCallback((item: MenuItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setTimeout(() => setDetailItem(null), 350);
  }, []);

  const handlePlaceOrder = async (payload: Parameters<typeof menuApi.placeOrder>[1]) => {
    try {
      const result = await menuApi.placeOrder(slug, payload);
      setCartOpen(false);
      clearCart();
      toast.success('تم إنشاء طلبك! سيتم فتح واتساب الآن...');
      setTimeout(() => window.open(result.whatsapp_link, '_blank'), 500);
    } catch {
      toast.error('حدث خطأ أثناء إرسال الطلب، حاول مجدداً');
      throw new Error('order failed');
    }
  };

  /* ── Splash ─────────────────────────────────────────── */
  if (!splashDone) {
    return <SplashScreen onDone={() => setSplashDone(true)} />;
  }

  /* ── Loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#FBF3E4',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              width: 8, height: 8, borderRadius: 999, background: '#8A5228',
              animation: `splashBounce 1s ease-in-out ${i * 0.15}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ────────────────────────────────────────────── */
  if (error || !data) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', gap: 16, padding: '0 24px', textAlign: 'center',
        background: '#FBF3E4',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: '#F5E8CE', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
        }}>🍽</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: '#3E1D08' }}>مطعم غير موجود</div>
        <div style={{ color: '#9B8A74', fontSize: 14 }}>{error ?? 'تحقق من الرابط وحاول مجدداً'}</div>
      </div>
    );
  }

  const { restaurant, categories, items, offers } = data;
  const currencyCode = restaurant.currency_code || 'IQD';
  const currencySymbol = getCurrencySymbol(currencyCode);

  /* ── Nav: prepend "الكل" ──────────────────────────────── */
  const allCat = {
    id: '__all__', name: 'الكل', description: '', image_url: '',
    order: -1, restaurant_id: '', is_active: true, created_at: '',
  };
  const navCategories = [allCat, ...categories];

  /* ── Which categories/items to show (filter) ─────────── */
  const visibleCategories = activeCatId === '__all__'
    ? categories
    : categories.filter((c) => c.id === activeCatId);

  return (
    <>
      <Header restaurant={restaurant} cartCount={cartCount} onCartClick={() => setCartOpen(true)} />

      {/* ── Hero ────────────────────────────────────────── */}
      <div style={{ padding: '4px 16px 12px', maxWidth: 440, margin: '0 auto' }}>
        <div style={{
          background: 'linear-gradient(135deg, #6B3410 0%, #3E1D08 100%)',
          borderRadius: 24, padding: '20px 22px',
          color: '#FBF3E4', position: 'relative', overflow: 'hidden',
          boxShadow: '0 10px 28px rgba(62,29,8,.18)',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.1,
            backgroundImage: 'radial-gradient(#FBF3E4 1px, transparent 1px)',
            backgroundSize: '8px 8px', pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', opacity: 0.75, marginBottom: 4 }}>
              أهلاً بكم
            </div>
            <div style={{ fontWeight: 800, fontSize: 26, lineHeight: 1.2 }}>
              نكهة عراقية<br />أصيلة منذ 1973
            </div>
            <div style={{ marginTop: 14, fontSize: 13, opacity: 0.85, lineHeight: 1.55, maxWidth: 260 }}>
              تصفّح قائمتنا، أضف ما يعجبك، وأرسل طلبك مباشرةً عبر واتساب.
            </div>
          </div>
        </div>
      </div>

      {/* ── Category filter nav ──────────────────────────── */}
      <CategoryNav
        categories={navCategories}
        activeId={activeCatId}
        viewMode={viewMode}
        onSelect={(id) => {
          setActiveCatId(id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onViewChange={(mode) => {
          setViewMode(mode);
          try { localStorage.setItem('viewMode', mode); } catch {}
        }}
      />

      <main style={{ maxWidth: 440, margin: '0 auto', padding: '12px 16px 120px' }}>
        {visibleCategories.map((cat) => {
          const catItems = items.filter((it) => it.category_id === cat.id);
          if (!catItems.length) return null;
          return (
            <section key={cat.id} style={{ marginBottom: 12 }}>

              <div style={viewMode === 'grid'
                ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
                : { display: 'flex', flexDirection: 'column', gap: 12 }
              }>
                {catItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    currencyCode={currencyCode}
                    cart={cart}
                    offers={offers}
                    compact={viewMode === 'grid'}
                    onAdd={addToCart}
                    onRemove={removeFromCart}
                    onOpenDetail={openDetail}
                  />
                ))}
              </div>
            </section>
          );
        })}

        <ReviewSection slug={slug} cartVisible={cartCount > 0 && !cartOpen && !detailOpen} restaurant={restaurant} />
      </main>

      {/* ── Floating cart ──────────────────────────────── */}
      {cartCount > 0 && !cartOpen && !detailOpen && (
        <div style={{
          position: 'fixed', bottom: 20, left: 16, right: 16, zIndex: 40,
          display: 'flex', justifyContent: 'center',
        }}>
          <button
            onClick={() => setCartOpen(true)}
            className="slide-up"
            style={{
              display: 'flex', alignItems: 'center',
              padding: '8px 16px 8px 8px',
              background: '#6B3410', color: '#FBF3E4',
              border: 'none', borderRadius: 999, cursor: 'pointer',
              minHeight: 56, width: '100%', maxWidth: 440,
              boxShadow: '0 10px 28px rgba(62,29,8,.30)',
              fontFamily: 'inherit',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 999,
              background: '#E89B2C', color: '#3E1D08',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 15, flexShrink: 0,
            }}>
              {cartCount}
            </div>
            <span style={{ marginRight: 10, fontWeight: 700, fontSize: 15 }}>عرض السلة</span>
            <span style={{ flex: 1 }} />
            <span style={{ fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>
              {cartTotal.toFixed(0)} <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7 }}>{currencySymbol}</span>
            </span>
          </button>
        </div>
      )}

      <ProductDetailModal
        item={detailItem}
        open={detailOpen}
        currencyCode={currencyCode}
        cart={cart}
        onClose={closeDetail}
        onAdd={addToCart}
        onRemove={removeFromCart}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        currencyCode={currencyCode}
        discountAmount={cartDiscount}
        onClose={() => setCartOpen(false)}
        onAdd={(itemId, variantName) => addByKeyToCart(itemId, variantName)}
        onRemove={(itemId, variantName) => removeFromCart(itemId, variantName)}
        onClear={clearCart}
        onSubmit={handlePlaceOrder}
      />
    </>
  );
}
