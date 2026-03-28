import { useState } from 'react';
import { LargeCalendar } from './components/LargeCalendar';
import { DailyManagementView } from './components/DailyManagementView';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showManagementView, setShowManagementView] = useState(false);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowManagementView(true);
  };

  const handleBack = () => {
    setShowManagementView(false);
  };

  if (showManagementView && selectedDate) {
    return <DailyManagementView selectedDate={selectedDate} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-[90vw] max-w-[1400px]">
        <LargeCalendar onDateClick={handleDateClick} />
      </div>
    </div>
  );
}