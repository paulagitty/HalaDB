import { useMemo, useState } from 'react';
import ScrollTableWrap from '../common/ScrollTableWrap';
import { formatCurrency, formatCurrencyShort, formatVoucherShort, getMonthName, truncateText } from '../../lib/format';

function buildMonthOptions(dashboardData) {
  const months = new Set([dashboardData?.currentMonthValue].filter(Boolean));
  (dashboardData?.yearlyReport || []).forEach((row) => {
    if (row.month) months.add(row.month);
  });
  Object.keys(dashboardData?.monthlySummary || {}).forEach((month) => months.add(month));
  return [...months].filter(Boolean).sort().reverse();
}

function resolveMonthData(dashboardData, month) {
  const fromApi = dashboardData?.monthlySummary?.[month] || {};
  const yearly = (dashboardData?.yearlyReport || []).find((row) => row.month === month) || {};
  const tourRows = fromApi.tours || fromApi.tourRows || [];
  const hotelRows = fromApi.hotels || fromApi.hotelRows || [];
  const tourTotal = Number(yearly.tourProfit ?? fromApi.tourTotal ?? 0);
  const hotelTotal = Number(yearly.hotelProfit ?? fromApi.hotelTotal ?? 0);
  return {
    tourRows,
    hotelRows,
    tourTotal,
    hotelTotal,
    total: tourTotal + hotelTotal,
  };
}

function MoneyCell({ value, accent = '' }) {
  const amount = Number(value || 0);
  return (
    <span className={`font-semibold tabular-nums ${amount < 0 ? 'text-red-500' : accent}`}>
      {amount ? formatCurrencyShort(amount) : '—'}
    </span>
  );
}

function SummaryCard({ label, value, tone }) {
  const colors = {
    blue: 'border-l-blue-500 text-blue-600',
    green: 'border-l-green-500 text-green-600',
    orange: 'border-l-orange-500 text-orange-600',
    gray: 'border-l-gray-500 text-gray-900',
  };
  return (
    <div className={`bg-white rounded-lg border border-gray-200 border-l-4 ${colors[tone]} p-3 md:p-4 shadow-sm`}>
      <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">{label}</p>
      <p className="text-lg md:text-2xl font-extrabold tabular-nums">{formatCurrencyShort(value)}</p>
    </div>
  );
}

function TableHeader({ label, align = 'left', multiline = false, className = '' }) {
  return (
    <th className={`px-2 py-2 font-extrabold text-gray-600 text-[10px] uppercase tracking-wide align-middle ${align === 'right' ? 'text-right' : 'text-left'} ${multiline ? 'leading-tight' : 'whitespace-nowrap'} ${className}`}>
      {label}
    </th>
  );
}

function VoucherBadge({ voucher }) {
  return (
    <span className="inline-block min-w-[1.75rem] text-center bg-gray-800 text-white text-[10px] font-bold px-1 py-0.5 rounded tabular-nums">
      {formatVoucherShort(voucher)}
    </span>
  );
}

function CellText({ children, title, lines = 1 }) {
  return (
    <div className={`${lines === 2 ? 'line-clamp-2 leading-snug break-words' : 'truncate'} max-w-full`} title={title}>
      {children}
    </div>
  );
}

function TourTable({ rows }) {
  return (
    <ScrollTableWrap hint="← เลื่อนดู Tour →">
      <table className="w-full text-xs border-collapse table-fixed">
        <colgroup>
          <col style={{ width: '8%' }} />
          <col style={{ width: '28%' }} />
          <col style={{ width: '9%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '15%' }} />
        </colgroup>
        <thead className="bg-blue-50/90 border-b border-blue-100">
          <tr>
            <TableHeader label="VC" />
            <TableHeader label="Guest" />
            <TableHeader label="Nat." />
            <TableHeader label="Tour" />
            <TableHeader label="Co." />
            <TableHeader label="Profit" align="right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr><td colSpan="6" className="px-2 py-8 text-center text-gray-400">ยังไม่มีรายละเอียด Tour</td></tr>
          ) : rows.map((row, idx) => {
            const guest = row.guestName || row.customer || '-';
            const tour = row.tour || row.tourName || row.service || '-';
            const company = row.company || row.companyName || '-';
            return (
            <tr key={`${row.voucher}-${idx}`} className={`align-top hover:bg-blue-50/40 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
              <td className="px-2 py-2 align-middle"><VoucherBadge voucher={row.voucher || row.voucherRaw} /></td>
              <td className="px-2 py-2 font-semibold text-gray-900"><CellText title={guest} lines={2}>{guest}</CellText></td>
              <td className="px-2 py-2 text-[10px] text-gray-500 whitespace-nowrap align-middle">{row.nationality || '-'}</td>
              <td className="px-2 py-2 text-gray-700 align-middle"><CellText title={tour}>{tour}</CellText></td>
              <td className="px-2 py-2 text-gray-600"><CellText title={company} lines={2}>{company === '-' ? '—' : company}</CellText></td>
              <td className="px-2 py-2 text-right whitespace-nowrap align-middle"><MoneyCell value={row.profit} /></td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollTableWrap>
  );
}

function HotelTable({ rows }) {
  return (
    <ScrollTableWrap hint="← เลื่อนดู Hotel →">
      <table className="w-full text-xs border-collapse table-fixed">
        <colgroup>
          <col style={{ width: '6%' }} />
          <col style={{ width: '22%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '28%' }} />
          <col style={{ width: '24%' }} />
          <col style={{ width: '10%' }} />
        </colgroup>
        <thead className="bg-green-50/90 border-b border-green-100">
          <tr>
            <TableHeader label="VC" />
            <TableHeader label="Guest" />
            <TableHeader label="Nat." />
            <TableHeader label="Hotel" />
            <TableHeader label="Stay" />
            <TableHeader label="Profit" align="right" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr><td colSpan="6" className="px-2 py-8 text-center text-gray-400">ยังไม่มีรายละเอียด Hotel</td></tr>
          ) : rows.map((row, idx) => {
            const guest = row.guestName || row.customer || '-';
            const hotel = row.hotelName || row.service || '-';
            const stay = row.stayDate || row.dateStr || '-';
            return (
            <tr key={`${row.voucher}-${idx}`} className={`align-top hover:bg-green-50/40 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
              <td className="px-2 py-2 align-middle"><VoucherBadge voucher={row.voucher || row.voucherRaw} /></td>
              <td className="px-2 py-2 font-semibold text-gray-900"><CellText title={guest} lines={2}>{guest}</CellText></td>
              <td className="px-2 py-2 text-[10px] text-gray-500 whitespace-nowrap align-middle">{row.nationality || '-'}</td>
              <td className="px-2 py-2 text-gray-700"><CellText title={hotel} lines={2}>{hotel}</CellText></td>
              <td className="px-2 py-2 text-[10px] leading-snug text-gray-600 whitespace-nowrap align-middle">{stay}</td>
              <td className="px-2 py-2 text-right whitespace-nowrap align-middle"><MoneyCell value={row.profit} /></td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </ScrollTableWrap>
  );
}

function MobileRows({ title, rows, total, type }) {
  return (
    <section className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className={`px-3 py-2 flex justify-between ${type === 'tour' ? 'bg-blue-50' : 'bg-green-50'}`}>
        <h3 className="text-xs font-extrabold text-gray-800">{title}</h3>
        <span className="text-xs font-extrabold">{formatCurrencyShort(total)}</span>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.length === 0 ? <p className="px-3 py-5 text-center text-xs text-gray-400">ยังไม่มีรายละเอียด</p> : rows.map((row, idx) => (
          <div key={idx} className="px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold text-gray-900 tabular-nums">{formatVoucherShort(row.voucher || row.voucherRaw)}</span>
              <MoneyCell value={row.profit} accent={type === 'tour' ? 'text-blue-600' : 'text-green-600'} />
            </div>
            <p className="text-xs font-bold text-gray-700 truncate">{truncateText(row.guestName || row.customer, 20)}</p>
            <p className="text-[10px] text-gray-500 truncate">
              {type === 'tour'
                ? [row.tour || row.tourName || row.service, row.company || row.companyName].filter(Boolean).join(' • ')
                : [row.hotelName || row.service, row.stayDate || row.dateStr].filter(Boolean).join(' • ')}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MonthlyReportTab({ dashboardData }) {
  const monthOptions = useMemo(() => buildMonthOptions(dashboardData), [dashboardData]);
  const [selectedMonth, setSelectedMonth] = useState(dashboardData?.currentMonthValue || monthOptions[0] || '');
  const monthData = resolveMonthData(dashboardData, selectedMonth);

  return (
    <div className="animate-fade-in space-y-3 md:space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="hidden md:block text-sm font-extrabold text-gray-800">Monthly Income Summary</h2>
          <p className="text-[11px] md:text-xs text-gray-500">แยกรายได้รายเดือนเป็น Tour และ Hotel</p>
        </div>
        <label className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500">เดือน</span>
          <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm font-extrabold text-gray-900 focus:outline-none">
            {monthOptions.map((month) => <option key={month} value={month}>{getMonthName(month)}</option>)}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-3 gap-1.5 md:gap-4">
        <SummaryCard label="Tour Income" value={monthData.tourTotal} tone="blue" />
        <SummaryCard label="Hotel Income" value={monthData.hotelTotal} tone="green" />
        <SummaryCard label="Total Month" value={monthData.total} tone="orange" />
      </div>

      <div className="md:hidden space-y-3">
        <MobileRows title="Tour Summary" rows={monthData.tourRows} total={monthData.tourTotal} type="tour" />
        <MobileRows title="Hotel Summary" rows={monthData.hotelRows} total={monthData.hotelTotal} type="hotel" />
      </div>

      <div className="hidden md:grid md:grid-cols-[2fr_3fr] gap-3">
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
          <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-[10px] font-extrabold uppercase text-gray-800">Tour</h3>
            <span className="text-xs font-extrabold text-blue-600 tabular-nums">{formatCurrencyShort(monthData.tourTotal)}</span>
          </div>
          <TourTable rows={monthData.tourRows} />
        </section>
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
          <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-[10px] font-extrabold uppercase text-gray-800">Hotel</h3>
            <span className="text-xs font-extrabold text-green-600 tabular-nums">{formatCurrencyShort(monthData.hotelTotal)}</span>
          </div>
          <HotelTable rows={monthData.hotelRows} />
        </section>
      </div>
    </div>
  );
}
