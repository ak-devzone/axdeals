import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 prose prose-slate max-w-none">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-500 font-medium mb-8">Last Updated: June 2026</p>

        <p className="text-lg text-slate-700 mb-8">Welcome to AXDeals. We respect your privacy and are committed to protecting your personal information.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Information We Collect</h2>
        <p>We may collect:</p>
        <ul className="list-disc pl-5 mb-6 text-slate-700">
          <li>Name</li>
          <li>Email Address</li>
          <li>IP Address</li>
          <li>Browser Information</li>
          <li>Device Information</li>
          <li>Cookies and Tracking Data</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">How We Use Information</h2>
        <p>We use collected information to:</p>
        <ul className="list-disc pl-5 mb-6 text-slate-700">
          <li>Improve website performance</li>
          <li>Respond to user inquiries</li>
          <li>Analyze website traffic</li>
          <li>Personalize user experience</li>
          <li>Prevent fraud and abuse</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Affiliate Links</h2>
        <p className="mb-6 text-slate-700">Our website contains affiliate links. When you click an affiliate link and make a purchase, we may earn a commission at no additional cost to you.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Cookies</h2>
        <p>We use cookies and third-party tracking technologies to:</p>
        <ul className="list-disc pl-5 mb-6 text-slate-700">
          <li>Remember user preferences</li>
          <li>Track affiliate referrals</li>
          <li>Measure website analytics</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Third-Party Services</h2>
        <p>We may use:</p>
        <ul className="list-disc pl-5 mb-4 text-slate-700">
          <li>Google Analytics</li>
          <li>Amazon Associates</li>
          <li>Flipkart Affiliate Program</li>
          <li>Other Affiliate Networks</li>
        </ul>
        <p className="mb-6 text-slate-700">These services may collect information according to their own privacy policies.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Data Security</h2>
        <p className="mb-6 text-slate-700">We implement reasonable security measures to protect your information.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Changes to This Policy</h2>
        <p className="mb-6 text-slate-700">We may update this Privacy Policy at any time. Updates will be posted on this page.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Contact Us</h2>
        <p className="text-slate-700">Email: <a href="mailto:info.axdeals@gmail.com" className="text-rose-600 hover:underline">info.axdeals@gmail.com</a></p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
