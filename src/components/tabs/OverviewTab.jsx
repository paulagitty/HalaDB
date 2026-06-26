import { IconElephant, IconTent } from '../icons';
import ThemeParkCard from '../overview/ThemeParkCard';
import RecentVoucherCard from '../overview/RecentVoucherCard';
import { formatNumber } from '../../lib/format';

export default function OverviewTab({ dashboardData, recentVoucherList }) {
  const fantaseaRemaining = (dashboardData?.themeParks?.fantasea?.initialQuota || 0) - (dashboardData?.themeParks?.fantasea?.used || 0);
  const carnivalRemaining = (dashboardData?.themeParks?.carnivalMagic?.initialQuota || 0) - (dashboardData?.themeParks?.carnivalMagic?.used || 0);
  return (
    <div className="animate-fade-in">
      <h2 className="hidden md:block text-sm font-extrabold text-gray-800 mb-4">Theme Park Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
        <ThemeParkCard icon={<div className="w-8 h-8 md:w-12 md:h-12 bg-gray-50 rounded-full flex items-center justify-center shrink-0 text-gray-600 border border-gray-100 scale-75 md:scale-100"><IconElephant /></div>} name="Phuket Fantasea" total={dashboardData?.themeParks?.fantasea?.initialQuota} used={dashboardData?.themeParks?.fantasea?.used} remaining={fantaseaRemaining} formatNumber={formatNumber} />
        <ThemeParkCard icon={<div className="w-8 h-8 md:w-12 md:h-12 bg-red-50 rounded-full flex items-center justify-center shrink-0 text-red-500 border border-red-100 scale-75 md:scale-100"><IconTent /></div>} name="Carnival Magic" total={dashboardData?.themeParks?.carnivalMagic?.initialQuota} used={dashboardData?.themeParks?.carnivalMagic?.used} remaining={carnivalRemaining} formatNumber={formatNumber} />
      </div>
      <RecentVoucherCard vouchers={recentVoucherList} />
    </div>
  );
}
