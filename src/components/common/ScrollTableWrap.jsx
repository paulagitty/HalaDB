export default function ScrollTableWrap({ children, hint = '← เลื่อนซ้าย-ขวาเพื่อดูตาราง →' }) {
  return (
    <div>
      <p className="md:hidden text-[10px] text-gray-400 text-center py-1.5 px-2 bg-gray-50 border-b border-gray-100">{hint}</p>
      <div className="overflow-x-auto overscroll-x-contain">{children}</div>
    </div>
  );
}
