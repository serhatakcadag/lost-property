import React from 'react';
import Layout from '@/components/layout/Layout';

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">About LostFound</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="prose max-w-none">
            <p className="text-gray-500 mb-4">
              LostFound is a community-driven platform dedicated to helping people recover their lost belongings.
              We believe in the power of community and technology to reunite people with their valuable items.
            </p>
            <p className="text-gray-500">
              Our mission is to create a trusted space where people can easily report lost items and connect
              with those who have found them, making the process of recovering lost items simpler and more efficient.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 