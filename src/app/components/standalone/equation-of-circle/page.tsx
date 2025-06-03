'use client';

import React, { useState, useEffect } from 'react';
import EquationOfCircle from '@/components/EquationOfCircle';
import StandaloneLayout from '@/components/StandaloneLayout';

export default function EquationOfCirclePage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple loading simulation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <StandaloneLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </StandaloneLayout>
    );
  }

  return (
    <StandaloneLayout>
      <h1 className="text-3xl font-bold mb-6">Equation of a Circle Video</h1>
      <p className="mb-8">Watch this video demonstration about the equation of a circle with centre (a,b).</p>
      <EquationOfCircle />
    </StandaloneLayout>
  );
}
