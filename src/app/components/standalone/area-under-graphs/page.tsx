"use client";
import React from "react";
import AreaUnderGraphs from "@/components/AreaUnderGraphs";
import StandaloneLayout from "@/components/StandaloneLayout";

export default function AreaUnderGraphsPage() {
  return (
    <StandaloneLayout>
      <h1 className="text-3xl font-bold mb-6">Area Under Graphs Video</h1>
      <p className="mb-8">
        Video demonstration about calculating the area under graphs.
      </p>
      <AreaUnderGraphs />
    </StandaloneLayout>
  );
}
