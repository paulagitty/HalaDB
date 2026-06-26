import { useState } from 'react';
import { saveManualYearlyEntries } from '../../api/googleSheets';
import ScrollTableWrap from '../common/ScrollTableWrap';
import { formatCurrency, formatCurrencyShort, formatNumber, getMonthName, getMonthNameShort } from '../../lib/format';

export default function YearlyReportTab({ dashboardData, currentYear, onRefresh, saving, setSaving }) {
  const [isEditingComparison, setIsEditingComparison] = useState(false);
  const [comparisonEditForm, setComparisonEditForm] = useState({});
  const manualData = dashboardData?.manualYearlyData || {};
  const currentYearApiReport = (dashboardData?.yearlyReport || []).filter((r) => r.month?.startsWith(currentYear));
  const COMPARISON_YEARS = Array.from({ length: 6 }, (_, i) => String(parseInt(currentYear) - i));

  const startComparisonEdit = () => {
    const form = {};
    COMPARISON_YEARS.forEach((year) => {
      if (year === currentYear) return;
      for (let m = 1; m <= 12; m++) {
        const mKey = `${year}-${String(m).padStart(2, '0')}`;
        const md = manualData[mKey];
        const v = md ? ((md.totalOnly != null && md.totalOnly !== '') ? Number(md.totalOnly) : (Number(md.tourProfit) || 0) + (Number(md.hotelProfit) || 0)) : 0;
        form[mKey] = v > 0 ? String(v) : '';
      }
    });
    setComparisonEditForm(form);
    setIsEditingComparison(true);
  };

  const saveComparison = async () => {
    setSaving(true);
    try {
      const entries = Object.keys(comparisonEditForm).map((month) => ({ month, tourProfit: 0, hotelProfit: 0, totalOnly: parseFloat(comparisonEditForm[month]) || null }));
      const result = await saveManualYearlyEntries(entries);
      if (result.status === 'success') { await onRefresh(); setIsEditingComparison(false); setComparisonEditForm({}); }
      else alert('บันทึกไม่สำเร็จ');
    } catch (err) { alert('บันทึกไม่สำเร็จ: ' + err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="animate-fade-in space-y-4 md:space-y-10">
      <div>
        <h2 className="hidden md:block text-sm font-extrabold text-gray-800 mb-4">รายละเอียดรายเดือน (ปี {parseInt(currentYear) + 543})</h2>
        <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="md:hidden">
            {currentYearApiReport.length === 0 ? <p className="px-3 py-6 text-center text-xs text-gray-500">ไม่พบข้อมูล</p> : (
              <>
                <div className="divide-y divide-gray-100">
                  {currentYearApiReport.map((row, idx) => (
                    <div key={idx} className="px-3 py-2">
                      <div className="flex justify-between mb-1"><span className="text-xs font-bold">{getMonthNameShort(row.month)}</span><span className="text-xs font-extrabold text-blue-600">{formatCurrencyShort(row.totalProfit)}</span></div>
                      <div className="flex gap-3 text-[10px] text-gray-500"><span>ทัวร์ <b className="text-gray-700">{formatCurrencyShort(row.tourProfit)}</b></span><span>โรงแรม <b className="text-gray-700">{formatCurrencyShort(row.hotelProfit)}</b></span></div>
                    </div>
                  ))}
                </div>
                <div className="px-3 py-2 bg-blue-600 flex justify-between"><span className="text-[11px] font-extrabold text-white">รวมปี</span><span className="text-xs font-extrabold text-yellow-300">{formatCurrencyShort(currentYearApiReport.reduce((s, r) => s + (r.totalProfit || 0), 0))}</span></div>
              </>
            )}
          </div>
          <div className="hidden md:block">
            <ScrollTableWrap>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50"><tr><th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">เดือน</th><th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">รายได้ทัวร์</th><th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">รายได้โรงแรม</th><th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">รวมทั้งหมด</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {currentYearApiReport.map((row, idx) => (
                    <tr key={idx}><td className="px-6 py-4 text-sm font-bold">{getMonthName(row.month)}</td><td className="px-6 py-4 text-sm text-right">{formatCurrency(row.tourProfit)}</td><td className="px-6 py-4 text-sm text-right">{formatCurrency(row.hotelProfit)}</td><td className="px-6 py-4 text-sm font-bold text-right text-blue-600">{formatCurrency(row.totalProfit)}</td></tr>
                  ))}
                </tbody>
              </table>
            </ScrollTableWrap>
          </div>
        </div>
      </div>
      <div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 md:mb-4">
          <h2 className="text-[11px] md:text-sm font-extrabold text-gray-800">เปรียบเทียบรายได้รายปี</h2>
          {isEditingComparison ? (
            <div className="flex gap-2"><button type="button" onClick={() => { setIsEditingComparison(false); setComparisonEditForm({}); }} className="px-3 py-1.5 text-xs font-bold border rounded-lg">ยกเลิก</button><button type="button" onClick={saveComparison} disabled={saving} className="px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded-lg">{saving ? 'บันทึก...' : '💾 บันทึก'}</button></div>
          ) : (
            <button type="button" onClick={startComparisonEdit} className="hidden md:flex px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg">✏️ กรอกข้อมูลปีก่อนหน้า</button>
          )}
        </div>
        <p className="md:hidden text-[10px] text-gray-400 text-center mb-2">ตารางเปรียบเทียบรายปี — ดูบนหน้าจอใหญ่</p>
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <ScrollTableWrap hint="← เลื่อนดูข้อมูลรายปี →">
            <table className="min-w-[720px] w-full divide-y divide-gray-200 text-sm">
              <thead><tr className="bg-gray-800"><th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase min-w-[200px]">เดือน</th>{COMPARISON_YEARS.map((year, yi) => <th key={year} className={`px-3 py-3 text-right text-xs font-bold uppercase min-w-[110px] ${yi === 0 ? 'bg-blue-700 text-white' : 'text-gray-300'}`}>ปี {parseInt(year) + 543}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((monthNum) => {
                  const labelKey = `${currentYear}-${String(monthNum).padStart(2,'0')}`;
                  return (
                    <tr key={monthNum}>
                      <td className="px-6 py-3 font-bold text-sm text-gray-700">{getMonthName(labelKey)}</td>
                      {COMPARISON_YEARS.map((year, yi) => {
                        const mKey = `${year}-${String(monthNum).padStart(2,'0')}`;
                        const isCurrentYr = yi === 0;
                        let value = 0;
                        if (isCurrentYr) { const apiRow = currentYearApiReport.find((r) => r.month === mKey); value = apiRow ? apiRow.totalProfit : 0; }
                        else { const md = manualData[mKey]; if (md) value = (md.totalOnly != null && md.totalOnly !== '') ? Number(md.totalOnly) : (Number(md.tourProfit)||0)+(Number(md.hotelProfit)||0); }
                        return (
                          <td key={year} className={`px-3 py-3 text-right ${isCurrentYr ? 'bg-blue-50/60 text-blue-700 font-semibold' : 'text-gray-700'}`}>
                            {isCurrentYr || !isEditingComparison ? (value > 0 ? formatNumber(value) : '—') : (
                              <input type="number" value={comparisonEditForm[mKey] ?? ''} onChange={(e) => setComparisonEditForm((f) => ({ ...f, [mKey]: e.target.value }))} className="w-28 text-right border rounded px-2 py-1 text-sm" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollTableWrap>
        </div>
      </div>
    </div>
  );
}
