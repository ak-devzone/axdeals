import React from 'react';

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 prose prose-slate max-w-none">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-slate-500 font-medium mb-8">Last Updated: June 2026</p>

        <p className="text-lg text-slate-700 mb-8">By accessing and using AXDeals, you agree to these Terms of Service.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Website Use</h2>
        <p>You agree to:</p>
        <ul className="list-disc pl-5 mb-6 text-slate-700">
          <li>Use the website legally</li>
          <li>Not attempt to hack or disrupt services</li>
          <li>Not copy content without permission</li>
          <li>Not misuse affiliate links</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Content Disclaimer</h2>
        <p className="mb-4 text-slate-700">Information provided on this website is for informational purposes only.</p>
        <p>We do not guarantee:</p>
        <ul className="list-disc pl-5 mb-4 text-slate-700">
          <li>Product availability</li>
          <li>Product pricing</li>
          <li>Product accuracy</li>
          <li>Merchant offers</li>
        </ul>
        <p className="mb-6 text-slate-700">Prices and offers may change without notice.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Affiliate Relationships</h2>
        <p className="mb-2 text-slate-700">Some links on this website are affiliate links.</p>
        <p className="mb-6 text-slate-700">We may receive commissions when purchases are made through these links.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Third-Party Websites</h2>
        <p>We are not responsible for:</p>
        <ul className="list-disc pl-5 mb-6 text-slate-700">
          <li>Third-party websites</li>
          <li>Product quality</li>
          <li>Delivery issues</li>
          <li>Refund policies</li>
          <li>External content</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Limitation of Liability</h2>
        <p className="mb-6 text-slate-700">AXDeals shall not be liable for any direct or indirect damages arising from the use of this website.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Changes to Terms</h2>
        <p className="mb-2 text-slate-700">We reserve the right to modify these Terms at any time.</p>
        <p className="mb-6 text-slate-700">Continued use of the website indicates acceptance of updated terms.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Contact</h2>
        <p className="text-slate-700">Email: <a href="mailto:info.axdeals@gmail.com" className="text-rose-600 hover:underline">info.axdeals@gmail.com</a></p>
      </div>
    </div>
  );
};

export default TermsOfService;
