import { useState } from 'react';
import { LargeCalendar } from './components/LargeCalendar';
import { DailyManagementView } from './components/DailyManagementView';
import { MonthlyManagementView } from './components/MonthlyManagementView';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDailyView, setShowDailyView] = useState(false);
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowDailyView(true);
    setShowMonthlyView(false);
  };

  const handleMonthClick = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowMonthlyView(true);
    setShowDailyView(false);
  };

  const handleBackFromDaily = () => {
    setShowDailyView(false);
  };

  const handleBackFromMonthly = () => {
    setShowMonthlyView(false);
  };

  if (showDailyView && selectedDate) {
    return <DailyManagementView selectedDate={selectedDate} onBack={handleBackFromDaily} />;
  }

  if (showMonthlyView) {
    return <MonthlyManagementView year={selectedYear} month={selectedMonth} onBack={handleBackFromMonthly} />;
  }

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="w-full h-full max-w-7xl flex items-center justify-center">
        <LargeCalendar onDateClick={handleDateClick} onMonthClick={handleMonthClick} />
      </div>
    </div>
  );
}