import React, { useState } from 'react';
import type { Order, OrderStatus, Language } from '../types';
import { translations } from '../data/translations';
import { getWhatsAppLink } from '../utils/storage';
import confetti from 'canvas-confetti';
import { 
  X, 
  Printer, 
  Send, 
  MessageCircle, 
  MapPin, 
  Archive, 
  Box, 
  ShoppingBag, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Phone, 
  User, 
  ChevronRight,
  Sparkles,
  Check,
  AlertCircle,
  Settings2
} from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  onSendNotification: (orderId: string, channel: 'sms' | 'whatsapp') => void;
  onOpenNotificationModal?: (order: Order) => void;
  language: Language;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onSendNotification,
  onOpenNotificationModal,
  language,
}) => {
  const [notificationSuccessMsg, setNotificationSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const t = translations[language] || translations.en;

  const getContainerIcon = () => {
    switch (order.containerType) {
      case 'steel_dabba': return <Archive className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
      case 'plastic_box': return <Box className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
      case 'cloth_bag': return <ShoppingBag className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'transparent_pouch': return <Layers className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />;
      case 'store_packaging': return <Box className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />;
      default: return <Box className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
    }
  };

  const statusSteps: Array<{ key: OrderStatus; label: string; labelMr: string }> = [
    { key: 'received', label: 'Received (Queued)', labelMr: 'नोंदणी झाली' },
    { key: 'in_production', label: 'In Production (Prepping)', labelMr: 'तयारी सुरू आहे' },
    { key: 'ready', label: 'Ready for Pickup', labelMr: 'तयार (रेडी)' },
    { key: 'collected', label: 'Collected / Handed Over', labelMr: 'ग्राहकाने नेली' },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  const handleNextStatus = () => {
    if (currentStepIndex < statusSteps.length - 1) {
      const nextStatus = statusSteps[currentStepIndex + 1].key;
      onUpdateStatus(order.id, nextStatus);

      if (nextStatus === 'collected') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleTriggerNotify = (channel: 'sms' | 'whatsapp') => {
    onSendNotification(order.id, channel);
    setNotificationSuccessMsg(
      channel === 'whatsapp' 
        ? (language === 'mr' ? 'व्हॉट्सॲप सूचना ग्राहकाला पाठवली!' : 'WhatsApp notification sent to customer!')
        : (language === 'mr' ? 'एसएमएस सूचना पाठवली गेली!' : 'SMS alert dispatched!')
    );
    setTimeout(() => setNotificationSuccessMsg(null), 4000);
  };

  const handlePrint = () => {
    window.print();
  };

  const whatsappUrl = getWhatsAppLink(order, language);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-800/50 border border-purple-700/50">
              <span className="font-mono font-bold text-amber-300 text-sm">
                {order.id}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight text-white">
                  {order.customerName}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  order.status === 'ready' 
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : order.status === 'in_production'
                    ? 'bg-amber-500 text-white'
                    : order.status === 'collected'
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-indigo-600 text-white'
                }`}>
                  {language === 'mr' 
                    ? statusSteps.find(s => s.key === order.status)?.labelMr 
                    : statusSteps.find(s => s.key === order.status)?.label}
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                {t.placedAt}: {new Date(order.createdAt).toLocaleString(language === 'mr' ? 'mr-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title={t.printTicket}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{t.printTicket}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notification Toast Alert */}
        {notificationSuccessMsg && (
          <div className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{notificationSuccessMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          
          {/* Order Lifecycle Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {language === 'mr' ? 'ऑर्डर प्रगती टप्पा' : 'Fulfillment Status Progress'}
              </span>
              {currentStepIndex < statusSteps.length - 1 && (
                <button
                  onClick={handleNextStatus}
                  className="px-3 py-1 bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <span>{t.updateStatus}: {language === 'mr' ? statusSteps[currentStepIndex + 1].labelMr : statusSteps[currentStepIndex + 1].label}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {statusSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div key={step.key} className="space-y-1.5">
                    <div className={`h-2 rounded-full transition-all ${
                      isPassed ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                    }`} />
                    <div className="flex items-center gap-1">
                      {isPassed ? (
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-emerald-500 dark:text-emerald-400'}`} />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                      )}
                      <span className={`text-[11px] font-semibold truncate ${
                        isCurrent ? 'text-purple-950 dark:text-purple-200 font-bold' : isPassed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                      }`}>
                        {language === 'mr' ? step.labelMr : step.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CRITICAL PICKUP SECTION: Container Type & Exact Storage Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Storage Rack Location Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-md space-y-1.5 border border-purple-800">
              <div className="flex items-center gap-2 text-amber-300">
                <MapPin className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t.containerLocationCard}
                </span>
              </div>
              <div className="text-xl font-black tracking-tight text-white">
                {order.storageLocation}
              </div>
              <p className="text-xs text-purple-200">
                {language === 'mr' ? 'ग्राहक आल्यावर थेट या रॅकवरून वस्तू द्यावी.' : 'Direct pickup spot for store counter staff.'}
              </p>
            </div>

            {/* Container Description & Identification */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                {getContainerIcon()}
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t.containerInfo}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {order.containerDescription}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="font-semibold text-purple-900 dark:text-purple-400">{t.storedIn}:</span>
                <span className="capitalize">{order.containerType.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Customer and Contact Details */}
          <div className="flex flex-wrap items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t.customerInfo}:</span>
              <strong className="text-slate-900 dark:text-white font-bold">{order.customerName}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">{t.phoneNumber}:</span>
              <a href={`tel:${order.phoneNumber}`} className="text-purple-700 dark:text-purple-400 font-bold hover:underline">
                +91 {order.phoneNumber}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400 font-medium">{language === 'mr' ? 'पेमेंट:' : 'Payment:'}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                order.paymentStatus === 'paid' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}>
                {order.paymentStatus.toUpperCase()} ({order.paymentMethod.toUpperCase()})
              </span>
            </div>
          </div>

          {/* Order Items Table & Spices Calculation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {language === 'mr' ? 'ऑर्डरमधील वस्तू व मजुरी/मसाला खर्च' : 'Order Items & Processing Breakdown'}
            </h3>
            
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {language === 'mr' ? item.productNameMr : item.productName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                        {item.variety}
                      </span>
                    </div>

                    {/* Spices Breakdown note */}
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      {item.spicesProvidedByCustomer ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {language === 'mr' ? 'ग्राहकाने मसाले दिले (बेस दर आकारला)' : 'Customer Supplied Spices (Standard base rate applied)'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                          <Flame className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          {language === 'mr' ? `स्टोअर मसाले (+₹${item.spiceCostPerKg}/kg समाविष्ट)` : `Anita Stores Spices (+₹${item.spiceCostPerKg}/kg added)`}
                        </span>
                      )}
                      {item.spiceDetails && (
                        <span className="text-slate-400 dark:text-slate-500 italic">({item.spiceDetails})</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      ₹{item.itemTotal.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.quantityKg} kg @ ₹{item.baseRatePerKg + item.spiceCostPerKg}/kg
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Math Summary */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <div>{t.baseRate}: <strong className="text-slate-800 dark:text-slate-200">₹{order.baseTotal}</strong></div>
                <div>{t.spiceCharge}: <strong className="text-slate-800 dark:text-slate-200">₹{order.spiceTotal}</strong></div>
                {order.taxAmount > 0 && <div>{t.tax}: <strong className="text-slate-800 dark:text-slate-200">₹{order.taxAmount}</strong></div>}
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">{t.total}</span>
                <span className="text-2xl font-black text-purple-950 dark:text-purple-300">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Real-Time Notification Trigger Hub */}
          <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-950 dark:text-purple-200">
                  {language === 'mr' ? 'रिअल-टाइम ग्राहक सूचना (Order Ready Alert)' : 'Real-time Customer Notification Dispatcher'}
                </h4>
              </div>
              {order.notificationSent && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <Check className="w-3 h-3" />
                  {language === 'mr' ? 'सूचना पाठवली आहे' : 'Alert Triggered'}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {language === 'mr' 
                ? 'माल तयार झाल्यावर एका क्लिकवर ग्राहकाला रॅक जागा आणि बिलासह व्हॉट्सॲप किंवा एसएमएस पाठवा.' 
                : 'Instantly notify customer with pickup rack location, container notes, and ready status.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* WhatsApp Trigger Button with direct Web link */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleTriggerNotify('whatsapp')}
                className="flex-1 min-w-[170px] py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.sendWhatsApp}</span>
              </a>

              {/* In-app Simulated SMS Trigger */}
              <button
                type="button"
                onClick={() => handleTriggerNotify('sms')}
                className="flex-1 min-w-[170px] py-2.5 px-3.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{t.sendSms}</span>
              </button>

              {/* Advanced Custom Dispatcher Modal Trigger */}
              {onOpenNotificationModal && (
                <button
                  type="button"
                  onClick={() => onOpenNotificationModal(order)}
                  className="py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-900 dark:text-purple-300 font-bold text-xs rounded-xl border border-purple-200 dark:border-purple-700 shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Customize notification text or language"
                >
                  <Settings2 className="w-4 h-4" />
                  <span>{language === 'mr' ? 'कस्टमाइज' : 'Customize'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Footer: Handover / Collect */}
          {order.status !== 'collected' && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(order.id, 'collected', 'Collected at counter');
                  confetti({
                    particleCount: 100,
                    spread: 80,
                    origin: { y: 0.6 }
                  });
                }}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t.markPickedUp}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

