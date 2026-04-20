'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CartItem, OrderPayload } from '@/types';
import { formatPrice } from '@/lib/currencies';
import { X, Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  items: CartItem[];
  currencyCode: string;
  total: number;
  discountAmount?: number;
  onClose: () => void;
  onSubmit: (payload: OrderPayload) => Promise<void>;
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.849L0 24l6.351-1.498A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.502-5.198-1.381l-.373-.221-3.87.913.975-3.764-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

export default function OrderModal({ open, items, currencyCode, total, discountAmount = 0, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 60,
          background: 'rgba(43,27,14,0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Bottom sheet */}
      <div className="slide-up" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 60 }}>
        <div style={{
          background: '#FBF3E4', maxWidth: 440, margin: '0 auto',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          boxShadow: '0 -10px 32px rgba(62,29,8,.18)',
        }}>
          {/* Handle */}
          <div style={{ width: 40, height: 4, background: '#E3D2B0', borderRadius: 999, margin: '12px auto 0' }} />

          <div style={{ padding: '12px 20px 28px' }}>
            {/* Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#3E1D08' }}>تفاصيل الطلب</div>
                <div style={{ fontSize: 12, color: '#9B8A74', marginTop: 2 }}>سيُرسَل طلبك عبر واتساب</div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: 999,
                  background: '#FFFFFF', border: '1px solid #E3D2B0',
                  color: '#6B3410', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Order summary */}
            <div style={{
              background: '#FFFFFF', borderRadius: 16, padding: '12px 14px', marginBottom: 16,
              border: '1px solid #E3D2B0',
            }}>
              {items.map((ci) => {
                const price = parseFloat(ci.variantPrice ?? ci.item.price);
                const key = ci.variantName ? `${ci.item.id}::${ci.variantName}` : ci.item.id;
                return (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: '#6B5A48' }}>
                      {ci.item.name}{ci.variantName ? ` (${ci.variantName})` : ''} × {ci.quantity}
                    </span>
                    <span style={{ color: '#3E1D08', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                      {formatPrice(price * ci.quantity, currencyCode)}
                    </span>
                  </div>
                );
              })}
              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A8451' }}>
                  <span>الخصم</span>
                  <span>-{formatPrice(discountAmount, currencyCode)}</span>
                </div>
              )}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 10, marginTop: 8, borderTop: '1px solid #E3D2B0',
              }}>
                <span style={{ color: '#6B5A48', fontSize: 14 }}>الإجمالي</span>
                <span style={{ fontWeight: 800, fontSize: 18, color: '#3E1D08', fontVariantNumeric: 'tabular-nums' }}>
                  {formatPrice(total, currencyCode)}
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                dir="ltr"
                style={{ ...inputStyle, textAlign: 'right' }}
              />
              <textarea
                placeholder="ملاحظات إضافية (اختياري)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                style={{ ...inputStyle, resize: 'none', minHeight: 70 }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', minHeight: 52, borderRadius: 999,
                  background: loading ? '#D8C7A8' : '#25D366', color: '#FFFFFF',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  marginTop: 4,
                }}
              >
                {loading ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : <WhatsAppIcon />}
                {loading ? 'جاري الإرسال...' : 'أرسل الطلب عبر واتساب'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  height: 48, padding: '0 14px', borderRadius: 14,
  background: '#FFFFFF', border: '1px solid #E3D2B0',
  fontFamily: 'inherit', fontSize: 15, color: '#2B1B0E',
  direction: 'rtl', outline: 'none', width: '100%',
};
