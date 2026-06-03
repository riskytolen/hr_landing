"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  hasError?: boolean;
  className?: string;
}

/**
 * Custom select dengan tema dark, dropdown panel di bawah trigger.
 * Auto-enable search jika options > 6.
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = "— Pilih —",
  disabled,
  searchable,
  hasError,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isSearchable = searchable ?? options.length > 6;
  const selected = options.find((o) => o.value === value);

  const filtered = isSearchable && search
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search saat dropdown buka, set highlight ke value yg terpilih
  useEffect(() => {
    if (!open) return;
    if (isSearchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    const idx = filtered.findIndex((o) => o.value === value);
    setHighlightIdx(idx >= 0 ? idx : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current && highlightIdx >= 0) {
      const items = listRef.current.querySelectorAll("[data-option]");
      items[highlightIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx, open]);

  const handleSelect = useCallback(
    (val: string) => {
      onChange(val);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIdx((p) => (p < filtered.length - 1 ? p + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIdx((p) => (p > 0 ? p - 1 : filtered.length - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIdx >= 0 && filtered[highlightIdx]) {
          handleSelect(filtered[highlightIdx].value);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setSearch("");
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger — sama style dengan input-field global supaya konsisten */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen(!open);
            setSearch("");
          }
        }}
        className={cn(
          "input-field flex items-center justify-between gap-2 text-left",
          !selected && "text-white/40",
          disabled && "opacity-50 cursor-not-allowed",
          hasError && "has-error",
          open && "border-amber-500/40 bg-amber-500/[0.04]",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className={cn(
            "truncate",
            selected ? "text-white font-medium" : "text-white/40",
          )}
        >
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 flex-shrink-0 text-white/40 transition-transform duration-200",
            open && "rotate-180 text-amber-400",
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-full rounded-xl overflow-hidden",
            "bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/60",
            "animate-fade-in",
          )}
          role="listbox"
        >
          {/* Search bar (auto-enable) */}
          {isSearchable && (
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-zinc-800 bg-zinc-800/30">
              <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightIdx(0);
                }}
                placeholder="Cari..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
          )}

          {/* Options list */}
          <div ref={listRef} className="max-h-56 overflow-y-auto py-1 custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-white/40">
                Tidak ditemukan
              </div>
            ) : (
              filtered.map((option, idx) => {
                const isSelected = option.value === value;
                const isHighlighted = idx === highlightIdx;
                return (
                  <button
                    key={option.value}
                    type="button"
                    data-option
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightIdx(idx)}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm text-left transition-colors",
                      isHighlighted && "bg-amber-500/10",
                      isSelected
                        ? "text-amber-300 font-semibold"
                        : "text-zinc-300",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description && (
                        <span className="block text-[11px] text-white/40 mt-0.5 truncate">
                          {option.description}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.custom-scrollbar) {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
        }
        :global(.custom-scrollbar::-webkit-scrollbar) {
          width: 5px;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-track) {
          background: transparent;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-thumb) {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
        }
        :global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
          background: rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  );
}
