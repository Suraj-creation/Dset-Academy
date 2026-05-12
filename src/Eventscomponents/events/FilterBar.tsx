// src/components/events/FilterBar.tsx

import { useCallback } from "react";
import { FilterType, ENTERPRISE_EASE } from "./types";

interface FilterBarProps {
  eventTypes: string[];
  filter: FilterType;
  search: string;
  filteredCount: number;
  onFilterChange: (filterValue: FilterType) => void;
  onSearchChange: (searchValue: string) => void;
}

export default function FilterBar({
  eventTypes,
  filter,
  search,
  filteredCount,
  onFilterChange,
  onSearchChange,
}: FilterBarProps) {
  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  return (
    <section className="px-8 pb-0 pt-11 max-sm:px-4">
      <div className="sticky top-4 z-20 mx-auto max-w-[1280px]">
        <div className="flex flex-wrap items-center gap-4 rounded-[28px] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(135deg,rgba(0,31,63,0.9),rgba(7,50,95,0.88),rgba(31,47,143,0.82))] p-4 shadow-[0_22px_60px_rgba(0,18,45,0.24)] backdrop-blur-[22px]">
          <div className="relative min-w-[220px] flex-[1_1_240px]">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.56)]">
              Find
            </span>
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search event titles or descriptions"
              className="min-h-[52px] w-full rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.12)] px-4 py-[0.95rem] pl-[4.6rem] text-[0.9rem] text-white outline-none [box-shadow:inset_0_1px_0_rgba(255,255,255,0.08)] transition-[border-color,box-shadow,background] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] placeholder:text-[rgba(226,235,255,0.42)] focus:border-[rgba(30,144,255,0.7)] focus:bg-[rgba(255,255,255,0.14)] focus:[box-shadow:0_0_0_4px_rgba(30,144,255,0.14)]"
            />
          </div>

          <div className="flex flex-[999_1_auto] flex-wrap gap-2.5">
            {eventTypes.map((type) => {
              const active = filter === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => onFilterChange(type as FilterType)}
                  className={`min-h-[46px] cursor-pointer rounded-full border px-4 py-[0.7rem] text-[0.8rem] font-bold tracking-[0.04em] transition-[transform,box-shadow,border-color,background] duration-[550ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 ${
                    active
                      ? "border-[rgba(30,144,255,0.4)] bg-[linear-gradient(135deg,#5e17ea,#1e90ff)] text-white shadow-[0_16px_36px_rgba(36,77,145,0.22),inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                      : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.08)] text-[rgba(232,239,255,0.76)]"
                  }`}
                >
                  {type === "all" ? "All Events" : type}
                </button>
              );
            })}
          </div>

          <div className="ml-auto whitespace-nowrap rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.08)] px-4 py-[0.8rem] text-[0.76rem] font-extrabold uppercase tracking-[0.12em] text-[rgba(232,239,255,0.78)]">
            {filteredCount} {filteredCount === 1 ? "Event" : "Events"}
          </div>
        </div>
      </div>
    </section>
  );
}