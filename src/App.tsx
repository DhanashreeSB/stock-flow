import React, { useState, useEffect } from 'react';
import type {
  Order,
  FixtureItem,
  StoreRates,
  RetentionPolicySettings,
  Language,
  OrderStatus,
  Theme,
  NotificationLog
} from './types';
import { 
  getStoredOrders, 
  saveOrdersList, 
  getStoredFixtures, 
  saveFixturesList, 
  getStoredRates, 
  saveStoredRates, 
  getStoredRetention, 
  saveStoredRetention, 
  getStoredLanguage, 
  setStoredLanguage,
  getStoredTheme,
  setStoredTheme,
  createNotificationLog,
  generateNotificationMessage,
  generateSmsMessage,
  purgeExpiredOrders 
} from './utils/storage';
import { soundNotifier } from './utils/audio';
import { Header } from './components/Header';
import { OperationsDashboard } from './components/OperationsDashboard';
import { FixtureInventoryView } from './components/FixtureInventoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { NewOrderModal } from './components/NewOrderModal';
import { OrderDetailsModal } from './components/OrderDetailsModal';
import { NotificationDispatcherModal } from './components/NotificationDispatcherModal';
import { translations } from './data/translations';

export default function App() {
  // Application State
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [orders, setOrders] = useState<Order[]>(() => getStoredOrders());
  const [fixtures, setFixtures] = useState<FixtureItem[]>(() => getStoredFixtures());
  const [storeRates, setStoreRates] = useState<StoreRates>(() => getStoredRates());
  const [retentionSettings, setRetentionSettings] = useState<RetentionPolicySettings>(() => getStoredRetention());
  
  // UI & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Notification Modal State
  const [notificationOrder, setNotificationOrder] = useState<Order | null>(null);

  const t = translations[language as keyof typeof translations] || translations.en;

  // Sync Theme to HTML Root Class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  // Sync Language
  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    setStoredLanguage(newLang);
  };

  // Sync Theme
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  // Sync Orders
  const updateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveOrdersList(newOrders);
  };

  // Sync Fixtures
  const updateFixtures = (newFixtures: FixtureItem[]) => {
    setFixtures(newFixtures);
    saveFixturesList(newFixtures);
  };

  // Check 6-Month Retention Policy on load if autoDelete is active
  useEffect(() => {
    if (retentionSettings.autoDeleteAfter6Months) {
      const { purgedCount, updatedOrders } = purgeExpiredOrders(retentionSettings.retentionDays);
      if (purgedCount > 0) {
        setOrders(updatedOrders);
      }
    }
  }, []);

  // Save new order created via Digital Intake Register
  const handleSaveNewOrder = (newOrder: Order) => {
    const updated = [newOrder, ...orders];
    updateOrders(updated);
    if (soundEnabled) {
      soundNotifier.playOrderAdded();
    }
  };

  // Advance / Update Order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    let orderToNotify: Order | null = null;

    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const historyItem = {
          status: newStatus,
          timestamp: new Date().toISOString(),
          note: note || `Status updated to ${newStatus}`,
        };

        const isNowReady = newStatus === 'ready';
        const isNowCollected = newStatus === 'collected';

        const modifiedOrder: Order = {
          ...o,
          status: newStatus,
          readyAt: isNowReady ? new Date().toISOString() : o.readyAt,
          collectedAt: isNowCollected ? new Date().toISOString() : o.collectedAt,
          statusHistory: [...o.statusHistory, historyItem],
        };

        if (isNowReady) {
          orderToNotify = modifiedOrder;
        }

        return modifiedOrder;
      }
      return o;
    });

    updateOrders(updated);

    // Update active modal selected order if open
    if (selectedOrder && selectedOrder.id === orderId) {
      const refreshed = updated.find((o) => o.id === orderId) || null;
      setSelectedOrder(refreshed);
    }

    // Play chime and trigger notification prompt when ready
    if (newStatus === 'ready') {
      if (soundEnabled) {
        soundNotifier.playReadyChime();
      }
      if (orderToNotify) {
        setNotificationOrder(orderToNotify);
      }
    }
  };

  // Trigger Notification to customer
  const handleSendNotification = (
    orderId: string, 
    channel: 'sms' | 'whatsapp', 
    customMessage?: string,
    notifLanguage?: Language
  ) => {
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        const targetLang = notifLanguage || language;
        const msg = customMessage || (channel === 'whatsapp' 
          ? generateNotificationMessage(o, targetLang) 
          : generateSmsMessage(o, targetLang));

        const log: NotificationLog = {
          id: `NOTIF-${Date.now()}`,
          timestamp: new Date().toISOString(),
          channel,
          recipientPhone: o.phoneNumber,
          recipientName: o.customerName,
          status: 'delivered',
          messagePreview: msg,
        };
        const existingLogs = o.notificationLogs || [];

        return {
          ...o,
          notificationSent: true,
          lastNotificationChannel: channel,
          lastNotificationTime: new Date().toISOString(),
          notificationLogs: [...existingLogs, log],
        };
      }
      return o;
    });

    updateOrders(updated);

    if (selectedOrder && selectedOrder.id === orderId) {
      const refreshed = updated.find((o) => o.id === orderId) || null;
      setSelectedOrder(refreshed);
    }

    if (soundEnabled) {
      soundNotifier.playReadyChime();
    }
  };

  // Fixture Inventory Stock Update (Issue / Restock)
  const handleUpdateFixtureStock = (fixtureId: string, deltaKg: number) => {
    const updated = fixtures.map((f) => {
      if (f.id === fixtureId) {
        const newStock = Math.max(0, Math.min(f.capacityKg, f.currentStockKg + deltaKg));
        const addedSold = deltaKg < 0 ? Math.abs(deltaKg) : 0;
        const newSold = f.soldKg + addedSold;
        const unitMargin = f.sellingPricePerKg - f.costPricePerKg;
        const newProfit = f.profitEarned + addedSold * unitMargin;

        const newStatus: FixtureItem['status'] =
          newStock < f.capacityKg * 0.25
            ? 'critical'
            : newStock < f.capacityKg * 0.4
            ? 'low'
            : 'adequate';

        return {
          ...f,
          currentStockKg: newStock,
          soldKg: newSold,
          profitEarned: newProfit,
          lastRestocked: deltaKg > 0 ? new Date().toISOString() : f.lastRestocked,
          status: newStatus,
        };
      }
      return f;
    });

    updateFixtures(updated);
  };

  // Add new Fixture
  const handleAddFixture = (newFix: FixtureItem) => {
    const updated = [newFix, ...fixtures];
    updateFixtures(updated);
  };

  // Save Pricing Rates
  const handleSaveRates = (newRates: StoreRates) => {
    setStoreRates(newRates);
    saveStoredRates(newRates);
  };

  // Save Retention Settings
  const handleSaveRetention = (newSettings: RetentionPolicySettings) => {
    setRetentionSettings(newSettings);
    saveStoredRetention(newSettings);
  };

  // Manual 6-Month Purge
  const handlePurgeExpiredOrders = () => {
    const { purgedCount, updatedOrders } = purgeExpiredOrders(retentionSettings.retentionDays);
    setOrders(updatedOrders);
    setRetentionSettings(getStoredRetention());
    alert(
      language === 'mr'
        ? `६ महिन्यांपेक्षा जुन्या ${purgedCount} ऑर्डर्स यशस्वीरित्या हटवण्यात आल्या आहेत.`
        : `Successfully purged ${purgedCount} orders older than 6 months.`
    );
  };

  const pendingCount = orders.filter((o) => o.status === 'received').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-purple-200 dark:selection:bg-purple-900 selection:text-purple-950 dark:selection:text-purple-200 transition-colors">
      {/* Top Main Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        pendingCount={pendingCount}
        readyCount={readyCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <OperationsDashboard
            orders={orders}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
            onUpdateStatus={handleUpdateOrderStatus}
            onSendNotification={handleSendNotification}
            onOpenNotificationModal={(ord) => setNotificationOrder(ord)}
            language={language}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'active_orders' && (
          <OperationsDashboard
            orders={orders}
            onSelectOrder={(ord) => setSelectedOrder(ord)}
            onOpenNewOrder={() => setIsNewOrderModalOpen(true)}
            onUpdateStatus={handleUpdateOrderStatus}
            onSendNotification={handleSendNotification}
            onOpenNotificationModal={(ord) => setNotificationOrder(ord)}
            language={language}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'inventory' && (
          <FixtureInventoryView
            fixtures={fixtures}
            onUpdateStock={handleUpdateFixtureStock}
            onAddFixture={handleAddFixture}
            language={language}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView language={language} />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            storeRates={storeRates}
            onSaveRates={handleSaveRates}
            retentionSettings={retentionSettings}
            onSaveRetention={handleSaveRetention}
            onPurgeExpiredOrders={handlePurgeExpiredOrders}
            orders={orders}
            language={language}
            setLanguage={setLanguage}
          />
        )}
      </main>

      {/* New Order Intake Register Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onSaveOrder={handleSaveNewOrder}
        language={language}
        storeRates={storeRates}
        orders={orders}
      />

      {/* Order Details, Print Slip & Notification Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onSendNotification={handleSendNotification}
        onOpenNotificationModal={(ord) => setNotificationOrder(ord)}
        language={language}
      />

      {/* Real-time WhatsApp & SMS Notification Dispatcher Modal */}
      <NotificationDispatcherModal
        order={notificationOrder}
        isOpen={!!notificationOrder}
        onClose={() => setNotificationOrder(null)}
        onSendNotification={handleSendNotification}
        language={language}
      />

      {/* Footer Branding */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            <span className="text-slate-800 dark:text-slate-200">Anita Stores (अनिता स्टोअर्स) — Digital Kitchen & Retail POS</span>
          </div>
          <div>
            <span>6-Month Data Retention Compliant • WhatsApp & SMS Dispatcher • English & Marathi (मराठी)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
