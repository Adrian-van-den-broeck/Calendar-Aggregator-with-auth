import React from 'react';
import { Appointment } from '../types';
import { getDaysInMonthForGrid, isSameDay, isSameMonth, WEEK_DAY_NAMES, addDays } from '../utils/dateUtils';
import { ClockIcon } from './icons'; // For indicating appointments

interface MonthViewProps {
  monthDate: Date; // A date within the month to display
  appointments: Appointment[];
}

export const MonthView: React.FC<MonthViewProps> = ({ monthDate, appointments }) => {
  // Assuming week starts on Sunday (0) for this implementation.
  // Could be made configurable later.
  const weekStartsOn = 0; 
  const weeksInMonth = getDaysInMonthForGrid(monthDate, weekStartsOn);
  const dayNames = WEEK_DAY_NAMES(weekStartsOn, 'short');
  const today = new Date();

  return (
    <div className="flex flex-col h-full">
      {/* Header for day names */}
      <div className="grid grid-cols-7 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
        {dayNames.map(name => (
          <div key={name} className="p-2 text-center text-xs font-medium text-gray-500">
            {name}
          </div>
        ))}
      </div>

      {/* Grid for days */}
      <div className="grid grid-cols-7 grid-rows-auto flex-1 overflow-y-auto">
        {weeksInMonth.flat().map((day, index) => {
          const isCurrentMonth = isSameMonth(day, monthDate);
          const isToday = isSameDay(day, today);
          
          const dayAppointments = appointments.filter(app => isSameDay(app.start, day))
            .sort((a,b) => a.start.getTime() - b.start.getTime());

          let cellClasses = "p-1.5 sm:p-2 border-b border-r border-gray-200 relative min-h-[80px] sm:min-h-[100px] flex flex-col";
          if (!isCurrentMonth) {
            cellClasses += " bg-gray-50 text-gray-400";
          } else {
            cellClasses += " bg-white hover:bg-sky-50 transition-colors";
          }
          if (isToday && isCurrentMonth) {
            cellClasses += " "; // Keep special styling for today minimal to avoid conflict
          }
          // Remove right border for last cell in a row, and bottom for last row
          if ((index + 1) % 7 === 0) cellClasses = cellClasses.replace("border-r", "");
          // This is a bit tricky for the last row, as weeksInMonth.flat() doesn't tell us directly.
          // A simpler approach is to ensure the container clips or handles overflow.

          return (
            <div key={day.toISOString()} className={cellClasses}>
              <span 
                className={`text-xs sm:text-sm font-medium mb-1 ${
                  isToday && isCurrentMonth ? 'bg-blue-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center' : ''
                } ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}`}
              >
                {day.getDate()}
              </span>
              {isCurrentMonth && dayAppointments.length > 0 && (
                <div className="overflow-y-auto text-xs space-y-0.5 flex-1">
                  {dayAppointments.slice(0, 2).map(app => ( // Show max 2 app titles
                    <div 
                      key={app.id} 
                      className="p-0.5 rounded text-white truncate text-[10px] sm:text-xs"
                      style={{ backgroundColor: app.agendaColor || '#3B82F6' }}
                      title={app.title}
                    >
                      <ClockIcon className="w-2.5 h-2.5 mr-0.5 inline-block" />
                      {app.title}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-[10px] text-blue-500 mt-0.5">
                      + {dayAppointments.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
