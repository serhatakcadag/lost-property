import React from 'react';
import Layout from '@/components/layout/Layout';

export default function FoundItemsPage() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Found Items</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <p className="text-gray-500">Report items you've found here. Coming soon...</p>
        </div>
      </div>
    </Layout>
  );
} 