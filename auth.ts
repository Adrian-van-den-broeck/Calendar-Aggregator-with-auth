import { GOOGLE_CLIENT_ID, MICROSOFT_CLIENT_ID, REDIRECT_URI, GOOGLE_SCOPES, MICROSOFT_SCOPES } from './config';

interface AuthToken {
  accessToken: string;
  expiresIn?: number; // in seconds
  tokenType?: string;
  scope?: string;
  provider: 'google' | 'microsoft';
  state?: string; // To verify against CSRF
}

// Function to generate a random string for state parameter (CSRF protection)
const generateState = (length: number = 20): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


export const redirectToGoogleAuth = (agendaId: string) => {
  const state = generateState();
  sessionStorage.setItem(`oauth_state_google_${agendaId}`, state);
  sessionStorage.setItem('oauth_agenda_id', agendaId);
  sessionStorage.setItem('oauth_provider', 'google');

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token', // Implicit Grant Flow
    scope: GOOGLE_SCOPES,
    state: state,
    prompt: 'consent', // Force consent screen for testing, can be removed later
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const redirectToMicrosoftAuth = (agendaId: string) => {
  const state = generateState();
  sessionStorage.setItem(`oauth_state_microsoft_${agendaId}`, state);
  sessionStorage.setItem('oauth_agenda_id', agendaId);
  sessionStorage.setItem('oauth_provider', 'microsoft');
  
  const params = new URLSearchParams({
    client_id: MICROSOFT_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'token', // Implicit Grant Flow
    scope: MICROSOFT_SCOPES,
    state: state,
    // nonce: generateState(), // Recommended for AAD
    prompt: 'select_account',
  });
  window.location.href = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
};

export const parseAuthTokenFromUrl = (): AuthToken | null => {
  const hash = window.location.hash.substring(1); // Remove #
  const params = new URLSearchParams(hash);
  
  const accessToken = params.get('access_token');
  const state = params.get('state');
  const expiresInStr = params.get('expires_in'); // typically for Google and Microsoft
  const scope = params.get('scope');
  const tokenType = params.get('token_type');

  const storedAgendaId = sessionStorage.getItem('oauth_agenda_id');
  const storedProvider = sessionStorage.getItem('oauth_provider') as 'google' | 'microsoft' | null;
  
  if (!accessToken || !storedAgendaId || !storedProvider) {
    return null;
  }

  // Verify state
  const storedState = sessionStorage.getItem(`oauth_state_${storedProvider}_${storedAgendaId}`);
  if (storedState !== state) {
    console.error('OAuth state mismatch. Possible CSRF attack.');
    // Clear sensitive items from session storage
    clearOAuthState(storedAgendaId, storedProvider);
    return null;
  }

  // Clear the hash from the URL for cleanliness and security
  window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

  return {
    accessToken,
    expiresIn: expiresInStr ? parseInt(expiresInStr, 10) : undefined,
    tokenType: tokenType || undefined,
    scope: scope || undefined,
    provider: storedProvider,
    state: storedAgendaId, // Using state to pass back agendaId
  };
};

export const clearOAuthState = (agendaId?: string, provider?: 'google' | 'microsoft') => {
  sessionStorage.removeItem('oauth_agenda_id');
  sessionStorage.removeItem('oauth_provider');
  if (agendaId && provider) {
    sessionStorage.removeItem(`oauth_state_${provider}_${agendaId}`);
  }
};
