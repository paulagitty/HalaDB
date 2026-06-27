import { useState, useEffect, useCallback } from 'react';
import { fetchDashboardData } from './api/googleSheets';
import { formatCurrency, formatCurrencyShort, buildRecentVoucherList } from './lib/format';
import LoadingState from './components/common/LoadingState';
import ErrorState from './components/common/ErrorState';
import DashboardHeader from './components/layout/DashboardHeader';
import DashboardNav from './components/layout/DashboardNav';
import MobileBottomNav from './components/layout/MobileBottomNav';
import MetricCard from './components/overview/MetricCard';
import MobileMetricStrip from './components/overview/MobileMetricStrip';
import OverviewTab from './components/tabs/OverviewTab';
import MonthlyReportTab from './components/tabs/MonthlyReportTab';
import YearlyReportTab from './components/tabs/YearlyReportTab';
import AccountingTab from './components/tabs/AccountingTab';
import DailyOpsTab from './components/tabs/DailyOpsTab';
import PaymentDueTab from './components/tabs/PaymentDueTab';

const EMPTY_DASHBOARD = {
  currentMonthText: 'กำลังโหลดข้อมูล...',
  currentMonthValue: '',
  overview: { tourOnly: 0, hotelOnly: 0 },
  themeParks: { fantasea: { initialQuota: 183, used: 0 }, carnivalMagic: { initialQuota: 1200, used: 0 } },
  yearlyReport: [],
  manualYearlyData: {},
  accountingData: {},
  monthlySummary: {},
  dailyOps: { tours: [], hotels: [] },
  voucherList: [],
  paymentList: [],
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [errorMsg, setErrorMsg] = useState('');
  const [isOtherMenuOpen, setIsOtherMenuOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);
  const [dashboardData, setDashboardData] = useState(EMPTY_DASHBOARD);

  const updatePaymentLocally = useCallback((uid, patch) => {
    setDashboardData((prev) => ({
      ...prev,
      paymentList: (prev.paymentList || []).map((p) => (p.uid === uid ? { ...p, ...patch } : p)),
    }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
      setLoading(false);
    } catch {
      setErrorMsg('เชื่อมต่อข้อมูลไม่สำเร็จ กรุณาลองรีเฟรชหน้าเว็บอีกครั้ง');
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setIsOtherMenuOpen(false); }, [activeTab]);

  if (loading) return <LoadingState />;
  if (errorMsg) return <ErrorState message={errorMsg} />;

  const currentYear = (dashboardData?.currentMonthValue || new Date().getFullYear().toString()).split('-')[0];
  const activeYear = selectedYear || currentYear;
  const currentYearApiReport = (dashboardData?.yearlyReport || []).filter((r) => r.month?.startsWith(currentYear));
  const recentVoucherList = buildRecentVoucherList(dashboardData);

  let displayTourProfit = 0;
  let displayHotelProfit = 0;
  if (activeTab === 'overview') {
    displayTourProfit = dashboardData?.overview?.tourOnly || 0;
    displayHotelProfit = dashboardData?.overview?.hotelOnly || 0;
  } else if (activeTab === 'yearlyReport') {
    displayTourProfit = currentYearApiReport.reduce((sum, r) => sum + (r.tourProfit || 0), 0);
    displayHotelProfit = currentYearApiReport.reduce((sum, r) => sum + (r.hotelProfit || 0), 0);
  }
  const displayTotalProfit = activeTab === 'yearlyReport'
    ? currentYearApiReport.reduce((sum, r) => sum + (r.totalProfit || 0), 0)
    : displayTourProfit + displayHotelProfit;

  const metricItems = activeTab === 'overview'
    ? [{ label: 'ทัวร์', value: formatCurrencyShort(displayTourProfit) }, { label: 'โรงแรม', value: formatCurrencyShort(displayHotelProfit) }, { label: 'รวม', value: formatCurrencyShort(displayTotalProfit), accent: 'text-blue-600' }]
    : [{ label: 'ทัวร์', value: formatCurrencyShort(displayTourProfit) }, { label: 'โรงแรม', value: formatCurrencyShort(displayHotelProfit) }, { label: 'รวมปี', value: formatCurrencyShort(displayTotalProfit), accent: 'text-blue-600' }];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans mobile-app-shell animate-fade-in">
      <div className="max-w-7xl mx-auto px-2 pt-1 md:p-8 lg:p-12 md:px-8">
        <DashboardHeader activeTab={activeTab} activeYear={activeYear} currentYear={currentYear} currentMonthText={dashboardData?.currentMonthText} isOtherMenuOpen={isOtherMenuOpen} setIsOtherMenuOpen={setIsOtherMenuOpen} />
        <DashboardNav activeTab={activeTab} activeYear={activeYear} currentYear={currentYear} currentMonthText={dashboardData?.currentMonthText} isOtherMenuOpen={isOtherMenuOpen} setActiveTab={setActiveTab} setIsOtherMenuOpen={setIsOtherMenuOpen} />

        {(activeTab === 'overview' || activeTab === 'yearlyReport') && (
          <>
            <MobileMetricStrip items={metricItems} />
            <div className="hidden md:grid md:grid-cols-3 gap-6 mb-10">
              <MetricCard title={activeTab === 'overview' ? 'รายได้รวมทัวร์' : `ทัวร์ (ปี ${parseInt(currentYear) + 543})`} value={formatCurrency(displayTourProfit)} />
              <MetricCard title={activeTab === 'overview' ? 'รายได้รวมโรงแรม' : `โรงแรม (ปี ${parseInt(currentYear) + 543})`} value={formatCurrency(displayHotelProfit)} />
              <MetricCard title={activeTab === 'overview' ? 'รายได้รวมทั้งหมด' : `รวมทั้งหมด (ปี ${parseInt(currentYear) + 543})`} value={formatCurrency(displayTotalProfit)} accent="text-blue-600" />
            </div>
            {activeTab === 'overview' && <OverviewTab dashboardData={dashboardData} recentVoucherList={recentVoucherList} />}
            {activeTab === 'yearlyReport' && <YearlyReportTab dashboardData={dashboardData} currentYear={currentYear} onRefresh={fetchData} saving={saving} setSaving={setSaving} />}
          </>
        )}
        {activeTab === 'accounting' && <AccountingTab dashboardData={dashboardData} currentYear={currentYear} activeYear={activeYear} setActiveYear={setSelectedYear} onRefresh={fetchData} saving={saving} setSaving={setSaving} />}
        {activeTab === 'dailyOps' && <DailyOpsTab dashboardData={dashboardData} />}
        {activeTab === 'monthlyReport' && <MonthlyReportTab dashboardData={dashboardData} />}
        {activeTab === 'paymentDue' && (
          <PaymentDueTab dashboardData={dashboardData} onPaymentUpdate={updatePaymentLocally} onRefresh={fetchData} />
        )}
      </div>
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
