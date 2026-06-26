import { useState } from 'react';
import { IconClipboardList, IconBus, IconBuilding, IconChevronLeft, IconChevronRight } from '../icons';

function OpsListItemMobile({ voucher, customer, meta }) {
  return (
    <div className="px-2 py-1.5 active:bg-gray-50">
      <div className="flex items-baseline gap-1.5">
        <span className="text-[10px] font-extrabold text-gray-400 tabular-nums shrink-0">{voucher}</span>
        <span className="flex-1 text-[11px] font-bold text-gray-900 truncate">{customer}</span>
      </div>
      <p className="text-[10px] text-gray-500 truncate mt-0.5">{meta}</p>
    </div>
  );
}

export default function DailyOpsTab({ dashboardData }) {
  const [opsDate, setOpsDate] = useState(new Date());
  const [mobileSection, setMobileSection] = useState('tours');
  const y = opsDate.getFullYear();
  const m = String(opsDate.getMonth() + 1).padStart(2, '0');
  const d = String(opsDate.getDate()).padStart(2, '0');
  const targetDateYMD = `${y}-${m}-${d}`;
  const filteredTours = (dashboardData?.dailyOps?.tours || []).filter((t) => t.dateStr === targetDateYMD);
  const filteredHotels = (dashboardData?.dailyOps?.hotels || []).filter((h) => h.dateStr === targetDateYMD);
  const changeOpsDate = (days) => { const nd = new Date(opsDate); nd.setDate(nd.getDate() + days); setOpsDate(nd); };
  const dateShort = opsDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  const dateFull = opsDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const tourMeta = (t) => [t.tourName || t.service || 'ไม่ระบุทริป', t.companyName, t.pickupTime, t.agent].filter(Boolean).join(' · ');
  const hotelMeta = (h) => [h.hotelName || h.service || 'ไม่ระบุโรงแรม', h.stayDate, h.agent].filter(Boolean).join(' · ');
  const mobileItems = mobileSection === 'tours' ? filteredTours : filteredHotels;

  return (
    <div className="animate-fade-in space-y-2 md:space-y-6">
      <div className="md:hidden flex items-center gap-1">
        <button type="button" onClick={() => changeOpsDate(-1)} className="w-7 h-7 flex items-center justify-center bg-white rounded border border-gray-200"><IconChevronLeft /></button>
        <span className="flex-1 text-center text-[11px] font-bold text-gray-800">{dateShort}</span>
        <button type="button" onClick={() => changeOpsDate(1)} className="w-7 h-7 flex items-center justify-center bg-white rounded border border-gray-200"><IconChevronRight /></button>
        <button type="button" onClick={() => setOpsDate(new Date())} className="px-1.5 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 rounded border border-blue-100">วันนี้</button>
      </div>
      <div className="md:hidden">
        <div className="flex bg-gray-100 rounded-lg p-0.5 mb-1.5">
          <button type="button" onClick={() => setMobileSection('tours')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${mobileSection === 'tours' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>ทัวร์ ({filteredTours.length})</button>
          <button type="button" onClick={() => setMobileSection('hotels')} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md ${mobileSection === 'hotels' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}>โรงแรม ({filteredHotels.length})</button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {mobileItems.length === 0 ? <p className="py-6 text-center text-[11px] text-gray-400">{mobileSection === 'tours' ? 'ไม่มีทัวร์วันนี้' : 'ไม่มีเช็คอินวันนี้'}</p> : (
            <div className="divide-y divide-gray-100">
              {mobileSection === 'tours' ? filteredTours.map((t, i) => <OpsListItemMobile key={i} voucher={t.voucher} customer={t.customer} meta={tourMeta(t)} />) : filteredHotels.map((h, i) => <OpsListItemMobile key={i} voucher={h.voucher} customer={h.customer} meta={hotelMeta(h)} />)}
            </div>
          )}
        </div>
      </div>
      <div className="hidden md:flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-extrabold text-gray-800">รายการปฏิบัติงาน</h2>
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
          <button type="button" onClick={() => changeOpsDate(-1)} className="p-2 bg-white rounded-md border border-gray-200"><IconChevronLeft /></button>
          <span className="px-4 text-sm font-bold min-w-[140px] text-center">{dateFull}</span>
          <button type="button" onClick={() => changeOpsDate(1)} className="p-2 bg-white rounded-md border border-gray-200"><IconChevronRight /></button>
          <button type="button" onClick={() => setOpsDate(new Date())} className="ml-1 px-2 py-1.5 bg-blue-50 text-blue-600 font-bold text-xs rounded-md border border-blue-100">วันนี้</button>
        </div>
      </div>
      <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center gap-2"><div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><IconBus /></div><h3 className="font-bold">ทัวร์ (Tours)</h3><span className="ml-auto bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{filteredTours.length}</span></div>
          <div className="p-4">{filteredTours.length === 0 ? <div className="py-10 text-center text-gray-400 text-sm"><IconClipboardList /><p className="mt-2">ไม่มีรายการ</p></div> : filteredTours.map((item, i) => (
            <div key={i} className="flex gap-2 p-3 mb-2 border border-gray-100 rounded-lg bg-gray-50/50"><span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded h-fit">{item.voucher}</span><div className="min-w-0 flex-1"><p className="font-bold truncate">{item.customer}</p><p className="text-sm truncate">{tourMeta(item)}</p></div></div>
          ))}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-purple-50 border-b border-purple-100 px-6 py-4 flex items-center gap-2"><div className="bg-purple-100 text-purple-600 p-2 rounded-lg"><IconBuilding /></div><h3 className="font-bold">เช็คอินโรงแรม</h3><span className="ml-auto bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">{filteredHotels.length}</span></div>
          <div className="p-4">{filteredHotels.length === 0 ? <div className="py-10 text-center text-gray-400 text-sm"><IconClipboardList /><p className="mt-2">ไม่มีรายการ</p></div> : filteredHotels.map((item, i) => (
            <div key={i} className="flex gap-2 p-3 mb-2 border border-gray-100 rounded-lg bg-gray-50/50"><span className="bg-gray-800 text-white text-xs font-bold px-2 py-1 rounded h-fit">{item.voucher}</span><div className="min-w-0 flex-1"><p className="font-bold truncate">{item.customer}</p><p className="text-sm truncate">{hotelMeta(item)}</p></div></div>
          ))}</div>
        </div>
      </div>
    </div>
  );
}
