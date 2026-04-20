'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const hold = setTimeout(() => setPhase('hold'), 600);
    const out  = setTimeout(() => setPhase('out'),  1800);
    const done = setTimeout(onDone,                  2400);
    return () => { clearTimeout(hold); clearTimeout(out); clearTimeout(done); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 100,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #FBF3E4 0%, #F5E8CE 100%)',
        opacity: phase === 'out' ? 0 : 1,
        transition: 'opacity 0.6s ease',
      }}
    >
      {/* Logo */}
      <div style={{
        transform: phase === 'in' ? 'scale(0.85)' : 'scale(1)',
        opacity: phase === 'in' ? 0 : 1,
        transition: 'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.6s ease',
        width: 140, height: 140, borderRadius: 999, overflow: 'hidden',
        boxShadow: '0 10px 32px rgba(62,29,8,.18)',
      }}>
        <Image
          src="/logo.jpg"
          alt="مطاعم الطبيخ"
          width={140}
          height={140}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          priority
        />
      </div>

      {/* Restaurant name */}
      <div style={{
        opacity: phase === 'in' ? 0 : 1,
        transition: 'opacity 0.4s ease 0.2s',
        marginTop: 20, textAlign: 'center',
      }}>
        <div style={{ fontWeight: 800, fontSize: 22, color: '#3E1D08' }}>مطاعم الطبيخ</div>
        <div style={{
          fontFamily: 'var(--font-playfair), "Playfair Display", Georgia, serif',
          fontWeight: 900, fontSize: 10, letterSpacing: '.12em',
          color: '#6B3410', textTransform: 'uppercase', marginTop: 4,
        }}>
          AL TABIKH · SINCE 1973
        </div>
      </div>

      {/* Dots */}
      <div style={{
        display: 'flex', gap: 6, marginTop: 28,
        opacity: phase === 'in' ? 0 : 1,
        transition: 'opacity 0.4s ease 0.35s',
      }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 6, height: 6, borderRadius: 999,
              background: '#8A5228',
              animation: `splashBounce 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
