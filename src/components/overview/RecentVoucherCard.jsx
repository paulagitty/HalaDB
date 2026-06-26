import { formatDateShow } from '../../lib/format';

export default function RecentVoucherCard({ vouchers }) {
  return (
    <div className="mt-3 md:mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-3 md:px-6 py-2 md:py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-[11px] md:text-sm font-extrabold text-gray-800">Voucher ล่าสุด</h2>
        <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full text-[10px] font-bold">{vouchers.length}</span>
      </div>
      {vouchers.length === 0 ? (
        <div className="px-4 py-6 text-center text-gray-400 text-xs">ยังไม่มีรายการ Voucher</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {vouchers.map((item, idx) => (
            <div key={`${item.voucher}-${idx}`} className="px-3 py-2 flex gap-2 items-start hover:bg-blue-50/40">
              <span className="bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded min-w-[2.5rem] text-center shrink-0">{item.voucher}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-bold text-xs text-gray-900 truncate">{item.customer}</p>
                  <span className={`inline-flex px-1.5 py-0 rounded text-[9px] font-bold border ${item.type === 'Tour' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'}`}>{item.type || 'Booking'}</span>
                </div>
                <p className="text-[10px] text-gray-500 truncate">{item.service || '-'}</p>
                <p className="text-[10px] text-gray-400">{formatDateShow(item.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
