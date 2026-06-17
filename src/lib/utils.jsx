// ใส่ลิงก์ Web App ตรงนี้ครับ
const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbyVSGSC5sNwOfxwQvTwi0kpBtUsGn6-4SnsBFqqHNBqjGRoVYR0EFXGOMuuAHVUakTE/exec";

// ฟังก์ชันแปลงวันที่ให้สวยงาม (2026-04-03 -> 03/04/2026)
const formatDateShow = (dStr) => {
  if (!dStr) return '';
  if (dStr.length === 7) return dStr; 
  const parts = dStr.split('-');
  if(parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return dStr;
};
window.GOOGLE_API_URL = GOOGLE_API_URL;
window.formatDateShow = formatDateShow;
