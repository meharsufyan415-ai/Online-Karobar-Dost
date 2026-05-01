import React, { useState } from 'react';
import { Users, Search, Plus, Phone, Mail, MapPin, ShoppingBag, MoreVertical, UserPlus, UserCheck } from 'lucide-react';
import { Customer, Order } from '../types';

interface CRMProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  orders: Order[];
}

export default function CRM({ customers, setCustomers, orders }: CRMProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    address: '',
    email: ''
  });

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      ...newCustomer as Customer,
      id: Math.random().toString(36).substr(2, 9),
      orderHistory: []
    };
    setCustomers([...customers, customer]);
    setIsModalOpen(false);
    setNewCustomer({ name: '', phone: '', address: '', email: '' });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search customers... (کسٹمرز تلاش کریں)"
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#00695C] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#004D40] transition-colors shadow-lg shadow-[#00695C]/20"
        >
          <UserPlus size={20} />
          Add Customer (نیا کسٹمر)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            const customerOrders = orders.filter(o => o.customerId === customer.id);
            const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);

            return (
              <div key={customer.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  <button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#1A237E] flex items-center justify-center text-white text-xl font-black shadow-lg shadow-[#1A237E]/20">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{customer.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><UserCheck size={12} /> Registered Customer</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <Phone size={14} />
                    </div>
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin size={14} />
                    </div>
                    <span className="line-clamp-1">{customer.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Orders</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1"><ShoppingBag size={14} className="text-indigo-600" /> {customerOrders.length}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Spent</p>
                    <p className="font-bold text-slate-800">Rs. {totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No customers found.</p>
            <p className="text-xs text-slate-400 font-urdu mt-1">کوئی کسٹمر نہیں ملا۔</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (نام)</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                  value={newCustomer.name}
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number (فون نمبر)</label>
                <input 
                  required
                  type="tel" 
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                  value={newCustomer.phone}
                  onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Address (پتہ)</label>
                <textarea 
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#00695C]"
                  value={newCustomer.address}
                  onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#00695C] text-white py-3 rounded-xl font-bold mt-4 hover:bg-[#004D40] transition-colors"
              >
                Save Customer
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
