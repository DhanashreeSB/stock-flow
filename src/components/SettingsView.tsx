import React, { useState } from 'react';
import type { StoreRates, RetentionPolicySettings, Language, Order } from '../types';
import { translations } from '../data/translations';
import { 
  Settings, 
  Trash2, 
  Save, 
  Printer, 
  Check, 
  Database, 
  DollarSign, 
  HardDrive
} from 'lucide-react';

interface SettingsViewProps {
  storeRates: StoreRates;
  onSaveRates: (rates: StoreRates) => void;
  retentionSettings: RetentionPolicySettings;
  onSaveRetention: (settings: RetentionPolicySettings) => void;
  onPurgeExpiredOrders: () => void;
  orders: Order[];
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  storeRates,
  onSaveRates,
  retentionSettings,
  onSaveRetention,
  onPurgeExpiredOrders,
  orders,
  language,
  setLanguage,
}) => {
  const t = translations[language] || translations.en;

  // Local state for rates
  const [wafersBase, setWafersBase] = useState(storeRates.wafersBaseRatePerKg);
  const [wafersSpice, setWafersSpice] = useState(storeRates.wafersSpiceChargePerKg);
  const [vermicelliBase, setVermicelliBase] = useState(storeRates.vermicelliBaseRatePerKg);
  const [vermicelliSpice, setVermicelliSpice] = useState(storeRates.vermicelliSpiceChargePerKg);
  const [taxPercent, setTaxPercent] = useState(storeRates.taxPercent);

  // Retention state
  const [autoDelete, setAutoDelete] = useState(retentionSettings.autoDeleteAfter6Months);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Calculate orders older than 180 days (6 months)
  const cutoffTime = Date.now() - 180 * 24 * 60 * 60 * 1000;
  const expiredOrdersCount = orders.filter(o => new Date(o.createdAt).getTime() < cutoffTime).length;
  const activeOrdersCount = orders.length - expiredOrdersCount;

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedRates: StoreRates = {
      wafersBaseRatePerKg: wafersBase,
      wafersSpiceChargePerKg: wafersSpice,
      vermicelliBaseRatePerKg: vermicelliBase,
      vermicelliSpiceChargePerKg: vermicelliSpice,
      taxPercent: taxPercent,
    };
    onSaveRates(updatedRates);

    const updatedRetention: RetentionPolicySettings = {
      ...retentionSettings,
      autoDeleteAfter6Months: autoDelete,
    };
    onSaveRetention(updatedRetention);

    setSavedSuccessMsg(language === 'mr' ? 'सेटिंग्ज यशस्वीरित्या सेव्ह झाल्या!' : 'Store settings updated successfully!');
    setTimeout(() => setSavedSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-900 dark:text-purple-400" />
            <span>{t.navSettings}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {language === 'mr' 
              ? '६ महिन्यांचे डेटा रिटेन्शन धोरण, दर पत्रक आणि नोटिफिकेशन सेटिंग्ज व्यवस्थापित करा.' 
              : 'Manage 6-month retention compliance, standard rates matrix, and connected POS hardware.'}
          </p>
        </div>

        {/* Quick Language Toggle in Settings */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Language / भाषा:</span>
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'en' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                language === 'mr' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              मराठी (Marathi)
            </button>
          </div>
        </div>
      </div>

      {savedSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{savedSuccessMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 6-Month Data Retention Policy (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: 6-Month Policy & Auto-Purge Manager */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.retentionTitle}</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">{language === 'mr' ? 'डेटा गोपनीयता व १८० दिवसांचे धोरण' : '180-Day Rolling Storage Limit'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              {t.retentionDesc}
            </p>

            {/* Storage Usage Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{t.storageUsage}</span>
                <span className="font-bold text-purple-900 dark:text-purple-300">{orders.length} {language === 'mr' ? 'एकूण नोंदी' : 'Total Records'}</span>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="bg-purple-600 h-full" 
                  style={{ width: `${Math.max(15, (activeOrdersCount / (orders.length || 1)) * 100)}%` }} 
                  title={`Active: ${activeOrdersCount}`}
                />
                {expiredOrdersCount > 0 && (
                  <div 
                    className="bg-rose-500 h-full animate-pulse" 
                    style={{ width: `${(expiredOrdersCount / (orders.length || 1)) * 100}%` }} 
                    title={`Expired > 6 months: ${expiredOrdersCount}`}
                  />
                )}
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  {t.activeRecords}: <strong className="text-slate-800 dark:text-slate-200">{activeOrdersCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  {t.expiredRecords}: <strong className="text-rose-600 dark:text-rose-400">{expiredOrdersCount}</strong>
                </span>
              </div>
            </div>

            {/* Auto Delete Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">{t.autoPurgeActive}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">{language === 'mr' ? '१८० दिवस पूर्ण झाल्यावर आपोआप डेटा हटवला जातो' : 'Purges historical entries older than 6 months seamlessly'}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoDelete}
                  onChange={(e) => setAutoDelete(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-900 dark:peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Purge Now Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'mr' ? 'मागील एकूण हटवलेल्या नोंदी:' : 'Total orders purged historically:'} <strong className="text-slate-800 dark:text-slate-200">{retentionSettings.deletedOrdersCount}</strong>
              </div>
              <button
                type="button"
                onClick={onPurgeExpiredOrders}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>{t.purgeNowBtn}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Hardware & POS Integrations (Printer & KDS) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Printer className="w-4 h-4 text-purple-900 dark:text-purple-400" />
              <span>{language === 'mr' ? 'काउंटर हार्डवेअर व प्रिंटर स्थिती' : 'Connected Hardware & Label Maker'}</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block">Thermal Receipt Printer (Station 1)</strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">ESC/POS 80mm Token Slip</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div>
                    <strong className="text-slate-900 dark:text-white block">Kitchen KDS Display Line</strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Touch Terminal Station A</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Rates Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSaveRates} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <DollarSign className="w-5 h-5 text-purple-900 dark:text-purple-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.ratesConfiguration}</h2>
            </div>

            {/* Wafers Base & Spice Surcharge */}
            <div className="space-y-3 p-3.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/60 text-xs">
              <span className="font-bold text-purple-950 dark:text-purple-200 block">{t.wafersTitle}</span>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">{t.wafersBasePriceLabel}</label>
                <input
                  type="number"
                  value={wafersBase}
                  onChange={(e) => setWafersBase(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">{t.wafersSpicePriceLabel}</label>
                <input
                  type="number"
                  value={wafersSpice}
                  onChange={(e) => setWafersSpice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-600"
                />
              </div>
            </div>

            {/* Vermicelli Base & Spice Surcharge */}
            <div className="space-y-3 p-3.5 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs">
              <span className="font-bold text-indigo-950 dark:text-indigo-200 block">{t.vermicelliTitle}</span>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">{t.vermicelliBasePriceLabel}</label>
                <input
                  type="number"
                  value={vermicelliBase}
                  onChange={(e) => setVermicelliBase(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">{t.vermicelliSpicePriceLabel}</label>
                <input
                  type="number"
                  value={vermicelliSpice}
                  onChange={(e) => setVermicelliSpice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* Tax / Packaging Percentage */}
            <div className="text-xs">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">{language === 'mr' ? 'पॅकिंग व कर (%):' : 'Estimated Tax & Packaging (%)'}</label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="w-full py-3 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

