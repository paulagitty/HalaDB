export default function ThemeParkCard({ icon, name, total, used, remaining, formatNumber }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-2 md:mb-8">{icon}<h3 className="font-semibold text-gray-800 text-xs md:text-base truncate">{name}</h3></div>
      <div className="border-t border-dashed border-gray-200 mb-2 md:mb-6" />
      <div className="grid grid-cols-3 gap-1 md:gap-4 text-center">
        <div><p className="text-base md:text-3xl font-bold text-blue-500 leading-none mb-0.5">{formatNumber(total)}</p><p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase">ทั้งหมด</p></div>
        <div><p className={`text-base md:text-3xl font-bold leading-none mb-0.5 ${(used || 0) > 0 ? 'text-red-500' : 'text-gray-400'}`}>{formatNumber(used)}</p><p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase">ใช้ไป</p></div>
        <div><p className={`text-base md:text-3xl font-bold leading-none mb-0.5 ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatNumber(remaining)}</p><p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase">คงเหลือ</p></div>
      </div>
    </div>
  );
}
