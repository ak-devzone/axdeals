import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, AlertCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-10 animate-pulse"></div>
        <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 relative z-10">
          <AlertCircle size={48} className="text-indigo-600" />
        </div>
      </div>
      
      <h1 className="text-8xl font-black text-slate-900 mb-4 tracking-tighter">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Looking for something?</h2>
      <p className="text-slate-500 max-w-md mb-10 font-medium leading-relaxed">
        We're sorry, but the page you are looking for doesn't exist or has been moved. 
        Try searching for products or return to the homepage.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
          <Home size={20} />
          Go Home
        </Link>
        <Link to="/products" className="flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95">
          <Search size={20} />
          Explore Deals
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
