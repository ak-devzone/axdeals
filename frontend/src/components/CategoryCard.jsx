import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => {
  return (
    <Link 
      to={`/products?category=${category.slug}`}
      className="group relative flex flex-col items-center p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
    >
      <div className="w-16 h-16 mb-4 rounded-2xl overflow-hidden bg-slate-50 group-hover:scale-110 transition-transform duration-300">
        <img 
          src={category.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200'} 
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors uppercase tracking-wide">
        {category.name}
      </h3>
      <span className="mt-1 text-[10px] text-slate-400 font-medium">
        {category.product_count || 0} Products
      </span>
      
      {/* Decorative dots background on hover */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="grid grid-cols-2 gap-1">
          <div className="w-1 h-1 bg-indigo-200 rounded-full"></div>
          <div className="w-1 h-1 bg-indigo-100 rounded-full"></div>
          <div className="w-1 h-1 bg-indigo-50 rounded-full"></div>
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
