'use client';

import { Category } from '@/types';
import { useEffect, useRef } from 'react';

interface Props {
  categories: Category[];
  activeId: string | null;
  viewMode: 'list' | 'grid';
  onSelect: (id: string) => void;
  onViewChange: (mode: 'list' | 'grid') => void;
}

export default function CategoryNav({ categories, activeId, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !activeId) return;
    const btn = ref.current.querySelector(`[data-cat="${activeId}"]`) as HTMLElement;
    btn?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }, [activeId]);

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 30,
      padding: '10px 0 12px',
      background: 'rgba(251,243,228,0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E3D2B0',
    }}>
      <div
        ref={ref}
        className="no-scrollbar"
        style={{
          display: 'flex', gap: 8, overflowX: 'auto',
          padding: '0 16px', scrollSnapType: 'x mandatory',
          maxWidth: 440, margin: '0 auto',
        }}
      >
        {categories.map((cat) => {
          const active = activeId === cat.id;
          return (
            <button
              key={cat.id}
              data-cat={cat.id}
              onClick={() => onSelect(cat.id)}
              style={{
                flexShrink: 0,
                display: 'inline-flex', alignItems: 'center',
                padding: '10px 16px', borderRadius: 999,
                background: active ? '#6B3410' : '#FFFFFF',
                color: active ? '#FBF3E4' : '#2B1B0E',
                border: `1px solid ${active ? '#6B3410' : '#E3D2B0'}`,
                fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                minHeight: 40, cursor: 'pointer',
                scrollSnapAlign: 'start',
                transition: 'all 150ms cubic-bezier(.2,.8,.2,1)',
                boxShadow: active ? '0 2px 8px rgba(107,52,16,.25)' : '0 1px 2px rgba(62,29,8,.04)',
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
