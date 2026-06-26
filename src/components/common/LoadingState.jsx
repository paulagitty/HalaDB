export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm font-semibold text-gray-500 text-center">กำลังดึงข้อมูลจาก Google Sheets...</p>
    </div>
  );
}
