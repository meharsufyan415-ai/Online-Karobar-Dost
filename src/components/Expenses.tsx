import React, { useState, useCallback } from 'react';
import { Receipt, Search, Plus, Filter, Camera, Upload, Loader2, CheckCircle2, AlertCircle, Calendar, DollarSign, Tag } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Expense, ExpenseCategory, BusinessSettings } from '../types';
import { scanReceipt } from '../services/ai';

interface ExpensesProps {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  settings: BusinessSettings;
}

export default function Expenses({ expenses, setExpenses, settings }: ExpensesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    name: '',
    amount: 0,
    category: 'Others',
    date: new Date().toISOString().split('T')[0]
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const data = await scanReceipt(base64);
      
      if (data) {
        setNewExpense({
          name: data.item_name || 'New Expense',
          amount: data.amount || 0,
          category: (data.category as ExpenseCategory) || 'Others',
          date: data.date || new Date().toISOString().split('T')[0],
          confidenceScore: data.confidence_score
        });
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'image/*': [] },
    multiple: false 
  } as any);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const expense: Expense = {
      ...newExpense as Expense,
      id: Math.random().toString(36).substr(2, 9),
      currency: settings.primaryCurrency,
      exchangeRate: 1
    };
    setExpenses([...expenses, expense]);
    setIsModalOpen(false);
    setNewExpense({ name: '', amount: 0, category: 'Others', date: new Date().toISOString().split('T')[0] });
  };

  const filteredExpenses = expenses.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categoryColors: Record<ExpenseCategory, string> = {
    'Marketing': 'bg-blue-50 text-blue-600',
    'Stock': 'bg-emerald-50 text-emerald-600',
    'Utility': 'bg-amber-50 text-amber-600',
    'Delivery': 'bg-purple-50 text-purple-600',
    'Damaged Stock': 'bg-orange-50 text-orange-600',
    'Returned Orders': 'bg-orange-50 text-orange-600',
    'Bad Debts': 'bg-rose-50 text-rose-600',
    'Others': 'bg-slate-50 text-slate-600'
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search expenses... (اخراجات تلاش کریں)"
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00695C] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#004D40] transition-colors shadow-lg shadow-[#00695C]/20"
        >
          <Plus size={20} />
          Add Expense (نیا خرچہ)
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Expense Name</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{expense.name}</p>
                        <p className="text-xs text-slate-400">ID: {expense.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${categoryColors[expense.category]}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-500">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="p-4 font-bold text-slate-800">{settings.currencySymbol} {expense.amount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <div className="max-w-xs mx-auto">
                    <Receipt size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-medium">No expenses recorded.</p>
                    <p className="text-xs text-slate-400 font-urdu mt-1">کوئی خرچہ ریکارڈ نہیں کیا گیا۔</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add New Expense</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* AI Scanner Dropzone */}
            <div 
              {...getRootProps()} 
              className={cn(
                "border-2 border-dashed rounded-2xl p-6 mb-6 text-center transition-all cursor-pointer group",
                isDragActive ? "border-[#00695C] bg-emerald-50" : "border-slate-200 hover:border-[#00695C] hover:bg-slate-50"
              )}
            >
              <input {...getInputProps()} />
              {isScanning ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="text-[#00695C] animate-spin" size={32} />
                  <p className="text-sm font-bold text-[#00695C]">AI is scanning your receipt...</p>
                  <p className="text-xs text-slate-400 font-urdu">رسید اسکین ہو رہی ہے...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-emerald-50 text-[#00695C] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={24} />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Upload Receipt for AI Scanning</p>
                  <p className="text-xs text-slate-400">Drag & drop or click to upload</p>
                </div>
              )}
            </div>

            {newExpense.confidenceScore && (
              <div className="flex items-center gap-2 mb-4 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">
                <CheckCircle2 size={14} />
                AI extracted data with {(newExpense.confidenceScore * 100).toFixed(0)}% confidence
              </div>
            )}

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Tag size={14} /> Expense Name (نام)
                </label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                  value={newExpense.name}
                  onChange={e => setNewExpense({...newExpense, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <DollarSign size={14} /> Amount (رقم)
                  </label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                    value={newExpense.amount}
                    onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Calendar size={14} /> Date (تاریخ)
                  </label>
                  <input 
                    required
                    type="date" 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                    value={newExpense.date}
                    onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category (قسم)</label>
                <select 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                  value={newExpense.category}
                  onChange={e => setNewExpense({...newExpense, category: e.target.value as ExpenseCategory})}
                >
                  <option value="Marketing">Marketing</option>
                  <option value="Stock">Stock</option>
                  <option value="Utility">Utility</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Damaged Stock">Damaged Stock</option>
                  <option value="Returned Orders">Returned Orders</option>
                  <option value="Bad Debts">Bad Debts</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#00695C] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#004D40] transition-colors"
              >
                Save Expense
              </button>
            </form>
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

function Trash2({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18"></path>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
