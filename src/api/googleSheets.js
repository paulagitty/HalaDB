const GOOGLE_API_URL = 'https://script.google.com/macros/s/AKfycbyVSGSC5sNwOfxwQvTwi0kpBtUsGn6-4SnsBFqqHNBqjGRoVYR0EFXGOMuuAHVUakTE/exec';

function sortPaymentList(list) {
  if (!list?.length) return list || [];
  return [...list].sort((a, b) => {
    const aAllPaid = a.suppStatus === 'Paid' && a.custStatus === 'Paid';
    const bAllPaid = b.suppStatus === 'Paid' && b.custStatus === 'Paid';
    if (aAllPaid && !bAllPaid) return 1;
    if (!aAllPaid && bAllPaid) return -1;
    if (aAllPaid && bAllPaid) return 0;
    const getUrgency = (item) => {
      let urgency = new Date('2099-12-31').getTime();
      let hasDue = false;
      if (item.suppStatus !== 'Paid' && item.suppDueDate) {
        urgency = Math.min(urgency, new Date(item.suppDueDate).getTime());
        hasDue = true;
      }
      if (item.custStatus !== 'Paid' && item.custDueDate) {
        urgency = Math.min(urgency, new Date(item.custDueDate).getTime());
        hasDue = true;
      }
      if (!hasDue && item.serviceDate) {
        const sDate = new Date(item.serviceDate).getTime();
        if (!isNaN(sDate)) urgency = Math.min(urgency, sDate);
      }
      return urgency;
    };
    return getUrgency(a) - getUrgency(b);
  });
}

export async function fetchDashboardData() {
  const response = await fetch(GOOGLE_API_URL);
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('API returned invalid data');
  }
  if (!data || typeof data !== 'object') throw new Error('API returned empty data');
  if (data.paymentList) data.paymentList = sortPaymentList(data.paymentList);
  return data;
}

export async function savePaymentRecord(uid, voucherRaw, paymentData) {
  const res = await fetch(GOOGLE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'savePayment', uid, voucherRaw, data: paymentData }),
  });
  return res.json();
}

export async function saveManualYearlyEntries(entries) {
  const res = await fetch(GOOGLE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'saveManualYearly', entries }),
  });
  return res.json();
}
