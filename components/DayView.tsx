import React from 'react';
import { Appointment } from '../types';
import { AppointmentCard } from './AppointmentCard';
import { isSameDay } from '../utils/dateUtils';
import { CalendarDaysIcon } from './icons';

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
}

export const DayView: React.FC<DayViewProps> = ({ date, appointments }) => {
  const dayAppointments = appointments
    .filter(app => isSameDay(app.start, date))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Basic hourly grid structure (visual only for now)
  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23

  return (
    <div className="p-4 h-full">
      {dayAppointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 pt-10">
          <CalendarDaysIcon className="w-12 h-12 mb-3 text-gray-400" />
          <p>No appointments for this day.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayAppointments.map(appointment => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
      {/* Future: Implement a more detailed hourly grid if needed 
          <div className="relative mt-4 border-t border-l border-gray-200">
             {hours.map(hour => (
                <div key={hour} className="h-12 border-b border-r border-gray-200 relative">
                    <span className="absolute -top-2.5 left-1 text-xs text-gray-400 bg-white px-1">{`${hour}:00`}</span>
                </div>
             ))}
             { // Position appointments on this grid }
          </div> 
      */}
    </div>
  );
};
