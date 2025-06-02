import React from 'react';
import { Appointment, ViewMode } from '../types';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from './icons';
import { addDays, addMonths, addWeeks, formatMonthYear, formatWeekRange, formatDayDate, getStartOfWeek } from '../utils/dateUtils';

interface CalendarViewProps {
  appointments: Appointment[];
  currentDate: Date;
  viewMode: ViewMode;
  onDateChange: (newDate: Date) => void;
  onViewModeChange: (newViewMode: ViewMode) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  appointments,
  currentDate,
  viewMode,
  onDateChange,
  onViewModeChange,
}) => {
  const handlePrevious = () => {
    let newDate;
    if (viewMode === 'day') {
      newDate = addDays(currentDate, -1);
    } else if (viewMode === 'week') {
      newDate = addWeeks(currentDate, -1);
    } else { // month
      newDate = addMonths(currentDate, -1);
    }
    onDateChange(newDate);
  };

  const handleNext = () => {
    let newDate;
    if (viewMode === 'day') {
      newDate = addDays(currentDate, 1);
    } else if (viewMode === 'week') {
      newDate = addWeeks(currentDate, 1);
    } else { // month
      newDate = addMonths(currentDate, 1);
    }
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getHeaderText = () => {
    if (viewMode === 'day') {
      return formatDayDate(currentDate);
    } else if (viewMode === 'week') {
      // currentDate for week view is already start of week from App.tsx
      return formatWeekRange(currentDate);
    } else { // month
      return formatMonthYear(currentDate);
    }
  };

  const viewButtonClasses = (mode: ViewMode) => 
    `px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-md focus:outline-none transition-colors duration-150 ease-in-out ` +
    (viewMode === mode 
      ? 'bg-blue-600 text-white shadow-sm' 
      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300');

  if (appointments.length === 0 && viewMode !== 'month') { // Month view can be useful even without appointments
     return (
      <div className="flex flex-col items-center justify-center p-10 text-center text-gray-500 bg-white rounded-lg shadow min-h-[300px]">
        <CalendarDaysIcon className="w-16 h-16 mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold">No appointments to display</h3>
        <p>Toggle agenda visibility or add new agendas to see events here.</p>
      </div>
    );
  }
  
  const actualDateForWeekView = viewMode === 'week' ? getStartOfWeek(currentDate) : currentDate;


  return (
    <div className="bg-white rounded-xl shadow-lg flex flex-col h-full">
      {/* Header for navigation and view controls */}
      <header className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={handleToday}
            className="p-2 rounded-md hover:bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Go to today"
          >
            <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handlePrevious}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Previous period"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Next period"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-base sm:text-lg font-semibold text-gray-700 ml-2 sm:ml-4 whitespace-nowrap">
            {getHeaderText()}
          </h2>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={viewButtonClasses(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Content area for the selected view */}
      <div className="flex-1 overflow-auto p-1 sm:p-0"> {/* p-0 for month/week to use full space */}
        {viewMode === 'day' && <DayView date={currentDate} appointments={appointments} />}
        {viewMode === 'week' && <WeekView startDateOfWeek={actualDateForWeekView} appointments={appointments} />}
        {viewMode === 'month' && <MonthView monthDate={currentDate} appointments={appointments} />}
      </div>
    </div>
  );
};
