import { Appointment, AgendaSource } from './types';
import { GOOGLE_CALENDAR_API_ENDPOINT, MICROSOFT_GRAPH_API_ENDPOINT } from './config';

const mapGoogleEventToAppointment = (event: any, agendaId: string): Appointment => {
  return {
    id: event.id,
    title: event.summary || 'No Title',
    start: new Date(event.start?.dateTime || event.start?.date), // Handles all-day events
    end: new Date(event.end?.dateTime || event.end?.date),     // Handles all-day events
    description: event.description,
    agendaId: agendaId,
  };
};

const mapMicrosoftEventToAppointment = (event: any, agendaId: string): Appointment => {
  return {
    id: event.id,
    title: event.subject || 'No Title',
    start: new Date(event.start?.dateTime),
    end: new Date(event.end?.dateTime),
    description: event.bodyPreview,
    agendaId: agendaId,
  };
};

export const fetchGoogleCalendarEvents = async (accessToken: string, agendaId: string): Promise<Appointment[]> => {
  try {
    const response = await fetch(`${GOOGLE_CALENDAR_API_ENDPOINT}?maxResults=50&orderBy=startTime&singleEvents=true`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Calendar API Error:', errorData);
      throw new Error(`Google API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.items?.map((event: any) => mapGoogleEventToAppointment(event, agendaId)) || [];
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
    throw error;
  }
};

export const fetchMicrosoftCalendarEvents = async (accessToken: string, agendaId: string): Promise<Appointment[]> => {
  try {
    // Get a date range for fetching events, e.g., current month +/- 1 month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString(); // End of next month

    const queryParams = new URLSearchParams({
      $top: '50',
      $select: 'id,subject,bodyPreview,start,end',
      startDateTime: startDate,
      endDateTime: endDate,
      $orderby: 'start/dateTime ASC'
    });
    
    const response = await fetch(`${MICROSOFT_GRAPH_API_ENDPOINT}?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Microsoft Graph API Error:', errorData);
      throw new Error(`Microsoft Graph API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.value?.map((event: any) => mapMicrosoftEventToAppointment(event, agendaId)) || [];
  } catch (error) {
    console.error('Failed to fetch Microsoft Calendar events:', error);
    throw error;
  }
};

export const fetchEvents = async (
  source: AgendaSource,
  accessToken: string,
  agendaId: string
): Promise<Appointment[]> => {
  if (source === 'google') {
    return fetchGoogleCalendarEvents(accessToken, agendaId);
  } else if (source === 'microsoft') {
    return fetchMicrosoftCalendarEvents(accessToken, agendaId);
  }
  return []; // Should not happen for these sources
};
