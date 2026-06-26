function num(v) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeAccountingRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const salary1 = num(raw.salary1 ?? raw.Salary_1);
  const salary2 = num(raw.salary2 ?? raw.Salary_2);
  const salary3 = num(raw.salary3 ?? raw.Salary_3);
  const salary = num(raw.salary) || salary1 + salary2 + salary3;
  const socialSec = num(raw.socialSec ?? raw.SSO ?? raw.sso);
  const vat = num(raw.vat ?? raw.VAT);
  const others = num(raw.others ?? raw.otherCost ?? raw.OtherCost);
  const othersDesc = raw.othersDesc ?? raw.note ?? raw.Note ?? '';
  if (salary === 0 && socialSec === 0 && vat === 0 && others === 0 && !othersDesc) return null;
  return { salary, socialSec, vat, others, othersDesc };
}

export function normalizeAccountingMap(source) {
  if (!source || typeof source !== 'object') return {};
  const out = {};
  Object.entries(source).forEach(([month, raw]) => {
    const rec = normalizeAccountingRecord(raw);
    if (rec) out[month] = rec;
  });
  return out;
}

export function mergeAccountingMaps(...maps) {
  const out = {};
  maps.forEach((map) => {
    Object.assign(out, normalizeAccountingMap(map));
  });
  return out;
}
