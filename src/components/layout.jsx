const { IconClipboardList, IconCreditCard, IconBarChart2, IconPin, IconChevronDown, IconAccounting } = window;
const DashboardHeader = ({ activeTab, activeYear }) => (
  <div className="mb-6 flex justify-between items-end">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
      <p className="text-sm text-gray-600 mt-1">
        {activeTab === 'overview' ? 'ภาพรวมประจำเดือนปัจจุบัน' :
         activeTab === 'yearlyReport' ? `รายงานสรุปรายปี (Yearly Report ${parseInt(activeYear) + 543})` :
         activeTab === 'accounting' ? `สรุปบัญชีรายเดือน (Accounting ${parseInt(activeYear) + 543})` :
         activeTab === 'paymentDue' ? 'ระบบจัดการกำหนดชำระเงิน (Payment Due)' :
         'รายงานการดำเนินงานประจำวัน (Daily Operations)'}
      </p>
    </div>
  </div>
);

const DashboardNav = ({
  activeTab,
  activeYear,
  currentYear,
  currentMonthText,
  isOtherMenuOpen,
  setActiveTab,
  setIsOtherMenuOpen
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-2 mb-8 flex flex-col md:flex-row justify-between items-center shadow-sm relative z-40">
    <div className="flex items-center w-full md:w-auto overflow-visible">
      <div className="flex space-x-1 overflow-x-auto no-scrollbar w-full">
        <button onClick={() => setActiveTab('overview')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>ภาพรวม</button>
        <button onClick={() => setActiveTab('dailyOps')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'dailyOps' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><IconClipboardList /> <span className="ml-2">Daily Ops</span></button>
        <button onClick={() => setActiveTab('paymentDue')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'paymentDue' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><IconCreditCard /> <span className="ml-2">Payment Due</span></button>
        <button onClick={() => setActiveTab('yearlyReport')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'yearlyReport' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><IconBarChart2 /> <span className="ml-2">Yearly Report</span></button>
        <button onClick={() => setActiveTab('accounting')} className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'accounting' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><IconAccounting /> <span className="ml-2">Accounting</span></button>
      </div>

      <div className="relative ml-1 shrink-0">
        <button onClick={() => setIsOtherMenuOpen(!isOtherMenuOpen)} className="flex items-center px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap">
          <span className="text-red-500"><IconPin /></span>
          <span className="ml-2 hidden sm:block">Other</span>
          <span className="ml-1 text-gray-400"><IconChevronDown /></span>
        </button>

        {isOtherMenuOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOtherMenuOpen(false)}></div>
            <div className="absolute right-0 sm:left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl z-[101] border border-gray-100 overflow-hidden animate-fade-in">
              <div className="py-1 flex flex-col">
                <a href="https://script.google.com/macros/s/AKfycbxS0oAeM3iMVvoVO55RH0AJE9D6hM7XAvPjuPcZORWWOlh4KBeHeoA44jAwVDvCZnQ/exec" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors border-b border-gray-50 cursor-pointer block">HalaWalla Booking</a>
                <a href="https://taxi-booking-one.vercel.app" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors border-b border-gray-50 cursor-pointer block">Taxi Booking</a>
                <a href="https://offersystemhala.vercel.app/" target="_blank" rel="noopener noreferrer" onClick={() => setIsOtherMenuOpen(false)} className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 font-bold transition-colors cursor-pointer block">Create Package</a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>

    <div className="mt-4 md:mt-0 px-2 w-full md:w-auto shrink-0">
      {activeTab !== 'dailyOps' && activeTab !== 'paymentDue' && (
        <div className="px-4 py-1.5 flex items-center bg-green-50 text-green-700 border border-green-200 rounded-lg shadow-sm">
          <span className="text-sm font-bold">
            {activeTab === 'overview' ? (currentMonthText || "รายรับเดือนปัจจุบัน") :
             activeTab === 'accounting' ? `สรุปบัญชีปี ${parseInt(activeYear) + 543}` :
             `รายรับรวมทั้งปี ${parseInt(currentYear) + 543}`}
          </span>
        </div>
      )}
    </div>
  </div>
);
Object.assign(window, { DashboardHeader, DashboardNav });
