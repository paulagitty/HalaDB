const { formatDateShow } = window;
const MetricCard = ({ title, value, accent = 'text-gray-900' }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
    <h3 className="text-sm font-bold text-gray-600 mb-4">{title}</h3>
    <p className={`text-3xl font-extrabold ${accent} tracking-tight`}>{value}</p>
  </div>
);

const ThemeParkCard = ({ icon, name, total, used, remaining, formatNumber }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
    <div className="flex items-center mb-8">{icon}<h3 className="font-semibold text-gray-800">{name}</h3></div>
    <div className="border-t border-dashed border-gray-200 mb-6"></div>
    <div className="grid grid-cols-3 gap-4 text-center">
      <div><p className="text-3xl font-bold text-blue-500 mb-1">{formatNumber(total)}</p><p className="text-xs font-bold text-gray-500 uppercase">ทั้งหมด</p></div>
      <div><p className={`text-3xl font-bold mb-1 ${(used || 0) > 0 ? 'text-red-500' : 'text-gray-400'}`}>{formatNumber(used)}</p><p className="text-xs font-bold text-gray-500 uppercase">ใช้ไป</p></div>
      <div><p className={`text-3xl font-bold mb-1 ${remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>{formatNumber(remaining)}</p><p className="text-xs font-bold text-gray-500 uppercase">คงเหลือ</p></div>
    </div>
  </div>
);

const RecentVoucherCard = ({ vouchers }) => (
  <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h2 className="text-sm font-extrabold text-gray-800">รายการ Voucher ล่าสุด</h2>
        <p className="text-xs font-semibold text-gray-400 mt-1">เรียงตาม Voucher Number จากใหม่สุด แสดง 10 รายการ</p>
      </div>
      <span className="self-start sm:self-auto bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
        {vouchers.length} รายการ
      </span>
    </div>
    {vouchers.length === 0 ? (
      <div className="px-6 py-10 text-center text-gray-400 text-sm">ยังไม่มีรายการ Voucher</div>
    ) : (
      <div className="divide-y divide-gray-100">
        {vouchers.map((item, idx) => (
          <div key={`${item.voucher}-${idx}`} className="px-6 py-3 flex flex-col md:flex-row md:items-center gap-2 hover:bg-blue-50/40 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded min-w-[4rem] text-center">{item.voucher}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-gray-900 truncate">{item.customer}</p>
                  <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold border ${item.type === 'Tour' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>
                    {item.type || 'Booking'}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-500 truncate mt-0.5">{item.service || '-'}</p>
              </div>
            </div>
            <div className="md:w-32 md:text-right text-xs font-bold text-gray-400 pl-[5.25rem] md:pl-0">
              {formatDateShow(item.date)}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
Object.assign(window, { MetricCard, ThemeParkCard, RecentVoucherCard });
