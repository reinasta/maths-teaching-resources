// src/app/components/[name]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import StandaloneLayout from '@/components/StandaloneLayout';

export default function ComponentPage({ params }: { params: { name: string } }) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [params.name]);
  
  if (loading) return <StandaloneLayout><div>Loading...</div></StandaloneLayout>;
  
  return (
    <StandaloneLayout>
      <h1 className="text-3xl font-bold">{params.name}</h1>
      <p className="my-4">This component is under development.</p>
      <div className="component-container">
        {/* Basic placeholder content */}
        <p>Content will be added soon.</p>
      </div>
    </StandaloneLayout>
  );
}