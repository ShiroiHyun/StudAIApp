import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  DocumentCheckIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Metric, Ticket } from '../types';
import { AppController } from '../controllers/appController';

interface AdminPanelProps {
  metrics: Metric[];
}

const AdminPanel: React.FC<AdminPanelProps> = ({ metrics }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const load = async () => {
        try {
            const data = await AppController.getAdminDashboardData();
            setTickets(data.tickets);
        } catch (e) {
            console.error("Failed to load admin data", e);
        }
    };
    load();
  }, []);

  const handleGenerateReport = () => {
    AppController.generateCSVReport();
  };

  const handleResolveTicket = async (id: string) => {
    const success = await AppController.resolveTicket(id);
    if (success) {
        // Animate removal locally
        setTickets(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Panel Administrativo</h2>
          <p className="text-slate-500">Gestión de inclusión y monitoreo (RF-F15)</p>
        </div>
        <button 
            onClick={handleGenerateReport}
            className="w-full md:w-auto bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-green-700 shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
        >
          <DocumentCheckIcon className="w-5 h-5" />
          Descargar CSV
        </button>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">{metric.label}</h3>
                <p className="text-3xl font-extrabold text-slate-800 mt-1">{metric.value}</p>
            </div>
            <div className={`p-2 rounded-lg ${metric.change > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <span className="text-sm font-bold">{metric.change > 0 ? '+' : ''}{metric.change}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
            Tickets Pendientes
          </h3>
          <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold">{tickets.length}</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
                <div key={ticket.id} className="p-5 flex flex-col gap-3 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-slate-900 text-lg leading-tight">{ticket.subject}</p>
                        <p className="text-sm text-slate-500 mt-1">{ticket.user} • {ticket.date}</p>
                    </div>
                </div>
                <button 
                    onClick={() => handleResolveTicket(ticket.id)}
                    className="self-end flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors"
                >
                    <CheckCircleIcon className="w-5 h-5" />
                    Marcar Resuelto
                </button>
                </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400">
                <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-200" />
                <p>Todo en orden. No hay tickets pendientes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;