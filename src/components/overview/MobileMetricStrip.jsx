export default function MobileMetricStrip({ items }) {
  return (
    <div className="md:hidden bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-2">
      <div className="grid grid-cols-3 divide-x divide-gray-100">
        {items.map(({ label, value, accent = 'text-gray-900' }, i) => (
          <div key={i} className="px-1 py-2 text-center min-w-0">
            <p className="text-[9px] font-bold text-gray-500 leading-none mb-0.5">{label}</p>
            <p className={`text-[11px] font-extrabold leading-tight tabular-nums ${accent}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
