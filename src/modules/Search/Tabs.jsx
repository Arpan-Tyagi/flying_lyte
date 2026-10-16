import { Plane, Hotel, Gift } from "lucide-react";

const Tabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "flights", label: "Flights", icon: Plane },
    { id: "hotels", label: "Hotels", icon: Hotel },
    { id: "packages", label: "Packages", icon: Gift },
  ];

  return (
    <div className="grid w-full grid-cols-3 gap-1 border-b pb-2 sm:flex sm:gap-6 sm:pb-4" style={{ borderColor: "var(--border-soft)" }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="group relative flex min-w-0 items-center justify-center gap-1 px-0.5 pb-2 text-[11px] font-medium transition-all duration-300 sm:justify-start sm:gap-2 sm:px-2 sm:pb-3 sm:text-sm md:text-base"
            style={{
              fontFamily: "var(--font-body)",
              color: isActive ? "#E6B35C" : "var(--text-muted)",
            }}
          >
            <Icon size={16} strokeWidth={1.8} className={isActive ? "shrink-0 text-[#E6B35C] drop-shadow-[0_0_6px_rgba(230,179,92,0.7)]" : "shrink-0 text-gray-400 transition-colors group-hover:text-[#E6B35C]"} />

            <span className="truncate transition-colors duration-300 group-hover:text-[#E6B35C]">
              {tab.label}
            </span>

            <span className={`absolute bottom-0 left-0 h-[2px] w-full origin-center bg-linear-to-r from-transparent via-[#F7D77D] to-transparent transition-all duration-300 ${isActive ? "scale-x-100 opacity-100 shadow-[0_0_12px_rgba(247,215,125,0.95)]" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"}`} />
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;