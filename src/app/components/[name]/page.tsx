// src/app/components/[name]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import StandaloneLayout from '@/components/StandaloneLayout';

export default function ComponentPage({ params }: { params: { name: string } }) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [params.name]);
  
  if (loading) return <StandaloneLayout><div>Loading...</div></StandaloneLayout>;
  
  return (
    <StandaloneLayout>
      <h1>{params.name}</h1>
      <p>Component details will be displayed here</p>
      <div className="component-container">
        {/* Component rendering logic goes here */}
      </div>
    </StandaloneLayout>
  );
}