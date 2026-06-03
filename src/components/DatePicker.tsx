"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface DatePickerProps {
  /** YYYY-MM-DD */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** YYYY-MM-DD — tanggal paling akhir yang bisa dipilih */
  max?: string;
  /** YYYY-MM-DD — tanggal paling awal yang bisa dipilih */
  min?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  max,
  min,
  hasError,
  disabled,
  className,
}: DatePickerProps) {
  const selected = parseDate(value);
  const maxDate = parseDate(max ?? "");
  const minDate = parseDate(min ?? "");

  // Bulan yang ditampilkan di calendar grid (month = 0-indexed)
  const [viewYear, setViewYear] = useState(() => selected?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selected?.getMonth() ?? new Date().getMonth());
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Saat value berubah dari luar, sync view ke bulan dari value
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Navigation
  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);
  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);
  const prevYear = useCallback(() => setViewYear((y) => y - 1), []);
  const nextYear = useCallback(() => setViewYear((y) => y + 1), []);

  // Generate calendar grid for the view month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const startOffset = firstDay.getDay(); // 0=Sunday
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Previous month filler
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
    const cells: { date: Date; inMonth: boolean }[] = [];

    for (let i = startOffset - 1; i >= 0; i--) {
      cells.push({
        date: new Date(viewYear, viewMonth - 1, prevMonthDays - i),
        inMonth: false,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ date: new Date(viewYear, viewMonth, d), inMonth: true });
    }
    // Next month filler to fill 6 rows
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ date: new Date(viewYear, viewMonth + 1, d), inMonth: false });
    }

    return cells;
  }, [viewYear, viewMonth]);

  const isDisabledDate = useCallback(
    (d: Date): boolean => {
      if (maxDate && d > maxDate) return true;
      if (minDate && d < minDate) return true;
      return false;
    },
    [maxDate, minDate],
  );

  const handleSelect = (d: Date) => {
    if (isDisabledDate(d)) return;
    onChange(toDateStr(d));
    setOpen(false);
  };

  const isToday = (d: Date): boolean => {
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const isSelected = (d: Date): boolean => {
    if (!selected) return false;
    return d.getDate() === selected.getDate() && d.getMonth() === selected.getMonth() && d.getFullYear() === selected.getFullYear();
  };

  // Format display
  const displayText = selected
    ? selected.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "input-field flex items-center gap-2.5 text-left",
          !displayText && "text-white/40",
          disabled && "opacity-50 cursor-not-allowed",
          hasError && "has-error",
          open && "border-amber-500/40 bg-amber-500/[0.04]",
        )}
      >
        <Calendar
          className={cn(
            "w-4 h-4 flex-shrink-0",
            open ? "text-amber-400" : "text-zinc-500",
          )}
        />
        <span
          className={cn(
            "flex-1 truncate",
            displayText ? "text-white font-medium" : "text-white/40",
          )}
        >
          {displayText ?? placeholder}
        </span>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-full max-w-[300px] rounded-xl overflow-hidden",
            "bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/60",
            "animate-fade-in p-3",
          )}
        >
          {/* Month/Year navigator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-0.5">
              <NavBtn onClick={prevYear} title="Tahun sebelumnya">
                <ChevronsLeft className="w-3.5 h-3.5" />
              </NavBtn>
              <NavBtn onClick={prevMonth} title="Bulan sebelumnya">
                <ChevronLeft className="w-3.5 h-3.5" />
              </NavBtn>
            </div>

            <span className="text-[13px] font-bold text-white select-none">
              {BULAN[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-0.5">
              <NavBtn onClick={nextMonth} title="Bulan berikutnya">
                <ChevronRight className="w-3.5 h-3.5" />
              </NavBtn>
              <NavBtn onClick={nextYear} title="Tahun berikutnya">
                <ChevronsRight className="w-3.5 h-3.5" />
              </NavBtn>
            </div>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-1">
            {HARI.map((h) => (
              <div
                key={h}
                className="text-center text-[10px] font-semibold text-zinc-500 uppercase tracking-wide py-1"
              >
                {h}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, idx) => {
              const sel = isSelected(cell.date);
              const today = isToday(cell.date);
              const dis = isDisabledDate(cell.date);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={dis}
                  onClick={() => handleSelect(cell.date)}
                  className={cn(
                    "relative flex items-center justify-center h-9 text-[12px] font-medium rounded-lg transition-all",
                    // Base
                    cell.inMonth ? "text-zinc-300" : "text-zinc-600",
                    // Disabled
                    dis && "opacity-30 cursor-not-allowed",
                    // Hover (bukan selected, bukan disabled)
                    !sel && !dis && "hover:bg-white/[0.08]",
                    // Selected
                    sel && "bg-amber-500 text-zinc-900 font-bold shadow-md shadow-amber-500/20",
                    // Today ring
                    today && !sel && "ring-1 ring-amber-400/40",
                  )}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick actions footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                if (!isDisabledDate(now)) {
                  onChange(toDateStr(now));
                  setOpen(false);
                }
              }}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Hari ini
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                Hapus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper ───
function NavBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
    >
      {children}
    </button>
  );
}
