// src/app/page.tsx
import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mathematics Teaching Resources
          </h1>
          <p className="text-xl text-gray-600">
            Interactive materials for teaching mathematical concepts
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Slides Section */}
          <section className="col-span-full mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Interactive Presentations
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link 
                href="/slides/conversion"
                className="block p-6 bg-white border border-gray-200 rounded-lg 
                         hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Unit Conversion Graphs
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Learn how to convert between different units using coordinate graphs
                </p>
              </Link>
            </div>
          </section>

          {/* Components Section */}
          <section className="col-span-full">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Interactive Tools
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Link 
                href="/components/standalone/conversion-graph"
                className="block p-6 bg-white border border-gray-200 rounded-lg 
                         hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Conversion Graph Tool
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Interactive tool for exploring unit conversions
                </p>
              </Link>
              
              <Link 
                href="/components/standalone/coordinate-plane"
                className="block p-6 bg-white border border-gray-200 rounded-lg 
                         hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Coordinate Plane
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Interactive coordinate system for plotting points
                </p>
              </Link>

              <Link
                href="/components/standalone/prism"
                className="block p-6 bg-white border border-gray-200 rounded-lg 
                         hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  3D Prism
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore an interactive 3D triangular prism with annotations and transformations.
                </p>
              </Link>

              <Link
                href="/components/standalone/enlargement"
                className="block p-6 bg-white border border-gray-200 rounded-lg 
                         hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Enlargement
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Watch video demonstrations about enlargement and scale factors
                </p>
              </Link>

              <Link 
                href="/components/standalone/trapezoidal-prism" 
                className="block p-6 bg-white border border-gray-200 rounded-lg 
                         hover:border-primary hover:shadow-md transition-all"
              >
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Trapezoidal Prism
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Explore the properties of a trapezoidal prism in 3D
                </p>
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="mt-16 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Mathematics Teaching Resources. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}