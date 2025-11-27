// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { Navigation } from '@/components/Navigation';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/context/ThemeContext';
import { StarryBackground } from '@/components/StarryBackground';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fi' }];
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const { locale } = params;
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <StarryBackground />
            <Navigation />
            <main className="container mx-auto px-6 py-8">
              {children}
              <Footer />
            </main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
