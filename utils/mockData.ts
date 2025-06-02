import { Appointment } from '../types';
import { addDays } from './dateUtils'; // Import addDays utility

export const AGENDA_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F59E0B', // Amber
  '#6366F1', // Indigo
];

const USER_APPOINTMENT_TITLES = [
  "Team Meeting", "Doctor Appointment", "Gym Session", "Project Deadline", "Lunch with Client", 
  "Dentist Check-up", "Grocery Shopping", "Pay Bills", "Read Book", "Call Mom"
];

const FRIEND_APPOINTMENT_TITLES = [
  "Sarah's Birthday Party", "John's Movie Night", "Family Dinner", "Weekend Getaway Planning", 
  "Book Club Meetup", "Yoga Class with Emily", "Tech Conference", "Charity Run", "Art Exhibition Visit"
];

export const generateMockAppointments = (isUserAgenda: boolean, baseDate: Date = new Date()): Appointment[] => {
  const appointments: Appointment[] = [];
  const titles = isUserAgenda ? USER_APPOINTMENT_TITLES : FRIEND_APPOINTMENT_TITLES;

  const numberOfAppointments = Math.floor(Math.random() * 5) + 2; // 2 to 6 appointments

  for (let i = 0; i < numberOfAppointments; i++) {
    const randomTitleIndex = Math.floor(Math.random() * titles.length);
    const title = titles[randomTitleIndex];
    
    // Generate appointments around the baseDate (e.g., within a +/- 15 day range for month view, or +/- 3 days for week view)
    const startDayOffset = Math.floor(Math.random() * 30) - 15; 
    const startHour = Math.floor(Math.random() * 12) + 8; // 8 AM to 7 PM
    const startMinute = Math.random() < 0.5 ? 0 : 30;
    
    const startDate = addDays(new Date(baseDate), startDayOffset); // Use addDays from dateUtils
    startDate.setHours(startHour, startMinute, 0, 0);
    
    const durationHours = Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 0.5 : 2); // 0.5, 1 or 2 hours long
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours()); // Set hours first
    endDate.setMinutes(startDate.getMinutes() + durationHours * 60); // Then add minutes


    appointments.push({
      id: `appt-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      title: title,
      start: startDate,
      end: endDate,
      description: Math.random() < 0.3 ? `Details for ${title}.` : undefined,
      agendaId: 'temp-id', // This will be overwritten when creating the agenda
    });
  }
  return appointments;
};
