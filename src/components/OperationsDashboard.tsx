import React, { useState } from 'react';
import type { Order, OrderStatus, Language } from '../types';
import { translations } from '../data/translations';
import { 
  ClipboardList, 
  Clock, 
  Flame, 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Sparkles,
  Archive,
  Box,
  Layers,
  Check} from 'lucide-react';

interface OperationsDashboardProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onOpenNewOrder: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onSendNotification: (orderId: string, channel: 'sms' | 'whatsapp') => void;
  onOpenNotificationModal?: (order: Order) => void;
  language: Language;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const OperationsDashboard: React.FC<OperationsDashboardProps> = ({
  orders,
  onSelectOrder,
  onOpenNewOrder,
  onUpdateStatus,
  onSendNotification,
  onOpenNotificationModal,
  language,
  searchQuery,
  setSearchQuery,
}) => {
  const t = translations[language] || translations.en;
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [productFilter, setProductFilter] = useState<'all' | 'wafers' | 'vermicelli'>('all');

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    // Search query
    const matchSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phoneNumber.includes(searchQuery) ||
      o.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.containerDescription.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;

    // Product filter
    const matchProduct =
      productFilter === 'all' ||
      (productFilter === 'wafers' && o.items.some((i) => i.productType === 'indian_wafers')) ||
      (productFilter === 'vermicelli' && o.items.some((i) => i.productType === 'vermicelli'));

    return matchSearch && matchStatus && matchProduct;
  });

  // Calculate high-level KPIs
  const pendingOrdersCount = orders.filter((o) => o.status === 'received').length;
  const inProgressCount = orders.filter((o) => o.status === 'in_production').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const collectedCount = orders.filter((o) => o.status === 'collected').length;

  const getContainerBadge = (type: Order['containerType']) => {
    switch (type) {
      case 'steel_dabba': return { label: language === 'mr' ? 'स्टील डबा' : 'Steel Dabba', icon: Archive, color: 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      case 'plastic_box': return { label: language === 'mr' ? 'प्लास्टिक डबा' : 'Plastic Box', icon: Box, color: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'cloth_bag': return { label: language === 'mr' ? 'कापडी पिशवी' : 'Cloth Bag', icon: ShoppingBag, color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'transparent_pouch': return { label: language === 'mr' ? 'प्लास्टिक पिशवी' : 'Pouch', icon: Layers, color: 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-900 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' };
      case 'store_packaging': return { label: language === 'mr' ? 'स्टोअर बॉक्स' : 'Store Box', icon: Box, color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      default: return { label: 'Container', icon: Box, color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Operations KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.pendingOrders}
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{pendingOrdersCount}</span>
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
              {language === 'mr' ? 'नोंदणी प्रतीक्षा' : 'Queued'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'आज नवीन आलेली कामे' : 'Needs processing kick-off'}</span>
          </div>
        </div>

        {/* Card 2: In Progress / Prepping */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.inProgress}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{inProgressCount}</span>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              {t.activeStations}: 4/5
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {language === 'mr' ? 'वेफर्स स्लाइसिंग, बॉइलिंग व शेवया तयार' : 'Kettle & sun-drying batches active'}
          </div>
        </div>

        {/* Card 3: Ready for Pickup */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/40 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-xs hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              {t.readyForPickup}
            </span>
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-950 dark:text-emerald-100">{readyCount}</span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full animate-pulse">
              {language === 'mr' ? 'उचलण्यासाठी सज्ज' : 'Ready on Shelf'}
            </span>
          </div>
          <div className="mt-3 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            {language === 'mr' ? 'ग्राहकांना मेसेज पाठवून रॅकवर ठेवले' : 'Customer notified / stored on rack'}
          </div>
        </div>

        {/* Card 4: Collected Today */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.collectedToday}
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{collectedCount}</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {language === 'mr' ? 'यशस्वी वाटप' : 'Completed'}
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {language === 'mr' ? '६ महिन्यांच्या रजिस्टरमध्ये साठवले' : '6-Month compliant digital record'}
          </div>
        </div>
      </div>

      {/* Main Section: Active Production Queue & Digital Register */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        
        {/* Header & Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{language === 'mr' ? 'सक्रिय ऑर्डर्स व डिजिटल रजिस्टर' : 'Active Production Queue & Register'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 font-bold">
                {filteredOrders.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' 
                ? 'कागदी वह्या न वापरता येथे सर्व ऑर्डर्स, भांडे प्रकार व ठेवलेली जागा व्यवस्थापित करा.' 
                : 'Manage customer batches, spice selections, and container shelf locations.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Buttons */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'all' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {language === 'mr' ? 'सर्व' : 'All'}
              </button>
              <button
                onClick={() => setStatusFilter('received')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'received' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.statusReceived}
              </button>
              <button
                onClick={() => setStatusFilter('in_production')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'in_production' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.statusInProduction}
              </button>
              <button
                onClick={() => setStatusFilter('ready')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'ready' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.statusReady}
              </button>
              <button
                onClick={() => setStatusFilter('collected')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === 'collected' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.statusCollected}
              </button>
            </div>

            {/* Product Variety Filter */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value as 'all' | 'wafers' | 'vermicelli')}
              className="px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 outline-hidden text-slate-700 dark:text-slate-200"
            >
              <option value="all">{t.filterAll}</option>
              <option value="wafers">{t.filterWafers}</option>
              <option value="vermicelli">{t.filterVermicelli}</option>
            </select>
          </div>
        </div>

        {/* Orders Card Grid */}
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">{t.noOrdersFound}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              {language === 'mr' 
                ? 'नवीन ग्राहकाची ऑर्डर नोंदवण्यासाठी वरील "+ नवीन नोंदणी" बटनावर क्लिक करा.' 
                : 'Click "+ New Manual Order" to register a new customer batch.'}
            </p>
            <button
              onClick={onOpenNewOrder}
              className="mt-2 px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
            >
              {t.newOrderBtn}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => {
              const containerBadge = getContainerBadge(order.containerType);
              const ContainerIcon = containerBadge.icon;
              
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-300 dark:hover:border-purple-600/60 shadow-xs hover:shadow-lg dark:hover:shadow-purple-950/20 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/70">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-mono font-bold text-xs text-purple-900 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/90 px-2 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800/80">
                        {order.id}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.status === 'ready'
                            ? 'bg-emerald-500 text-white animate-pulse'
                            : order.status === 'in_production'
                            ? 'bg-amber-500 text-white'
                            : order.status === 'collected'
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/50 dark:border-slate-700/60'
                            : 'bg-indigo-600 dark:bg-indigo-500 text-white'
                        }`}
                      >
                        {order.status === 'ready'
                          ? t.statusReady
                          : order.status === 'in_production'
                          ? t.statusInProduction
                          : order.status === 'collected'
                          ? t.statusCollected
                          : t.statusReceived}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                      {order.customerName}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      <span>+91 {order.phoneNumber}</span>
                    </div>
                  </div>

                  {/* Card Body: Items & Spices Breakdown */}
                  <div className="p-4 space-y-3.5 flex-1">
                    <div className="space-y-1.5">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-xs flex items-center justify-between text-slate-700 dark:text-slate-200">
                          <span className="font-medium truncate max-w-[200px]">
                            {language === 'mr' ? item.productNameMr : item.productName}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">{item.quantityKg} kg</span>
                        </div>
                      ))}
                    </div>

                    {/* Spices Highlight */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                      {order.items.some((i) => i.spicesProvidedByCustomer) ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/70">
                          <Check className="w-3 h-3" />
                          {language === 'mr' ? 'ग्राहक मसाले (बेस दर)' : 'Customer Spices (Std Rate)'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/70">
                          <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          {language === 'mr' ? 'स्टोअर मसाले शुल्क समाविष्ट' : 'Store Spices Added'}
                        </span>
                      )}
                    </div>

                    {/* Container & Exact Storage Location Badge */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200/80 dark:border-slate-800/90 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1.5">
                          <ContainerIcon className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                          <span className="truncate max-w-[130px]">{containerBadge.label}</span>
                        </span>
                        <span className="font-extrabold text-slate-900 dark:text-amber-300">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-purple-950 dark:text-purple-200 font-bold bg-purple-100/70 dark:bg-purple-950/80 px-2.5 py-1.5 rounded-lg border border-purple-200/90 dark:border-purple-800/80">
                        <MapPin className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400 flex-shrink-0" />
                        <span className="truncate">{order.storageLocation}</span>
                      </div>
                    </div>

                    {/* Notification Status Badge if sent */}
                    {order.notificationSent && (
                      <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/70">
                        <span className="flex items-center gap-1 font-semibold">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {order.lastNotificationChannel === 'whatsapp' ? 'WhatsApp Sent' : 'SMS Sent'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {order.lastNotificationTime ? new Date(order.lastNotificationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-950/80 flex items-center gap-2">
                    <button
                      onClick={() => onSelectOrder(order)}
                      className="flex-1 py-1.5 px-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-purple-900 dark:hover:text-purple-300 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 rounded-lg transition-colors cursor-pointer"
                    >
                      {language === 'mr' ? 'तपशील' : 'Details'}
                    </button>

                    {/* Quick WhatsApp / SMS Direct Trigger if Ready */}
                    {order.status === 'ready' && onOpenNotificationModal && (
                      <button
                        onClick={() => onOpenNotificationModal(order)}
                        title="Notify Customer via WhatsApp or SMS"
                        className="p-1.5 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 rounded-lg transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}

                    {/* Advance Status Button */}
                    {order.status === 'received' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'in_production')}
                        className="py-1.5 px-3 bg-purple-900 hover:bg-purple-800 dark:bg-purple-700 dark:hover:bg-purple-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                      >
                        {language === 'mr' ? 'तयारी सुरू करा' : 'Start Prep'}
                      </button>
                    )}

                    {order.status === 'in_production' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'ready')}
                        className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t.markAsReadyAction}</span>
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'collected')}
                        className="py-1.5 px-3 bg-slate-800 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-xs border dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        {t.markPickedUp}
                      </button>
                    )}

                    {order.status === 'collected' && (
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-400 px-2">
                        {language === 'mr' ? 'पूर्ण' : 'Collected'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

