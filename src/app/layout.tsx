import type { Metadata } from 'next';
import { Rubik, Playfair_Display } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/lib/theme';
import './globals.css';

const rubik = Rubik({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-rubik',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'OrionMenu — قائمة المطعم',
  description: 'تفضل بتصفح قائمة مطعمنا وأرسل طلبك مباشرةً عبر واتساب',
  icons: { icon: [] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${rubik.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:," />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ fontFamily: 'var(--font-rubik), Tajawal, Cairo, system-ui, sans-serif', background: '#FBF3E4', color: '#2B1B0E' }}
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#FFFFFF',
                color: '#2B1B0E',
                border: '1px solid #E3D2B0',
                fontFamily: 'var(--font-rubik), system-ui, sans-serif',
                direction: 'rtl',
                boxShadow: '0 4px 12px rgba(62,29,8,.12)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
