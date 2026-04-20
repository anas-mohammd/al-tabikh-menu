'use client';

import { useState } from 'react';
import { ReviewCreate, Restaurant } from '@/types';
import { menuApi } from '@/lib/api';
import { Star, Loader2, X, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  slug: string;
  cartVisible?: boolean;
  restaurant?: Restaurant;
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.522 5.849L0 24l6.351-1.498A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.667-.502-5.198-1.381l-.373-.221-3.87.913.975-3.764-.242-.386A9.944 9.944 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.72-.86a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z" />
    </svg>
  );
}

function StarIcon({ filled, size = 34 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? '#E89B2C' : 'none'} stroke={filled ? '#E89B2C' : '#D8C7A8'} strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function ReviewSection({ slug, restaurant }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<ReviewCreate>({ customer_name: '', rating: 0, comment: '' });
  const [hovered, setHovered] = useState(0);

  const hasSocial = restaurant && (restaurant.whatsapp_number || restaurant.instagram_url || restaurant.phone_number);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.rating === 0) { toast.error('يرجى اختيار عدد النجوم'); return; }
    setSubmitting(true);
    try {
      await menuApi.submitReview(slug, {
        customer_name: form.customer_name,
        rating: form.rating,
        comment: form.comment || undefined,
      });
      setSent(true);
      setTimeout(() => { setSent(false); setForm({ customer_name: '', rating: 0, comment: '' }); setOpen(false); }, 1400);
    } catch {
      toast.error('تعذّر إرسال التقييم، حاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ── Rating banner (inline) ─────────────────────── */}
      <div style={{ padding: '4px 16px' }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            width: '100%', background: '#FFFFFF',
            border: '1px dashed #E3D2B0', borderRadius: 16,
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', textAlign: 'right',
            boxShadow: 'var(--shadow-1)',
          }}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 999,
            background: '#FBF3E4', color: '#E89B2C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <StarIcon filled size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#2B1B0E' }}>رأيك يهمنا</div>
            <div style={{ fontSize: 12, color: '#6B5A48' }}>قيّم تجربتك معنا — خاص وسري.</div>
          </div>
          <ChevronLeft style={{ width: 16, height: 16, color: '#9B8A74' }} />
        </button>
      </div>

      {/* ── Contact strip (inline) ─────────────────────── */}
      {hasSocial && (
        <div style={{ padding: '24px 16px 100px', textAlign: 'center' }}>
          <div style={{
            fontSize: 12, fontWeight: 700, letterSpacing: '.10em',
            color: '#6B3410', textTransform: 'uppercase', marginBottom: 16,
          }}>
            تواصل معنا
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            {restaurant?.phone_number && (
              <a href={`tel:${restaurant.phone_number}`} style={socialLink}>
                <div style={{ ...socialCircle, background: '#6B3410' }}>
                  <PhoneIcon />
                </div>
                <span style={socialLabel}>اتصال</span>
              </a>
            )}
            {restaurant?.whatsapp_number && (
              <a href={`https://wa.me/${restaurant.whatsapp_number}`} target="_blank" rel="noopener noreferrer" style={socialLink}>
                <div style={{ ...socialCircle, background: '#25D366' }}>
                  <WhatsAppIcon />
                </div>
                <span style={socialLabel}>واتساب</span>
              </a>
            )}
            {restaurant?.instagram_url && (
              <a
                href={restaurant.instagram_url.startsWith('http') ? restaurant.instagram_url : `https://instagram.com/${restaurant.instagram_url}`}
                target="_blank" rel="noopener noreferrer" style={socialLink}
              >
                <div style={{ ...socialCircle, background: 'linear-gradient(135deg, #F58529, #DD2A7B 55%, #8134AF)' }}>
                  <InstagramIcon />
                </div>
                <span style={socialLabel}>إنستغرام</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* ── Rating sheet ──────────────────────────────── */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 50,
              background: 'rgba(43,27,14,0.55)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />
          <div className="sheet-up" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50 }}>
            <div style={{
              background: '#FBF3E4', maxWidth: 440, margin: '0 auto',
              borderTopLeftRadius: 28, borderTopRightRadius: 28,
              padding: '16px 20px 28px',
              boxShadow: '0 -10px 32px rgba(62,29,8,.18)',
            }}>
              <div style={{ width: 40, height: 4, background: '#E3D2B0', borderRadius: 999, margin: '0 auto 14px' }} />

              {sent ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <div style={{ fontWeight: 800, fontSize: 22, color: '#3E1D08' }}>شكراً لك</div>
                  <div style={{ fontSize: 14, color: '#6B5A48', marginTop: 6 }}>وصل تقييمك للإدارة.</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 22, color: '#3E1D08' }}>رأيك يهمنا</div>
                    <button
                      onClick={() => setOpen(false)}
                      style={{
                        width: 34, height: 34, borderRadius: 999,
                        background: '#FFFFFF', border: '1px solid #E3D2B0',
                        color: '#6B3410', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X style={{ width: 15, height: 15 }} />
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: '#6B5A48', marginBottom: 20 }}>
                    تقييمك خاص ولن يظهر في القائمة.
                  </div>

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Stars */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, direction: 'ltr', margin: '4px 0' }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm({ ...form, rating: n })}
                          onMouseEnter={() => setHovered(n)}
                          onMouseLeave={() => setHovered(0)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}
                        >
                          <StarIcon filled={n <= (hovered || form.rating)} size={36} />
                        </button>
                      ))}
                    </div>

                    {/* Name */}
                    <input
                      type="text"
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                      placeholder="اسمك (اختياري)"
                      style={{
                        height: 48, padding: '0 14px', borderRadius: 14,
                        border: '1px solid #E3D2B0', background: '#FFFFFF',
                        fontFamily: 'inherit', fontSize: 15, color: '#2B1B0E',
                        direction: 'rtl', outline: 'none', width: '100%',
                      }}
                    />

                    <textarea
                      value={form.comment}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      placeholder="تعليق (اختياري)"
                      rows={3}
                      style={{
                        width: '100%', minHeight: 88, padding: 14,
                        borderRadius: 14, border: '1px solid #E3D2B0',
                        background: '#FFFFFF', fontFamily: 'inherit', fontSize: 14,
                        resize: 'none', direction: 'rtl', color: '#2B1B0E', outline: 'none',
                      }}
                    />

                    <button
                      type="submit"
                      disabled={submitting || form.rating === 0}
                      style={{
                        width: '100%', minHeight: 50, borderRadius: 999,
                        background: form.rating > 0 ? '#6B3410' : '#D8C7A8',
                        color: '#FBF3E4', border: 'none',
                        cursor: form.rating > 0 ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit', fontWeight: 700, fontSize: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                    >
                      {submitting
                        ? <Loader2 style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} />
                        : 'إرسال التقييم'
                      }
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

const socialLink: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  textDecoration: 'none',
};
const socialCircle: React.CSSProperties = {
  width: 56, height: 56, borderRadius: 999,
  color: '#FFFFFF',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(62,29,8,.15)',
};
const socialLabel: React.CSSProperties = {
  fontSize: 11, color: '#6B5A48', fontWeight: 600,
};
