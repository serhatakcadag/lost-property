import React from 'react';
import Layout from '@/components/layout/Layout';

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using LostFound, you agree to be bound by these Terms of Service
              and all applicable laws and regulations. If you do not agree with any of these terms,
              you are prohibited from using or accessing this site.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Use of Service</h2>
            <p className="text-gray-600 mb-4">
              You agree to use LostFound only for lawful purposes and in a way that does not
              infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the platform.
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>You must provide accurate and truthful information</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must not misuse or abuse the platform's features</li>
              <li>You must not attempt to deceive or defraud other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Item Claims</h2>
            <p className="text-gray-600 mb-4">
              When claiming a found item:
            </p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>You must be able to prove ownership or legitimate connection to the item</li>
              <li>False claims may result in account termination</li>
              <li>LostFound is not responsible for any disputes between users</li>
              <li>We recommend meeting in safe, public locations for item exchanges</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Limitation of Liability</h2>
            <p className="text-gray-600">
              LostFound is not responsible for any loss, damage, or disputes arising from the use
              of our platform. We act solely as a platform to connect users and do not guarantee
              the return of lost items or the accuracy of found item reports.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Contact</h2>
            <p className="text-gray-600">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:terms@lostfound.com" className="text-primary-600 hover:text-primary-700">
                terms@lostfound.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
} 