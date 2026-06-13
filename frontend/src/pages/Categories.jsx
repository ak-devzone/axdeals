import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../services/api';
import CategoryCard from '../components/CategoryCard';
import { Layers } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        setCategories(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="py-20 text-center animate-pulse">Loading categories...</div>;

  return (
    <div className="pb-20">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg">
          <Layers size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900">All Categories</h1>
          <p className="text-slate-500 font-medium">Browse products by their specific niche</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
};

export default Categories;
