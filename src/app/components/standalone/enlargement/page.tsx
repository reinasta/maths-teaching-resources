'use client';

import Enlargement from '@/components/Enlargement';

export default function EnlargementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Enlargement Videos</h1>
      <p className="mb-8">Learn about enlargement and scale factors with these video demonstrations.</p>
      
      <Enlargement />
    </div>
  );
}