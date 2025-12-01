
import React, { useState, useEffect } from 'react';
import Chatbot from './components/Chatbot';
import OcrTool from './components/OcrTool';
import VoiceDictation from './components/VoiceDictation';
import AdminPanel from './components/AdminPanel';
import AccessibilityPanel from './components/AccessibilityPanel';
import Schedule from './components/Schedule';
import Settings from './components/Settings';
import NotificationPanel from './components/NotificationPanel';
import AcademicContent from './components/AcademicContent';
import { AppController } from './controllers/appController';
import { User, Notification } from './types';
import { 
  EyeIcon, 
  SpeakerWaveIcon, 
  Squares2X2Icon,
  CalendarIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  BellIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';

type ViewMode = 'login' | 'dashboard' | 'ocr' | 'stt' | 'schedule' | 'settings' | 'admin' | 'courses';

const App: React.FC = () => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('login');
  const [showHelp, setShowHelp] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Login Form State
  const [email, setEmail] = useState('juan@estudiante.edu');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Font Size Logic - UPDATED FOR MOBILE VISIBILITY
  // Tailwind uses rem. 1rem = root font size.
  // By changing the root pixel size, everything scales proportionally.
  useEffect(() => {
    if (user) {
        const size = user.preferences.fontSize;
        let pixelSize = '16px'; // Default
        
        // Drastic changes for visibility on small screens
        if (size === 'large') pixelSize = '20px'; // +25%
        if (size === 'xl') pixelSize = '24px';    // +50%
        
        document.documentElement.style.setProperty('font-size', pixelSize, 'important');
    } else {
        document.documentElement.style.removeProperty('font-size');
    }
  }, [user?.preferences.fontSize]);

  // Load Notifications
  useEffect(() => {
    if (user) {
        setNotifications(AppController.getNotifications(user.id));
    }
  }, [user, showNotifications]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const loggedUser = await AppController.login(email, password);
      if (loggedUser) {
        setUser(loggedUser);
        setCurrentView(loggedUser.role === 'admin' ? 'admin' : 'dashboard');
        if (loggedUser.preferences.highContrast) {
           document.documentElement.classList.add('grayscale', 'contrast-125');
        } else {
           document.documentElement.classList.remove('grayscale', 'contrast-125');
        }
      } else {
        setLoginError('Credenciales inválidas.');
      }
    } catch (err) {
      setLoginError('Error de conexión.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    document.documentElement.classList.remove('grayscale', 'contrast-125');
    document.documentElement.style.removeProperty('font-size');
  };

  // --- Views ---

  const renderLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-6">IS</div>
        <h1 className="text-3xl font-bold text-slate-900 text-center">Inclusive StudAI</h1>
        <p className="text-slate-500 mb-8 text-center">Tu compañero académico accesible</p>
        
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Correo</label>
                <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                />
            </div>
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
                <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-lg"
                placeholder="••••••••"
                />
            </div>
            
            {loginError && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{loginError}</p>}
            
            <button 
                type="submit" 
                disabled={loginLoading}
                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 text-lg"
            >
                {loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
        </form>
        <p className="mt-8 text-xs text-slate-400 text-center">v2.2 Mobile • Powered by Gemini AI</p>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 pb-24 pt-4 px-4 animate-fadeIn">
        {/* Welcome Card */}
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><AcademicCapIcon className="w-32 h-32 rotate-12" /></div>
            <p className="text-indigo-100 font-medium mb-1">Bienvenido,</p>
            <h2 className="text-3xl font-bold">{user?.name.split(' ')[0]}</h2>
            <div className="mt-4 flex gap-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Ciclo 2025-I</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">Ingeniería</span>
            </div>
        </div>

        {/* Quick Tools Grid */}
        <h3 className="font-bold text-slate-800 text-lg px-1">Herramientas Rápidas</h3>
        <div className="grid grid-cols-2 gap-4">
            <button 
            onClick={() => setCurrentView('ocr')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform flex flex-col items-center justify-center gap-3 text-center h-36"
            >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                    <EyeIcon className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700 text-sm">Leer Texto</span>
            </button>

            <button 
            onClick={() => setCurrentView('stt')}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 active:scale-95 transition-transform flex flex-col items-center justify-center gap-3 text-center h-36"
            >
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                    <SpeakerWaveIcon className="w-6 h-6" />
                </div>
                <span className="font-bold text-slate-700 text-sm">Subtítulos</span>
            </button>
        </div>

        {/* Next Class Card */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
            <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Siguiente Clase</p>
                <h3 className="text-xl font-bold">Ingeniería de Sistemas</h3>
                <p className="text-slate-300 text-sm mt-1">Aula 302 • 10:00 AM</p>
            </div>
            <button onClick={() => setCurrentView('schedule')} className="bg-white text-slate-900 p-3 rounded-2xl">
                <CalendarIcon className="w-6 h-6" />
            </button>
        </div>
        
        {/* Help Banner */}
        <button onClick={() => setShowHelp(true)} className="w-full bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="bg-white p-2 rounded-full shadow-sm text-indigo-600">
                <QuestionMarkCircleIcon className="w-6 h-6" />
            </div>
            <div className="text-left">
                <h4 className="font-bold text-indigo-900 text-sm">¿Necesitas ayuda?</h4>
                <p className="text-indigo-700 text-xs">Ver tutorial de accesibilidad</p>
            </div>
        </button>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'ocr': return <div className="pb-24 pt-4 px-4 h-full"><OcrTool /></div>;
      case 'stt': return <div className="pb-24 pt-4 px-4 h-full"><VoiceDictation /></div>;
      case 'schedule': return user ? <div className="pb-24 pt-4 px-4"><Schedule userId={user.id} initialAppointments={AppController.getAppointments(user.id)} /></div> : null;
      case 'courses': return user ? <div className="pb-24 pt-4 px-4"><AcademicContent courses={AppController.getCourses(user.id)} /></div> : null;
      case 'settings': return user ? <div className="pb-24 pt-4 px-4"><Settings user={user} onUpdate={setUser} /></div> : null;
      case 'admin': return <div className="pb-24 pt-4 px-4"><AdminPanel metrics={AppController.getAdminDashboardData().metrics} /></div>;
      default: return null;
    }
  };

  // Main Render
  if (currentView === 'login') return renderLogin();

  const isHome = currentView === 'dashboard' || currentView === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-base">
      
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm h-16 safe-area-top">
        {!isHome ? (
            <button onClick={() => setCurrentView(user?.role === 'admin' ? 'admin' : 'dashboard')} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
        ) : (
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">IS</div>
                <h1 className="font-bold text-lg text-slate-800">StudAI</h1>
            </div>
        )}

        <div className="flex items-center gap-2">
            <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative"
                >
                    <BellIcon className="w-6 h-6" />
                    {notifications.some(n => !n.read) && (
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
                    )}
                </button>
                {showNotifications && (
                    <NotificationPanel 
                        notifications={notifications} 
                        onClose={() => setShowNotifications(false)}
                        onUpdate={() => setNotifications(AppController.getNotifications(user!.id))}
                    />
                )}
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600">
                <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-md mx-auto min-h-[calc(100vh-64px)] relative" ref={contentRef}>
         {renderContent()}
      </main>

      {/* Tools Overlays */}
      <AccessibilityPanel contentRef={contentRef} voiceSpeed={user?.preferences.voiceSpeed} />
      <Chatbot />

      {/* Mobile Bottom Navigation Bar */}
      {user?.role === 'student' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-2 pb-safe-bottom z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-bottom">
            <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-colors ${currentView === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                {currentView === 'dashboard' ? <Squares2X2Icon className="w-6 h-6 stroke-2" /> : <Squares2X2Icon className="w-6 h-6" />}
                <span className="text-[10px] font-medium">Inicio</span>
            </button>
            
            <button 
                onClick={() => setCurrentView('courses')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-colors ${currentView === 'courses' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                <AcademicCapIcon className="w-6 h-6" />
                <span className="text-[10px] font-medium">Cursos</span>
            </button>

            {/* Middle Action Button Placeholder (Agenda) */}
            <button 
                onClick={() => setCurrentView('schedule')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-colors ${currentView === 'schedule' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                <CalendarIcon className="w-6 h-6" />
                <span className="text-[10px] font-medium">Agenda</span>
            </button>

            <button 
                onClick={() => setCurrentView('settings')}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl w-16 transition-colors ${currentView === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
                <Cog6ToothIcon className="w-6 h-6" />
                <span className="text-[10px] font-medium">Ajustes</span>
            </button>
          </nav>
      )}

      {/* Help Modal (Full Screen Mobile) */}
      {showHelp && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fadeIn">
            <div className="bg-indigo-600 p-4 pt-safe-top text-white flex justify-between items-center shadow-md">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-6 h-6" /> Tutorial
                </h3>
                <button onClick={() => setShowHelp(false)} className="bg-white/20 rounded-full p-1"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-indigo-600 mb-2 text-lg">1. Lector Inteligente</h4>
                    <p className="text-slate-600">Sube fotos de documentos para convertirlos a texto. Usa el botón "Escuchar" para que el sistema lea el contenido.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-indigo-600 mb-2 text-lg">2. Subtitulado</h4>
                    <p className="text-slate-600">En clase, activa esta herramienta para ver transcripciones en tiempo real con letra grande y alto contraste.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-indigo-600 mb-2 text-lg">3. Accesibilidad Global</h4>
                    <p className="text-slate-600">Botones flotantes (derecha) para: <br/>🗣️ Leer pantalla actual <br/>👁️ Modo Alto Contraste.</p>
                </div>
            </div>
            <div className="p-4 border-t border-slate-100 pb-safe-bottom">
                <button onClick={() => setShowHelp(false)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg">Entendido</button>
            </div>
        </div>
      )}

      <style>{`
        .safe-area-top { padding-top: env(safe-area-inset-top); }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }
        .pb-safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 10px); }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
