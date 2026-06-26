export default function StatusToggle({ isPaid, onChange }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
      <span className={`text-[10px] sm:text-sm font-bold ${isPaid ? 'text-gray-400' : 'text-red-500'}`}>Unpaid</span>
      <div className="relative inline-block w-10 sm:w-12 h-5 sm:h-6 shrink-0">
        <input type="checkbox" checked={isPaid} onChange={(e) => onChange(e.target.checked)} className="toggle-checkbox absolute block w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
        <label className="toggle-label block overflow-hidden h-5 sm:h-6 rounded-full bg-gray-300 cursor-pointer !w-10 sm:!w-12" />
      </div>
      <span className={`text-[10px] sm:text-sm font-bold ${isPaid ? 'text-green-500' : 'text-gray-400'}`}>Paid</span>
    </div>
  );
}
