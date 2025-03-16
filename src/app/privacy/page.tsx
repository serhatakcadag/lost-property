import React from 'react';
import Layout from '@/components/layout/Layout';

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Name and contact information</li>
              <li>Account credentials</li>
              <li>Information about lost or found items</li>
              <li>Location data related to lost or found items</li>
              <li>Communications between users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Facilitate connections between users who have lost and found items</li>
              <li>Improve our services and develop new features</li>
              <li>Ensure platform safety and security</li>
              <li>Communicate with you about your account and our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your personal
              information. However, no security system is impenetrable and we cannot guarantee the
              security of our systems 100%.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@lostfound.com" className="text-primary-600 hover:text-primary-700">
                privacy@lostfound.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
} 