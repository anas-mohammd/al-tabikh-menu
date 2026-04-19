'use client';

import Image from 'next/image';
import { Restaurant } from '@/types';

interface Props {
  restaurant: Restaurant;
  cartCount: number;
  onCartClick: () => void;
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default function Header({ restaurant, cartCount, onCartClick }: Props) {
  return (
    <header style={{ background: '#FBF3E4', padding: '20px 16px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, maxWidth: 440, margin: '0 auto' }}>

        {/* Circular logo — right side (RTL first) */}
        <div style={{
          width: 56, height: 56, borderRadius: 999, overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(62,29,8,.15)',
          flexShrink: 0, background: '#F5E8CE',
        }}>
          <Image
            src={restaurant.logo_url || '/logo.jpg'}
            alt={restaurant.name}
            width={56} height={56}
            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          />
        </div>

        {/* Name + subtitle — center */}
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-rubik), Rubik, sans-serif',
            fontWeight: 800, fontSize: 22, color: '#3E1D08', lineHeight: 1.1,
          }}>
            {restaurant.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
            fontWeight: 900, fontSize: 10, letterSpacing: '.10em',
            color: '#6B3410', textTransform: 'uppercase', marginTop: 3,
          }}>
            AL TABIKH · SINCE 1973
          </div>
        </div>

        {/* Cart button — left side (RTL last) */}
        <button
          onClick={onCartClick}
          style={{
            width: 44, height: 44, borderRadius: 999,
            background: '#FFFFFF', border: '1px solid #E3D2B0',
            color: '#6B3410', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
            boxShadow: '0 1px 2px rgba(62,29,8,.06)',
            position: 'relative',
          }}
          aria-label="السلة"
        >
          <CartIcon />

          {/* Badge */}
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: -4, left: -4,
              minWidth: 18, height: 18,
              borderRadius: 999,
              background: '#E89B2C', color: '#3E1D08',
              fontSize: 10, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid #FBF3E4',
              lineHeight: 1,
            }}>
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>

      </div>
    </header>
  );
}
