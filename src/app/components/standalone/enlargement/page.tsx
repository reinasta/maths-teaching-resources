'use client';

import Enlargement from '@/components/Enlargement';
import StandaloneLayout from '@/components/StandaloneLayout';

export default function EnlargementPage() {
  return (
    <StandaloneLayout>
      <h1 className="text-3xl font-bold mb-6">Enlargement Videos</h1>
      <p className="mb-8">Learn about enlargement and scale factors with these video demonstrations.</p>
      
      <Enlargement />
    </StandaloneLayout>
  );
}