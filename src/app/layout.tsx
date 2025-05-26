// src/app/layout.tsx
import React from 'react'
import type { Metadata } from 'next'
import './globals.css'

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
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}