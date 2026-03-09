import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from 'next-themes'
import { AppProvider } from '@/lib/app-context'
import { Navbar } from '@/components/navbar'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: 'KrishiBot AI Pro - Smart Multilingual Farming Assistant',
  description: 'AI-powered smart farming platform with irrigation control, soil monitoring, weather updates, and multilingual voice assistant for Indian farmers.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2e7d32' },
    { media: '(prefers-color-scheme: dark)', color: '#1b5e20' },
  ],
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AppProvider>
            <div className="flex min-h-screen flex-col bg-background">
              <Navbar />
              {children}
            </div>
          </AppProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}