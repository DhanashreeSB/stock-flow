import React, { useState } from 'react';
import type {
  Order,
  OrderItem,
  ContainerType,
  Language,
  StoreRates,
  ProductType
} from '../types';
import { translations } from '../data/translations';
import { 
  X, 
  Sparkles, 
  Box, 
  ShoppingBag, 
  Archive, 
  MapPin, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  Flame,
  Info
} from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveOrder: (newOrder: Order) => void;
  language: Language;
  storeRates: StoreRates;
  orders: Order[];
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onSaveOrder,
  language,
  storeRates,
  orders,
}) => {
  const t = translations[language] || translations.en;

  const existingCustomers = Array.from(
    new Map(
      orders.map((order) => [order.phoneNumber, {
        name: order.customerName,
        phoneNumber: order.phoneNumber,
      }])
    ).values()
  ).sort((first, second) => first.name.localeCompare(second.name));

  // Customer state
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleCustomerSelect = (phone: string) => {
    const customer = existingCustomers.find((entry) => entry.phoneNumber === phone);
    if (!customer) {
      setCustomerName('');
      setPhoneNumber('');
      return;
    }

    setCustomerName(customer.name);
    setPhoneNumber(customer.phoneNumber);
  };

  // Primary selected product items
  const [items, setItems] = useState<Array<{
    productType: ProductType;
    variety: string;
    quantityKg: number;
    spicesProvidedByCustomer: boolean;
    spiceDetails: string;
  }>>([
    {
      productType: 'indian_wafers',
      variety: t.varietyWafersPotato,
      quantityKg: 10,
      spicesProvidedByCustomer: false,
      spiceDetails: '',
    }
  ]);

  // Container & Location
  const [containerType, setContainerType] = useState<ContainerType>('steel_dabba');
  const [containerDescription, setContainerDescription] = useState('');
  const [storageLocation, setStorageLocation] = useState('Rack A - Shelf 1 (रॅक अ - कप्पा १)');
  const [specialNotes, setSpecialNotes] = useState('');

  // Payment
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');

  if (!isOpen) return null;

  // Calculation helpers
  const calculateItemCost = (item: typeof items[0]) => {
    const isWafers = item.productType === 'indian_wafers';
    const baseRate = isWafers ? storeRates.wafersBaseRatePerKg : storeRates.vermicelliBaseRatePerKg;
    const spiceRate = item.spicesProvidedByCustomer ? 0 : (isWafers ? storeRates.wafersSpiceChargePerKg : storeRates.vermicelliSpiceChargePerKg);
    const itemTotal = item.quantityKg * (baseRate + spiceRate);
    const baseSubtotal = item.quantityKg * baseRate;
    const spiceSubtotal = item.quantityKg * spiceRate;
    return { baseRate, spiceRate, baseSubtotal, spiceSubtotal, itemTotal };
  };

  const calculatedItems: OrderItem[] = items.map((it, idx) => {
    const calc = calculateItemCost(it);
    const isWafers = it.productType === 'indian_wafers';
    return {
      id: `ITM-${Date.now()}-${idx}`,
      productType: it.productType,
      productName: isWafers ? 'Indian Wafers (बटाटा वेफर्स)' : 'Vermicelli / Shevai (शेवया)',
      productNameMr: isWafers ? 'बटाटा वेफर्स / पापड' : 'शेवया / कुरडई',
      variety: it.variety,
      quantityKg: it.quantityKg,
      spicesProvidedByCustomer: it.spicesProvidedByCustomer,
      spiceDetails: it.spiceDetails,
      baseRatePerKg: calc.baseRate,
      spiceCostPerKg: calc.spiceRate,
      itemTotal: calc.itemTotal,
    };
  });

  const baseTotal = calculatedItems.reduce((acc, curr) => acc + (curr.quantityKg * curr.baseRatePerKg), 0);
  const spiceTotal = calculatedItems.reduce((acc, curr) => acc + (curr.quantityKg * curr.spiceCostPerKg), 0);
  const subtotal = baseTotal + spiceTotal;
  const taxAmount = Math.round((subtotal * (storeRates.taxPercent / 100)) * 100) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleAddItem = (type: ProductType) => {
    const isWafers = type === 'indian_wafers';
    setItems(prev => [
      ...prev,
      {
        productType: type,
        variety: isWafers ? t.varietyWafersSpicy : t.varietyVermicelliRoasted,
        quantityKg: 10,
        spicesProvidedByCustomer: false,
        spiceDetails: '',
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, updates: Partial<typeof items[0]>) => {
    setItems(prev => prev.map((it, idx) => idx === index ? { ...it, ...updates } : it));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim()) {
      alert(language === 'mr' ? 'कृपया ग्राहकाचे नाव आणि फोन नंबर प्रविष्ट करा.' : 'Please enter customer name and phone number.');
      return;
    }

    const randomOrderNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `ORD-${randomOrderNum}`,
      customerName: customerName.trim(),
      phoneNumber: phoneNumber.trim(),
      items: calculatedItems,
      baseTotal,
      spiceTotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      containerType,
      containerDescription: containerDescription.trim() || (language === 'mr' ? 'ग्राहकाचे भांडे' : 'Customer Container'),
      storageLocation: storageLocation.trim(),
      specialNotes: specialNotes.trim(),
      createdAt: new Date().toISOString(),
      status: 'received',
      statusHistory: [
        {
          status: 'received',
          timestamp: new Date().toISOString(),
          note: language === 'mr' ? 'ऑर्डर काउंटरवर नोंदवली गेली' : 'Order received at counter',
        }
      ],
      notificationSent: false,
      paymentStatus,
      paymentMethod,
    };

    onSaveOrder(newOrder);
    onClose();
  };

  const containerOptions: Array<{ type: ContainerType; label: string; icon: React.ReactNode }> = [
    { type: 'steel_dabba', label: t.containerSteelDabba, icon: <Archive className="w-5 h-5" /> },
    { type: 'plastic_box', label: t.containerPlasticBox, icon: <Box className="w-5 h-5" /> },
    { type: 'cloth_bag', label: t.containerClothBag, icon: <ShoppingBag className="w-5 h-5" /> },
    { type: 'transparent_pouch', label: t.containerPouch, icon: <Layers className="w-5 h-5" /> },
    { type: 'store_packaging', label: t.containerStoreBag, icon: <Box className="w-5 h-5 text-purple-600" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="relative w-full max-w-4xl max-h-[calc(100dvh-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 via-indigo-950 to-purple-950 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-800/60 border border-purple-600/40">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {t.orderIntakeTitle}
              </h2>
              <p className="text-xs text-purple-200">
                {language === 'mr' ? 'कागदी रजिस्टर बंद करा — डिजिटल नोंदणी करा' : 'Paperless order intake for Anita Stores'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-200 hover:text-white hover:bg-purple-800/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Form Fields (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Section 1: Customer Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  {t.customerDetails}
                </h3>
                {existingCustomers.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {language === 'mr' ? 'विद्यमान ग्राहक निवडा' : 'Select Existing Customer'}
                    </label>
                    <select
                      value={phoneNumber}
                      onChange={(event) => handleCustomerSelect(event.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-hidden transition-all"
                    >
                      <option value="">
                        {language === 'mr' ? 'नवीन ग्राहक किंवा नावाने शोधा' : 'New customer or enter details below'}
                      </option>
                      {existingCustomers.map((customer) => (
                        <option key={customer.phoneNumber} value={customer.phoneNumber}>
                          {customer.name} - {customer.phoneNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.fullName} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t.fullNamePlaceholder}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-hidden transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.phoneNumber} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Products & Custom Batch Specification */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    {t.productSelection}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddItem('indian_wafers')}
                      className="text-xs px-2.5 py-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold rounded-lg border border-purple-200 dark:border-purple-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {language === 'mr' ? 'वेफर्स' : 'Wafers'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddItem('vermicelli')}
                      className="text-xs px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {language === 'mr' ? 'शेवया' : 'Vermicelli'}
                    </button>
                  </div>
                </div>

                {items.map((item, idx) => {
                  const isWafers = item.productType === 'indian_wafers';
                  const baseRate = isWafers ? storeRates.wafersBaseRatePerKg : storeRates.vermicelliBaseRatePerKg;
                  const spiceRate = isWafers ? storeRates.wafersSpiceChargePerKg : storeRates.vermicelliSpiceChargePerKg;
                  
                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isWafers 
                          ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/50' 
                          : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isWafers ? 'bg-purple-900 dark:bg-purple-700 text-white' : 'bg-indigo-900 dark:bg-indigo-700 text-white'
                          }`}>
                            #{idx + 1} {isWafers ? 'Indian Wafers (वेफर्स)' : 'Vermicelli (शेवया)'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {language === 'mr' ? `बेस: ₹${baseRate}/kg` : `Base: ₹${baseRate}/kg`}
                          </span>
                        </div>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-3">
                        {/* Variety Selector */}
                        <div className="sm:col-span-8">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {t.variety}
                          </label>
                          <select
                            value={item.variety}
                            onChange={(e) => handleItemChange(idx, { variety: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-1 focus:ring-purple-600"
                          >
                            {isWafers ? (
                              <>
                                <option value={t.varietyWafersPotato}>{t.varietyWafersPotato}</option>
                                <option value={t.varietyWafersSpicy}>{t.varietyWafersSpicy}</option>
                                <option value={t.varietyWafersSabudana}>{t.varietyWafersSabudana}</option>
                              </>
                            ) : (
                              <>
                                <option value={t.varietyVermicelliRoasted}>{t.varietyVermicelliRoasted}</option>
                                <option value={t.varietyVermicelliFine}>{t.varietyVermicelliFine}</option>
                                <option value={t.varietyKurdayi}>{t.varietyKurdayi}</option>
                              </>
                            )}
                          </select>
                        </div>

                        {/* Quantity in KG */}
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {t.quantity}
                          </label>
                          <div className="flex items-center">
                            <input
                              type="number"
                              min="1"
                              max="1000"
                              step="0.5"
                              value={item.quantityKg}
                              onChange={(e) => handleItemChange(idx, { quantityKg: Math.max(0.5, parseFloat(e.target.value) || 1) })}
                              className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-1 focus:ring-purple-600 font-bold text-slate-800 dark:text-white"
                            />
                            <span className="ml-1 text-xs text-slate-500 dark:text-slate-400 font-bold">kg</span>
                          </div>
                        </div>
                      </div>

                      {/* Spices Provisioning Rule (Customer vs Store provided) */}
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={item.spicesProvidedByCustomer}
                                onChange={(e) => handleItemChange(idx, { spicesProvidedByCustomer: e.target.checked })}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-slate-300 dark:border-slate-700"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <Flame className="w-3.5 h-3.5 text-amber-500" />
                                {t.spicesProvidedByCust}
                              </span>
                            </label>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-6">
                              {item.spicesProvidedByCustomer ? t.spicesProvidedHelp : t.spicesNotProvidedHelp}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              item.spicesProvidedByCustomer 
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300'
                            }`}>
                              {item.spicesProvidedByCustomer 
                                ? (language === 'mr' ? 'मसाला मोफत/ग्राहक' : '₹0 (Supplied)') 
                                : `+₹${spiceRate}/kg ${language === 'mr' ? 'मसाला' : 'Spices'}`}
                            </span>
                          </div>
                        </div>

                        {item.spicesProvidedByCustomer && (
                          <div className="mt-2 pl-6">
                            <input
                              type="text"
                              value={item.spiceDetails}
                              onChange={(e) => handleItemChange(idx, { spiceDetails: e.target.value })}
                              placeholder={t.spiceNotePlaceholder}
                              className="w-full px-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded outline-hidden focus:bg-white dark:focus:bg-slate-700"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Section 3: Container Type & Storage Rack Location */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {t.containerSectionTitle}
                </h3>

                {/* Container Type Grid */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t.containerType}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {containerOptions.map((opt) => {
                      const isSelected = containerType === opt.type;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => setContainerType(opt.type)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-900 dark:bg-purple-700 text-white border-purple-900 dark:border-purple-700 shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className={isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                            {opt.icon}
                          </div>
                          <span className="text-xs font-semibold truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.containerDescLabel}
                    </label>
                    <input
                      type="text"
                      value={containerDescription}
                      onChange={(e) => setContainerDescription(e.target.value)}
                      placeholder={t.containerDescPlaceholder}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-1 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      {t.storageLocation} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder={t.storageLocationPlaceholder}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-1 focus:ring-purple-600 font-semibold text-purple-950 dark:text-purple-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.specialNotes}
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder={t.specialNotesPlaceholder}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-1 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Price Calculation & Live Summary (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-4 p-5 rounded-2xl bg-gradient-to-b from-slate-900 to-indigo-950 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-purple-400" />
                    {t.orderSummary}
                  </h3>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {items.length} {language === 'mr' ? 'वस्तू' : 'Items'}
                  </span>
                </div>

                {/* Calculation breakdown lines */}
                <div className="space-y-2.5 text-xs text-indigo-200">
                  {calculatedItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-indigo-900/40 border border-indigo-800/50 space-y-1">
                      <div className="flex justify-between font-bold text-white">
                        <span>{language === 'mr' ? item.productNameMr : item.productName}</span>
                        <span>₹{item.itemTotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-indigo-300">
                        <span>{item.quantityKg} kg × ₹{item.baseRatePerKg} (Base Rate)</span>
                        <span>₹{(item.quantityKg * item.baseRatePerKg).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className={item.spicesProvidedByCustomer ? 'text-emerald-400' : 'text-amber-300'}>
                          {item.spicesProvidedByCustomer 
                            ? `✓ ${language === 'mr' ? 'ग्राहक मसाले (शुल्क नाही)' : 'Customer Spices (₹0)'}` 
                            : `+ In-House Spices (${item.quantityKg}kg × ₹${item.spiceCostPerKg})`}
                        </span>
                        <span className={item.spicesProvidedByCustomer ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                          ₹{(item.quantityKg * item.spiceCostPerKg).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-indigo-800 space-y-1.5">
                    <div className="flex justify-between text-indigo-300">
                      <span>{t.subtotal}:</span>
                      <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-indigo-300">
                      <span>{t.tax} ({storeRates.taxPercent}%):</span>
                      <span className="font-semibold text-white">₹{taxAmount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Total Card */}
                  <div className="pt-3 border-t border-indigo-700/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-indigo-300 uppercase tracking-wider block font-bold">
                        {t.total}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        {language === 'mr' ? 'सर्व दर व मसाला शुल्कासह' : 'Incl. all charges & spices'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-amber-400 tracking-tight">
                      ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Payment Option Pill */}
                <div className="p-3 bg-indigo-900/60 rounded-xl border border-indigo-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-200">
                    <span>{language === 'mr' ? 'पेमेंट स्थिती' : 'Payment Status'}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentStatus('paid')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          paymentStatus === 'paid' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {language === 'mr' ? 'प्राप्त (Paid)' : 'Paid'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentStatus('pending')}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer ${
                          paymentStatus === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300'
                        }`}
                      >
                        {language === 'mr' ? 'बाकी (Pending)' : 'Pending'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  <span>{t.saveAndQueue}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
