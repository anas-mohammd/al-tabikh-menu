'use client';

import { MenuItem, CartItem, Offer } from '@/types';
import { formatPrice } from '@/lib/currencies';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

interface Props {
  item: MenuItem;
  currencyCode: string;
  cart: CartItem[];
  offers: Offer[];
  compact?: boolean;
  onAdd: (item: MenuItem, variantName?: string, variantPrice?: string) => void;
  onRemove: (itemId: string, variantName?: string) => void;
  onOpenDetail: (item: MenuItem) => void;
}

/* Deterministic gradient from item name */
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

function shortLabel(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export default function MenuItemCard({
  item, currencyCode, cart, offers, compact = false, onAdd, onRemove, onOpenDetail,
}: Props) {
  const hasVariants = item.variants && item.variants.length > 0;

  const totalQty = cart
    .filter((ci) => ci.item.id === item.id)
    .reduce((s, ci) => s + ci.quantity, 0);

  const applicableOffers = offers.filter(
    (o) => o.applicable_items.length === 0 || o.applicable_items.includes(item.id)
  );

  const displayPrice = hasVariants
    ? Math.min(...item.variants.map((v) => parseFloat(v.price))).toString()
    : item.price;

  const basePrice = parseFloat(displayPrice);
  const discountedPrice = applicableOffers.reduce((price, offer) => {
    const val = parseFloat(offer.discount_value);
    return offer.discount_type === 'percentage'
      ? price * (1 - val / 100)
      : Math.max(0, price - val);
  }, basePrice);
  const hasDiscount = applicableOffers.length > 0 && discountedPrice < basePrice;

  const handleAddClick = () => {
    if (hasVariants) onOpenDetail(item);
    else onAdd(item);
  };
  const handleRemoveClick = () => {
    if (hasVariants) onOpenDetail(item);
    else onRemove(item.id);
  };

  const formatOfferLabel = (offer: Offer) => {
    const val = parseFloat(offer.discount_value);
    return offer.discount_type === 'percentage'
      ? `خصم ${Number.isInteger(val) ? val : val}%`
      : `خصم ${val}`;
  };

  /* ── Thumbnail ─────────────────────────────────────── */
  const Thumb = ({ size }: { size: 'card' | 'grid' }) => (
    <div style={{
      marginTop:10,marginBottom: 10, marginRight:10,
      width: size === 'grid' ? '100%' : 90,
      minWidth: size === 'card' ? 90 : undefined,
      /* card: stretch to full card height; grid: fill aspect-ratio box */
      alignSelf: size === 'card' ? 'stretch' : undefined,
      height: size === 'grid' ? '100%' : undefined,
      borderRadius: size === 'grid' ? '20px 20px 0 0' : 14,
      overflow: 'hidden', flexShrink: 0, position: 'relative',
    }}>
      {item.image_url ? (
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          sizes={size === 'card' ? '90px' : '50vw'}
        />
      ) : (
        <div style={{
          
          width: '100%', height: '100%',
          background: thumbGradient(item.name),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FBF3E4', fontSize: size === 'grid' ? 22 : 13,
          fontWeight: 700, letterSpacing: '-0.01em',
        }}>
          {shortLabel(item.name)}
        </div>
      )}
      {/* Offer badge */}
      {applicableOffers.length > 0 && (
        <div style={{ position: 'absolute', top: 6, right: 6 }}>
          <span style={{
            background: '#C0392B', color: '#FFFFFF',
            fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 999,
          }}>
            {formatOfferLabel(applicableOffers[0])}
          </span>
        </div>
      )}
    </div>
  );

  /* ── Grid card ─────────────────────────────────────── */
  if (compact) {
    return (
      <div
        className="item-card fade-in"
        onClick={() => onOpenDetail(item)}
        style={{
          background: '#FFFFFF', borderRadius: 20,
          boxShadow: '0 1px 2px rgba(62,29,8,.06), 0 2px 6px rgba(62,29,8,.04)',
          overflow: 'hidden', cursor: 'pointer',
          transition: 'transform 150ms cubic-bezier(.2,.8,.2,1)',
        }}
        onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(.99)'; }}
        onMouseUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
      >
        <div style={{ aspectRatio: '1/1', position: 'relative', width: '100%' }}>
          <Thumb size="grid" />
          {totalQty > 0 && (
            <div style={{
              position: 'absolute', top: 8, left: 8,
              width: 22, height: 22, borderRadius: 999,
              background: '#E89B2C', color: '#3E1D08',
              fontSize: 11, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{totalQty}</div>
          )}
        </div>
        <div style={{ padding: '10px 12px 12px' }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#2B1B0E', lineHeight: 1.3, marginBottom: 6 }}>
            {item.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#3E1D08', fontVariantNumeric: 'tabular-nums' }}>
              {hasVariants && <span style={{ fontSize: 11, color: '#6B5A48', fontWeight: 500, marginInlineEnd: 3 }}>من</span>}
              {hasDiscount
                ? <span style={{ color: '#C0392B' }}>{formatPrice(discountedPrice, currencyCode)}</span>
                : formatPrice(displayPrice, currencyCode)
              }
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleAddClick(); }}
              style={{
                width: 32, height: 32, borderRadius: 999,
                background: '#E89B2C', color: '#3E1D08',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(62,29,8,.15)',
                flexShrink: 0,
              }}
              aria-label="أضف"
            >
              <Plus style={{ width: 16, height: 16, strokeWidth: 2.5 }} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── List card ─────────────────────────────────────── */
  return (
    <div
      className="item-card fade-in"
      onClick={() => onOpenDetail(item)}
      style={{
        background: '#FFFFFF', borderRadius: 20,
        boxShadow: '0 1px 2px rgba(62,29,8,.06), 0 2px 6px rgba(62,29,8,.04)',
        padding: 0, display: 'flex', gap: 0,
        overflow: 'hidden',
        height: 110,           /* ← fixed height → all cards identical */
        cursor: 'pointer',
        transition: 'transform 150ms cubic-bezier(.2,.8,.2,1)',
      }}
      onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(.99)'; }}
      onMouseUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ''; }}
    >
      {/* Thumb — first in JSX = RIGHT side in RTL */}
      <Thumb size="card" />

      {/* Content — second in JSX = LEFT side in RTL */}
      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0,
        padding: '10px 14px 10px 12px',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        {/* Top: name + description */}
        <div>
          <div style={{
            fontWeight: 700, fontSize: 15, color: '#2B1B0E', lineHeight: 1.3,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {item.name}
          </div>
          {item.description && (
            <div style={{
              fontSize: 12, color: '#6B5A48', lineHeight: 1.4, marginTop: 3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {item.description}
            </div>
          )}
        </div>

        {/* Price + action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#3E1D08', fontVariantNumeric: 'tabular-nums' }}>
            {hasVariants && <span style={{ fontSize: 11, color: '#6B5A48', fontWeight: 500, marginInlineEnd: 4 }}>من</span>}
            {hasDiscount ? (
              <span style={{ color: '#110201' }}>{formatPrice(discountedPrice, currencyCode)}</span>
            ) : (
              formatPrice(displayPrice, currencyCode)
            )}
          </div>

          {totalQty === 0 ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleAddClick(); }}
              style={{
                width: 36, height: 36, borderRadius: 999,
                background: '#E89B2C', color: '#3E1D08',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 2px rgba(62,29,8,.15)',
                flexShrink: 0,
              }}
              aria-label="أضف"
            >
              <Plus style={{ width: 18, height: 18, strokeWidth: 2.5 }} />
            </button>
          ) : hasVariants ? (
            <button
              onClick={(e) => { e.stopPropagation(); onOpenDetail(item); }}
              style={{
                width: 36, height: 36, borderRadius: 999,
                background: '#FBF3E4', border: '1px solid #E3D2B0',
                color: '#6B3410', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 13, flexShrink: 0,
              }}
            >
              {totalQty}
            </button>
          ) : (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex', alignItems: 'center', gap: 0,
                background: '#FBF3E4', borderRadius: 999, padding: 3,
                border: '1px solid #E3D2B0', flexShrink: 0,
              }}
            >
              <button onClick={handleRemoveClick} style={qtyBtnStyle}>
                <Minus style={{ width: 14, height: 14 }} />
              </button>
              <div style={{ minWidth: 26, textAlign: 'center', fontWeight: 700, fontSize: 15, color: '#2B1B0E' }}>
                {totalQty}
              </div>
              <button onClick={handleAddClick} style={qtyBtnStyle}>
                <Plus style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 999,
  background: '#FFFFFF', border: 'none', color: '#6B3410',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
};
