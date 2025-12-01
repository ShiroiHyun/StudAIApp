import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, PlusIcon, ChevronLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Appointment } from '../types';
import { AppController } from '../controllers/appController';

interface ScheduleProps {
  userId: string;
  initialAppointments: Appointment[];
}

const Schedule: React.FC<ScheduleProps> = ({ userId, initialAppointments }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState<Appointment['type']>('academic');

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const newApt = await AppController.addAppointment(userId, {
      title: newTitle,
      date: newDate.replace('T', ' '),
      type: newType,
      userId
    });

    setAppointments(prev => [...prev, newApt]);
    setIsModalOpen(false);
    setNewTitle(''); setNewDate('');
  };

  const filtered = appointments.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-900">Agenda</h2>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 text-white p-2 rounded-xl shadow-md active:scale-95">
          <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar RF-F22 */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
        <input 
            type="text" 
            placeholder="Buscar citas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map((apt) => (
            <div key={apt.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-xl shrink-0 ${apt.type === 'academic' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  <CalendarIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-base truncate">{apt.title}</h3>
                  <div className="flex flex-col text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" /> {apt.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-50 pt-2 mt-1">
                <span className="px-2 py-1 rounded-md text-xs font-bold uppercase bg-slate-100 text-slate-500">{apt.status}</span>
              </div>
            </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fadeIn">
            <div className="bg-indigo-600 p-4 pt-safe-top text-white flex justify-between items-center shadow-md shrink-0">
              <h3 className="font-bold text-lg">Nueva Cita</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/20 p-1 rounded-full"><ChevronLeftIcon className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleCreateAppointment} className="p-6 space-y-6 bg-slate-50 flex-1">
              <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full p-4 rounded-xl border" placeholder="Título" required />
              <input type="datetime-local" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full p-4 rounded-xl border bg-white" required />
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Guardar</button>
            </form>
        </div>
      )}
    </div>
  );
};

export default Schedule;