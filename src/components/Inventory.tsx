import React, { useState, useRef } from 'react';
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, AlertCircle, Package, TrendingUp, LayoutGrid, List, Info, AlertTriangle, ShieldCheck, ShieldAlert, Image as ImageIcon, Upload, CheckCircle } from 'lucide-react';
import { Product, Order, BusinessSettings, Category } from '../types';

interface InventoryProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  orders: Order[];
  settings: BusinessSettings;
}

export default function Inventory({ products, setProducts, categories, setCategories, orders, settings }: InventoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageStatus, setImageStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    costPrice: 0,
    stock: 0,
    lowStockThreshold: 5,
    category: '',
    imageUrl: '',
    defaultDiscount: 0,
    defaultDiscountType: 'fixed',
    isDamaged: false
  });

  const allCategories = ['All', ...categories.map(c => c.name)];

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    if (editingCategory) {
      const oldName = editingCategory.name;
      const updatedCategory = { ...editingCategory, name: trimmedName };
      
      // Update categories
      setCategories(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
      
      // Update products that use this category name
      if (oldName !== trimmedName) {
        setProducts(products.map(p => p.category === oldName ? { ...p, category: trimmedName } : p));
      }
      
      setEditingCategory(null);
    } else {
      const category: Category = {
        id: Math.random().toString(36).substr(2, 9),
        name: trimmedName
      };
      setCategories([...categories, category]);
    }
    setNewCategoryName('');
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Are you sure? Products in this category will remain but their category label will be empty. (کیا آپ واقعی اس کیٹیگری کو حذف کرنا چاہتے ہیں؟)')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...newProduct, id: p.id } as Product : p));
    } else {
      const product: Product = {
        ...newProduct as Product,
        id: Math.random().toString(36).substr(2, 9),
      };
      setProducts([...products, product]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageStatus('idle');
    setNewProduct({ 
      name: '', 
      price: 0, 
      costPrice: 0, 
      stock: 0, 
      lowStockThreshold: 5,
      category: 'Apparel',
      imageUrl: '',
      defaultDiscount: 0,
      defaultDiscountType: 'fixed',
      isDamaged: false
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setImageStatus(product.imageUrl ? 'success' : 'idle');
    setIsModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? (کیا آپ واقعی اس پروڈکٹ کو حذف کرنا چاہتے ہیں؟)')) {
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  const toggleDamaged = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isDamaged: !p.isDamaged } : p
    ));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageStatus('uploading');
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result as string });
        setImageStatus('success');
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (p.category?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    
    let matchesStock = true;
    if (stockFilter === 'Out of Stock') matchesStock = p.stock <= 0;
    else if (stockFilter === 'Low Stock') matchesStock = p.stock > 0 && p.stock <= p.lowStockThreshold;
    else if (stockFilter === 'In Stock') matchesStock = p.stock > p.lowStockThreshold;

    return matchesSearch && matchesCategory && matchesStock;
  }).sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
    if (sortBy === 'price') comparison = a.price - b.price;
    if (sortBy === 'stock') comparison = a.stock - b.stock;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStockBadge = (stock: number, threshold: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-rose-50 text-rose-600 border-rose-100', dot: 'bg-rose-500' };
    if (stock <= threshold) return { label: 'Low Stock', color: 'bg-amber-50 text-amber-600 border-amber-100', dot: 'bg-amber-500' };
    return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-1 flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products... (پروڈکٹس تلاش کریں)"
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#00695C] text-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Package size={16} className="text-slate-400" />
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#00695C] text-sm"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-slate-400" />
            <select 
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#00695C] text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
            </select>
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-[#00695C]"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 transition-colors border border-indigo-100"
          >
            <LayoutGrid size={18} />
            Categories
          </button>
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-[#00695C]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-100 text-[#00695C]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#00695C] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#004D40] transition-colors shadow-lg shadow-[#00695C]/20"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const badge = getStockBadge(product.stock, product.lowStockThreshold);
            const profit = product.price - product.costPrice;
            const margin = ((profit / product.price) * 100).toFixed(0);

            return (
              <div key={product.id} className={`bg-white rounded-3xl border border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-300 relative ${product.isDamaged ? 'opacity-75 grayscale' : ''}`}>
                {product.isDamaged && (
                  <div className="absolute top-4 right-4 z-10 bg-rose-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1">
                    <AlertTriangle size={12} /> Damaged
                  </div>
                )}
                
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package size={64} />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border backdrop-blur-md flex items-center gap-2 ${badge.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{product.category}</p>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight">{product.name}</h4>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(product)} className="p-2 bg-slate-50 text-slate-400 hover:text-[#00695C] hover:bg-emerald-50 rounded-xl transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <button onClick={() => toggleDamaged(product.id)} className={`p-2 rounded-xl transition-colors ${product.isDamaged ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400 hover:text-rose-600'}`}>
                        {product.isDamaged ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-slate-400">Selling Price</p>
                      <p className="text-xl font-black text-[#00695C]">{settings.currencySymbol} {product.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Stock</p>
                      <p className="text-lg font-bold text-slate-700">{product.stock} Units</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                    <div className="bg-emerald-50 p-2 rounded-2xl">
                      <p className="text-[10px] text-emerald-600 font-bold uppercase">Potential Profit</p>
                      <p className="text-sm font-black text-emerald-700">{settings.currencySymbol} {profit.toLocaleString()}</p>
                    </div>
                    <div className="bg-indigo-50 p-2 rounded-2xl text-right">
                      <p className="text-[10px] text-indigo-600 font-bold uppercase">Margin</p>
                      <p className="text-sm font-black text-indigo-700">{margin}%</p>
                    </div>
                  </div>
                  
                  {product.defaultDiscount ? (
                    <div className="mt-3 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-700 uppercase">Default Discount</span>
                      <span className="text-xs font-black text-amber-700">
                        {product.defaultDiscountType === 'percentage' ? `${product.defaultDiscount}%` : `${settings.currencySymbol} ${product.defaultDiscount}`}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Purchase Price</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Selling Price</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Profit</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(product => {
                const badge = getStockBadge(product.stock, product.lowStockThreshold);
                const profit = product.price - product.costPrice;
                return (
                  <tr key={product.id} className={`hover:bg-slate-50 transition-colors group ${product.isDamaged ? 'opacity-60 grayscale' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400">
                          {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover" /> : <Package size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{product.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center gap-2 w-fit ${badge.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label} ({product.stock})
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 font-medium">{settings.currencySymbol} {product.costPrice.toLocaleString()}</td>
                    <td className="p-4 text-sm text-slate-800 font-bold">{settings.currencySymbol} {product.price.toLocaleString()}</td>
                    <td className="p-4">
                      <span className="text-sm font-black text-emerald-600">{settings.currencySymbol} {profit.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleDamaged(product.id)} title="Mark as Damaged" className={`p-2 rounded-lg transition-colors ${product.isDamaged ? 'bg-rose-50 text-rose-600' : 'hover:bg-slate-100 text-slate-400'}`}>
                          <ShieldAlert size={18} />
                        </button>
                        <button onClick={() => handleEdit(product)} title="Edit Product" className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors hover:text-[#00695C]">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} title="Delete Product" className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors hover:text-rose-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-4">
              {/* Image Upload Section */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 space-y-4">
                <div className="w-32 h-32 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                  {newProduct.imageUrl ? (
                    <img src={newProduct.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={48} className="text-slate-200" />
                  )}
                </div>
                
                <div className="text-center">
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className="bg-[#00695C] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#004D40] transition-all shadow-lg shadow-[#00695C]/20 active:scale-95"
                  >
                    <Upload size={18} />
                    Upload Image
                  </button>
                  
                  {imageStatus === 'success' && (
                    <p className="text-emerald-600 text-xs font-bold mt-2 flex items-center justify-center gap-1">
                      <CheckCircle size={12} /> Image Uploaded
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                      value={newProduct.name || ''}
                      onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category (کیٹیگری)</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Manual Image URL (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                      value={newProduct.imageUrl || ''}
                      onChange={e => {
                        setNewProduct({...newProduct, imageUrl: e.target.value});
                        if (e.target.value) setImageStatus('success');
                        else setImageStatus('idle');
                      }}
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price (Cost)</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                      value={newProduct.costPrice ?? 0}
                      onChange={e => setNewProduct({...newProduct, costPrice: Number(e.target.value)})}
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Selling Price</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                      value={newProduct.price ?? 0}
                      onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                      value={newProduct.stock ?? 0}
                      onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
                    <input 
                      required
                      type="number" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                      value={newProduct.lowStockThreshold ?? 5}
                      onChange={e => setNewProduct({...newProduct, lowStockThreshold: Number(e.target.value)})}
                    />
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 space-y-3">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Smart Discount Settings</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase">Default Discount</label>
                    <input 
                      type="number" 
                      className="w-full px-3 py-1.5 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      value={newProduct.defaultDiscount ?? 0}
                      onChange={e => setNewProduct({...newProduct, defaultDiscount: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-600 mb-1 uppercase">Discount Type</label>
                    <select 
                      className="w-full px-3 py-1.5 border border-amber-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                      value={newProduct.defaultDiscountType}
                      onChange={e => setNewProduct({...newProduct, defaultDiscountType: e.target.value as 'percentage' | 'fixed'})}
                    >
                      <option value="fixed">Fixed</option>
                      <option value="percentage">Percentage</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#00695C] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#004D40] transition-colors shadow-lg shadow-[#00695C]/20"
              >
                {editingProduct ? 'Update Product' : 'Save Product to Inventory'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Category Management Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Manage Categories</h3>
                <p className="text-xs text-slate-400 font-urdu">کیٹیگریز کا انتظام کریں</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder={editingCategory ? "Edit Category Name..." : "New Category Name... (نئی کیٹیگری)"}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
              />
              <button 
                type="submit"
                className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                {editingCategory ? <CheckCircle size={24} /> : <Plus size={24} />}
              </button>
              {editingCategory && (
                <button 
                  type="button"
                  onClick={() => { setEditingCategory(null); setNewCategoryName(''); }}
                  className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              )}
            </form>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {categories.length > 0 ? categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  <span className="font-medium text-slate-700">{cat.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEditCategory(cat)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400">
                  <Package size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No categories yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
