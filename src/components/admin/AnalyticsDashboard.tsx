import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { api } from '../../services/api.ts';
import { Employee, StudioPackage } from '../../types.ts';
import {
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  Filter,
  BarChart2,
  PieChart as PieIcon,
  RotateCcw
} from 'lucide-react';

interface AnalyticsDashboardProps {
  employees: Employee[];
  packages: StudioPackage[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  employees,
  packages,
}) => {
  const [dateRange, setDateRange] = useState('all');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('All');
  const [selectedPackageId, setSelectedPackageId] = useState('All');

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics({
        dateRange: dateRange === 'all' ? undefined : dateRange,
        eventType: selectedEventType === 'All' ? undefined : selectedEventType,
        employeeId: selectedEmployeeId === 'All' ? undefined : selectedEmployeeId,
        packageId: selectedPackageId === 'All' ? undefined : selectedPackageId,
      });
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedEventType, selectedEmployeeId, selectedPackageId]);

  const resetFilters = () => {
    setDateRange('all');
    setSelectedEventType('All');
    setSelectedEmployeeId('All');
    setSelectedPackageId('All');
  };

  const metrics = analytics?.metrics || {
    totalRevenue: 0,
    totalCollected: 0,
    pendingPayments: 0,
    totalBookings: 0,
    thisMonthEvents: 0,
    upcomingEvents: 0,
  };

  return (
    <div className="space-y-8">
      
      {/* Top Header & Dynamic Filters Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl">
        <div>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">
            Sales & Revenue Analytics
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Real-time financial performance, booking frequency distributions, and tier performance.
          </p>
        </div>

        {/* Dynamic Multi-Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Filters:</span>
          </div>

          {/* Date Range */}
          <select
            id="filter-analytics-date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 outline-none focus:border-amber-500"
          >
            <option value="all">All Time (2026)</option>
            <option value="thisMonth">This Month (September)</option>
            <option value="last6Months">Last 6 Months</option>
          </select>

          {/* Event Type */}
          <select
            id="filter-analytics-type"
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 outline-none focus:border-amber-500"
          >
            <option value="All">All Event Types</option>
            <option value="Wedding">Wedding</option>
            <option value="Corporate">Corporate</option>
            <option value="Birthday">Birthday</option>
            <option value="Portrait">Portrait</option>
            <option value="Product">Product 3D</option>
            <option value="Fashion">Fashion</option>
            <option value="Architectural">Architectural</option>
          </select>

          {/* Employee */}
          <select
            id="filter-analytics-emp"
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 outline-none focus:border-amber-500"
          >
            <option value="All">All Photographers / Crew</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.role.split(' ')[0]})
              </option>
            ))}
          </select>

          {/* Package */}
          <select
            id="filter-analytics-pkg"
            value={selectedPackageId}
            onChange={(e) => setSelectedPackageId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 outline-none focus:border-amber-500"
          >
            <option value="All">All Packages</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            id="reset-analytics-filters-btn"
            onClick={resetFilters}
            title="Reset Filters"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            ${metrics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>${metrics.totalCollected.toLocaleString()} Collected</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">Total Bookings</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {metrics.totalBookings}
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-2">
            Scheduled Sessions
          </div>
        </div>

        {/* Events This Month */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">This Month</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {metrics.thisMonthEvents}
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-2">
            Active in September 2026
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">Upcoming Events</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {metrics.upcomingEvents}
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-2">
            Future Scheduled Dates
          </div>
        </div>

        {/* Pending Payments */}
        <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono">Pending Balance</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-bold text-amber-400">
            ${metrics.pendingPayments.toLocaleString()}
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-2">
            Awaiting Final Settlement
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 1: Monthly Revenue Bar Chart (Jan - Dec comparison) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-amber-400" />
              <h3 className="font-display text-base font-bold text-white">
                Monthly Revenue & Sales Comparison (Jan – Dec 2026)
              </h3>
            </div>
            <span className="text-xs font-mono text-neutral-400">USD ($)</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="month" stroke="#737373" fontSize={11} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" name="Actual Revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Monthly Target" fill="#3f3f46" radius={[6, 6, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Revenue by Event Category (Donut / Pie Chart) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-blue-400" />
            <h3 className="font-display text-base font-bold text-white">
              Revenue by Category
            </h3>
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {(analytics?.categoryBreakdown || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800 text-[11px] font-mono">
            {(analytics?.categoryBreakdown || []).map((cat: any) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="text-neutral-400 truncate">{cat.name}:</span>
                <span className="text-white font-bold">${cat.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lower Row: HISTOGRAM of Bookings & Package Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CHART 3: HISTOGRAM - Distribution of Bookings by Price Range */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Histogram: Booking Price Distribution
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Frequency distribution of scheduled events grouped by price bracket.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              Histogram
            </span>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.priceHistogram || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="range" stroke="#737373" fontSize={10} tickLine={false} />
                <YAxis stroke="#737373" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any, name: any) => [
                    name === 'count' ? `${val} Events Booked` : `$${Number(val).toLocaleString()}`,
                    name === 'count' ? 'Frequency' : 'Total Bracket Revenue'
                  ]}
                />
                <Bar dataKey="count" name="Frequency (Bookings)" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Revenue & Booking Volume by Package Tier */}
        <div className="lg:col-span-6 p-6 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Service Package Yield
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Performance across our public photography tiers.
              </p>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={analytics?.packageBreakdown || []}
                margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                <XAxis type="number" stroke="#737373" fontSize={10} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="packageName" type="category" stroke="#737373" fontSize={10} tickLine={false} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#171717',
                    borderColor: '#404040',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Total Revenue']}
                />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
