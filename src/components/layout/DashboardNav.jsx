import { TABS } from '../../config/tabs';
import { IconPin, IconChevronDown } from '../icons';

export default function DashboardNav({ activeTab, activeYear, currentYear, currentMonthText, isOtherMenuOpen, setActiveTab, setIsOtherMenuOpen }) {
  return (
    <div className="hidden md:block bg-white border border-gray-200 rounded-xl p-2 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm relative z-40">
      <div className="flex items-center w-full md:w-auto overflow-visible">
        <div className="flex space-x-1 overflow-x-auto no-scrollbar w-full">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === id ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Icon /> <span className="ml-2">{label}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-1 shrink-0">
          <button type="button" onClick={() => setIsOtherMenuOpen(!isOtherMenuOpen)} className="flex items-center px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-semibold">
            <span className="text-red-500"><IconPin /></span>
            <span className="ml-2">Other</span>
            <span className="ml-1 text-gray-400"><IconChevronDown /></span>
          </button>
          {isOtherMenuOpen && (
            <>
              <div className="fixed inset-0 z-[100]" onClick={() => setIsOtherMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl z-[101] border border-gray-100 overflow-hidden">
                <a href="https://script.google.com/macros/s/AKfycbxS0oAeM3iMVvoVO55RH0AJE9D6hM7XAvPjuPcZORWWOlh4KBeHeoA44jAwVDvCZnQ/exec" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 border-b border-gray-50 hover:bg-blue-50">HalaWalla Booking</a>
                <a href="https://taxi-booking-one.vercel.app" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 border-b border-gray-50 hover:bg-blue-50">Taxi Booking</a>
                <a href="https://offersystemhala.vercel.app/" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="block px-4 py-3 text-sm font-bold text-gray-700 hover:bg-blue-50">Create Package</a>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-4 md:mt-0 px-2 w-full md:w-auto shrink-0">
        {activeTab !== 'dailyOps' && activeTab !== 'paymentDue' && (
          <div className="px-4 py-1.5 flex items-center bg-green-50 text-green-700 border border-green-200 rounded-lg shadow-sm">
            <span className="text-sm font-bold">
              {activeTab === 'overview' ? (currentMonthText || 'รายรับเดือนปัจจุบัน') :
               activeTab === 'accounting' ? `สรุปบัญชีปี ${parseInt(activeYear) + 543}` :
               `รายรับรวมทั้งปี ${parseInt(currentYear) + 543}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
