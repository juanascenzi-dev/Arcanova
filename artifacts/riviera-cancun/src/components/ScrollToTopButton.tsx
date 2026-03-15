import { useState, useEffect } from 'react';

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '96px',
        right: '24px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'rgba(201, 168, 76, 0.92)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 15px rgba(201,168,76,0.35)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.2s ease',
        pointerEvents: visible ? 'auto' : 'none',
        zIndex: 800,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(201,168,76,0.55)';
        (e.currentTarget as HTMLButtonElement).style.transform = visible ? 'translateY(0) scale(1.1)' : 'translateY(16px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 15px rgba(201,168,76,0.35)';
        (e.currentTarget as HTMLButtonElement).style.transform = visible ? 'translateY(0) scale(1)' : 'translateY(16px)';
      }}
    >
      {/* Arrow up with wave accent */}
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
        <path d="M3 21c2-1.5 4 0 6-1.5S12 18 15 19.5s4 1.5 6 0" strokeWidth="1.8" opacity="0.65" />
      </svg>
    </button>
  );
}
