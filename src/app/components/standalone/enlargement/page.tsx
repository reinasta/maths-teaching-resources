"use client";
import React from "react";
import Enlargement from "@/components/Enlargement";
import StandaloneLayout from "@/components/StandaloneLayout";

export default function EnlargementPage() {
  return (
    <StandaloneLayout>
      <h1 className="text-3xl font-bold mb-6">Enlargement Video</h1>
      <p className="mb-8">
        Video about enlargement transformations in geometry.
      </p>
      <Enlargement />
    </StandaloneLayout>
  );
}
