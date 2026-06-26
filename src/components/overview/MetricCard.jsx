export default function MetricCard({ title, value, accent = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-600 mb-4">{title}</h3>
      <p className={`text-3xl font-extrabold ${accent}`}>{value}</p>
    </div>
  );
}
