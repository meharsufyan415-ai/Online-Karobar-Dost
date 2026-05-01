import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, ShoppingBag, AlertTriangle, MinusCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Product, Order, Expense, BusinessSettings, ExpenseCategory } from '../types';

interface DashboardProps {
  products: Product[];
  orders: Order[];
  expenses: Expense[];
  settings: BusinessSettings;
  onRecordLoss?: () => void;
}

type FilterOption = 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 12 Months';

export default function Dashboard({ products, orders, expenses, settings, onRecordLoss }: DashboardProps) {
  const [filter, setFilter] = useState<FilterOption>('Last 7 Days');

  const lossCategories: ExpenseCategory[] = ['Damaged Stock', 'Returned Orders', 'Bad Debts'];
  
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  const totalLossFromExpenses = expenses
    .filter(exp => lossCategories.includes(exp.category))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalLossFromDamagedStock = products
    .filter(p => p.isDamaged)
    .reduce((sum, p) => sum + (p.costPrice * p.stock), 0);

  const totalLoss = totalLossFromExpenses + totalLossFromDamagedStock;
    
  const totalRegularExpenses = expenses
    .filter(exp => !lossCategories.includes(exp.category))
    .reduce((sum, exp) => sum + exp.amount, 0);
    
  const netProfit = totalRevenue - (totalRegularExpenses + totalLoss);
  
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

  const stats = [
    { label: 'Total Revenue', value: totalRevenue, icon: TrendingUp, color: 'text-[#00695C]', bg: 'bg-[#E0F2F1]', labelUrdu: 'کل آمدنی', type: 'currency' },
    { label: 'Total Expenses', value: totalRegularExpenses, icon: TrendingDown, color: 'text-[#C62828]', bg: 'bg-[#FFEBEE]', labelUrdu: 'کل اخراجات', type: 'currency' },
    { label: 'Total Loss', value: totalLoss, icon: MinusCircle, color: 'text-[#E65100]', bg: 'bg-[#FFF3E0]', labelUrdu: 'کل نقصان', type: 'currency', valueColor: 'text-[#E65100]' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-[#1A237E]', bg: 'bg-[#E8EAF6]', labelUrdu: 'کل آرڈرز', type: 'count' },
    { 
      label: 'Net Profit', 
      value: netProfit, 
      icon: Wallet, 
      color: 'text-[#006400]', 
      bg: 'bg-[#E0F2F1]', 
      labelUrdu: 'خالص منافع', 
      type: 'currency',
      valueColor: 'text-[#006400]'
    },
  ];

  // Prepare chart data based on filter
  const { chartData, hasRealData } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let data: any[] = [];
    let realDataFound = false;

    if (filter === 'Today') {
      data = Array.from({ length: 24 }, (_, i) => {
        const hour = i % 12 || 12;
        const ampm = i < 12 ? 'AM' : 'PM';
        const hourStart = new Date(today);
        hourStart.setHours(i, 0, 0, 0);
        const hourEnd = new Date(today);
        hourEnd.setHours(i, 59, 59, 999);

        const hourOrders = orders.filter(o => {
          const d = new Date(o.date);
          return d >= hourStart && d <= hourEnd;
        });
        const hourExpenses = expenses.filter(e => {
          const d = new Date(e.date);
          return d >= hourStart && d <= hourEnd;
        });

        const rev = hourOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const exp = hourExpenses.reduce((sum, e) => sum + e.amount, 0);
        const ord = hourOrders.length;

        if (rev > 0 || exp > 0 || ord > 0) realDataFound = true;

        return {
          name: `${hour} ${ampm}`,
          fullTime: `${hour.toString().padStart(2, '0')}:00 ${ampm}`,
          revenue: rev,
          expenses: exp,
          orders: ord,
        };
      });
    } else if (filter === 'Last 7 Days') {
      data = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (6 - i));
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const dayOrders = orders.filter(o => {
          const od = new Date(o.date);
          return od >= dayStart && od <= dayEnd;
        });
        const dayExpenses = expenses.filter(e => {
          const ed = new Date(e.date);
          return ed >= dayStart && ed <= dayEnd;
        });

        const rev = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const exp = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
        const ord = dayOrders.length;

        if (rev > 0 || exp > 0 || ord > 0) realDataFound = true;

        return {
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: rev,
          expenses: exp,
          orders: ord,
        };
      });
    } else if (filter === 'Last 30 Days') {
      data = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (29 - i));
        const dayStart = new Date(d);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(d);
        dayEnd.setHours(23, 59, 59, 999);

        const dayOrders = orders.filter(o => {
          const od = new Date(o.date);
          return od >= dayStart && od <= dayEnd;
        });
        const dayExpenses = expenses.filter(e => {
          const ed = new Date(e.date);
          return ed >= dayStart && ed <= dayEnd;
        });

        const rev = dayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const exp = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
        const ord = dayOrders.length;

        if (rev > 0 || exp > 0 || ord > 0) realDataFound = true;

        return {
          name: d.getDate().toString(),
          revenue: rev,
          expenses: exp,
          orders: ord,
        };
      });
    } else if (filter === 'Last 12 Months') {
      data = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthOrders = orders.filter(o => {
          const od = new Date(o.date);
          return od >= monthStart && od <= monthEnd;
        });
        const monthExpenses = expenses.filter(e => {
          const ed = new Date(e.date);
          return ed >= monthStart && ed <= monthEnd;
        });

        const rev = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
        const exp = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const ord = monthOrders.length;

        if (rev > 0 || exp > 0 || ord > 0) realDataFound = true;

        return {
          name: d.toLocaleDateString('en-US', { month: 'short' }),
          revenue: rev,
          expenses: exp,
          profit: rev - exp,
          orders: ord,
        };
      });
    }

    return { chartData: data, hasRealData: realDataFound };
  }, [filter, orders, expenses]);

  const totalAnnualProfit = useMemo(() => {
    if (filter !== 'Last 12 Months') return 0;
    return chartData.reduce((sum, item) => sum + (item.profit || 0), 0);
  }, [chartData, filter]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const revenue = data.revenue;
      const expenses = data.expenses;
      const loss = data.loss || 0;
      const ordersCount = data.orders;
      const profit = revenue - (expenses + loss);

      return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl">
          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
            {filter === 'Today' ? data.fullTime : label}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-8">
              <span className="text-sm text-slate-600">Orders:</span>
              <span className="text-sm font-bold text-[#1A237E]">{ordersCount}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-sm text-slate-600">Revenue:</span>
              <span className="text-sm font-bold text-[#00695C]">{settings.currencySymbol} {revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-sm text-slate-600">Expenses:</span>
              <span className="text-sm font-bold text-[#C62828]">{settings.currencySymbol} {expenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-sm text-slate-600">Loss:</span>
              <span className="text-sm font-bold text-[#E65100]">{settings.currencySymbol} {loss.toLocaleString()}</span>
            </div>
            <div className="pt-1 mt-1 border-t border-slate-50 flex items-center justify-between gap-8">
              <span className="text-sm font-medium text-slate-800">Net Profit:</span>
              <span className="text-sm font-bold text-[#006400]">
                {settings.currencySymbol} {profit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{stat.label}</p>
                <p className="text-[10px] text-slate-400 font-urdu">{stat.labelUrdu}</p>
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${stat.valueColor || 'text-slate-800'}`}>
              {stat.type === 'currency' ? (
                <span className="flex items-center gap-1">
                  <span className="text-sm font-medium text-slate-400">{settings.currencySymbol}</span>
                  {stat.value.toLocaleString()}
                </span>
              ) : (
                `${stat.value.toLocaleString()} Orders`
              )}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-0">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-slate-800">Financial Overview</h3>
                {filter === 'Last 12 Months' && (
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100 uppercase tracking-wider">
                    Annual Profit: {settings.currencySymbol} {totalAnnualProfit.toLocaleString()}
                  </span>
                )}
                <button 
                  onClick={onRecordLoss}
                  className="px-3 py-1 bg-orange-50 text-orange-700 text-[10px] font-bold rounded-md border border-orange-100 uppercase tracking-wider hover:bg-orange-100 transition-colors"
                >
                  Record Loss
                </button>
              </div>
              <p className="text-sm text-slate-500 font-urdu">مالیاتی جائزہ</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#00695C]" />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#C62828]" />
                  <span>Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#E65100]" />
                  <span>Loss</span>
                </div>
                {filter === 'Last 12 Months' ? (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#006400]" />
                    <span>Profit</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#5C6BC0]" />
                    <span>Orders</span>
                  </div>
                )}
              </div>
              <select 
                className="bg-slate-50 border-none text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#00695C] cursor-pointer"
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterOption)}
              >
                <option value="Today">Today</option>
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 12 Months">Last 12 Months</option>
              </select>
            </div>
          </div>
          
          <div className="p-6 h-[350px] w-full relative">
            {!hasRealData && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px]">
                <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-100 text-center">
                  <ShoppingBag size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-sm font-bold text-slate-800">No data available</p>
                  <p className="text-xs text-slate-400 font-urdu mt-1">کوئی ڈیٹا دستیاب نہیں ہے</p>
                </div>
              </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} 
                  dy={10}
                  interval={filter === 'Today' ? 0 : filter === 'Last 30 Days' ? 5 : 0}
                  ticks={filter === 'Today' ? ['12 AM', '6 AM', '12 PM', '8 PM'] : undefined}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="revenue" fill="#00695C" radius={[4, 4, 0, 0]} barSize={filter === 'Today' ? 6 : filter === 'Last 12 Months' ? 10 : 15} />
                <Bar dataKey="expenses" fill="#C62828" radius={[4, 4, 0, 0]} barSize={filter === 'Today' ? 6 : filter === 'Last 12 Months' ? 10 : 15} />
                <Bar dataKey="loss" fill="#E65100" radius={[4, 4, 0, 0]} barSize={filter === 'Today' ? 6 : filter === 'Last 12 Months' ? 10 : 15} />
                {filter === 'Last 12 Months' ? (
                  <Bar dataKey="profit" fill="#006400" radius={[4, 4, 0, 0]} barSize={12} />
                ) : (
                  <Bar dataKey="orders" fill="#5C6BC0" radius={[4, 4, 0, 0]} barSize={filter === 'Today' ? 8 : 20} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-amber-600">
            <AlertTriangle size={20} />
            <h3 className="text-lg font-bold text-slate-800">Low Stock Alerts</h3>
          </div>
          <div className="space-y-4">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div>
                    <p className="font-bold text-slate-800">{product.name}</p>
                    <p className="text-xs text-amber-700 font-medium">Only {product.stock} left in stock</p>
                  </div>
                  <button className="px-4 py-2 bg-white border border-amber-200 text-amber-700 text-xs font-bold rounded-xl hover:bg-amber-100 transition-colors shadow-sm">
                    Reorder
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp size={24} />
                </div>
                <p className="text-sm text-slate-500">All stock levels are healthy!</p>
                <p className="text-xs text-slate-400 font-urdu mt-1">تمام اسٹاک لیول ٹھیک ہیں!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
