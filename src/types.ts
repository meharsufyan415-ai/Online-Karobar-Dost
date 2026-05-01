export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery (COD)' | 'Bank Transfer' | 'EasyPaisa/JazzCash';
export type CourierService = 'TCS' | 'Leopards' | 'Trax' | 'MnP';
export type ExpenseCategory = 'Marketing' | 'Stock' | 'Utility' | 'Delivery' | 'Damaged Stock' | 'Returned Orders' | 'Bad Debts' | 'Others';
export type Currency = 'PKR' | 'USD' | 'AED' | 'GBP' | 'EUR';

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  imageUrl?: string;
  category?: string;
  defaultDiscount?: number;
  defaultDiscountType?: 'percentage' | 'fixed';
  isDamaged?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  orderHistory: string[]; // IDs of orders
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  discountAmount?: number;
  discountType?: 'percentage' | 'fixed';
  status: OrderStatus;
  date: string;
  currency: Currency;
  exchangeRate: number; // Rate to primary currency
  paymentMethod?: PaymentMethod;
  courierService?: CourierService;
  trackingNumber?: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  imageUrl?: string;
  confidenceScore?: number;
  currency: Currency;
  exchangeRate: number;
}

export interface ExchangeRates {
  [key: string]: number;
}

export interface BusinessSettings {
  primaryCurrency: Currency;
  currencySymbol: 'PKR' | 'Rs.';
  businessName: string;
  whatsappNumber: string;
  businessAddress: string;
  storeLogo?: string;
  defaultDeliveryCharges: number;
  preferredCouriers: string[];
  bankName?: string;
  accountTitle?: string;
  easyPaisaNumber?: string;
  jazzCashNumber?: string;
}
