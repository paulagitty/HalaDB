import { useState, useRef, useCallback } from 'react';
import { IconChevronDown, IconChevronRight } from '../icons';
import StatusToggle from '../common/StatusToggle';
import { savePaymentRecord } from '../../api/googleSheets';
import { formatDateShow, todayYMD, getVisiblePaymentList } from '../../lib/format';

function PaymentStatusBadge({ shortLabel, isPaid, dueDate, syncing, compact }) {
  if (isPaid) {
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 border border-green-100 whitespace-nowrap shrink-0 ${syncing ? 'opacity-70' : ''}`}>
        ✓ {shortLabel}
      </span>
    );
  }
  const text = dueDate ? formatDateShow(dueDate) : 'Unpaid';
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 whitespace-nowrap shrink-0 ${compact ? 'max-w-[5.5rem] truncate' : ''} ${syncing ? 'opacity-70' : ''}`}>
      {shortLabel} {text}
    </span>
  );
}

function paymentSummary(payment) {
  if (payment.type === 'Tour') return [payment.tourName || payment.service, payment.companyName, payment.pickupTime].filter(Boolean).join(', ');
  return payment.hotelName || payment.service || '';
}

function paymentDate(payment) {
  if (payment.type === 'Tour') return formatDateShow(payment.dateStr || payment.serviceDate);
  return payment.stayDate || '';
}

function formToPayload(form, isClearedFlag = false) {
  const today = todayYMD();
  const bothPaid = form.suppStatus && form.custStatus;
  return {
    suppStatus: form.suppStatus ? 'Paid' : 'Unpaid',
    suppDueDate: form.suppStatus ? '' : (form.suppDueDate || ''),
    suppPaidDate: form.suppStatus ? (form.suppPaidDate || today) : '',
    suppEmail: !!form.suppEmail,
    custStatus: form.custStatus ? 'Paid' : 'Unpaid',
    custDueDate: form.custStatus ? '' : (form.custDueDate || ''),
    custPaidDate: form.custStatus ? (form.custPaidDate || today) : '',
    custEmail: !!form.custEmail,
    isCleared: isClearedFlag || bothPaid,
  };
}

function paymentToForm(payment) {
  return {
    suppStatus: payment.suppStatus === 'Paid',
    suppDueDate: payment.suppDueDate || '',
    suppPaidDate: payment.suppPaidDate || '',
    suppEmail: payment.suppEmail || false,
    custStatus: payment.custStatus === 'Paid',
    custDueDate: payment.custDueDate || '',
    custPaidDate: payment.custPaidDate || '',
    custEmail: payment.custEmail || false,
  };
}

export default function PaymentDueTab({ dashboardData, onPaymentUpdate, onRefresh }) {
  const [expandedPaymentId, setExpandedPaymentId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [syncingUids, setSyncingUids] = useState({});
  const debounceRef = useRef({});
  const snapshotRef = useRef({});

  const paymentList = getVisiblePaymentList(dashboardData?.paymentList || []);

  const setSyncing = (uid, on) => {
    setSyncingUids((prev) => ({ ...prev, [uid]: on }));
  };

  const syncToSheet = useCallback(async (uid, voucherRaw, payload, revertSnapshot) => {
    setSyncing(uid, true);
    try {
      const result = await savePaymentRecord(uid, voucherRaw, payload);
      if (result.status !== 'success') throw new Error(result.message || 'Save failed');
    } catch (err) {
      if (revertSnapshot) onPaymentUpdate(uid, revertSnapshot);
      alert('บันทึกไม่สำเร็จ (ข้อมูลถูกย้อนกลับ): ' + err.message);
    } finally {
      setSyncing(uid, false);
    }
  }, [onPaymentUpdate]);

  const applyOptimistic = useCallback((payment, form, isClearedFlag = false) => {
    const payload = formToPayload(form, isClearedFlag);
    snapshotRef.current[payment.uid] = {
      suppStatus: payment.suppStatus,
      suppDueDate: payment.suppDueDate || '',
      suppPaidDate: payment.suppPaidDate || '',
      suppEmail: payment.suppEmail || false,
      custStatus: payment.custStatus,
      custDueDate: payment.custDueDate || '',
      custPaidDate: payment.custPaidDate || '',
      custEmail: payment.custEmail || false,
      isCleared: payment.isCleared || false,
    };
    onPaymentUpdate(payment.uid, payload);
    if (payload.isCleared || (payload.suppStatus === 'Paid' && payload.custStatus === 'Paid')) {
      setExpandedPaymentId(null);
    }
    syncToSheet(payment.uid, payment.voucherRaw, payload, snapshotRef.current[payment.uid]);
  }, [onPaymentUpdate, syncToSheet]);

  const scheduleSave = useCallback((payment, form, isClearedFlag = false) => {
    clearTimeout(debounceRef.current[payment.uid]);
    debounceRef.current[payment.uid] = setTimeout(() => {
      applyOptimistic(payment, form, isClearedFlag);
    }, 400);
  }, [applyOptimistic]);

  const handleEditPayment = (payment) => {
    if (expandedPaymentId === payment.uid) {
      setExpandedPaymentId(null);
    } else {
      setExpandedPaymentId(payment.uid);
      setEditForm(paymentToForm(payment));
    }
  };

  const updateForm = (payment, patch, { immediate = false, isCleared = false } = {}) => {
    const nextForm = { ...editForm, ...patch };
    setEditForm(nextForm);
    if (immediate) applyOptimistic(payment, nextForm, isCleared);
    else scheduleSave(payment, nextForm, isCleared);
  };

  const handleToggle = (payment, side, val) => {
    const today = todayYMD();
    const patch = {
      [`${side}Status`]: val,
      [`${side}DueDate`]: val ? '' : editForm[`${side}DueDate`],
      [`${side}PaidDate`]: val ? (editForm[`${side}PaidDate`] || today) : '',
    };
    updateForm(payment, patch, { immediate: true });
  };

  return (
    <div className="animate-fade-in">
      <p className="md:hidden text-[10px] text-orange-700 font-semibold mb-2 px-1">
        รายการใกล้วันเที่ยว/เช็คอิน อยู่ด้านบน · อัปเดตทันที
      </p>
      <div className="hidden md:flex justify-between items-center mb-4">
        <h2 className="text-lg font-extrabold text-gray-800">รายการค้างชำระ / รอตรวจสอบ</h2>
        <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-200">
          บันทึก Sheets ในพื้นหลัง — แสดงผลทันที
        </span>
      </div>
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {paymentList.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs md:text-sm">ไม่พบรายการ Booking ที่ค้างชำระในระบบ</div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[3.5rem_4rem_minmax(8rem,1fr)_minmax(0,2fr)_5.5rem_5.5rem_1.25rem] gap-2 px-3 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              <span>Voucher</span>
              <span>Type</span>
              <span>Customer</span>
              <span>Details</span>
              <span className="text-center">ซัพ</span>
              <span className="text-center">ลูกค้า</span>
              <span />
            </div>
          <div className="divide-y divide-gray-100">
            {paymentList.map((payment, idx) => {
              const isExpanded = expandedPaymentId === payment.uid;
              const syncing = !!syncingUids[payment.uid];
              const summary = paymentSummary(payment);
              const date = paymentDate(payment);
              return (
                <div key={payment.uid || idx} className={syncing ? 'bg-blue-50/30' : ''}>
                  <div className="md:hidden px-2 py-1.5 cursor-pointer active:bg-gray-50" onClick={() => handleEditPayment(payment)}>
                    <div className="flex items-center gap-1.5">
                      <span className="bg-gray-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">{payment.voucher}</span>
                      <span className={`text-[9px] font-bold px-1 py-0.5 rounded shrink-0 ${payment.type === 'Tour' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {payment.type === 'Tour' ? 'Tour' : 'Hotel'}
                      </span>
                      <p className="flex-1 font-bold text-xs text-gray-900 truncate">{payment.customer}</p>
                      {syncing && <span className="text-[9px] text-blue-500 shrink-0">sync…</span>}
                      <span className="text-gray-300 shrink-0 scale-75">{isExpanded ? <IconChevronDown /> : <IconChevronRight />}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{summary}{payment.agent ? ` · ${payment.agent}` : ''}{date ? ` · ${date}` : ''}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <PaymentStatusBadge shortLabel="ซัพ" isPaid={payment.suppStatus === 'Paid'} dueDate={payment.suppDueDate} syncing={syncing} />
                      <PaymentStatusBadge shortLabel="ลูกค้า" isPaid={payment.custStatus === 'Paid'} dueDate={payment.custDueDate} syncing={syncing} />
                    </div>
                  </div>
                  <div
                    className="hidden md:grid grid-cols-[3.5rem_4rem_minmax(8rem,1fr)_minmax(0,2fr)_5.5rem_5.5rem_1.25rem] gap-2 items-center px-3 py-2 cursor-pointer hover:bg-gray-50/80"
                    onClick={() => handleEditPayment(payment)}
                  >
                    <span className="bg-gray-800 text-white text-[11px] font-bold px-1.5 py-0.5 rounded text-center">{payment.voucher}</span>
                    <span className={`text-[10px] font-bold px-1 py-0.5 rounded text-center ${payment.type === 'Tour' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                      {payment.type === 'Tour' ? 'Tour' : 'Hotel'}
                    </span>
                    <span className="font-bold text-sm text-gray-900 truncate">{payment.customer}</span>
                    <span className="text-xs text-gray-500 truncate min-w-0">
                      {summary}{payment.agent ? ` · ${payment.agent}` : ''}{date ? ` · ${date}` : ''}
                    </span>
                    <span className="flex justify-center">
                      <PaymentStatusBadge shortLabel="ซัพ" isPaid={payment.suppStatus === 'Paid'} dueDate={payment.suppDueDate} syncing={syncing} compact />
                    </span>
                    <span className="flex justify-center">
                      <PaymentStatusBadge shortLabel="ลูกค้า" isPaid={payment.custStatus === 'Paid'} dueDate={payment.custDueDate} syncing={syncing} compact />
                    </span>
                    <span className="flex items-center justify-end text-gray-300">
                      {syncing ? <span className="text-[9px] text-blue-500 mr-0.5">↻</span> : null}
                      {isExpanded ? <IconChevronDown /> : <IconChevronRight />}
                    </span>
                  </div>
                  {isExpanded && (
                    <div className="bg-gray-50 px-2 py-3 md:p-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-8" onClick={(e) => e.stopPropagation()}>
                      {['supp', 'cust'].map((side) => (
                        <div key={side} className="bg-white p-3 md:p-5 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-1 h-full ${side === 'supp' ? 'bg-blue-400' : 'bg-orange-400'}`} />
                          <h3 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 text-xs md:text-base">
                            {side === 'supp' ? 'จ่ายซัพพลายเออร์' : 'รับเงินลูกค้า'}
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-medium text-gray-600">สถานะ</span>
                              <StatusToggle
                                isPaid={editForm[`${side}Status`]}
                                onChange={(val) => handleToggle(payment, side, val)}
                              />
                            </div>
                            {!editForm[`${side}Status`] ? (
                              <div>
                                <label className="block text-xs font-bold text-red-600 mb-0.5">Due Date</label>
                                <input
                                  type="date"
                                  value={editForm[`${side}DueDate`]}
                                  onChange={(e) => updateForm(payment, { [`${side}DueDate`]: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-xs font-bold text-green-600 mb-0.5">Paid Date</label>
                                <input
                                  type="date"
                                  value={editForm[`${side}PaidDate`]}
                                  onChange={(e) => updateForm(payment, { [`${side}PaidDate`]: e.target.value })}
                                  className="w-full border border-green-300 bg-green-50 rounded-md px-2 py-2 text-sm"
                                />
                              </div>
                            )}
                            <div className={`flex items-center gap-2 ${editForm[`${side}Status`] ? 'opacity-40 pointer-events-none' : ''}`}>
                              <input
                                type="checkbox"
                                id={`${side}Email-${payment.uid}`}
                                checked={editForm[`${side}Email`]}
                                onChange={(e) => updateForm(payment, { [`${side}Email`]: e.target.checked }, { immediate: true })}
                                className="w-3.5 h-3.5"
                                disabled={editForm[`${side}Status`]}
                              />
                              <label htmlFor={`${side}Email-${payment.uid}`} className="text-[11px] text-gray-600">แจ้งเตือนอีเมลล่วงหน้า 1 วัน</label>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="md:col-span-2 flex flex-col-reverse md:flex-row md:justify-end gap-2 pt-2 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => { setExpandedPaymentId(null); onRefresh(); }}
                          className="w-full md:w-auto px-4 py-2 rounded-lg font-bold text-xs md:text-sm text-gray-600 bg-white border border-gray-300"
                        >
                          ปิด
                        </button>
                        {(editForm.suppStatus && editForm.custStatus) && (
                          <button
                            type="button"
                            onClick={() => updateForm(payment, editForm, { immediate: true, isCleared: true })}
                            className="w-full md:w-auto px-4 py-2 rounded-lg font-bold text-xs md:text-sm text-white bg-green-500"
                          >
                            ✅ เคลียร์ออกจากรายการ
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </div>
  );
}
