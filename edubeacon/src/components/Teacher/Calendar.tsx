import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
}

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function tomorrow() {
  const d = startOfDay(new Date());
  d.setDate(d.getDate() + 1);
  return d;
}

const Calendar = ({ selectedDate, onSelect, minDate = tomorrow() }: CalendarProps) => {
  const [viewDate, setViewDate] = useState(() => selectedDate || minDate);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const minDateStart = startOfDay(minDate);

  const cells: (Date | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="border border-gray-200 rounded-lg p-4 w-full max-w-sm dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {MONTH_LABELS[month]} {year}
        </p>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-xs font-medium text-gray-400 dark:text-gray-500">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} />;

          const isDisabled = startOfDay(date) < minDateStart;
          const isSelected =
            selectedDate && startOfDay(date).getTime() === startOfDay(selectedDate).getTime();

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(date)}
              className={`h-8 w-8 rounded-full text-sm transition-colors ${
                isSelected
                  ? 'bg-purple-600 text-white font-semibold'
                  : isDisabled
                    ? 'text-gray-300 cursor-not-allowed dark:text-gray-700'
                    : 'text-gray-700 hover:bg-purple-50 dark:text-gray-300 dark:hover:bg-purple-950/40'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
