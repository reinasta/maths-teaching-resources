// src/app/api/components/[name]/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This is a server component that can use fs
export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  // Simple response with just the component name
  return NextResponse.json({ 
    componentName: params.name,
    status: 'ok'
  });
}