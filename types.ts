export enum AgendaType {
  USER = 'user',
  FRIEND = 'friend',
}

export type AgendaSource = 'google' | 'microsoft' | 'manual' | 'friend_link';

export type AuthStatus = 'pending_auth' | 'authenticating' | 'authenticated' | 'error' | 'token_expired';

export interface Appointment {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  agendaId: string; 
  agendaName?: string; // For display in CalendarView
  agendaColor?: string; // For display in CalendarView
}

export interface Agenda {
  id: string;
  name: string;
  ownerType: AgendaType;
  source: AgendaSource;
  color: string;
  isVisible: boolean;
  appointments: Appointment[];
  privateLink?: string; // Only for friend's agenda (simulated)
  
  // OAuth related fields
  accessToken?: string;
  tokenExpiry?: Date; // Store actual expiry date
  authStatus?: AuthStatus;
  authError?: string; // Store error message if auth fails
}

export type ViewMode = 'day' | 'week' | 'month';
