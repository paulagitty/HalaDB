import { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '../icons';
import ScrollTableWrap from '../common/ScrollTableWrap';
import { formatCurrency, formatCurrencyShort, getMonthName, getMonthNameShort } from '../../lib/format';

export default function AccountingTab({ dashboardData, currentYear, activeYear, setActiveYear }) {
  const [isEditingAccounting, setIsEditingAccounting] = useState(false);
  const [accountingEditForm, setAccountingEditForm] = useState({});
  const [accountingData, setAccountingData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hala_accounting') || '{}'); } catch { return {}; }
  });

  const manualData = dashboardData?.manualYearlyData || {};
  const thisYearReport = (dashboardData?.yearlyReport || []).filter((r) => r.month?.startsWith(activeYear));
  const MONTH_KEYS = Array.from({ length: 12 }, (_, i) => `${activeYear}-${String(i + 1).padStart(2, '0')}`);
  const apiDataMap = Object.fromEntries(thisYearReport.map((r) => [r.month, r]));
  const mergedYearReport = MONTH_KEYS.map((month) => {
    if (apiDataMap[month]) return { ...apiDataMap[month], source: 'api' };
    if (manualData[month]) {
      const md = manualData[month];
      const totalOnly = (md.totalOnly != null && md.totalOnly !== '') ? Number(md.totalOnly) : null;
      const total = totalOnly !== null ? totalOnly : (Number(md.tourProfit) || 0) + (Number(md.hotelProfit) || 0);
      return { month, totalProfit: total, source: 'manual' };
    }
    return { month, totalProfit: 0, source: 'empty' };
  });
  const allDataReport = mergedYearReport.filter((r) => r.source !== 'empty');

  const accMonthData = MONTH_KEYS.map((month) => {
    const rev = allDataReport.find((r) => r.month === month);
    const totalRevenue = rev ? rev.totalProfit : 0;
    const src = isEditingAccounting && accountingEditForm[month] ? accountingEditForm[month] : (accountingData[month] || {});
    const salary = parseFloat(src?.salary) || 0;
    const socialSec = parseFloat(src?.socialSec) || 0;
    const others = parseFloat(src?.others) || 0;
    const vat = parseFloat(src?.vat) || 0;
    const totalExpense = salary + socialSec + others + vat;
    const afterExpense = totalRevenue - totalExpense;
    const commission = afterExpense > 0 ? afterExpense * 0.05 : 0;
    const netCompany = afterExpense - commission;
    return { month, totalRevenue, salary, socialSec, others, vat, totalExpense, afterExpense, commission, netCompany };
  });

  const displayAccData = isEditingAccounting ? accMonthData : accMonthData.filter((r) => r.totalRevenue > 0 || r.totalExpense > 0);
  const accTotals = accMonthData.reduce((t, r) => ({ revenue: t.revenue + r.totalRevenue, expense: t.expense + r.totalExpense, commission: t.commission + r.commission, netCompany: t.netCompany + r.netCompany }), { revenue: 0, expense: 0, commission: 0, netCompany: 0 });

  const startAccountingEdit = () => {
    const form = {};
    MONTH_KEYS.forEach((month) => { const acc = accountingData[month] || {}; form[month] = { salary: acc.salary ?? '', socialSec: acc.socialSec ?? '', others: acc.others ?? '', vat: acc.vat ?? '' }; });
    setAccountingEditForm(form);
    setIsEditingAccounting(true);
  };

  const saveAccounting = () => {
    const updated = { ...accountingData };
    Object.keys(accountingEditForm).forEach((month) => {
      const f = accountingEditForm[month];
      const salary = parseFloat(f.salary) || 0; const socialSec = parseFloat(f.socialSec) || 0; const others = parseFloat(f.others) || 0; const vat = parseFloat(f.vat) || 0;
      if (salary === 0 && socialSec === 0 && others === 0 && vat === 0) delete updated[month];
      else updated[month] = { salary, socialSec, others, vat };
    });
    setAccountingData(updated);
    localStorage.setItem('hala_accounting', JSON.stringify(updated));
    setIsEditingAccounting(false);
    setAccountingEditForm({});
  };

  return (
    <div className="animate-fade-in space-y-3 md:space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h2 className="hidden md:block text-sm font-extrabold text-gray-800">สรุปบัญชีรายเดือน (ปี {parseInt(activeYear) + 543})</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5">
            <button type="button" onClick={() => { setActiveYear(String(parseInt(activeYear) - 1)); setIsEditingAccounting(false); }} className="p-1 rounded-md"><IconChevronLeft /></button>
            <span className="px-2 text-xs font-bold min-w-[72px] text-center">ปี {parseInt(activeYear) + 543}</span>
            <button type="button" onClick={() => { setActiveYear(String(parseInt(activeYear) + 1)); setIsEditingAccounting(false); }} className="p-1 rounded-md"><IconChevronRight /></button>
          </div>
          {isEditingAccounting ? (
            <div className="flex gap-2"><button type="button" onClick={() => { setIsEditingAccounting(false); setAccountingEditForm({}); }} className="px-3 py-1.5 text-xs font-bold border rounded-lg">ยกเลิก</button><button type="button" onClick={saveAccounting} className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded-lg">💾 บันทึก</button></div>
          ) : (
            <button type="button" onClick={startAccountingEdit} className="px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg">✏️ กรอกค่าใช้จ่าย</button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-4">
        {[['รายรับ', accTotals.revenue, 'text-gray-900', ''], ['ค่าใช้จ่าย', accTotals.expense, 'text-red-500', 'border-l-red-400'], ['Comm 5%', accTotals.commission, 'text-amber-600', 'border-l-amber-400'], ['สุทธิ', accTotals.netCompany, accTotals.netCompany >= 0 ? 'text-green-600' : 'text-red-500', accTotals.netCompany >= 0 ? 'border-l-green-500' : 'border-l-red-500']].map(([label, val, color, border]) => (
          <div key={label} className={`bg-white rounded-lg border border-gray-200 p-2 md:p-5 shadow-sm border-l-2 md:border-l-4 ${border}`}><p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase mb-0.5">{label}</p><p className={`text-sm md:text-2xl font-extrabold tabular-nums ${color}`}>{formatCurrencyShort(val)}</p></div>
        ))}
      </div>
      {!isEditingAccounting ? (
        <div className="md:hidden bg-white rounded-lg border border-gray-200 overflow-hidden">
          {displayAccData.length === 0 ? <p className="py-6 text-center text-xs text-gray-400">ยังไม่มีข้อมูล</p> : (
            <>
              <div className="divide-y divide-gray-100">
                {displayAccData.map((row, idx) => (
                  <div key={idx} className="px-3 py-2">
                    <div className="flex justify-between mb-1"><span className="text-xs font-bold">{getMonthNameShort(row.month)}</span><span className={`text-xs font-extrabold ${row.netCompany >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{formatCurrencyShort(row.netCompany)}</span></div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-500"><span>รับ <b>{formatCurrencyShort(row.totalRevenue)}</b></span><span>จ่าย <b className="text-red-500">{row.totalExpense > 0 ? formatCurrencyShort(row.totalExpense) : '—'}</b></span><span className="text-right">Comm <b className="text-amber-600">{formatCurrencyShort(row.commission)}</b></span></div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-2 bg-gray-800 flex justify-between"><span className="text-[11px] font-extrabold text-white">รวมปี</span><span className={`text-xs font-extrabold ${accTotals.netCompany >= 0 ? 'text-green-300' : 'text-red-300'}`}>{formatCurrencyShort(accTotals.netCompany)}</span></div>
            </>
          )}
        </div>
      ) : (
        <div className="md:hidden bg-white rounded-lg border overflow-hidden"><ScrollTableWrap><table className="min-w-[640px] w-full text-xs"><thead className="bg-gray-50"><tr><th className="px-2 py-2 text-left">เดือน</th><th className="px-2 py-2 text-right">เงินเดือน</th><th className="px-2 py-2 text-right">ประกัน</th><th className="px-2 py-2 text-right">อื่นๆ</th><th className="px-2 py-2 text-right">VAT</th></tr></thead><tbody>{displayAccData.map((row, idx) => (
          <tr key={idx}><td className="px-2 py-2 font-bold">{getMonthNameShort(row.month)}</td>{['salary','socialSec','others','vat'].map((f) => <td key={f} className="px-2 py-2 text-right"><input type="number" value={accountingEditForm[row.month]?.[f] ?? ''} onChange={(e) => setAccountingEditForm((form) => ({ ...form, [row.month]: { ...form[row.month], [f]: e.target.value } }))} className="w-20 text-right border rounded px-1 py-1" /></td>)}</tr>
        ))}</tbody></table></ScrollTableWrap></div>
      )}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <ScrollTableWrap>
          <table className="min-w-[880px] w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase sticky left-0 bg-gray-50">เดือน</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">รายรับรวม</th><th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">เงินเดือน</th><th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">ประกันสังคม</th><th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">อื่นๆ</th><th className="px-4 py-3 text-right text-xs font-bold text-red-400 uppercase">VAT</th><th className="px-4 py-3 text-right text-xs font-bold text-red-500 uppercase bg-red-50">รวมค่าใช้จ่าย</th><th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase">คงเหลือ</th><th className="px-4 py-3 text-right text-xs font-bold text-amber-500 uppercase bg-amber-50">Comm 5%</th><th className="px-4 py-3 text-right text-xs font-bold text-blue-600 uppercase bg-blue-50">เข้าบริษัทสุทธิ</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {displayAccData.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3 font-bold sticky left-0 bg-white">{getMonthName(row.month)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(row.totalRevenue)}</td>
                  {['salary','socialSec','others','vat'].map((f) => (
                    <td key={f} className="px-4 py-3 text-right">{isEditingAccounting ? <input type="number" value={accountingEditForm[row.month]?.[f] ?? ''} onChange={(e) => setAccountingEditForm((form) => ({ ...form, [row.month]: { ...form[row.month], [f]: e.target.value } }))} className="w-28 text-right border rounded px-2 py-1 text-sm" /> : <span className={row[f] > 0 ? 'text-red-500' : 'text-gray-300'}>{row[f] > 0 ? formatCurrency(row[f]) : '—'}</span>}</td>
                  ))}
                  <td className="px-4 py-3 text-right font-semibold text-red-500 bg-red-50/40">{row.totalExpense > 0 ? formatCurrency(row.totalExpense) : '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(row.afterExpense)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-amber-600 bg-amber-50/40">{formatCurrency(row.commission)}</td>
                  <td className={`px-4 py-3 text-right font-extrabold bg-blue-50/40 ${row.netCompany >= 0 ? 'text-blue-600' : 'text-red-500'}`}>{formatCurrency(row.netCompany)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollTableWrap>
      </div>
    </div>
  );
}
