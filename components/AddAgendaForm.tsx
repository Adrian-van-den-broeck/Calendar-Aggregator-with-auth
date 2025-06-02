import React, { useState } from 'react';
import { AgendaType, AgendaSource } from '../types';
import { GoogleIcon, MicrosoftIcon, UserIcon } from './icons'; // Assuming UserIcon for manual

interface AddAgendaFormProps {
  agendaType: AgendaType;
  onSubmit: (name: string, type: AgendaType, source: AgendaSource, link?: string) => void;
  onCancel: () => void;
}

export const AddAgendaForm: React.FC<AddAgendaFormProps> = ({ agendaType, onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  // 'initial' is for user to choose connection type, 'manual_form' for entering name for manual agenda
  const [userCreationStep, setUserCreationStep] = useState<'initial' | 'manual_form'>(
    agendaType === AgendaType.USER ? 'initial' : 'manual_form' // Friend agenda goes straight to form
  );

  const handleConnect = (source: 'google' | 'microsoft') => {
    const agendaName = source === 'google' ? 'My Google Calendar' : 'My Microsoft Calendar';
    onSubmit(agendaName, AgendaType.USER, source);
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    const source: AgendaSource = agendaType === AgendaType.USER ? 'manual' : 'friend_link';
    onSubmit(name, agendaType, source, agendaType === AgendaType.FRIEND ? link : undefined);
    setName('');
    setLink('');
  };
  
  if (agendaType === AgendaType.USER && userCreationStep === 'initial') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 mb-3">Connect your cloud calendar or create one manually.</p>
        <button
          onClick={() => handleConnect('google')}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <GoogleIcon className="w-5 h-5 mr-2" />
          Connect with Google Calendar
        </button>
        <button
          onClick={() => handleConnect('microsoft')}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <MicrosoftIcon className="w-5 h-5 mr-2" />
          Connect with Microsoft Calendar
        </button>
        <button
          onClick={() => setUserCreationStep('manual_form')}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserIcon className="w-5 h-5 mr-2" />
          Create Manually
        </button>
        <div className="flex justify-end pt-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // This part is for manual user agenda (after clicking "Create Manually") or for friend's agenda
  return (
    <form onSubmit={handleSubmitManual} className="space-y-4">
      {agendaType === AgendaType.USER && userCreationStep === 'manual_form' && (
         <p className="text-sm text-gray-600 -mb-2">Enter a name for your manual agenda.</p>
      )}
      <div>
        <label htmlFor="agendaName" className="block text-sm font-medium text-gray-700">
          Agenda Name {agendaType === AgendaType.USER && userCreationStep === 'manual_form' ? '(Optional, defaults to "My Agenda")' : ''}
        </label>
        <input
          type="text"
          id="agendaName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={agendaType === AgendaType.USER ? "e.g., Personal Tasks" : "e.g., Sarah's Agenda"}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required={agendaType === AgendaType.FRIEND} // Name is required for friend, optional for manual user
        />
      </div>

      {agendaType === AgendaType.FRIEND && (
        <div>
          <label htmlFor="agendaLink" className="block text-sm font-medium text-gray-700">
            Friend's Private Link (Simulated)
          </label>
          <input
            type="text"
            id="agendaLink"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Enter the shared link"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
           <p className="mt-1 text-xs text-gray-500">This is a simulated link for demo purposes.</p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {agendaType === AgendaType.USER ? 'Add My Agenda' : 'Add Friend Agenda'}
        </button>
      </div>
    </form>
  );
};