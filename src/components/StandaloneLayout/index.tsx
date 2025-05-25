// src/components/StandaloneLayout/index.tsx
import React from 'react';
import NavigationHeader from '../NavigationHeader'

interface StandaloneLayoutProps {
  children: React.ReactNode;
}

export default function StandaloneLayout({ children }: StandaloneLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}