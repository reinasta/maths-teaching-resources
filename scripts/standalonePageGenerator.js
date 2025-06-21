"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStandalonePage = generateStandalonePage;
function generateStandalonePage(entry) {
    const { componentName, description } = entry;
    const kebabName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    const displayName = componentName.replace(/([A-Z])/g, ' $1').trim();
    return `"use client";
import React from "react";
import ${componentName} from "@/components/${componentName}";
import StandaloneLayout from "@/components/StandaloneLayout";

export default function ${componentName}Page() {
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
