import React, { useState } from 'react';
import type { MonthProfitRecord, Language } from '../types';
import { initial6MonthsProfit } from '../data/initialData';
import { translations } from '../data/translations';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Download, 
  Layers, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AnalyticsViewProps {
  language: Language;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ language }) => {
  const t = translations[language] || translations.en;
  const [data] = useState<MonthProfitRecord[]>(initial6MonthsProfit);
  const [timeframeFilter, setTimeframeFilter] = useState<'all_6m' | 'last_3m'>('all_6m');

  const displayData = timeframeFilter === 'last_3m' ? data.slice(-3) : data;

  // Aggregate Metrics over 6 Months
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.netProfit, 0);
  const totalCogs = data.reduce((sum, item) => sum + item.cogs, 0);
  const totalLabor = data.reduce((sum, item) => sum + item.laborAndOverhead, 0);
  const totalOrders = data.reduce((sum, item) => sum + item.totalOrders, 0);
  const avgMargin = Math.round((totalProfit / totalRevenue) * 10000) / 100;
  const totalWafersKg = data.reduce((sum, item) => sum + item.wafersSoldKg, 0);
  const totalVermicelliKg = data.reduce((sum, item) => sum + item.vermicelliSoldKg, 0);
  const totalSpiceRev = data.reduce((sum, item) => sum + item.spiceRevenue, 0);

  const productDistribution = [
    { name: language === 'mr' ? 'वेफर्स व पापड' : 'Indian Wafers', value: totalWafersKg, color: '#6366F1' },
    { name: language === 'mr' ? 'शेवया व कुरडई' : 'Vermicelli', value: totalVermicelliKg, color: '#A855F7' },
    { name: language === 'mr' ? 'मसाले व साहित्य' : 'In-House Spices', value: Math.round(totalSpiceRev / 140), color: '#F59E0B' },
  ];

  const handleExportCSV = () => {
    const headers = ['Month', 'Revenue (INR)', 'Raw Materials & Spices (INR)', 'Labor & Overheads (INR)', 'Net Profit (INR)', 'Margin %', 'Orders'];
    const rows = data.map(d => [
      d.monthName,
      d.revenue,
      d.cogs,
      d.laborAndOverhead,
      d.netProfit,
      d.profitMarginPercent,
      d.totalOrders
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Anita_Stores_6Month_Profit_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-900 dark:text-purple-400" />
            <span>{t.analyticsTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.analyticsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setTimeframeFilter('all_6m')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframeFilter === 'all_6m' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'mr' ? '६ महिने (Full 6M)' : 'Full 6 Months'}
            </button>
            <button
              onClick={() => setTimeframeFilter('last_3m')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframeFilter === 'last_3m' ? 'bg-purple-900 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'mr' ? 'गेले ३ महिने' : 'Recent 3M'}
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-900 dark:text-purple-400" />
            <span>{t.exportReport}</span>
          </button>
        </div>
      </div>

      {/* 4 Core Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total 6-Month Profit */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950 via-indigo-950 to-slate-900 text-white shadow-lg border border-purple-800">
          <div className="flex items-center justify-between text-xs font-bold text-purple-200 uppercase tracking-wider mb-2">
            <span>{t.total6MonthProfit}</span>
            <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 tracking-tight">
            ₹{totalProfit.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{avgMargin}% {language === 'mr' ? 'निव्वळ नफा मार्जिन' : 'Net Margin'}</span>
          </div>
        </div>

        {/* Gross Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>{t.grossRevenue}</span>
            <DollarSign className="w-4 h-4 text-purple-700 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 block">
            {language === 'mr' ? '६ महिन्यांची एकूण उलाढाल' : 'Total sales & processing billing'}
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>{t.totalOrders6M}</span>
            <ShoppingBag className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalOrders.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 block">
            {language === 'mr' ? 'सरासरी ऑर्डर: ' : 'Average Order: '} 
            <strong className="text-slate-800 dark:text-slate-200">₹{Math.round(totalRevenue / totalOrders).toLocaleString('en-IN')}</strong>
          </span>
        </div>

        {/* Total Volume Processed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            <span>{language === 'mr' ? 'एकूण उत्पादन (किलो)' : 'Total Volume (kg)'}</span>
            <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {(totalWafersKg + totalVermicelliKg).toLocaleString('en-IN')} <span className="text-sm text-slate-400">kg</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 block">
            {totalWafersKg}kg {language === 'mr' ? 'वेफर्स' : 'Wafers'} + {totalVermicelliKg}kg {language === 'mr' ? 'शेवया' : 'Shevai'}
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: 6-Month Profit & Revenue Curve (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-purple-900 dark:text-purple-400" />
                <span>{t.profitTrendTitle}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'mr' ? 'महिन्यानिहाय उलाढाल व निव्वळ नफा कल' : 'Monthly revenue vs net profits (INR)'}
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                <XAxis 
                  dataKey={language === 'mr' ? 'monthNameMr' : 'monthName'} 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748B' }} 
                  axisLine={{ stroke: '#CBD5E1' }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name={language === 'mr' ? 'एकूण महसूल (Revenue)' : 'Gross Revenue'} 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#revGrad)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="netProfit" 
                  name={language === 'mr' ? 'निव्वळ नफा (Net Profit)' : 'Net Profit'} 
                  stroke="#7C3AED" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#profitGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Product Breakdown Pie Chart (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-purple-900 dark:text-purple-400" />
              <span>{language === 'mr' ? 'उत्पादन वर्गवारी वाटा' : 'Volume Breakdown'}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'mr' ? 'वेफर्स, शेवया व मसाले प्रमाण' : 'Total 6-month product volume distribution'}
            </p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`${Number(val).toLocaleString('en-IN')} kg`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            {productDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{item.value} kg</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Monthly Financial Audit Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-900 dark:text-purple-400" />
          <span>{t.monthlyProfitBreakdown}</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">{t.monthCol}</th>
                <th className="py-3 px-4 text-right">{t.revenueCol}</th>
                <th className="py-3 px-4 text-right">{t.cogsCol}</th>
                <th className="py-3 px-4 text-right">{t.overheadCol}</th>
                <th className="py-3 px-4 text-right">{t.profitCol}</th>
                <th className="py-3 px-4 text-right">{t.marginCol}</th>
                <th className="py-3 px-4 text-right">{t.ordersCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.map((row) => (
                <tr key={row.monthKey} className="hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    {language === 'mr' ? row.monthNameMr : row.monthName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                    ₹{row.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                    ₹{row.cogs.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                    ₹{row.laborAndOverhead.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-purple-950 dark:text-purple-400">
                    ₹{row.netProfit.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                    {row.profitMarginPercent.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    {row.totalOrders}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-100/80 dark:bg-slate-800/80 font-bold border-t-2 border-slate-300 dark:border-slate-700">
              <tr>
                <td className="py-3 px-4 text-slate-900 dark:text-white">{language === 'mr' ? '६ महिन्यांचे एकूण (Total 6M)' : 'Total 6 Months'}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-900 dark:text-white">₹{totalRevenue.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">₹{totalCogs.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">₹{totalLabor.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right font-mono text-purple-950 dark:text-purple-300 text-sm">₹{totalProfit.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right text-emerald-700 dark:text-emerald-400">{avgMargin}%</td>
                <td className="py-3 px-4 text-right text-slate-900 dark:text-white">{totalOrders}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
