export default function ErrorState({ message }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-500 p-6 text-center">
      <h2 className="text-lg font-bold mb-2">พบข้อผิดพลาด</h2>
      <p className="text-sm">{message}</p>
    </div>
  );
}
