import React, { useState } from 'react';
import { BellIcon, CheckIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { Notification } from '../types';
import { AppController } from '../controllers/appController';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onUpdate: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onUpdate }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleRead = (id: string) => {
    AppController.markNotificationRead(id);
    onUpdate();
  };

  const handleSpeak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
      <div className="bg-indigo-600 p-3 text-white flex justify-between items-center">
        <h3 className="font-bold flex items-center gap-2">
          <BellIcon className="w-5 h-5" /> Notificaciones
          {unreadCount > 0 && <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
        </h3>
        <button onClick={onClose} className="text-xs hover:bg-indigo-500 px-2 py-1 rounded">Cerrar</button>
      </div>
      
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">No tienes notificaciones.</div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-indigo-50/50' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  n.type === 'warning' ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                  n.type === 'success' ? 'bg-green-100 text-green-700 border-green-200' : 
                  'bg-blue-100 text-blue-700 border-blue-200'
                }`}>
                  {n.type === 'warning' ? 'Aviso' : n.type === 'success' ? 'Éxito' : 'Info'}
                </span>
                <span className="text-xs text-slate-400">{n.date}</span>
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{n.title}</h4>
              <p className="text-sm text-slate-600 mt-1 leading-snug">{n.message}</p>
              
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => handleSpeak(`${n.title}. ${n.message}`)}
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                  title="Leer en voz alta"
                >
                  <SpeakerWaveIcon className="w-4 h-4" />
                </button>
                {!n.read && (
                  <button 
                    onClick={() => handleRead(n.id)}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded font-medium"
                  >
                    <CheckIcon className="w-3 h-3" /> Marcar leída
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;