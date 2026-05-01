import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Package, PieChart as PieChartIcon, 
  FileText, Download, Calendar
} from 'lucide-react';
import { Product, Order, Expense, BusinessSettings, Category } from '../types';

interface AnalyticsProps {
  products: Product[];
  orders: Order[];
  expenses: Expense[];
  categories: Category[];
  settings: BusinessSettings;
}

const COLORS = ['#00695C', '#1A237E', '#C62828', '#E65100', '#5C6BC0', '#43A047', '#D81B60', '#8E24AA'];

export default function Analytics({ products, orders, expenses, categories, settings }: AnalyticsProps) {
  
  // 1. Monthly Sales Data
  const monthlySalesData = useMemo(() => {
    const months: Record<string, { name: string, total: number }> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleDateString('en-US', { month: 'short' });
    });

    last6Months.forEach(m => months[m] = { name: m, total: 0 });

    orders.forEach(order => {
      const d = new Date(order.date);
      const m = d.toLocaleDateString('en-US', { month: 'short' });
      if (months[m]) {
        months[m].total += order.totalAmount;
      }
    });

    return Object.values(months);
  }, [orders]);

  // 2. Inventory Value by Category
  const categoryInventoryValue = useMemo(() => {
    const data: Record<string, { name: string, value: number }> = {};
    
    products.forEach(p => {
      const catName = p.category || 'Uncategorized';
      if (!data[catName]) {
        data[catName] = { name: catName, value: 0 };
      }
      data[catName].value += (p.costPrice * p.stock);
    });

    return Object.values(data).sort((a, b) => b.value - a.value);
  }, [products]);

  // 3. Expense Distribution
  const expenseBreakdown = useMemo(() => {
    const data: Record<string, { name: string, value: number }> = {};
    
    expenses.forEach(e => {
      if (!data[e.category]) {
        data[e.category] = { name: e.category, value: 0 };
      }
      data[e.category].value += e.amount;
    });

    return Object.values(data).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const totalStockValue = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
  const totalPotentialRevenue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const averageOrderValue = orders.length > 0 ? (orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length) : 0;

  const handleExportCSV = (data: any[], fileName: string) => {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#00695C] text-white rounded-2xl shadow-lg shadow-[#00695C]/20">
            <PieChartIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Business Intelligence</h2>
            <p className="text-sm text-slate-500 font-urdu tracking-wide">کاروباری معلومات اور رپورٹیں</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handleExportCSV(orders, 'Sales_Report')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <Download size={18} />
            Export Sales
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Package size={80} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Stock Value</p>
          <h3 className="text-3xl font-black text-[#00695C]">
            <span className="text-lg font-bold text-slate-300 mr-1">{settings.currencySymbol}</span>
            {totalStockValue.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400 font-urdu mt-2">اسٹاک کی کل قیمت</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Potential Sale Value</p>
          <h3 className="text-3xl font-black text-indigo-900">
            <span className="text-lg font-bold text-slate-300 mr-1">{settings.currencySymbol}</span>
            {totalPotentialRevenue.toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400 font-urdu mt-2">ممکنہ کل فروخت</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <FileText size={80} />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Order Value</p>
          <h3 className="text-3xl font-black text-emerald-600">
            <span className="text-lg font-bold text-slate-300 mr-1">{settings.currencySymbol}</span>
            {averageOrderValue.toFixed(0).toLocaleString()}
          </h3>
          <p className="text-[10px] text-slate-400 font-urdu mt-2">اوسط آرڈر کی قیمت</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Trend Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Monthly Sales Trend</h3>
              <p className="text-xs text-slate-400 font-urdu">ماہانہ سیلز کا رجحان</p>
            </div>
            <Calendar size={20} className="text-slate-300" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00695C" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00695C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`${settings.currencySymbol} ${value.toLocaleString()}`, 'Sales']}
                />
                <Area type="monotone" dataKey="total" stroke="#00695C" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Pie */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Expense Distribution</h3>
              <p className="text-xs text-slate-400 font-urdu">اخراجات کی تقسیم</p>
            </div>
            <TrendingDown size={20} className="text-rose-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `${settings.currencySymbol} ${value.toLocaleString()}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Value by Category */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Inventory Value by Category</h3>
              <p className="text-xs text-slate-400 font-urdu">کیٹیگری کے لحاظ سے اسٹاک کی قیمت</p>
            </div>
            <Package size={20} className="text-[#1A237E]" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryInventoryValue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} width={100} />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: number) => `${settings.currencySymbol} ${value.toLocaleString()}`}
                />
                <Bar dataKey="value" fill="#1A237E" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Sales Breakdown Table */}
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Recent Sales Activity</h3>
                    <p className="text-xs text-slate-400 font-urdu">حالیہ فروخت کی سرگرمی</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="pb-4">Date</th>
                            <th className="pb-4">Customer</th>
                            <th className="pb-4">Items</th>
                            <th className="pb-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {orders.slice(0, 5).map(order => (
                            <tr key={order.id} className="group hover:bg-slate-50 transition-colors">
                                <td className="py-4 text-sm font-medium text-slate-600">
                                    {new Date(order.date).toLocaleDateString('en-GB')}
                                </td>
                                <td className="py-4">
                                    <p className="text-sm font-bold text-slate-800">{order.customerName}</p>
                                </td>
                                <td className="py-4">
                                    <p className="text-xs text-slate-500">{order.items.length} items</p>
                                </td>
                                <td className="py-4 text-right">
                                    <p className="text-sm font-black text-[#00695C]">{settings.currencySymbol} {order.totalAmount.toLocaleString()}</p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {orders.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-400 text-sm">No sales records to display.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
