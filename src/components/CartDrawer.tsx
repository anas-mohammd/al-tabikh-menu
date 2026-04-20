'use client';

import { useState } from 'react';
import { CartItem, OrderPayload } from '@/types';
import { formatPrice } from '@/lib/currencies';
import { X, Plus, Minus, Loader2 } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  items: CartItem[];
  currencyCode: string;
  discountAmount?: number;
  onClose: () => void;
  onAdd: (itemId: string, variantName?: string) => void;
  onRemove: (itemId: string, variantName?: string) => void;
  onClear: () => void;
  onSubmit: (payload: OrderPayload) => Promise<void>;
}

/* Deterministic gradient — same palette as MenuItemCard */
const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #6B3410 0%, #3E1D08 100%)',
  'linear-gradient(135deg, #E89B2C 0%, #C97D14 100%)',
  'linear-gradient(135deg, #C0392B 0%, #8B1A0E 100%)',
  'linear-gradient(135deg, #8A5228 0%, #6B3410 100%)',
  'linear-gradient(135deg, #E89B2C 0%, #C0392B 100%)',
  'linear-gradient(135deg, #3E1D08 0%, #6B3410 100%)',
];
function thumbGradient(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return THUMB_GRADIENTS[Math.abs(hash) % THUMB_GRADIENTS.length];
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.849L0 24l6.351-1.498A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.502-5.198-1.381l-.373-.221-3.87.913.975-3.764-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

export default function CartDrawer({
  open, items, currencyCode, discountAmount = 0,
  onClose, onAdd, onRemove, onClear, onSubmit,
}: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const effectivePrice = (ci: CartItem) => parseFloat(ci.variantPrice ?? ci.item.price);
  const rawTotal = items.reduce((sum, ci) => sum + effectivePrice(ci) * ci.quantity, 0);
  const total = rawTotal - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (phone.trim().length < 7) {
      toast.error('رقم الجوال يجب أن يتكون من 7 أرقام على الأقل');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        customer_name: name.trim(),
        customer_phone: phone.trim(),
        items: items.map((ci) => ({
          item_id: ci.item.id,
          quantity: ci.quantity,
          ...(ci.variantName ? { variant_name: ci.variantName } : {}),
        })),
        notes: notes.trim() || undefined,
      });
      setName(''); setPhone(''); setNotes('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 50,
          background: 'rgba(43,27,14,0.45)',
          backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 280ms ease',
        }}
      />

      {/* Bottom sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 300ms cubic-bezier(.2,.8,.2,1)',
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: '#FBF3E4', maxWidth: 440, margin: '0 auto',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 -10px 40px rgba(62,29,8,.20)',
          }}
        >
          {/* Handle */}
          <div style={{ width: 40, height: 4, background: '#D8C8A8', borderRadius: 999, margin: '12px auto 0', flexShrink: 0 }} />

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px 10px', flexShrink: 0,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 38, height: 38, borderRadius: 999,
                background: '#FFFFFF', border: '1.5px solid #E3D2B0',
                color: '#6B3410', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <X style={{ width: 17, height: 17, strokeWidth: 2.2 }} />
            </button>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#2B1B0E' }}>سلة الطلبات</div>
          </div>

          {/* Scrollable body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 0', minHeight: 0 }}>

            {/* ── Cart items ── */}
            {items.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: '#9B8A74', fontSize: 14 }}>
                سلتك فارغة. تصفح القائمة وأضف ما يعجبك.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 4 }}>
                {items.map((ci) => {
                  const key = ci.variantName ? `${ci.item.id}::${ci.variantName}` : ci.item.id;
                  const price = effectivePrice(ci);
                  return (
                    <div key={key} style={{
                      display: 'flex', gap: 12, alignItems: 'center',
                      background: '#FFFFFF', borderRadius: 18, padding: '10px 12px',
                      boxShadow: '0 1px 2px rgba(62,29,8,.05), 0 2px 6px rgba(62,29,8,.04)',
                    }}>
                      {/* Qty stepper — LEFT in RTL (last JSX child) → put it first so it's on the right...
                          Actually: in RTL first=right, last=left.
                          We want stepper on LEFT → it should be LAST in JSX */}

                      {/* Thumbnail — FIRST = RIGHT in RTL */}
                      <div style={{
                        width: 54, height: 54, borderRadius: 12,
                        overflow: 'hidden', flexShrink: 0, position: 'relative',
                      }}>
                        {ci.item.image_url ? (
                          <Image
                            src={ci.item.image_url}
                            alt={ci.item.name}
                            width={54} height={54}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%', height: '100%',
                            background: thumbGradient(ci.item.name),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#FBF3E4', fontSize: 11, fontWeight: 700,
                          }}>
                            {ci.item.name.split(/\s+/)[0]}
                          </div>
                        )}
                      </div>

                      {/* Name + price */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#2B1B0E', lineHeight: 1.3 }}>
                          {ci.item.name}
                          {ci.variantName && (
                            <span style={{ fontSize: 12, color: '#9B8A74', fontWeight: 400, marginRight: 4 }}>
                              ({ci.variantName})
                            </span>
                          )}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#E89B2C', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                          {formatPrice(price * ci.quantity, currencyCode)}
                        </div>
                      </div>

                      {/* Qty stepper — LAST = LEFT in RTL */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        background: '#F5EAD6', borderRadius: 999, padding: '3px 4px',
                        flexShrink: 0,
                      }}>
                        {/* In RTL: first=right, last=left → Minus first (right), Plus last (left) → visual: + qty - */}
                        <button
                          type="button"
                          onClick={() => onRemove(ci.item.id, ci.variantName)}
                          style={qtyBtn}
                        >
                          <Minus style={{ width: 13, height: 13, strokeWidth: 2.5 }} />
                        </button>
                        <div style={{ minWidth: 24, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#2B1B0E' }}>
                          {ci.quantity}
                        </div>
                        <button
                          type="button"
                          onClick={() => onAdd(ci.item.id, ci.variantName)}
                          style={qtyBtn}
                        >
                          <Plus style={{ width: 13, height: 13, strokeWidth: 2.5 }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Customer info ── */}
            {items.length > 0 && (
              <div style={{ paddingTop: 20, paddingBottom: 4 }}>
                {/* Section label */}
                <div style={{
                  fontSize: 13, fontWeight: 700, color: '#9B8A74',
                  letterSpacing: '.08em', marginBottom: 10, textAlign: 'right',
                }}>
                  معلوماتك
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="الاسم"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                  <input
                    type="tel"
                    placeholder="رقم الهاتف"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    minLength={7}
                    style={{ ...inputStyle, direction: 'ltr', textAlign: 'right' }}
                  />
                  <textarea
                    placeholder="ملاحظات (اختياري)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    style={{ ...inputStyle, resize: 'none', height: 'auto', minHeight: 64, paddingTop: 12 }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── Footer: total + send ── */}
          {items.length > 0 && (
            <div style={{ padding: '14px 20px 28px', flexShrink: 0 }}>
              {/* Discount row */}
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#7A8451', fontSize: 13, fontWeight: 600 }}>
                    -{formatPrice(discountAmount, currencyCode)}
                  </span>
                  <span style={{ color: '#9B8A74', fontSize: 13 }}>الخصم</span>
                </div>
              )}
              {/* Total row */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 14,
              }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#2B1B0E', fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(total, currencyCode)}
                </div>
                <div style={{ fontSize: 14, color: '#9B8A74', fontWeight: 500 }}>المجموع</div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', minHeight: 54, borderRadius: 999,
                  background: loading ? '#C4A882' : '#8A6040',
                  color: '#FBF3E4',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'background 200ms',
                  boxShadow: '0 4px 14px rgba(107,52,16,.22)',
                }}
              >
                {loading
                  ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                  : <WhatsAppIcon />
                }
                {loading ? 'جاري الإرسال...' : 'إرسال الطلب عبر واتساب'}
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 999,
  background: '#FFFFFF', border: 'none', color: '#6B3410',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};

const inputStyle: React.CSSProperties = {
  height: 48, padding: '0 14px', borderRadius: 14,
  background: '#FFFFFF', border: '1px solid #E3D2B0',
  fontFamily: 'inherit', fontSize: 15, color: '#2B1B0E',
  direction: 'rtl', outline: 'none', width: '100%',
};
