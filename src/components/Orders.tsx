import React, { useState } from 'react';
import { ShoppingBag, Search, Plus, Filter, MessageCircle, Download, ExternalLink, User, Calendar, CheckCircle2, Clock, Truck, MapPin, AlertCircle } from 'lucide-react';
import { Order, Customer, Product, BusinessSettings, OrderStatus, PaymentMethod, CourierService } from '../types';

interface OrdersProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  customers: Customer[];
  products: Product[];
  settings: BusinessSettings;
}

export default function Orders({ orders, setOrders, customers, products, settings }: OrdersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');

  const statusColors: Record<OrderStatus, string> = {
    'Pending': 'bg-slate-100 text-slate-600 border-slate-200',
    'Shipped': 'bg-blue-50 text-blue-600 border-blue-100',
    'Delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Returned': 'bg-rose-50 text-rose-600 border-rose-100',
    'Cancelled': 'bg-slate-50 text-slate-400 border-slate-100'
  };

  const statusLabels: Record<OrderStatus, string> = {
    'Pending': 'Pending (آرڈر مل گیا)',
    'Shipped': 'Shipped (روانہ کر دیا)',
    'Delivered': 'Delivered (پہنچ گیا)',
    'Returned': 'Returned (واپس آ گیا)',
    'Cancelled': 'Cancelled (منسوخ)'
  };

  const statusIcons: Record<OrderStatus, any> = {
    'Pending': Clock,
    'Shipped': Truck,
    'Delivered': CheckCircle2,
    'Returned': AlertCircle,
    'Cancelled': ShoppingBag
  };

  const shareOnWhatsApp = (order: Order) => {
    const text = `*Invoice from ${settings.businessName}*\n\nOrder ID: ${order.id}\nCustomer: ${order.customerName}\nTotal: ${settings.currencySymbol} ${order.totalAmount}\nStatus: ${order.status}\n\nThank you for your business!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sendWhatsAppUpdate = (order: Order) => {
    const customer = customers.find(c => c.id === order.customerId);
    if (!customer) return;
    
    const text = `Asalam-o-Alaikum ${order.customerName}, your order #${order.id} has been ${order.status.toLowerCase()} ${order.courierService ? `via ${order.courierService}` : ''} ${order.trackingNumber ? `with Tracking ID: ${order.trackingNumber}` : ''}.`;
    const phone = customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getTrackingUrl = (courier?: string, trackingId?: string) => {
    if (!trackingId) return '#';
    if (courier === 'TCS') return `https://www.tcsexpress.com/track/${trackingId}`;
    if (courier === 'Leopards') return `https://www.leopardscourier.com/tracking?track-no=${trackingId}`;
    if (courier === 'Trax') return `https://trax.pk/tracking?tracking_number=${trackingId}`;
    if (courier === 'MnP') return `https://www.mnp.com.pk/tracking?tracking_no=${trackingId}`;
    return '#';
  };

  const filteredOrders = orders.filter(o => statusFilter === 'All' || o.status === statusFilter);

  const openCustomerDetails = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setIsCustomerModalOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-slate-800">Order History</h3>
          <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">{orders.length} Total</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {(['All', 'Pending', 'Shipped', 'Delivered', 'Returned'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                statusFilter === status 
                  ? 'bg-[#1A237E] text-white border-[#1A237E] shadow-md' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1A237E] text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#0D145A] transition-colors shadow-lg shadow-[#1A237E]/20"
        >
          <Plus size={20} />
          New Order (نیا آرڈر)
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            return (
              <div key={order.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${statusColors[order.status].split(' ')[1].replace('text-', 'bg-')}`} />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl ${statusColors[order.status]} border`}>
                      <StatusIcon size={24} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 
                          className="font-bold text-slate-800 text-lg cursor-pointer hover:text-[#00695C] hover:underline"
                          onClick={() => openCustomerDetails(order.customerId)}
                        >
                          {order.customerName}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{order.id}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" /> {new Date(order.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><ShoppingBag size={14} className="text-slate-400" /> {order.items.length} Items</span>
                        {order.courierService && (
                          <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                            <Truck size={14} /> {order.courierService}
                          </span>
                        )}
                        {order.trackingNumber && (
                          <a 
                            href={getTrackingUrl(order.courierService, order.trackingNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
                          >
                            <ExternalLink size={14} /> {order.trackingNumber}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Grand Total</p>
                      <p className="text-2xl font-black text-slate-800">{settings.currencySymbol} {order.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => sendWhatsAppUpdate(order)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all"
                        title="Send WhatsApp Update"
                      >
                        <MessageCircle size={16} />
                        Send Update
                      </button>
                      <button 
                        onClick={() => { setSelectedOrder(order); setIsReceiptOpen(true); }}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-[#00695C] hover:bg-emerald-50 rounded-xl transition-all"
                        title="View Receipt"
                      >
                        <Receipt size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
            <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No orders yet. Start selling!</p>
            <p className="text-xs text-slate-400 font-urdu mt-1">ابھی تک کوئی آرڈر نہیں ہے۔ فروخت شروع کریں!</p>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Create New Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const customerId = formData.get('customerId') as string;
              const productId = formData.get('productId') as string;
              const quantity = Number(formData.get('quantity') || 1);
              const customer = customers.find(c => c.id === customerId);
              const product = products.find(p => p.id === productId);
              
              if (!product) return;

              const discountAmount = Number(formData.get('discountAmount') || 0);
              const discountType = formData.get('discountType') as 'percentage' | 'fixed';
              
              const selectedItems = [{
                productId: product.id,
                name: product.name,
                quantity: quantity,
                price: product.price
              }];

              const subtotal = product.price * quantity;
              const discountValue = discountType === 'percentage' ? (subtotal * discountAmount / 100) : discountAmount;
              const deliveryCharges = settings.defaultDeliveryCharges;
              const totalAmount = subtotal - discountValue + deliveryCharges;

              const paymentMethod = formData.get('paymentMethod') as PaymentMethod;
              const courierService = formData.get('courierService') as CourierService;
              const trackingNumber = formData.get('trackingNumber') as string;

              const newOrder: Order = {
                id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
                customerId: customerId,
                customerName: customer?.name || 'Unknown',
                items: selectedItems,
                totalAmount: totalAmount,
                discountAmount: discountAmount > 0 ? discountAmount : undefined,
                discountType: discountAmount > 0 ? discountType : undefined,
                status: 'Pending',
                date: new Date().toISOString().split('T')[0],
                currency: settings.primaryCurrency,
                exchangeRate: 1,
                paymentMethod: paymentMethod || undefined,
                courierService: courierService || undefined,
                trackingNumber: trackingNumber || undefined
              };

              setOrders([newOrder, ...orders]);
              setIsModalOpen(false);
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Customer</label>
                  <select name="customerId" required className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A237E]">
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Product</label>
                  <select 
                    name="productId" 
                    required 
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A237E]"
                    onChange={(e) => {
                      const p = products.find(prod => prod.id === e.target.value);
                      if (p && p.defaultDiscount) {
                        const discountInput = document.getElementsByName('discountAmount')[0] as HTMLInputElement;
                        const typeInput = document.getElementsByName('discountType')[0] as HTMLSelectElement;
                        if (discountInput) discountInput.value = p.defaultDiscount.toString();
                        if (typeInput) typeInput.value = p.defaultDiscountType || 'fixed';
                      }
                    }}
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {settings.primaryCurrency} {p.price} ({p.stock} in stock)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input name="quantity" type="number" min="1" defaultValue="1" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A237E]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Discount Amount</label>
                  <input name="discountAmount" type="number" step="0.01" defaultValue="0" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A237E]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
                  <select name="discountType" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A237E]">
                    <option value="fixed">Fixed ({settings.primaryCurrency})</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Payment & Shipment (Optional)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                    <select name="paymentMethod" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A237E]">
                      <option value="">Select Method...</option>
                      <option value="Cash on Delivery (COD)">Cash on Delivery (COD)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="EasyPaisa/JazzCash">EasyPaisa/JazzCash</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Courier Service</label>
                    <select name="courierService" className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A237E]">
                      <option value="">Select Courier...</option>
                      {settings.preferredCouriers.map(courier => (
                        <option key={courier} value={courier}>{courier}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tracking Number</label>
                  <input 
                    name="trackingNumber" 
                    type="text" 
                    placeholder="Enter tracking ID..."
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1A237E]" 
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-xs text-slate-400 uppercase font-bold mb-2">Order Summary Preview</p>
                <p className="text-sm text-slate-600 italic">Items will be added from inventory selection (Simplified for this demo)</p>
              </div>

              <button type="submit" className="w-full bg-[#1A237E] text-white py-3 rounded-xl font-bold hover:bg-[#0D145A] transition-colors">
                Generate Invoice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {isReceiptOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Digital Receipt</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Invoice #{selectedOrder.id}</p>
              </div>
              <button onClick={() => setIsReceiptOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  {settings.storeLogo && (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200">
                      <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-[#1A237E] mb-1">{settings.businessName}</h2>
                    <p className="text-xs text-slate-500 max-w-[200px]">{settings.businessAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">Date: {new Date(selectedOrder.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-500">Status: <span className="text-emerald-600 font-bold">{selectedOrder.status}</span></p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1A237E] shadow-sm">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase">Customer Details</p>
                    <p className="font-bold text-slate-800">{selectedOrder.customerName}</p>
                  </div>
                </div>
                
                {selectedOrder.paymentMethod && (
                  <div className="bg-indigo-50 p-4 rounded-2xl flex items-center gap-4 border border-indigo-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#1A237E] shadow-sm">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-indigo-400 font-medium uppercase">Payment Method</p>
                      <p className="font-bold text-indigo-900">{selectedOrder.paymentMethod}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipment Info */}
              {(selectedOrder.courierService || selectedOrder.trackingNumber) && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Truck size={20} className="text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Shipment Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedOrder.courierService && (
                      <div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Courier</p>
                        <p className="text-sm font-bold text-emerald-900">{selectedOrder.courierService}</p>
                      </div>
                    )}
                    {selectedOrder.trackingNumber && (
                      <div>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Tracking #</p>
                        <a 
                          href={getTrackingUrl(selectedOrder.courierService, selectedOrder.trackingNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-emerald-900 hover:underline flex items-center gap-1"
                        >
                          {selectedOrder.trackingNumber}
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
                  <div className="col-span-6">Item Description</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-4 text-sm py-2 border-b border-slate-50">
                    <div className="col-span-6 font-medium text-slate-800">{item.name}</div>
                    <div className="col-span-2 text-center text-slate-500">{item.quantity}</div>
                    <div className="col-span-2 text-right text-slate-500">{item.price}</div>
                    <div className="col-span-2 text-right font-bold text-slate-800">{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="flex justify-end pt-4">
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Subtotal</span>
                    <span>{settings.currencySymbol} {(selectedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Delivery Charges</span>
                    <span>{settings.currencySymbol} {settings.defaultDeliveryCharges.toLocaleString()}</span>
                  </div>
                  {selectedOrder.discountAmount ? (
                    <div className="flex justify-between text-sm text-emerald-600 font-medium">
                      <span>Discount {selectedOrder.discountType === 'percentage' ? `(${selectedOrder.discountAmount}%)` : ''}</span>
                      <span>- {settings.currencySymbol} {
                        (selectedOrder.discountType === 'percentage' 
                          ? (selectedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0) * selectedOrder.discountAmount / 100)
                          : selectedOrder.discountAmount
                        ).toLocaleString()
                      }</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-lg font-black text-[#1A237E] pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span>{settings.currencySymbol} {selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => shareOnWhatsApp(selectedOrder)}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                <MessageCircle size={20} />
                Share on WhatsApp
              </button>
              <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors flex items-center gap-2">
                <Download size={20} />
                PDF
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Customer Details Modal */}
      {isCustomerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">Customer Profile</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-[#1A237E] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#1A237E]/20">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xl">{selectedCustomer.name}</h4>
                <p className="text-sm text-slate-500">{selectedCustomer.phone}</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Address</p>
                  <p className="text-sm text-slate-700">{selectedCustomer.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShoppingBag size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Order History</p>
                  <p className="text-sm text-slate-700">{orders.filter(o => o.customerId === selectedCustomer.id).length} Total Orders</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsCustomerModalOpen(false)}
              className="w-full bg-[#00695C] text-white py-3 rounded-xl font-bold hover:bg-[#004D40] transition-colors"
            >
              Close Profile
            </button>
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

function Receipt({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path>
      <path d="M16 8h-6"></path>
      <path d="M16 12H8"></path>
      <path d="M13 16H8"></path>
    </svg>
  );
}
