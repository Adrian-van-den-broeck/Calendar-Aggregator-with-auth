import React from 'react';
import { Agenda } from '../types';
import { EyeIcon, EyeSlashIcon, TrashIcon, UserCircleIcon, UsersIcon, GoogleIcon, MicrosoftIcon, ArrowPathIcon, ShieldExclamationIcon, ShieldCheckIcon } from './icons';

interface AgendaItemProps {
  agenda: Agenda;
  onToggleVisibility: (agendaId: string) => void;
  onRemoveAgenda: (agendaId: string) => void;
  onInitiateAuth: (agendaId: string) => void;
  onFetchEvents: (agenda: Agenda) => void;
}

export const AgendaItem: React.FC<AgendaItemProps> = ({ 
  agenda, 
  onToggleVisibility, 
  onRemoveAgenda,
  onInitiateAuth,
  onFetchEvents
}) => {
  
  let SourceIconComponent;
  if (agenda.ownerType === 'user') {
    if (agenda.source === 'google') {
      SourceIconComponent = GoogleIcon;
    } else if (agenda.source === 'microsoft') {
      SourceIconComponent = MicrosoftIcon;
    } else { // manual user agenda
      SourceIconComponent = UserCircleIcon;
    }
  } else { // friend's agenda
    SourceIconComponent = UsersIcon;
  }

  const isOAuthAgenda = agenda.source === 'google' || agenda.source === 'microsoft';

  let authButton = null;
  if (isOAuthAgenda) {
    if (agenda.authStatus === 'pending_auth' || agenda.authStatus === 'token_expired' || (agenda.authStatus === 'error' && !agenda.accessToken)) {
      authButton = (
        <button
          onClick={() => onInitiateAuth(agenda.id)}
          className="ml-2 p-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center"
          title={agenda.authStatus === 'token_expired' ? "Re-authenticate" : "Authenticate"}
        >
          <ShieldExclamationIcon className="w-3 h-3 mr-1"/> Authenticate
        </button>
      );
    } else if (agenda.authStatus === 'authenticated') {
       authButton = (
        <button
          onClick={() => onFetchEvents(agenda)}
          className="ml-2 p-1 text-xs bg-sky-500 hover:bg-sky-600 text-white rounded flex items-center"
          title="Refresh events"
        >
          <ArrowPathIcon className="w-3 h-3 mr-1" /> Refresh
        </button>
      );
    } else if (agenda.authStatus === 'error' && agenda.accessToken) { // Error fetching events, but token exists
       authButton = (
        <button
          onClick={() => onFetchEvents(agenda)}
          className="ml-2 p-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded flex items-center"
          title="Retry fetching events"
        >
          <ArrowPathIcon className="w-3 h-3 mr-1" /> Retry
        </button>
      );
    }
  }
  
  const getAuthStatusIndicator = () => {
    if (!isOAuthAgenda) return null;
    switch (agenda.authStatus) {
      case 'authenticated':
        return <ShieldCheckIcon className="w-4 h-4 text-green-400 ml-1" title="Authenticated" />;
      case 'pending_auth':
      case 'token_expired':
        return <ShieldExclamationIcon className="w-4 h-4 text-yellow-400 ml-1" title={agenda.authStatus === 'token_expired' ? "Token Expired" : "Pending Authentication"} />;
      case 'error':
        return <ShieldExclamationIcon className="w-4 h-4 text-red-400 ml-1" title={`Error: ${agenda.authError || 'Unknown'}`} />;
      default:
        return null;
    }
  };


  return (
    <li 
      className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-150 ease-in-out group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center overflow-hidden min-w-0"> {/* min-w-0 for truncation */}
          <span
            className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
            style={{ backgroundColor: agenda.color }}
            title={`Color for ${agenda.name}`}
          ></span>
          <SourceIconComponent className="w-5 h-5 mr-2 text-gray-400 group-hover:text-white flex-shrink-0" />
          <span className="font-medium text-sm truncate" title={agenda.name}>
            {agenda.name}
          </span>
          {getAuthStatusIndicator()}
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          {authButton}
          <button
            onClick={() => onToggleVisibility(agenda.id)}
            className="text-gray-400 hover:text-white focus:outline-none"
            aria-label={agenda.isVisible ? "Hide agenda" : "Show agenda"}
          >
            {agenda.isVisible ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onRemoveAgenda(agenda.id)}
            className="text-gray-400 hover:text-red-500 focus:outline-none"
            aria-label={`Remove ${agenda.name}`}
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {isOAuthAgenda && agenda.authStatus === 'error' && agenda.authError && (
        <p className="text-xs text-red-400 mt-1 ml-7 truncate" title={agenda.authError}>
          Error: {agenda.authError}
        </p>
      )}
       {isOAuthAgenda && agenda.authStatus === 'token_expired' && (
        <p className="text-xs text-yellow-300 mt-1 ml-7">
          Token expired. Please re-authenticate.
        </p>
      )}
    </li>
  );
};
