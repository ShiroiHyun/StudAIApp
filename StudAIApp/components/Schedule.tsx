import React, { useState, useEffect } from 'react';
import { CalendarIcon, MapPinIcon, ClockIcon, CheckCircleIcon, XCircleIcon, PlusIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { Appointment } from '../types';
import { AppController } from '../controllers/appController';

interface ScheduleProps {
  userId: string;
  initialAppointments: Appointment[];
}

const Schedule: React.FC<ScheduleProps> = ({ userId, initialAppointments }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState<Appointment['type']>('academic');

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newAppointment = AppController.addAppointment(userId, {
      title: newTitle,
      date: newDate.replace('T', ' '),
      type: newType
    });

    setAppointments(prev => [...prev, newAppointment]);
    setIsModalOpen(false);
    
    setNewTitle('');
    setNewDate('');
    setNewType('academic');
  };

  const handleUpdateStatus = (id: string, status: 'confirmed' | 'cancelled') => {
    const updated = AppController.updateAppointmentStatus(id, status);
    if (updated) {
        setAppointments(prev => prev.map(a => a.id === id ? updated : a));
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-900">Agenda</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white p-2 rounded-xl shadow-md active:scale-95 transition-transform"
        >
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="grid gap-3">
        {appointments.length > 0 ? (
          appointments.map((apt) => (
            <div 
              key={apt.id} 
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl shrink-0 ${
                  apt.type === 'academic' ? 'bg-blue-100 text-blue-600' :
                  apt.type === 'medical' ? 'bg-red-100 text-red-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-base truncate">{apt.title}</h3>
                  <div className="flex flex-col text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" /> {new Date(apt.date).toLocaleDateString()} • {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1">
                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-500 line-through'
                }`}>
                  {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                </span>
                
                {apt.status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(apt.id, 'confirmed')} className="text-green-600 bg-green-50 p-2 rounded-lg"><CheckCircleIcon className="w-6 h-6"/></button>
                    <button onClick={() => handleUpdateStatus(apt.id, 'cancelled')} className="text-red-600 bg-red-50 p-2 rounded-lg"><XCircleIcon className="w-6 h-6"/></button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300">
            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Sin citas programadas.</p>
          </div>
        )}
      </div>

      {/* Mobile Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fadeIn">
            <div className="bg-indigo-600 p-4 pt-safe-top text-white flex justify-between items-center shadow-md shrink-0">
              <h3 className="font-bold text-lg">Nueva Cita</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-1 rounded-full"><ChevronLeftIcon className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Título</label>
                    <input 
                      type="text" 
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base"
                      placeholder="Ej: Examen Parcial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Fecha y Hora</label>
                    <input 
                      type="datetime-local" 
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-base bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Tipo</label>
                    <select 
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as Appointment['type'])}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-base"
                    >
                      <option value="academic">Académico</option>
                      <option value="medical">Médico / Salud</option>
                      <option value="administrative">Trámite</option>
                    </select>
                  </div>
              </div>
            </form>

            <div className="p-4 border-t border-slate-200 bg-white pb-safe-bottom">
                 <button 
                  onClick={handleCreateAppointment}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg text-lg"
                >
                  Confirmar Cita
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;