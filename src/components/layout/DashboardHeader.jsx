import { TAB_TITLES } from '../../config/tabs';
import { IconMoreHorizontal } from '../icons';
import AppLogo from './AppLogo';

export default function DashboardHeader({ activeTab, activeYear, currentMonthText, currentYear, isOtherMenuOpen, setIsOtherMenuOpen }) {
  const badgeText =
    activeTab === 'overview' ? (currentMonthText || 'รายรับเดือนปัจจุบัน') :
    activeTab === 'accounting' ? `บัญชี ปี ${parseInt(activeYear) + 543}` :
    activeTab === 'yearlyReport' ? `รายปี ${parseInt(currentYear) + 543}` :
    null;

  return (
    <>
      <header className="md:hidden sticky top-0 z-40 -mx-2 px-2 py-1.5 mb-2 bg-gray-50/95 backdrop-blur border-b border-gray-200/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <AppLogo size="sm" />
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-gray-900 truncate">{TAB_TITLES[activeTab]}</h1>
              {badgeText && <p className="text-[10px] text-green-700 font-semibold truncate">{badgeText}</p>}
            </div>
          </div>
          <div className="relative shrink-0">
            <button type="button" onClick={() => setIsOtherMenuOpen(!isOtherMenuOpen)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 active:bg-gray-100" aria-label="Other links">
              <IconMoreHorizontal />
            </button>
            {isOtherMenuOpen && (
              <>
                <div className="fixed inset-0 z-[100]" onClick={() => setIsOtherMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl z-[101] border border-gray-100 overflow-hidden">
                  <a href="https://script.google.com/macros/s/AKfycbxS0oAeM3iMVvoVO55RH0AJE9D6hM7XAvPjuPcZORWWOlh4KBeHeoA44jAwVDvCZnQ/exec" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 border-b border-gray-50 active:bg-blue-50">HalaWalla Booking</a>
                  <a href="https://taxi-booking-one.vercel.app" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 border-b border-gray-50 active:bg-blue-50">Taxi Booking</a>
                  <a href="https://offersystemhala.vercel.app/" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 active:bg-blue-50">Create Package</a>
                </div>
              </>
            )}
          </div>
        </div>
      </header>
      <div className="hidden md:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">
          {activeTab === 'overview' ? 'ภาพรวมประจำเดือนปัจจุบัน' :
           activeTab === 'yearlyReport' ? `รายงานสรุปรายปี (Yearly Report ${parseInt(activeYear) + 543})` :
           activeTab === 'accounting' ? `สรุปบัญชีรายเดือน (Accounting ${parseInt(activeYear) + 543})` :
           activeTab === 'paymentDue' ? 'ระบบจัดการกำหนดชำระเงิน (Payment Due)' :
           'รายงานการดำเนินงานประจำวัน (Daily Operations)'}
        </p>
      </div>
    </>
  );
}
