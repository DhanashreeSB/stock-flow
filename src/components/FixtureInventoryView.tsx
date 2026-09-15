import React, { useState } from 'react';
import type { FixtureItem, Language } from '../types';
import { translations } from '../data/translations';
import { 
  Layers, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Minus, 
  DollarSign, 
  Package, 
  X,
  MapPin,
  ArrowUpRight
} from 'lucide-react';

interface FixtureInventoryViewProps {
  fixtures: FixtureItem[];
  onUpdateStock: (fixtureId: string, deltaKg: number) => void;
  onAddFixture: (newFixture: FixtureItem) => void;
  language: Language;
}

export const FixtureInventoryView: React.FC<FixtureInventoryViewProps> = ({
  fixtures,
  onUpdateStock,
  onAddFixture,
  language,
}) => {
  const t = translations[language] || translations.en;
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Fixture Form state
  const [name, setName] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [category, setCategory] = useState<FixtureItem['category']>('wafers');
  const [fixtureLocation, setFixtureLocation] = useState('Aisle 1, Shelf 1');
  const [capacityKg, setCapacityKg] = useState(300);
  const [currentStockKg, setCurrentStockKg] = useState(150);
  const [costPricePerKg, setCostPricePerKg] = useState(40);
  const [sellingPricePerKg, setSellingPricePerKg] = useState(85);

  const filteredFixtures = fixtures.filter((f) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'low_stock') return f.status === 'low' || f.status === 'critical';
    return f.category === filterCategory;
  });

  // Calculate totals
  const totalStockKg = fixtures.reduce((sum, f) => sum + f.currentStockKg, 0);
  const totalCapacityKg = fixtures.reduce((sum, f) => sum + f.capacityKg, 0);
  const totalSoldKg = fixtures.reduce((sum, f) => sum + f.soldKg, 0);
  const totalInventoryProfit = fixtures.reduce((sum, f) => sum + f.profitEarned, 0);
  const lowStockCount = fixtures.filter(f => f.status === 'low' || f.status === 'critical').length;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newFix: FixtureItem = {
      id: `BIN-${category.substring(0, 1).toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      nameMr: nameMr.trim() || name.trim(),
      category,
      fixtureLocation: fixtureLocation.trim(),
      capacityKg,
      currentStockKg,
      soldKg: 0,
      minThresholdKg: Math.round(capacityKg * 0.25),
      costPricePerKg,
      sellingPricePerKg,
      profitEarned: 0,
      lastRestocked: new Date().toISOString(),
      status: currentStockKg < capacityKg * 0.25 ? 'critical' : currentStockKg < capacityKg * 0.4 ? 'low' : 'adequate',
    };

    onAddFixture(newFix);
    setIsAddModalOpen(false);
    setName('');
    setNameMr('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-900 dark:text-purple-400" />
            <span>{t.fixtureTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            {t.fixtureSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addFixtureBtn.replace(/^\+\s*/, '')}</span>
        </button>
      </div>

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Stock in Fixtures */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>{language === 'mr' ? 'एकूण भरलेला साठा' : 'Current Stock in Fixtures'}</span>
            <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalStockKg.toLocaleString('en-IN')} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">/ {totalCapacityKg} kg</span>
          </div>
          <div className="mt-2 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-full" 
              style={{ width: `${Math.min(100, Math.round((totalStockKg / (totalCapacityKg || 1)) * 100))}%` }} 
            />
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            {Math.round((totalStockKg / (totalCapacityKg || 1)) * 100)}% {language === 'mr' ? 'फिक्सचर भरलेले आहेत' : 'Overall Store Fill Rate'}
          </span>
        </div>

        {/* Total Sold Volume */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>{language === 'mr' ? 'विकलेला साठा' : 'Total Volume Sold'}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalSoldKg.toLocaleString('en-IN')} <span className="text-sm font-bold text-slate-500 dark:text-slate-400">kg</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-2 block flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {language === 'mr' ? 'वेफर्स व शेवयांची विक्रमी मागणी' : 'High seasonal turnover'}
          </span>
        </div>

        {/* Total Fixture Profit Earned */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-md border border-purple-800">
          <div className="flex items-center justify-between text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
            <span>{language === 'mr' ? 'फिक्सचरमधून झालेला नफा' : 'Total Fixture Profit'}</span>
            <DollarSign className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-2xl font-black text-amber-300 tracking-tight">
            ₹{totalInventoryProfit.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-purple-200 mt-2 block">
            {language === 'mr' ? 'खरेदी व विक्री दरातील निव्वळ फरक' : 'Realized spread on stock batches'}
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>{language === 'mr' ? 'कमी साठा इशारे' : 'Replenish Alerts'}</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{lowStockCount}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              lowStockCount > 0 
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}>
              {lowStockCount > 0 ? t.statusLow : t.statusAdequate}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 block">
            {language === 'mr' ? 'नवीन बॅच बनवण्याची गरज' : 'Bins below reorder threshold'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterCategory === 'all' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.allProducts} ({fixtures.length})
        </button>
        <button
          onClick={() => setFilterCategory('wafers')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterCategory === 'wafers' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.wafersFilter}
        </button>
        <button
          onClick={() => setFilterCategory('vermicelli')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterCategory === 'vermicelli' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.vermicelliFilter}
        </button>
        <button
          onClick={() => setFilterCategory('spices')}
          className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
            filterCategory === 'spices' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          {t.spicesFilter}
        </button>
        <button
          onClick={() => setFilterCategory('low_stock')}
          className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
            filterCategory === 'low_stock' ? 'bg-amber-600 text-white shadow-xs' : 'text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{t.lowStockFilter} ({lowStockCount})</span>
        </button>
      </div>

      {/* Fixture Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFixtures.map((fixture) => {
          const neededKg = Math.max(0, fixture.capacityKg - fixture.currentStockKg);
          const fillPercentage = Math.round((fixture.currentStockKg / fixture.capacityKg) * 100);
          const isCritical = fixture.status === 'critical';
          const isLow = fixture.status === 'low';

          return (
            <div
              key={fixture.id}
              className={`rounded-2xl border transition-all bg-white dark:bg-slate-900 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                isCritical 
                  ? 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-300 dark:ring-rose-800' 
                  : isLow 
                  ? 'border-amber-300 dark:border-amber-800 ring-1 ring-amber-300 dark:ring-amber-800' 
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-purple-900 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                    {fixture.id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isCritical 
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse' 
                      : isLow 
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {isCritical ? t.statusCritical : isLow ? t.statusLow : t.statusAdequate}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'mr' ? fixture.nameMr : fixture.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                  <span>{fixture.fixtureLocation}</span>
                </div>
              </div>

              {/* Card Body: Stock Fill & Replenishment Math */}
              <div className="p-4 space-y-4 flex-1">
                
                {/* Stock Level Display */}
                <div>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t.currentStock}</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{fixture.currentStockKg}</span>
                      <span className="text-xs font-bold text-slate-400"> / {fixture.capacityKg} kg</span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, fillPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Retail Metrics: Sold, Needed & Profit */}
                <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">{t.soldToDate}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{fixture.soldKg} kg</span>
                  </div>
                  <div className="border-x border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">{t.neededStock}</span>
                    <span className={`font-bold ${neededKg > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {neededKg} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block">{language === 'mr' ? 'नफा' : 'Profit'}</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{fixture.profitEarned.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Pricing Spread */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-1">
                  <span>{t.costPrice}: <strong className="text-slate-800 dark:text-slate-200">₹{fixture.costPricePerKg}/kg</strong></span>
                  <span>{t.sellingPrice}: <strong className="text-slate-800 dark:text-slate-200">₹{fixture.sellingPricePerKg}/kg</strong></span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    +₹{fixture.sellingPricePerKg - fixture.costPricePerKg}/kg {language === 'mr' ? 'मार्जिन' : 'margin'}
                  </span>
                </div>
              </div>

              {/* Card Footer: Quick Issue / Restock Controls */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 flex items-center justify-between gap-2">
                
                {/* Issue (Sell 10kg) */}
                <button
                  type="button"
                  onClick={() => onUpdateStock(fixture.id, -10)}
                  disabled={fixture.currentStockKg <= 0}
                  className="flex-1 py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 disabled:opacity-50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-rose-500" />
                  <span>-10 kg ({language === 'mr' ? 'विक्री' : 'Sell'})</span>
                </button>

                {/* Restock (+25kg) */}
                <button
                  type="button"
                  onClick={() => onUpdateStock(fixture.id, 25)}
                  className="flex-1 py-1.5 px-2 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>25 kg ({language === 'mr' ? 'भरा' : 'Restock'})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Fixture Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-purple-950 text-white">
              <h3 className="font-bold text-base">{t.addFixtureBtn}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-purple-200 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product / Fixture Name (English)</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sabudana Batata Wafers Special"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Product Name in Marathi (नाव मराठीत)</label>
                <input
                  type="text"
                  value={nameMr}
                  onChange={(e) => setNameMr(e.target.value)}
                  placeholder="उदा. साबुदाणा बटाटा पापड स्पेशल"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as FixtureItem['category'])}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden"
                  >
                    <option value="wafers">Indian Wafers (वेफर्स)</option>
                    <option value="vermicelli">Vermicelli / Shevai (शेवया)</option>
                    <option value="spices">Spices & Ingredients (मसाले)</option>
                    <option value="packaging">Packaging Materials</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Aisle / Shelf Location</label>
                  <input
                    type="text"
                    value={fixtureLocation}
                    onChange={(e) => setFixtureLocation(e.target.value)}
                    placeholder="e.g. Aisle 3, Shelf 2"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Fixture Capacity (kg)</label>
                  <input
                    type="number"
                    value={capacityKg}
                    onChange={(e) => setCapacityKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Stock (kg)</label>
                  <input
                    type="number"
                    value={currentStockKg}
                    onChange={(e) => setCurrentStockKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Wholesale Cost Price (₹/kg)</label>
                  <input
                    type="number"
                    value={costPricePerKg}
                    onChange={(e) => setCostPricePerKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Retail Selling Price (₹/kg)</label>
                  <input
                    type="number"
                    value={sellingPricePerKg}
                    onChange={(e) => setSellingPricePerKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Fixture Bin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

