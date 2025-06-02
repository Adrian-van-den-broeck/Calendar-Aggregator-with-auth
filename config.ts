// IMPORTANT: Replace these placeholder values with your actual OAuth client IDs and redirect URI.
// You need to register your application with Google Cloud Console and Azure Active Directory
// and configure the redirect URI there to match the one you specify here.

export const GOOGLE_CLIENT_ID = '992716485443-lfgor8ampb459645ub4rr2vdnp1cr6ri.apps.googleusercontent.com'; // Replace with your Google Client ID
export const MICROSOFT_CLIENT_ID = 'YOUR_MICROSOFT_CLIENT_ID_HERE'; // Replace with your Microsoft Client ID

// This URI must be registered as an Authorized Redirect URI in both your Google and Microsoft app configurations.
// For local development, this might be your dev server's address (e.g., 'http://localhost:8080/')
// or a specific callback page (e.g., 'http://localhost:8080/auth-callback.html').
// Ensure it matches *exactly* what you configured on the provider's side.
export const REDIRECT_URI = 'http://localhost:3000/'; // Replace with your actual redirect URI


// Scopes define the permissions your application requests.
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
].join(' ');

export const MICROSOFT_SCOPES = [
  'openid',
  'profile',
  'User.Read',
  'Calendars.Read',
].join(' ');

// API Endpoints
export const GOOGLE_CALENDAR_API_ENDPOINT = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
export const MICROSOFT_GRAPH_API_ENDPOINT = 'https://graph.microsoft.com/v1.0/me/calendar/events';
