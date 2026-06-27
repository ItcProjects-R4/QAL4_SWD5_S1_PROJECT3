import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
const MONTHS_EN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const MONTHS_AR = [
  "يناير","فبراير","مارس","أبريل","مايو","يونيو",
  "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
];

const DAYS_EN = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const DAYS_AR = ["س", "ج", "خ", "ر", "ث", "ن", "ح"];
function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBetween(d, start, end) {
  if (!start || !end) return false;
  return d > start && d < end;
}

function buildMonthGrid(year, month, isArabic = false) {
  const firstDay = new Date(year, month, 1);

  let startOffset = firstDay.getDay();

  if (isArabic) {
    startOffset = 6 - startOffset;
    if (startOffset < 0) startOffset += 7;
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  return cells;
}

const PRESETS = [
  { label: "Last 7 Days",  days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "Last 90 Days", days: 90 },
  { label: "This Month",   thisMonth: true },
];

export default function DateRangePicker({ startDate, endDate, onApply, onClose }) {
  const [start, setStart] = useState(startDate || null);
  const { t, i18n } = useTranslation();
  const MONTHS_FULL = i18n.language === "ar" ? MONTHS_AR : MONTHS_EN;

const DAYS = i18n.language === "ar" ? DAYS_AR : DAYS_EN;

const PRESETS = [
  {
    label: i18n.language === "ar" ? "آخر 7 أيام" : "Last 7 Days",
    days: 7,
  },
  {
    label: i18n.language === "ar" ? "آخر 30 يومًا" : "Last 30 Days",
    days: 30,
  },
  {
    label: i18n.language === "ar" ? "آخر 90 يومًا" : "Last 90 Days",
    days: 90,
  },
  {
    label: i18n.language === "ar" ? "هذا الشهر" : "This Month",
    thisMonth: true,
  },
];
  const [end, setEnd] = useState(endDate || null);
  const [hoverDate, setHoverDate] = useState(null);
  const [baseMonth, setBaseMonth] = useState(() => {
    const ref = startDate || new Date();
    return new Date(ref.getFullYear(), ref.getMonth(), 1);
  });
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function handleDayClick(day) {
    if (!day) return;
    if (!start || (start && end)) {
      setStart(day);
      setEnd(null);
    } else if (day < start) {
      setStart(day);
      setEnd(null);
    } else {
      setEnd(day);
    }
  }

  function applyPreset(preset) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let s;
    if (preset.thisMonth) {
      s = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      s = new Date(today);
      s.setDate(s.getDate() - (preset.days - 1));
    }
    setStart(s);
    setEnd(today);
    setBaseMonth(new Date(s.getFullYear(), s.getMonth(), 1));
    onApply(s, today);
  }

  function handleApply() {
    if (start && end) onApply(start, end);
  }

  const nextMonth = new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1);

  function renderMonth(monthDate) {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
   const cells = buildMonthGrid(
  year,
  month,
  i18n.language === "ar"
);
    return (
      <div className="w-full">
        <p className="text-center text-sm font-semibold text-slate-800 mb-3">
          {MONTHS_FULL[month]} {year}
        </p>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d) => (
            <span key={d} className="text-[10px] font-bold text-slate-400 text-center uppercase">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (!day) return <div key={i} />;
            const isStart = isSameDay(day, start);
            const isEnd = isSameDay(day, end);
            const inRange = isBetween(day, start, end) || (start && !end && hoverDate && isBetween(day, start, hoverDate));
            const isToday = isSameDay(day, new Date());
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                className={`h-8 w-8 text-xs rounded-lg flex items-center justify-center transition-colors
                  ${isStart || isEnd ? "bg-slate-800 text-white font-bold" : ""}
                  ${inRange && !isStart && !isEnd ? "bg-slate-100 text-slate-700" : ""}
                  ${!isStart && !isEnd && !inRange ? "hover:bg-slate-100 text-slate-700" : ""}
                  ${isToday && !isStart && !isEnd ? "ring-1 ring-slate-300" : ""}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`absolute mt-2 z-50 bg-white rounded-xl border border-slate-200 shadow-xl p-4 sm:p-5
                 w-[92vw] sm:w-[640px] max-w-[640px]
                 max-h-[85vh] overflow-y-auto
                 ${i18n.language === "ar" ? "left-0" : "right-0"}`}
    >
     <div
  dir={i18n.language === "ar" ? "rtl" : "ltr"}
  className={`flex flex-col gap-6 ${
    i18n.language === "ar"
      ? "sm:flex-row-reverse"
      : "sm:flex-row"
  }`}
>
        {/* Presets: عمود جانبي على الديسكتوب، صف أفقي قابل للسحب على الموبايل */}
       <div
  className={`w-full sm:w-40 shrink-0 border-b sm:border-b-0 border-slate-100 pb-3 sm:pb-0 ${
    i18n.language === "ar"
      ? "sm:border-l sm:pl-4"
      : "sm:border-r sm:pr-4"
  }`}
>
          <div className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible -mx-1 px-1 sm:mx-0 sm:px-0">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p)}
                className={`shrink-0 sm:w-full text-sm px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-600 font-medium whitespace-nowrap ${
  i18n.language === "ar" ? "text-right" : "text-left"
}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() - 1, 1))}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
            >
              <span className="material-symbols-outlined text-lg">
  {i18n.language === "ar" ? "chevron_right" : "chevron_left"}
</span>
            </button>
            {/* عنوان الشهر الحالي يظهر هنا فقط على الموبايل لأنه شهر واحد ظاهر */}
            <span className="sm:hidden text-sm font-semibold text-slate-800">
              {MONTHS_FULL[baseMonth.getMonth()]} {baseMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setBaseMonth(new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1))}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
            >
             <span className="material-symbols-outlined text-lg">
  {i18n.language === "ar" ? "chevron_left" : "chevron_right"}
</span>
            </button>
          </div>

          {/* على الموبايل: شهر واحد بس. من sm وفوق: شهرين جنب بعض */}
          <div
  dir={i18n.language === "ar" ? "rtl" : "ltr"}
  className={`flex flex-col gap-4 sm:gap-6 ${
    i18n.language === "ar" ? "sm:flex-row-reverse" : "sm:flex-row"
  }`}
>
            {renderMonth(baseMonth)}
            <div className="hidden sm:block w-full">
              {renderMonth(nextMonth)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500 text-center sm:text-left">
             {start
  ? toISO(start)
  : i18n.language === "ar"
    ? "تاريخ البداية"
    : "Start date"}{" "}
→{" "}
{end
  ? toISO(end)
  : i18n.language === "ar"
    ? "تاريخ النهاية"
    : "End date"}
            </span>
            <div className="flex gap-2">
              <button
  type="button"
  onClick={onClose}
  className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg"
>
  {i18n.language === "ar" ? "إلغاء" : "Cancel"}
</button>
              <button
  type="button"
  onClick={handleApply}
  disabled={!start || !end}
  className="flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold text-white bg-slate-800 rounded-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
>
  {i18n.language === "ar" ? "تطبيق" : "Apply"}
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
