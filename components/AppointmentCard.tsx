
import React from 'react';
import { Appointment } from '../types';
import { ClockIcon, TagIcon } from './icons'; // Assuming TagIcon for agenda name

interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div 
      className="p-4 rounded-lg shadow-md border-l-4"
      style={{ borderColor: appointment.agendaColor || '#60A5FA' /* Default blue */ }}
    >
      <h4 className="text-lg font-semibold text-gray-800">{appointment.title}</h4>
      <div className="mt-1 flex items-center text-sm text-gray-600">
        <ClockIcon className="w-4 h-4 mr-1.5 text-gray-500" />
        <span>{formatTime(appointment.start)} - {formatTime(appointment.end)}</span>
      </div>
      {appointment.description && (
        <p className="mt-1 text-sm text-gray-500">{appointment.description}</p>
      )}
      {appointment.agendaName && (
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <TagIcon className="w-3 h-3 mr-1.5" style={{ color: appointment.agendaColor || '#60A5FA' }} />
          <span>{appointment.agendaName}</span>
        </div>
      )}
    </div>
  );
};
