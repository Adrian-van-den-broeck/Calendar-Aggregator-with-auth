import React from 'react';
import { Appointment } from '../types';
import { AppointmentCard } from './AppointmentCard';
import { addDays, isSameDay, WEEK_DAY_NAMES } from '../utils/dateUtils';
import { CalendarDaysIcon } from './icons';

interface WeekViewProps {
  startDateOfWeek: Date;
  appointments: Appointment[];
}

export const WeekView: React.FC<WeekViewProps> = ({ startDateOfWeek, appointments }) => {
  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => addDays(startDateOfWeek, i));
  const weekDayNames = WEEK_DAY_NAMES(startDateOfWeek.getDay(), 'short'); // Use short names

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 h-full">
      {daysOfWeek.map((day, index) => {
        const dayAppointments = appointments
          .filter(app => isSameDay(app.start, day))
          .sort((a, b) => a.start.getTime() - b.start.getTime());

        const isToday = isSameDay(day, new Date());

        return (
          <div key={day.toISOString()} className="border-r border-gray-200 last:border-r-0 flex flex-col">
            <div className={`p-2 sm:p-3 border-b border-gray-200 text-center ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <p className={`text-xs sm:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}>
                {weekDayNames[index]}
              </p>
              <p className={`text-lg sm:text-xl font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                {day.getDate()}
              </p>
            </div>
            <div className="p-2 sm:p-3 space-y-2 overflow-y-auto flex-1 min-h-[150px] bg-white hover:bg-gray-50/50 transition-colors">
              {dayAppointments.length === 0 ? (
                 <div className="flex items-center justify-center h-full text-xs text-gray-400 pt-6">
                    {/* Optional: Small icon or text for no appointments */}
                 </div>
              ) : (
                dayAppointments.map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
