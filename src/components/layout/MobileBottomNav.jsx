import { TABS } from '../../config/tabs';

export default function MobileBottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] mobile-bottom-nav">
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {TABS.map(({ id, mobileLabel, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button key={id} type="button" onClick={() => setActiveTab(id)} className={`relative flex flex-col items-center justify-center gap-0 py-1.5 min-h-[48px] ${active ? 'text-blue-600' : 'text-gray-400'}`}>
              <Icon />
              <span className={`text-[10px] font-bold leading-none ${active ? 'text-blue-600' : 'text-gray-500'}`}>{mobileLabel}</span>
              {active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-600" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
