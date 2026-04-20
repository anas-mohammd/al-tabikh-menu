'use client';

import { useState, useEffect } from 'react';
import { MenuItem, CartItem, ItemVariant } from '@/types';
import { formatPrice } from '@/lib/currencies';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

interface Props {
  item: MenuItem | null;
  open: boolean;
  currencyCode: string;
  cart: CartItem[];
  onClose: () => void;
  onAdd: (item: MenuItem, variantName?: string, variantPrice?: string) => void;
  onRemove: (itemId: string, variantName?: string) => void;
}

const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #6B3410 0%, #3E1D08 100%)',
  'linear-gradient(135deg, #E89B2C 0%, #C97D14 100%)',
  'linear-gradient(135deg, #C0392B 0%, #8B1A0E 100%)',
  'linear-gradient(135deg, #8A5228 0%, #6B3410 100%)',
  'linear-gradient(135deg, #E89B2C 0%, #C0392B 100%)',
  'linear-gradient(135deg, #3E1D08 0%, #6B3410 100%)',
];
function thumbGradient(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return THUMB_GRADIENTS[Math.abs(hash) % THUMB_GRADIENTS.length];
}

export default function ProductDetailModal({
  item, open, currencyCode, cart, onClose, onAdd, onRemove,
}: Props) {
  const hasVariants = !!item?.variants?.length;
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (item && hasVariants) {
      setSelectedVariant(item.variants[1] ?? item.variants[0]);
    } else {
      setSelectedVariant(null);
    }
    setQty(1);
  }, [item]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!item) return null;

  const cartKey = selectedVariant ? `${item.id}::${selectedVariant.name}` : item.id;
  const cartItem = cart.find((ci) =>
    (ci.variantName ? `${ci.item.id}::${ci.variantName}` : ci.item.id) === cartKey
  );
  const cartQty = cartItem?.quantity ?? 0;

  const unitPrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(item.price);
  const total = unitPrice * qty;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      onAdd(item, selectedVariant?.name, selectedVariant?.price);
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`backdrop-in ${open ? '' : 'pointer-events-none'}`}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 50,
          background: 'rgba(43,27,14,0.55)',
          opacity: open ? 1 : 0,
          transition: 'opacity 220ms ease',
        }}
      />

      {/* Bottom sheet */}
      <div
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 280ms cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div style={{
          background: '#FBF3E4', maxWidth: 440, margin: '0 auto',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: '92vh', display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -10px 32px rgba(62,29,8,.15)',
        }}>
          {/* Handle */}
          <div style={{ width: 40, height: 4, background: '#E3D2B0', borderRadius: 999, margin: '12px auto 4px' }} />

          {/* Scrollable body */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {/* Food image / placeholder */}
            <div style={{ margin: '8px 16px 0', borderRadius: 20, overflow: 'hidden', position: 'relative', height: 220 }}>
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="440px"
                  priority
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: thumbGradient(item.name),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#FBF3E4', fontSize: 32, fontWeight: 700,
                }}>
                  {item.name.split(/\s+/)[0]}
                </div>
              )}
            </div>

            <div style={{ padding: '16px 20px 0' }}>
              {/* Name */}
              <div style={{ fontWeight: 800, fontSize: 24, color: '#3E1D08', lineHeight: 1.2 }}>
                {item.name}
              </div>
              {/* Description */}
              {item.description && (
                <div style={{ fontSize: 14, color: '#6B5A48', lineHeight: 1.55, marginTop: 6 }}>
                  {item.description}
                </div>
              )}

              {/* Variant picker */}
              {hasVariants && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#6B5A48', marginBottom: 10 }}>اختر الحجم</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {item.variants.map((v) => {
                      const sel = selectedVariant?.name === v.name;
                      return (
                        <div
                          key={v.name}
                          onClick={() => setSelectedVariant(v)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '12px 14px', borderRadius: 14,
                            background: sel ? '#FFFFFF' : 'transparent',
                            border: `1px solid ${sel ? '#6B3410' : '#E3D2B0'}`,
                            boxShadow: sel ? 'inset 0 0 0 1px #6B3410' : 'none',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 18, height: 18, borderRadius: 999,
                              border: `2px solid ${sel ? '#6B3410' : '#D8C7A8'}`,
                              background: sel ? 'radial-gradient(circle, #6B3410 0 40%, white 45%)' : 'transparent',
                              flexShrink: 0,
                            }} />
                            <span style={{ fontSize: 15, color: '#2B1B0E' }}>{v.name}</span>
                          </div>
                          <div style={{ fontWeight: 700, color: '#3E1D08', fontVariantNumeric: 'tabular-nums' }}>
                            {formatPrice(v.price, currencyCode)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#6B5A48' }}>الكمية</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  marginRight: 'auto',
                  background: '#FFFFFF', borderRadius: 999, padding: 4,
                  border: '1px solid #E3D2B0',
                }}>
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    style={qtyBtn}
                  >
                    <Minus style={{ width: 15, height: 15 }} />
                  </button>
                  <div style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 16, color: '#2B1B0E' }}>
                    {qty}
                  </div>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    style={qtyBtn}
                  >
                    <Plus style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA footer */}
          <div style={{ padding: '12px 20px 24px', borderTop: '1px solid #E3D2B0', background: '#FBF3E4' }}>
            {cartQty > 0 ? (
              <div style={{ display: 'flex', gap: 10 }}>
                {/* Remove/decrease */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  background: '#FFFFFF', borderRadius: 999, padding: 4,
                  border: '1px solid #E3D2B0', flex: 1,
                  justifyContent: 'center',
                }}>
                  <button onClick={() => { onRemove(item.id, selectedVariant?.name); }} style={qtyBtn}>
                    <Minus style={{ width: 15, height: 15 }} />
                  </button>
                  <div style={{ minWidth: 32, textAlign: 'center', fontWeight: 700, fontSize: 17, color: '#2B1B0E' }}>
                    {cartQty}
                  </div>
                  <button onClick={() => { onAdd(item, selectedVariant?.name, selectedVariant?.price); }} style={qtyBtn}>
                    <Plus style={{ width: 15, height: 15 }} />
                  </button>
                </div>
                {/* Done */}
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, minHeight: 52, borderRadius: 999,
                    background: '#E89B2C', color: '#3E1D08',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
                  }}
                >
                  تم
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                style={{
                  width: '100%', minHeight: 52, borderRadius: 999,
                  background: '#E89B2C', color: '#3E1D08',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0 20px',
                  boxShadow: '0 4px 12px rgba(232,155,44,.3)',
                }}
              >
                <span>أضف إلى السلة</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(total, currencyCode)}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 999,
  background: '#FBF3E4', border: 'none', color: '#6B3410',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};
