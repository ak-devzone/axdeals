import React from 'react';

const AffiliateDisclosure = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 prose prose-slate max-w-none">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Affiliate Disclosure</h1>

        <p className="text-lg text-slate-700 mb-6">Transparency is important to us.</p>
        <p className="mb-2 text-slate-700">AXDeals participates in various affiliate marketing programs.</p>
        <p className="mb-2 text-slate-700">This means that some links on this website are affiliate links.</p>
        <p className="mb-8 text-slate-700">If you click an affiliate link and make a purchase, we may receive a commission at no additional cost to you.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Affiliate Programs</h2>
        <p>We may participate in:</p>
        <ul className="list-disc pl-5 mb-8 text-slate-700">
          <li>Amazon Associates</li>
          <li>Flipkart Affiliate Program</li>
          <li>EarnKaro</li>
          <li>Cuelinks</li>
          <li>Impact</li>
          <li>CJ Affiliate</li>
          <li>ShareASale</li>
          <li>Other affiliate networks</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Our Promise</h2>
        <ul className="list-disc pl-5 mb-8 text-slate-700">
          <li>We only recommend products we believe provide value.</li>
          <li>Affiliate commissions do not affect our reviews or recommendations.</li>
          <li>Our goal is to provide honest and useful information.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">No Additional Cost</h2>
        <p className="mb-8 text-slate-700">Using our affiliate links does not increase the price you pay.</p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Questions</h2>
        <p className="mb-2 text-slate-700">If you have any questions regarding this disclosure, contact us at:</p>
        <p className="text-slate-700"><a href="mailto:info.axdeals@gmail.com" className="text-rose-600 hover:underline">info.axdeals@gmail.com</a></p>
      </div>
    </div>
  );
};

export default AffiliateDisclosure;
