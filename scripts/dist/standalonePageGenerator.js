export function generateStandalonePage(entry) {
    const { componentName, description } = entry;
    const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const displayName = componentName.replace(/([A-Z])/g, ' $1').trim();
    return `"use client";
import React, { useState, useEffect } from "react";
import ${componentName} from "@/components/${componentName}";
import StandaloneLayout from "@/components/StandaloneLayout";

export default function ${componentName}Page() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
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
      <h1 className="text-3xl font-bold mb-6">${displayName} Video</h1>
      <p className="mb-8">
        ${description}
      </p>
      <${componentName} />
    </StandaloneLayout>
  );
}
`;
}
