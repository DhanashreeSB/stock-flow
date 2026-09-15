import type { Order, FixtureItem, StoreRates, RetentionPolicySettings, Language, Theme, NotificationLog } from '../types';
import { initialOrders, initialFixtures, initialStoreRates, initialRetentionSettings } from '../data/initialData';

const STORAGE_KEYS = {
  ORDERS: 'anita_stores_orders_v1',
  FIXTURES: 'anita_stores_fixtures_v1',
  RATES: 'anita_stores_rates_v1',
  RETENTION: 'anita_stores_retention_v1',
  LANG: 'anita_stores_lang_v1',
  THEME: 'anita_stores_theme_v1',
  AUTO_NOTIFY: 'anita_stores_auto_notify_v1',
};

export const getStoredTheme = (): Theme => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // fallback
  }
  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

export const setStoredTheme = (theme: Theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // fallback
  }
};

export const getStoredAutoNotify = (): boolean => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTO_NOTIFY);
    if (saved !== null) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return true; // default enabled
};

export const setStoredAutoNotify = (enabled: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTO_NOTIFY, JSON.stringify(enabled));
  } catch {
    // fallback
  }
};

export const getStoredLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    if (saved === 'mr' || saved === 'en') return saved;
  } catch {
    // fallback
  }
  return 'en';
};

export const setStoredLanguage = (lang: Language) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  } catch {
    // fallback
  }
};

export const getStoredRates = (): StoreRates => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RATES);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return initialStoreRates;
};

export const saveStoredRates = (rates: StoreRates) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  } catch {
    // fallback
  }
};

export const getStoredRetention = (): RetentionPolicySettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.RETENTION);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return initialRetentionSettings;
};

export const saveStoredRetention = (settings: RetentionPolicySettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.RETENTION, JSON.stringify(settings));
  } catch {
    // fallback
  }
};

export const getStoredOrders = (): Order[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  // Initialize with initial data
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(initialOrders));
  return initialOrders;
};

export const saveOrdersList = (orders: Order[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch {
    // fallback
  }
};

export const getStoredFixtures = (): FixtureItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FIXTURES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(initialFixtures));
  return initialFixtures;
};

export const saveFixturesList = (fixtures: FixtureItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FIXTURES, JSON.stringify(fixtures));
  } catch {
    // fallback
  }
};

// 6-Month Auto Purge Check & Action
export const purgeExpiredOrders = (retentionDays = 180): { purgedCount: number; updatedOrders: Order[] } => {
  const currentOrders = getStoredOrders();
  const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  
  const retained: Order[] = [];
  let purgedCount = 0;

  for (const order of currentOrders) {
    const orderDate = new Date(order.createdAt).getTime();
    if (orderDate >= cutoffTime) {
      retained.push(order);
    } else {
      purgedCount++;
    }
  }

  saveOrdersList(retained);

  const retentionSettings = getStoredRetention();
  retentionSettings.deletedOrdersCount += purgedCount;
  retentionSettings.lastPurgeTimestamp = new Date().toISOString();
  saveStoredRetention(retentionSettings);

  return { purgedCount, updatedOrders: retained };
};

// Generate notification templates (WhatsApp / SMS)
export const generateNotificationMessage = (order: Order, lang: Language): string => {
  const itemsSummary = order.items
    .map(i => `${lang === 'mr' ? i.productNameMr : i.productName} (${i.quantityKg}kg)`)
    .join(', ');

  const containerText = order.containerDescription || order.containerType.replace('_', ' ');

  if (lang === 'mr') {
    return `🙏 *अनिता स्टोअर्स - तुमची ऑर्डर तयार आहे!*\n\n` +
      `नमस्कार *${order.customerName}*,\n` +
      `आपली ऑर्डर *#${order.id}* [${itemsSummary}] तयार झाली असून दुकानात साठवली आहे.\n\n` +
      `📦 *आपले भांडे:* ${containerText}\n` +
      `📍 *ठेवलेली जागा:* ${order.storageLocation}\n` +
      `💰 *एकूण देय बिल:* ₹${order.totalAmount.toLocaleString('en-IN')}\n\n` +
      `कृपया अनिता स्टोअर्स, मेन मार्केट येथे येऊन आपली ऑर्डर घेऊन जावी. काही अडचण असल्यास संपर्क करा.\n` +
      `धन्यवाद! 🌸`;
  }

  return `🙏 *Anita Stores - Your Order is Ready for Pickup!*\n\n` +
    `Hello *${order.customerName}*,\n` +
    `Your order *#${order.id}* [${itemsSummary}] has been freshly prepared and packed.\n\n` +
    `📦 *Container:* ${containerText}\n` +
    `📍 *Pickup Shelf / Rack:* ${order.storageLocation}\n` +
    `💰 *Total Amount:* ₹${order.totalAmount.toLocaleString('en-IN')}\n\n` +
    `Please visit Anita Stores, Main Market counter to collect your order.\n` +
    `Thank you! 🌸`;
};

export const generateSmsMessage = (order: Order, lang: Language): string => {
  const itemsSummary = order.items
    .map(i => `${lang === 'mr' ? i.productNameMr : i.productName} ${i.quantityKg}kg`)
    .join(', ');

  if (lang === 'mr') {
    return `अनिता स्टोअर्स: नमस्कार ${order.customerName}, आपली ऑर्डर #${order.id} (${itemsSummary}) तयार आहे. रॅक: ${order.storageLocation}. बिल: रु.${order.totalAmount}. कृपया दुकानातून घेऊन जावी.`;
  }

  return `Anita Stores: Hello ${order.customerName}, your order #${order.id} (${itemsSummary}) is ready for pickup at ${order.storageLocation}. Total: Rs.${order.totalAmount}. Please collect.`;
};

export const getWhatsAppLink = (order: Order, lang: Language): string => {
  const cleanPhone = order.phoneNumber.replace(/[^0-9]/g, '');
  const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const message = generateNotificationMessage(order, lang);
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
};

export const createNotificationLog = (
  order: Order,
  channel: 'sms' | 'whatsapp',
  lang: Language
): NotificationLog => {
  const msg = channel === 'whatsapp' 
    ? generateNotificationMessage(order, lang) 
    : generateSmsMessage(order, lang);

  return {
    id: `NOTIF-${Date.now()}`,
    timestamp: new Date().toISOString(),
    channel,
    recipientPhone: order.phoneNumber,
    recipientName: order.customerName,
    status: 'delivered',
    messagePreview: msg,
  };
};
