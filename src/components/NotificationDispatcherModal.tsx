import React, { useState } from 'react';
import type { Order, Language } from '../types';
import { translations } from '../data/translations';
import { 
  generateNotificationMessage, 
  generateSmsMessage} from '../utils/storage';
import { 
  MessageSquare, 
  Phone, 
  Send, 
  Copy, 
  Check, 
  X, 
  MapPin, 
  Package, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface NotificationDispatcherModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSendNotification: (orderId: string, channel: 'sms' | 'whatsapp') => void;
  language?: Language;
  defaultLanguage?: Language;
}

export const NotificationDispatcherModal: React.FC<NotificationDispatcherModalProps> = ({
  order,
  isOpen,
  onClose,
  onSendNotification,
  language = 'en',
  defaultLanguage,
}) => {
  if (!isOpen || !order) return null;

  const activeLang: Language = language || defaultLanguage || 'en';
  const t = translations[activeLang] || translations.en;
  const [selectedChannel, setSelectedChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [msgLanguage, setMsgLanguage] = useState<Language>(activeLang);
  const [copied, setCopied] = useState(false);
  const [isSentSuccess, setIsSentSuccess] = useState(false);
  const [customText, setCustomText] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const defaultWhatsAppMsg = generateNotificationMessage(order, msgLanguage);
  const defaultSmsMsg = generateSmsMessage(order, msgLanguage);
  const currentMsg = isEditing 
    ? customText 
    : (selectedChannel === 'whatsapp' ? defaultWhatsAppMsg : defaultSmsMsg);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentMsg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDispatchWhatsApp = () => {
    const cleanPhone = order.phoneNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const link = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(currentMsg)}`;
    
    // Open WhatsApp Web or mobile app in a new window/tab
    window.open(link, '_blank', 'noopener,noreferrer');
    
    onSendNotification(order.id, 'whatsapp');
    setIsSentSuccess(true);
    setTimeout(() => {
      setIsSentSuccess(false);
      onClose();
    }, 1800);
  };

  const handleDispatchSMS = () => {
    // For SMS on mobile or web, can use sms: link or internal carrier dispatch
    const cleanPhone = order.phoneNumber.replace(/[^0-9]/g, '');
    const smsLink = `sms:${cleanPhone}?body=${encodeURIComponent(currentMsg)}`;
    
    // Attempt opening device SMS app if supported, else record dispatch
    try {
      window.location.href = smsLink;
    } catch {
      // fallback
    }

    onSendNotification(order.id, 'sms');
    setIsSentSuccess(true);
    setTimeout(() => {
      setIsSentSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  {t.readyNotificationBanner}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  {order.id}
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                {t.notifyModalTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Customer & Storage Snapshot Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-xs">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{t.customerContact}</span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {order.customerName}
              </p>
              <p className="text-slate-600 dark:text-slate-300 font-mono">
                +91 {order.phoneNumber}
              </p>
            </div>

            <div className="space-y-1 sm:border-l sm:border-purple-200/60 dark:sm:border-purple-800/50 sm:pl-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{t.storedLocationPrompt}</span>
              </div>
              <p className="font-bold text-purple-950 dark:text-purple-200">
                {order.storageLocation}
              </p>
              <p className="text-slate-600 dark:text-slate-300 truncate" title={order.containerDescription}>
                <Package className="w-3 h-3 inline mr-1 text-slate-400" />
                {order.containerDescription || order.containerType}
              </p>
            </div>
          </div>

          {/* Channel Selector Tabs */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              {language === 'mr' ? 'संदेश पाठवण्याचे माध्यम (Channel)' : 'Select Notification Channel'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedChannel('whatsapp');
                  setIsEditing(false);
                }}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition-all ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.channelWhatsApp}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedChannel('sms');
                  setIsEditing(false);
                }}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border font-bold text-xs transition-all ${
                  selectedChannel === 'sms'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-800 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                }`}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t.channelSms}</span>
              </button>
            </div>
          </div>

          {/* Message Language & Action Switcher */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.messagePreview}
            </label>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                {language === 'mr' ? 'संदेश भाषा:' : 'Template Lang:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMsgLanguage('mr');
                  setIsEditing(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  msgLanguage === 'mr'
                    ? 'bg-purple-900 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => {
                  setMsgLanguage('en');
                  setIsEditing(false);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  msgLanguage === 'en'
                    ? 'bg-purple-900 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Message Preview Box */}
          <div className="relative">
            <textarea
              rows={selectedChannel === 'whatsapp' ? 6 : 4}
              value={currentMsg}
              onChange={(e) => {
                setCustomText(e.target.value);
                setIsEditing(true);
              }}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-purple-600/40 select-text"
            />

            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold border border-slate-200 dark:border-slate-700 shadow-xs transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-600">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{t.copyMessage}</span>
                </>
              )}
            </button>
          </div>

          {/* Previous Dispatch Status Banner if already sent */}
          {order.notificationSent && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {language === 'mr' 
                  ? `या ऑर्डरसाठी पूर्वी ${order.lastNotificationChannel?.toUpperCase()} द्वारे संदेश पाठवला गेला आहे (${order.lastNotificationTime ? new Date(order.lastNotificationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}).` 
                  : `Previously notified via ${order.lastNotificationChannel?.toUpperCase()} at ${order.lastNotificationTime ? new Date(order.lastNotificationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}.`}
              </span>
            </div>
          )}

          {/* Success Flash */}
          {isSentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold text-center animate-in zoom-in-95 duration-150 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{t.notificationSuccess}</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
          >
            {t.closeModal}
          </button>

          {selectedChannel === 'whatsapp' ? (
            <button
              type="button"
              onClick={handleDispatchWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.openWhatsAppDirect}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDispatchSMS}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t.sendSmsDirect}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
