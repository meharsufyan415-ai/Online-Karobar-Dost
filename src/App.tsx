import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Receipt, 
  Settings, 
  Menu, 
  X,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Bell,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Firebase
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  onSnapshot, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy, 
  User,
  handleFirestoreError,
  OperationType
} from './firebase';

// Components
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Orders from './components/Orders';
import CRM from './components/CRM';
import Expenses from './components/Expenses';
import SettingsTab from './components/Settings';
import Auth from './components/Auth';
import Analytics from './components/Analytics';

import { Product, Order, Customer, Expense, BusinessSettings, Currency, Category } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // App State
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<{ id: string, title: string, body: string, time: Date }[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!isAuthReady || !user) {
      if (isAuthReady && !user) setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribers = [
      onSnapshot(query(collection(db, 'products'), where('uid', '==', user.uid)), (snapshot) => {
        setProducts(snapshot.docs.map(doc => doc.data() as Product));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'products')),

      onSnapshot(query(collection(db, 'orders'), where('uid', '==', user.uid), orderBy('date', 'desc')), (snapshot) => {
        setOrders(snapshot.docs.map(doc => doc.data() as Order));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'orders')),

      onSnapshot(query(collection(db, 'customers'), where('uid', '==', user.uid)), (snapshot) => {
        setCustomers(snapshot.docs.map(doc => doc.data() as Customer));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'customers')),

      onSnapshot(query(collection(db, 'expenses'), where('uid', '==', user.uid), orderBy('date', 'desc')), (snapshot) => {
        setExpenses(snapshot.docs.map(doc => doc.data() as Expense));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses')),

      onSnapshot(query(collection(db, 'categories'), where('uid', '==', user.uid)), (snapshot) => {
        setCategories(snapshot.docs.map(doc => doc.data() as Category));
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'categories')),

      onSnapshot(doc(db, 'settings', user.uid), (snapshot) => {
        if (snapshot.exists()) {
          setSettings(snapshot.data() as BusinessSettings);
        } else {
          // Initialize default settings if not exists
          const defaultSettings: BusinessSettings = {
            primaryCurrency: 'PKR',
            currencySymbol: 'Rs.',
            businessName: user.displayName || 'My Business',
            whatsappNumber: '',
            businessAddress: '',
            defaultDeliveryCharges: 0,
            preferredCouriers: []
          };
          setDoc(doc(db, 'settings', user.uid), defaultSettings);
        }
      }, (err) => handleFirestoreError(err, OperationType.GET, `settings/${user.uid}`))
    ];

    setIsLoading(false);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [isAuthReady, user]);

  // Push Notification System
  useEffect(() => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Monitor Low Stock and New Orders for Notifications
  const prevOrdersCount = React.useRef(orders.length);
  const prevLowStockCount = React.useRef(products.filter(p => p.stock <= p.lowStockThreshold).length);

  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
      const newOrder = orders[0]; // Assuming desc order
      if (newOrder) {
        showNotification("New Order Received! 🛍️", `Order from ${newOrder.customerName} for ${settings?.currencySymbol} ${newOrder.totalAmount.toLocaleString()}`);
        setNotifications(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          title: "New Order",
          body: `${newOrder.customerName} placed an order.`,
          time: new Date()
        }, ...prev]);
      }
    }
    prevOrdersCount.current = orders.length;
  }, [orders.length]);

  useEffect(() => {
    const currentLowStock = products.filter(p => p.stock <= p.lowStockThreshold);
    if (currentLowStock.length > prevLowStockCount.current) {
      const latestAlert = currentLowStock[0];
      if (latestAlert) {
        showNotification("Low Stock Alert! ⚠️", `${latestAlert.name} is running low (${latestAlert.stock} left).`);
        setNotifications(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          title: "Low Stock",
          body: `${latestAlert.name} needs restock.`,
          time: new Date()
        }, ...prev]);
      }
    }
    prevLowStockCount.current = currentLowStock.length;
  }, [products]);

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  const handleSetProducts = async (action: React.SetStateAction<Product[]>) => {
    const next = typeof action === 'function' ? action(products) : action;
    const addedOrUpdated = next.filter(p => !products.find(pp => JSON.stringify(pp) === JSON.stringify(p)));
    const deleted = products.filter(p => !next.find(pp => pp.id === p.id));

    try {
      for (const p of addedOrUpdated) {
        await setDoc(doc(db, 'products', p.id), { ...p, uid: user?.uid });
      }
      for (const p of deleted) {
        await deleteDoc(doc(db, 'products', p.id));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'products');
    }
  };

  const handleSetOrders = async (action: React.SetStateAction<Order[]>) => {
    const next = typeof action === 'function' ? action(orders) : action;
    const addedOrUpdated = next.filter(o => !orders.find(oo => JSON.stringify(oo) === JSON.stringify(o)));
    
    try {
      for (const o of addedOrUpdated) {
        await setDoc(doc(db, 'orders', o.id), { ...o, uid: user?.uid });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    }
  };

  const handleSetCustomers = async (action: React.SetStateAction<Customer[]>) => {
    const next = typeof action === 'function' ? action(customers) : action;
    const addedOrUpdated = next.filter(c => !customers.find(cc => JSON.stringify(cc) === JSON.stringify(c)));
    
    try {
      for (const c of addedOrUpdated) {
        await setDoc(doc(db, 'customers', c.id), { ...c, uid: user?.uid });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'customers');
    }
  };

  const handleSetExpenses = async (action: React.SetStateAction<Expense[]>) => {
    const next = typeof action === 'function' ? action(expenses) : action;
    const addedOrUpdated = next.filter(e => !expenses.find(ee => JSON.stringify(ee) === JSON.stringify(e)));
    const deleted = expenses.filter(e => !next.find(ee => ee.id === e.id));

    try {
      for (const e of addedOrUpdated) {
        await setDoc(doc(db, 'expenses', e.id), { ...e, uid: user?.uid });
      }
      for (const e of deleted) {
        await deleteDoc(doc(db, 'expenses', e.id));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'expenses');
    }
  };

  const handleSetCategories = async (action: React.SetStateAction<Category[]>) => {
    const next = typeof action === 'function' ? action(categories) : action;
    const addedOrUpdated = next.filter(c => !categories.find(cc => JSON.stringify(cc) === JSON.stringify(c)));
    const deleted = categories.filter(c => !next.find(cc => cc.id === c.id));

    try {
      for (const c of addedOrUpdated) {
        await setDoc(doc(db, 'categories', c.id), { ...c, uid: user?.uid });
      }
      for (const c of deleted) {
        await deleteDoc(doc(db, 'categories', c.id));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'categories');
    }
  };

  const handleSetSettings = async (action: React.SetStateAction<BusinessSettings>) => {
    if (!settings || !user) return;
    const next = typeof action === 'function' ? action(settings) : action;
    try {
      await setDoc(doc(db, 'settings', user.uid), next);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `settings/${user.uid}`);
    }
  };

  if (!isAuthReady || (user && isLoading) || (user && !settings)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#00695C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-urdu">لوڈ ہو رہا ہے... براہ کرم انتظار کریں۔</p>
        </div>
      </div>
    );
  }

  const handleExportData = () => {
    // Simple CSV export logic
    const data = [
      ['Date', 'Order ID', 'Customer', 'Total Amount', 'Status'],
      ...orders.map(o => [o.date, o.id, o.customerName, o.totalAmount, o.status])
    ];
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + data.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Karobar_Dost_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, labelUrdu: 'ڈیش بورڈ' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, labelUrdu: 'اینالیٹکس' },
    { id: 'inventory', label: 'Inventory', icon: Package, labelUrdu: 'انوینٹری' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, labelUrdu: 'آرڈرز' },
    { id: 'crm', label: 'CRM', icon: Users, labelUrdu: 'کسٹمرز' },
    { id: 'expenses', label: 'Expenses', icon: Receipt, labelUrdu: 'اخراجات' },
    { id: 'settings', label: 'Settings', icon: Settings, labelUrdu: 'ترتیبات' },
  ];

  if (!user && isAuthReady) {
    return <Auth onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-[#1A237E] text-white transition-all duration-300 flex flex-col fixed h-full z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 mb-2"
            >
              <img src="/logo.png" alt="Karobar Dost" className="w-32 h-auto" />
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                activeTab === item.id 
                  ? "bg-[#00695C] text-white shadow-lg shadow-[#00695C]/20" 
                  : "hover:bg-white/5 text-white/70 hover:text-white"
              )}
            >
              <item.icon size={22} />
              {isSidebarOpen && (
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-[10px] opacity-60 font-urdu">{item.labelUrdu}</span>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-xl transition-all",
              activeTab === 'settings' ? "bg-[#00695C] text-white" : "hover:bg-white/5 text-white/70"
            )}
          >
            <Settings size={22} />
            {isSidebarOpen && <span className="text-sm font-medium">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 transition-all duration-300 min-h-screen",
        isSidebarOpen ? "ml-64" : "ml-20"
      )}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-6 sticky top-0 z-40 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {navItems.find(i => i.id === activeTab)?.label}
            </h2>
            <p className="text-sm text-slate-500 font-urdu">
              خوش آمدید! اپنے کاروبار کو بہتر طریقے سے سنبھالیں۔
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="p-2 text-slate-400 hover:text-[#00695C] hover:bg-slate-50 rounded-full relative">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {/* Notification Tray */}
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                  {notifications.length > 0 && (
                    <button onClick={() => setNotifications([])} className="text-[10px] font-bold text-rose-500 uppercase">Clear All</button>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(n => (
                    <div key={n.id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{n.body}</p>
                      <p className="text-[8px] text-slate-400 mt-2">{n.time.toLocaleTimeString()}</p>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-300 text-xs">No notifications</div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
            <div className="h-10 w-10 rounded-full bg-[#00695C] flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                user?.displayName?.charAt(0) || 'M'
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  products={products} 
                  orders={orders} 
                  expenses={expenses} 
                  settings={settings} 
                  onRecordLoss={() => setActiveTab('expenses')}
                />
              )}
              {activeTab === 'analytics' && (
                <Analytics
                  products={products}
                  orders={orders}
                  expenses={expenses}
                  categories={categories}
                  settings={settings}
                />
              )}
              {activeTab === 'inventory' && (
                <Inventory 
                  products={products} 
                  setProducts={handleSetProducts} 
                  categories={categories}
                  setCategories={handleSetCategories}
                  orders={orders}
                  settings={settings}
                />
              )}
              {activeTab === 'orders' && (
                <Orders 
                  orders={orders} 
                  setOrders={handleSetOrders} 
                  customers={customers}
                  products={products}
                  settings={settings}
                />
              )}
              {activeTab === 'crm' && (
                <CRM 
                  customers={customers} 
                  setCustomers={handleSetCustomers} 
                  orders={orders}
                />
              )}
              {activeTab === 'expenses' && (
                <Expenses 
                  expenses={expenses} 
                  setExpenses={handleSetExpenses} 
                  settings={settings}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsTab 
                  settings={settings}
                  setSettings={handleSetSettings}
                  onExportData={handleExportData}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
