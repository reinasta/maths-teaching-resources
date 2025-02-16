// src/app/layout.tsx
import type { Metadata } from 'next'
import { Fira_Sans } from 'next/font/google'
import './globals.css'

const fira = Fira_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fira'
})

export const metadata: Metadata = {
  title: 'Mathematics Teaching Resources',
  description: 'Interactive mathematics teaching resources focusing on unit conversions and coordinate geometry',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${fira.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}