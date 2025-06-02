
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarView } from './components/CalendarView';
import { Modal } from './components/Modal';
import { AddAgendaForm } from './components/AddAgendaForm';
import { Agenda, Appointment, AgendaType, ViewMode, AgendaSource, AuthStatus } from './types';
import { generateMockAppointments, AGENDA_COLORS } from './utils/mockData';
import { PlusIcon, UserIcon, UsersIcon } from './components/icons';
import { getStartOfWeek } from './utils/dateUtils';
import { redirectToGoogleAuth, redirectToMicrosoftAuth, parseAuthTokenFromUrl, clearOAuthState } from './auth';
import { fetchEvents } from './apiClients';
import { GOOGLE_CLIENT_ID, MICROSOFT_CLIENT_ID, REDIRECT_URI } from './config';


const App: React.FC = () => {
  const [agendas, setAgendas] = useState<Agenda[]>(() => {
    const savedAgendas = localStorage.getItem('agendas');
    if (savedAgendas) {
      const parsedAgendas = JSON.parse(savedAgendas) as Agenda[];
      // Convert date strings back to Date objects
      return parsedAgendas.map(agenda => ({
        ...agenda,
        appointments: agenda.appointments.map(app => ({
          ...app,
          start: new Date(app.start),
          end: new Date(app.end),
        })),
        tokenExpiry: agenda.tokenExpiry ? new Date(agenda.tokenExpiry) : undefined,
      }));
    }
    return [];
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<AgendaType | null>(null);
  const [nextColorIndex, setNextColorIndex] = useState(() => {
     const savedIndex = localStorage.getItem('nextColorIndex');
     return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appMessage, setAppMessage] = useState<{type: 'info'|'error', text: string} | null>(null);

  useEffect(() => {
    localStorage.setItem('agendas', JSON.stringify(agendas));
  }, [agendas]);

  useEffect(() => {
    localStorage.setItem('nextColorIndex', nextColorIndex.toString());
  }, [nextColorIndex]);


  const setAndClearAppMessage = (message: {type: 'info'|'error', text: string} | null, duration: number = 5000) => {
    setAppMessage(message);
    if (message) {
      setTimeout(() => setAppMessage(null), duration);
    }
  };

  const handleAuthenticationCallback = useCallback(async () => {
    const tokenData = parseAuthTokenFromUrl();
    if (!tokenData) {
      // Check for error params in URL from OAuth provider
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');
      const state = hashParams.get('state'); // agendaId passed as state

      if (error && state) {
        const agendaId = state; // Assuming agendaId was passed as state
        const provider = sessionStorage.getItem('oauth_provider') as 'google' | 'microsoft' | null;
        
        setAgendas(prev => prev.map(a => 
          a.id === agendaId ? { 
            ...a, 
            authStatus: 'error', 
            authError: `OAuth Error: ${error} - ${errorDescription || 'Unknown error during authentication.'}` 
          } : a
        ));
        setAndClearAppMessage({type: 'error', text: `Authentication failed for agenda. ${errorDescription || error}`});
        if(provider) clearOAuthState(agendaId, provider);
         window.history.replaceState({}, document.title, window.location.pathname + window.location.search); // Clean URL
      } else {
         clearOAuthState(); // Clear any dangling session storage if no useful token/error
      }
      return;
    }

    const { accessToken, expiresIn, provider, state: agendaIdFromState } = tokenData;
    
    // agendaIdFromState is the original agendaId we stored in state
    const agendaId = agendaIdFromState;

    if (!agendaId) {
        console.error("OAuth callback: Missing agendaId from state.");
        setAndClearAppMessage({type: 'error', text: "Authentication callback error: Could not identify agenda."});
        clearOAuthState(agendaId, provider);
        return;
    }

    setAgendas(prevAgendas =>
      prevAgendas.map(agenda =>
        agenda.id === agendaId
          ? {
              ...agenda,
              accessToken,
              tokenExpiry: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined,
              authStatus: 'authenticated' as AuthStatus,
              authError: undefined, // Clear previous errors
            }
          : agenda
      )
    );
    
    // Fetch events for the newly authenticated agenda
    const targetAgenda = agendas.find(a => a.id === agendaId);
    if (targetAgenda && accessToken) { // targetAgenda might not be updated yet in this closure, re-fetch from state
       const updatedTargetAgenda = agendas.find(a => a.id === agendaId) || 
                                  {...targetAgenda, accessToken, authStatus: 'authenticated', tokenExpiry: expiresIn ? new Date(Date.now() + expiresIn * 1000) : undefined }; // construct temp for fetch
       if(updatedTargetAgenda.authStatus === 'authenticated' && updatedTargetAgenda.accessToken) {
         await fetchAndSetAgendaEvents(updatedTargetAgenda);
       }
    }
    setAndClearAppMessage({type: 'info', text: `Successfully authenticated ${provider} agenda.`});
    clearOAuthState(agendaId, provider);
  }, [agendas]); // Added agendas to dependency array

  useEffect(() => {
    // This effect runs once on app load to handle OAuth callback
    if (window.location.hash.includes('access_token') || window.location.hash.includes('error')) {
      handleAuthenticationCallback();
    }
    
    // Check for placeholder client IDs
    if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE' || MICROSOFT_CLIENT_ID === 'YOUR_MICROSOFT_CLIENT_ID_HERE') {
      setAndClearAppMessage({type: 'error', text: "Developer: Please configure Google/Microsoft Client IDs in config.ts to enable OAuth agendas."});
    }
     if (REDIRECT_URI.includes('YOUR_REDIRECT_URI_HERE') || REDIRECT_URI === 'http://localhost:3000/') {
       console.warn("Developer: Please verify REDIRECT_URI in config.ts and ensure it's registered with your OAuth providers.");
    }


  }, [handleAuthenticationCallback]);


  const fetchAndSetAgendaEvents = async (agenda: Agenda) => {
    if (!agenda.accessToken || (agenda.tokenExpiry && agenda.tokenExpiry < new Date())) {
      setAgendas(prev => prev.map(a => a.id === agenda.id ? {...a, authStatus: 'token_expired', appointments: []} : a));
      setAndClearAppMessage({type: 'error', text: `Token expired for ${agenda.name}. Please re-authenticate.`});
      return;
    }

    setIsLoading(true);
    try {
      const appointments = await fetchEvents(agenda.source, agenda.accessToken, agenda.id);
      setAgendas(prevAgendas =>
        prevAgendas.map(a =>
          a.id === agenda.id ? { ...a, appointments, authStatus: 'authenticated' as AuthStatus, authError: undefined } : a
        )
      );
      setAndClearAppMessage({type: 'info', text: `Events fetched for ${agenda.name}.`});
    } catch (error: any) {
      console.error(`Failed to fetch events for ${agenda.name}:`, error);
      setAgendas(prevAgendas =>
        prevAgendas.map(a =>
          a.id === agenda.id ? { ...a, authStatus: 'error' as AuthStatus, authError: error.message || 'Failed to fetch events.', appointments: [] } : a
        )
      );
      setAndClearAppMessage({type: 'error', text: `Failed to fetch events for ${agenda.name}. ${error.message}`});
    } finally {
      setIsLoading(false);
    }
  };
  
  const initiateAuth = (agendaId: string) => {
    const agenda = agendas.find(a => a.id === agendaId);
    if (!agenda) return;

    if (agenda.source === 'google') {
      if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
         setAndClearAppMessage({type: 'error', text: "Google Client ID not configured in config.ts."});
         return;
      }
      redirectToGoogleAuth(agendaId);
    } else if (agenda.source === 'microsoft') {
       if (MICROSOFT_CLIENT_ID === 'YOUR_MICROSOFT_CLIENT_ID_HERE') {
         setAndClearAppMessage({type: 'error', text: "Microsoft Client ID not configured in config.ts."});
         return;
      }
      redirectToMicrosoftAuth(agendaId);
    }
  };


  const getNextColor = useCallback(() => {
    const color = AGENDA_COLORS[nextColorIndex % AGENDA_COLORS.length];
    setNextColorIndex(prevIndex => prevIndex + 1);
    return color;
  }, [nextColorIndex]);

  const handleAddAgenda = useCallback((name: string, type: AgendaType, source: AgendaSource, link?: string) => {
    let agendaName = name;
    let initialAuthStatus: AuthStatus | undefined = undefined;

    if (type === AgendaType.USER) {
      if (source === 'manual' && !name) agendaName = 'My Agenda';
      else if (source === 'google' || source === 'microsoft') {
        // Name is pre-defined by AddAgendaForm
        initialAuthStatus = 'pending_auth';
      }
    }
    
    const newAgenda: Agenda = {
      id: `agenda-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: agendaName,
      ownerType: type,
      source: source,
      color: getNextColor(),
      isVisible: true,
      appointments: (source === 'manual' || source === 'friend_link') ? generateMockAppointments(type === AgendaType.USER, currentDate) : [],
      privateLink: type === AgendaType.FRIEND ? link : undefined,
      authStatus: initialAuthStatus,
    };
    setAgendas(prevAgendas => [...prevAgendas, newAgenda]);
    setIsModalOpen(false);
    setModalType(null);

    if (initialAuthStatus === 'pending_auth') {
      // Automatically initiate auth for newly added Google/Microsoft agendas
      // Or you can let the user click a button in AgendaItem
      // initiateAuth(newAgenda.id); 
      setAndClearAppMessage({type: 'info', text: `${agendaName} added. Click "Authenticate" to connect.`});
    }
  }, [getNextColor, currentDate]);

  const handleToggleAgendaVisibility = useCallback((agendaId: string) => {
    setAgendas(prevAgendas =>
      prevAgendas.map(agenda =>
        agenda.id === agendaId ? { ...agenda, isVisible: !agenda.isVisible } : agenda
      )
    );
  }, []);

  const handleRemoveAgenda = useCallback((agendaId: string) => {
    setAgendas(prevAgendas => prevAgendas.filter(agenda => agenda.id !== agendaId));
  }, []);

  const openAddAgendaModal = (type: AgendaType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const visibleAppointments = useMemo(() => {
    return agendas
      .filter(agenda => agenda.isVisible)
      .flatMap(agenda => 
        agenda.appointments.map(appointment => ({
          ...appointment,
          agendaId: agenda.id,
          agendaName: agenda.name,
          agendaColor: agenda.color,
        }))
      );
  }, [agendas]);
  
  const hasPersonalAgenda = useMemo(() => 
    agendas.some(a => a.ownerType === AgendaType.USER && (a.source === 'manual' || a.source === 'google' || a.source === 'microsoft')), 
    [agendas]
  );
  
  const displayDate = useMemo(() => {
    if (viewMode === 'week') {
      return getStartOfWeek(currentDate);
    }
    return currentDate;
  }, [currentDate, viewMode]);

  return (
    <div className="flex h-screen font-sans antialiased">
      <Sidebar
        agendas={agendas}
        onToggleVisibility={handleToggleAgendaVisibility}
        onRemoveAgenda={handleRemoveAgenda}
        onAddUserAgenda={() => openAddAgendaModal(AgendaType.USER)}
        onAddFriendAgenda={() => openAddAgendaModal(AgendaType.FRIEND)}
        hasUserAgenda={hasPersonalAgenda}
        onInitiateAuth={initiateAuth}
        onFetchEvents={fetchAndSetAgendaEvents}
      />
      <main className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
        {appMessage && (
          <div 
            className={`p-3 text-center text-sm ${appMessage.type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
            role="alert"
          >
            {appMessage.text}
          </div>
        )}
        <header className="p-4 sm:p-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Aggregated Agenda</h1>
          <p className="text-sm text-gray-600">View all your important events in one place.</p>
        </header>
        
        <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
              <div className="text-lg font-semibold">Loading events...</div>
            </div>
          )}
          {agendas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <UsersIcon className="w-24 h-24 mb-4 text-gray-400" />
              <h2 className="text-2xl font-semibold mb-2">Your agenda space is empty</h2>
              <p className="mb-4">Start by adding your own agenda or linking a friend's agenda.</p>
              <div className="flex space-x-4">
                <button
                    onClick={() => openAddAgendaModal(AgendaType.USER)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out flex items-center"
                  >
                    <UserIcon className="w-5 h-5 mr-2" /> Add My Agenda
                  </button>
                <button
                  onClick={() => openAddAgendaModal(AgendaType.FRIEND)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition duration-150 ease-in-out flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" /> Add Friend's Agenda
                </button>
              </div>
            </div>
          ) : (
            <CalendarView
              appointments={visibleAppointments}
              currentDate={displayDate}
              viewMode={viewMode}
              onDateChange={setCurrentDate}
              onViewModeChange={setViewMode}
            />
          )}
        </div>
      </main>
      {isModalOpen && modalType && (
        <Modal 
            onClose={() => { setIsModalOpen(false); setModalType(null); }} 
            title={
                modalType === AgendaType.USER 
                ? "Add Your Agenda" 
                : "Add Friend's Agenda"
            }
        >
          <AddAgendaForm
            agendaType={modalType} 
            onSubmit={handleAddAgenda}
            onCancel={() => { setIsModalOpen(false); setModalType(null); }}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;
