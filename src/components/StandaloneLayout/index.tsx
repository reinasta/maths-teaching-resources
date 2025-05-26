// src/components/StandaloneLayout/index.tsx
import React from 'react';
import NavigationHeader from '../NavigationHeader'

interface StandaloneLayoutProps {
  children: React.ReactNode;
}

export default function StandaloneLayout({ children }: StandaloneLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <NavigationHeader />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}