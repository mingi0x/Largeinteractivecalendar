import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface LargeCalendarProps {
  onDateClick: (date: Date) => void;
  onMonthClick: (year: number, month: number) => void;
}

export function LargeCalendar({ onDateClick, onMonthClick }: LargeCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 해당 월의 첫 날과 마지막 날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 달력에서 시작할 날짜 (이전 월의 날짜 포함)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 6주치의 날짜 생성 (42일)
  const days: Date[] = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl shadow-xl p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={prevMonth}
          variant="outline"
          size="icon"
          className="h-12 w-12"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <button
          onClick={() => onMonthClick(year, month + 1)}
          className="text-4xl font-bold transition-all duration-200 ease-in-out hover:scale-110 cursor-pointer"
        >
          {year}년 {month + 1}월
        </button>
        
        <Button
          onClick={nextMonth}
          variant="outline"
          size="icon"
          className="h-12 w-12"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-3 mb-3">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`text-center py-3 font-semibold text-lg ${
              index === 0 ? 'text-red-600' : index === 6 ? 'text-blue-600' : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-3 flex-1">
        {days.map((date, index) => {
          const dayOfWeek = index % 7;
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;
          const currentMonth = isCurrentMonth(date);
          const today = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => onDateClick(date)}
              className={`
                flex items-center justify-center rounded-xl text-2xl font-medium
                border-2 border-gray-200
                transition-all hover:shadow-lg hover:scale-105 hover:border-indigo-400
                ${!currentMonth ? 'text-gray-300 bg-gray-50' : 'bg-white'}
                ${isSunday && currentMonth ? 'text-red-600' : ''}
                ${isSaturday && currentMonth ? 'text-blue-600' : ''}
                ${today ? 'bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 border-indigo-400 font-bold shadow-md' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}