// Component สำหรับสวิตช์ เปิด-ปิด
const StatusToggle = ({ isPaid, onChange }) => (
  <div className="flex items-center space-x-3">
    <span className={`text-sm font-bold ${isPaid ? 'text-gray-400' : 'text-red-500'}`}>Unpaid</span>
    <div className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in">
      <input type="checkbox" checked={isPaid} onChange={(e) => onChange(e.target.checked)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
      <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
    </div>
    <span className={`text-sm font-bold ${isPaid ? 'text-green-500' : 'text-gray-400'}`}>Paid</span>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <div className="text-xl font-semibold text-gray-500">กำลังดึงข้อมูลล่าสุดจาก Google Sheets...</div>
  </div>
);

const ErrorState = ({ message }) => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500 p-8 text-center">
    <h2 className="text-2xl font-bold mb-4">พบข้อผิดพลาด</h2>
    <p>{message}</p>
  </div>
);


