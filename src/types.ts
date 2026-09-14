export type Language = 'en' | 'mr';

export type Theme = 'light' | 'dark';

export type ProductType = 'indian_wafers' | 'vermicelli';

export type SpiceOption = 'customer_provided' | 'store_provided';

export type ContainerType = 
  | 'steel_dabba' 
  | 'plastic_box' 
  | 'cloth_bag' 
  | 'transparent_pouch' 
  | 'store_packaging';

export type OrderStatus = 'received' | 'in_production' | 'ready' | 'collected';

export interface NotificationLog {
  id: string;
  timestamp: string;
  channel: 'sms' | 'whatsapp';
  recipientPhone: string;
  recipientName: string;
  status: 'sent' | 'delivered';
  messagePreview: string;
}

export interface OrderItem {
  id: string;
  productType: ProductType;
  productName: string;
  productNameMr: string;
  variety: string;
  quantityKg: number;
  spicesProvidedByCustomer: boolean;
  spiceDetails?: string;
  baseRatePerKg: number;
  spiceCostPerKg: number; // 0 if customer provided
  itemTotal: number;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  updatedBy?: string;
  note?: string;
}

export interface Order {
  id: string; // e.g. "ORD-4920"
  customerName: string;
  phoneNumber: string;
  items: OrderItem[];
  totalAmount: number;
  baseTotal: number;
  spiceTotal: number;
  taxAmount: number;
  discountAmount: number;
  containerType: ContainerType;
  containerDescription: string; // e.g., "Silver Steel Dabba with yellow tape and 'Pawar' written"
  storageLocation: string; // e.g., "Rack A, Shelf 2"
  specialNotes?: string;
  createdAt: string; // ISO String
  readyAt?: string;
  collectedAt?: string;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  notificationSent: boolean;
  lastNotificationChannel?: 'sms' | 'whatsapp';
  lastNotificationTime?: string;
  notificationLogs?: NotificationLog[];
  paymentStatus: 'paid' | 'pending' | 'partial';
  paymentMethod: 'cash' | 'upi' | 'card';
}

export interface FixtureItem {
  id: string; // e.g. "BIN-A101"
  name: string;
  nameMr: string;
  category: 'wafers' | 'vermicelli' | 'spices' | 'packaging';
  fixtureLocation: string; // e.g., "Aisle 4, Shelf 2"
  capacityKg: number;
  currentStockKg: number;
  soldKg: number;
  minThresholdKg: number;
  costPricePerKg: number;
  sellingPricePerKg: number;
  profitEarned: number;
  lastRestocked: string;
  status: 'adequate' | 'low' | 'critical';
}

export interface MonthProfitRecord {
  monthKey: string; // e.g., "2026-03"
  monthName: string; // "Mar 2026"
  monthNameMr: string; // "मार्च २०२६"
  revenue: number;
  cogs: number; // Cost of goods / Raw materials & Spices
  laborAndOverhead: number;
  netProfit: number;
  profitMarginPercent: number;
  totalOrders: number;
  wafersSoldKg: number;
  vermicelliSoldKg: number;
  spiceRevenue: number;
}

export interface StoreRates {
  wafersBaseRatePerKg: number; // Standard rate when spices provided
  wafersSpiceChargePerKg: number; // Added if spices not provided
  vermicelliBaseRatePerKg: number;
  vermicelliSpiceChargePerKg: number;
  taxPercent: number;
}

export interface RetentionPolicySettings {
  autoDeleteAfter6Months: boolean;
  retentionDays: number; // 180 days = 6 months
  lastPurgeTimestamp?: string;
  deletedOrdersCount: number;
}
