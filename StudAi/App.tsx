
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
import ObjectRecognizer from './components/ObjectRecognizer';
import { AppController } from './controllers/appController';
import { User, Notification, Course, Appointment } from './types';
import { EyeIcon, SpeakerWaveIcon, Squares2X2Icon, CalendarIcon, Cog6ToothIcon, QuestionMarkCircleIcon, XMarkIcon, BellIcon, AcademicCapIcon, ArrowRightOnRectangleIcon, ChevronLeftIcon, UserPlusIcon, CameraIcon } from '@heroicons/react/24/outline';

type ViewMode = 'login' | 'dashboard' | 'ocr' | 'stt' | 'schedule' | 'settings' | 'admin' | 'courses' | 'object_ai';

const App: React.FC = () => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('login');
  const [loadingData, setLoadingData] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Login / Register State
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Initial Data Load on Login
  useEffect(() => {
    if (user) {
        setLoadingData(true);
        Promise.all([
            AppController.getCourses(user.id),
            AppController.getAppointments(user.id),
            AppController.getNotifications(user.id)
        ]).then(([c, a, n]) => {
            setCourses(c);
            setAppointments(a);
            setNotifications(n);
            setLoadingData(false);
        });
    }
  }, [user]);

  const refreshData = () => {
    if(user) {
        AppController.getCourses(user.id).then(setCourses);
        AppController.getAppointments(user.id).then(setAppointments);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    let u: User | null = null;

    if (isRegistering) {
        if(!name || !email || !password) return alert("Completa todos los campos");
        u = await AppController.register(name, email, password);
        if (!u) alert("El usuario ya existe o hubo un error.");
    } else {
        u = await AppController.login(email, password);
        if (!u) alert("Usuario no encontrado. ¿Ya te registraste?");
    }

    if (u) {
        setUser(u);
        setCurrentView(u.role === 'admin' ? 'admin' : 'dashboard');
    }
  };

  const fillDemoData = () => {
      setName('Juan Estudiante');
      setEmail('juan@demo.edu');
      setPassword('demo123');
      setIsRegistering(true); // Switch to register so user can create the user in DB
  };

  // Voice Navigation Handler
  const handleVoiceCommand = async (action: string, data?: any) => {
    if (action === 'navigate') {
        setCurrentView(data as ViewMode);
    } else if (action === 'create_course' && user) {
        await AppController.addCourse(user.id, data);
        refreshData();
    }
  };

  // ... Render Helpers (Login, Dashboard) ...
  const renderLogin = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <h1 className="text-4xl font-bold mb-2 text-indigo-700 tracking-tight">Inclusive StudAI</h1>
        <p className="text-slate-500 mb-8 text-center">Acceso Universal al Aprendizaje</p>
        
        <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl space-y-6">
            <div className="flex justify-center border-b mb-4">
                <button 
                    onClick={() => setIsRegistering(false)} 
                    className={`pb-2 px-4 font-bold ${!isRegistering ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
                >
                    Ingresar
                </button>
                <button 
                    onClick={() => setIsRegistering(true)} 
                    className={`pb-2 px-4 font-bold ${isRegistering ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}
                >
                    Registrarse
                </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
                {isRegistering && (
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nombre completo" required/>
                )}
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Correo electrónico" required/>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contraseña" required/>
                
                <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    {isRegistering ? 'Crear Cuenta' : 'Entrar'}
                </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center">
                <button onClick={fillDemoData} className="text-sm text-slate-500 hover:text-indigo-600 underline">
                    {isRegistering ? 'Llenar datos de prueba' : 'Quiero registrar una cuenta Demo'}
                </button>
            </div>
        </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 pb-24 pt-4 px-4 animate-fadeIn">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-1">Hola, {user?.name.split(' ')[0]}</h2>
                <p className="opacity-90 text-indigo-100">¿Qué haremos hoy?</p>
            </div>
            <div className="absolute -right-4 -bottom-8 opacity-20">
                <AcademicCapIcon className="w-32 h-32" />
            </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setCurrentView('ocr')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-40 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                    <EyeIcon className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-700">Lector IA</span>
            </button>
            <button onClick={() => setCurrentView('stt')} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-40 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 transition-colors">
                <div className="bg-pink-100 p-4 rounded-full text-pink-600">
                    <SpeakerWaveIcon className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-700">Subtítulos</span>
            </button>
            <button onClick={() => setCurrentView('object_ai')} className="col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 h-32 flex flex-row items-center justify-center gap-6 hover:bg-slate-50 transition-colors">
                <div className="bg-purple-100 p-4 rounded-full text-purple-600">
                    <CameraIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                    <span className="block font-bold text-slate-700 text-lg">Reconocedor IA</span>
                    <span className="text-slate-400 text-sm">Identificar objetos (Cámara)</span>
                </div>
            </button>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Próxima Actividad</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">HOY</span>
            </div>
            {appointments.length > 0 ? (
                <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-800">{appointments[0].title}</p>
                        <p className="text-sm text-slate-500">{appointments[0].date}</p>
                    </div>
                </div>
            ) : (
                <p className="text-slate-400 text-sm">No tienes actividades pendientes.</p>
            )}
        </div>
    </div>
  );

  const renderContent = () => {
    if (loadingData) return <div className="flex h-full items-center justify-center text-indigo-600 font-bold animate-pulse">Cargando datos...</div>;
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'ocr': return <div className="pb-24 pt-4 px-4 h-full"><OcrTool /></div>;
      case 'stt': return <div className="pb-24 pt-4 px-4 h-full"><VoiceDictation /></div>;
      case 'object_ai': return <div className="pb-24 pt-4 px-4 h-full"><ObjectRecognizer /></div>;
      case 'schedule': return user ? <div className="pb-24 pt-4 px-4"><Schedule userId={user.id} initialAppointments={appointments} /></div> : null;
      case 'courses': return user ? <div className="pb-24 pt-4 px-4"><AcademicContent courses={courses} userId={user.id} onRefresh={refreshData} /></div> : null;
      case 'settings': return user ? <div className="pb-24 pt-4 px-4"><Settings user={user} onUpdate={setUser} /></div> : null;
      case 'admin': return <div className="pb-24 pt-4 px-4"><AdminPanel metrics={[]} /></div>;
      default: return null;
    }
  };

  if (currentView === 'login') return renderLogin();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-base">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center h-16 pt-safe-top">
         <div className="flex items-center gap-2">
            {currentView !== 'dashboard' && currentView !== 'admin' && (
                <button onClick={() => setCurrentView('dashboard')} className="p-1 rounded-full hover:bg-slate-100">
                    <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
                </button>
            )}
            <h1 className="font-bold text-xl text-indigo-700 tracking-tight">StudAI</h1>
         </div>
         <div className="flex gap-3">
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-slate-100 rounded-full">
                <BellIcon className="w-6 h-6 text-slate-600" />
                {notifications.some(n => !n.read) && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
            </button>
         </div>
      </header>

      <main className="w-full max-w-md mx-auto min-h-[calc(100vh-64px)]" ref={contentRef}>
         {renderContent()}
      </main>

      <AccessibilityPanel contentRef={contentRef} onCommand={handleVoiceCommand} />
      <Chatbot />

      {user?.role === 'student' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex justify-around p-2 pb-safe-bottom z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <button onClick={() => setCurrentView('dashboard')} className={`p-2 flex flex-col items-center w-16 rounded-xl transition-colors ${currentView === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}><Squares2X2Icon className="w-6 h-6" /><span className="text-[10px] font-bold mt-1">Inicio</span></button>
            <button onClick={() => setCurrentView('courses')} className={`p-2 flex flex-col items-center w-16 rounded-xl transition-colors ${currentView === 'courses' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}><AcademicCapIcon className="w-6 h-6" /><span className="text-[10px] font-bold mt-1">Cursos</span></button>
            <button onClick={() => setCurrentView('schedule')} className={`p-2 flex flex-col items-center w-16 rounded-xl transition-colors ${currentView === 'schedule' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}><CalendarIcon className="w-6 h-6" /><span className="text-[10px] font-bold mt-1">Agenda</span></button>
            <button onClick={() => setCurrentView('settings')} className={`p-2 flex flex-col items-center w-16 rounded-xl transition-colors ${currentView === 'settings' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:bg-slate-50'}`}><Cog6ToothIcon className="w-6 h-6" /><span className="text-[10px] font-bold mt-1">Perfil</span></button>
          </nav>
      )}
      
      {showNotifications && <NotificationPanel notifications={notifications} onClose={() => setShowNotifications(false)} onUpdate={() => {}} />}
      
      <style>{` 
        .pt-safe-top { padding-top: env(safe-area-inset-top); } 
        .pb-safe-bottom { padding-bottom: env(safe-area-inset-bottom); } 
        html { font-size: ${user?.preferences.fontSize === 'large' ? '20px' : user?.preferences.fontSize === 'xl' ? '24px' : '16px'}; }
      `}</style>
    </div>
  );
};

export default App;
