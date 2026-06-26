export const formatDateShow = (dStr) => {
  if (!dStr) return '';
  if (dStr.length === 7) return dStr;
  const parts = dStr.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dStr;
};

export const todayYMD = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0) + ' ฿';

export const formatCurrencyShort = (amount) =>
  new Intl.NumberFormat('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount || 0) + ' ฿';

export const formatNumber = (num) => new Intl.NumberFormat('th-TH').format(num || 0);

export const getMonthName = (ym) => {
  if (!ym || !ym.includes('-')) return ym;
  const [y, m] = ym.split('-');
  const monthNames = ['', 'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  return `${monthNames[parseInt(m, 10)]} ${parseInt(y) + 543}`;
};

export const getMonthNameShort = (ym) => {
  if (!ym || !ym.includes('-')) return ym;
  const [, m] = ym.split('-');
  const shorts = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  return shorts[parseInt(m, 10)] || m;
};

export const getVoucherNumber = (voucher) => {
  const matches = String(voucher || '').match(/\d+/g);
  return matches ? parseInt(matches[matches.length - 1], 10) : -1;
};

export function getVisiblePaymentList(paymentList) {
  return (paymentList || []).filter((p) => {
    if (p.isCleared === true) return false;
    if (p.suppStatus === 'Paid' && p.custStatus === 'Paid') return false;
    return true;
  });
}

export function buildRecentVoucherList(dashboardData) {
  const rawTours = dashboardData?.dailyOps?.tours || [];
  const rawHotels = dashboardData?.dailyOps?.hotels || [];
  const seen = new Set();
  const rows = [];
  const addRows = (items, fallbackType) => {
    (items || []).forEach((item) => {
      const voucher = item.voucher || item.voucherRaw;
      const sortVoucher = item.voucherRaw || item.voucher;
      if (!voucher) return;
      const key = String(voucher).trim().toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      rows.push({
        voucher,
        voucherNumber: getVoucherNumber(sortVoucher),
        type: item.type || fallbackType,
        customer: item.customer || '-',
        service: item.type === 'Tour' || fallbackType === 'Tour'
          ? [item.tourName || item.service, item.companyName, item.pickupTime].filter(Boolean).join(' , ')
          : (item.hotelName || item.service || '-'),
        date: item.stayDate || item.dateStr || item.serviceDate || '',
      });
    });
  };
  addRows(dashboardData?.voucherList || []);
  addRows(dashboardData?.vouchers || []);
  addRows(dashboardData?.paymentList || []);
  addRows(rawTours, 'Tour');
  addRows(rawHotels, 'Hotel');
  return rows
    .sort((a, b) => b.voucherNumber - a.voucherNumber || String(b.voucher).localeCompare(String(a.voucher)))
    .slice(0, 10);
}
