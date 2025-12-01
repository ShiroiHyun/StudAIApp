import React, { ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';

// MVC: View - Layout Principal

interface LayoutProps {
    children?: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    const { preferences, speak, isListening, setIsListening } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Estilos dinámicos basados en preferencias
    const baseClasses = "min-h-screen flex flex-col transition-colors duration-300";
    const themeClasses = preferences.highContrast 
        ? "bg-black text-yellow-300" 
        : "bg-gray-50 text-gray-900";

    const navItems = [
        { label: 'Inicio', path: '/', icon: 'fa-home' },
        { label: 'Cursos', path: '/courses', icon: 'fa-book' },
        { label: 'Lector IA', path: '/ocr', icon: 'fa-eye' },
        { label: 'Perfil', path: '/profile', icon: 'fa-user' },
    ];

    const toggleMic = () => {
        if (isListening) {
            setIsListening(false);
            speak("Micrófono apagado");
        } else {
            setIsListening(true);
            speak("Escuchando comando...");
        }
    };

    return (
        <div className={`${baseClasses} ${themeClasses}`}>
            {/* Header Accesible */}
            <header className={`p-4 shadow-md flex justify-between items-center ${preferences.highContrast ? 'border-b-2 border-white' : 'bg-ucv-red text-white'}`}>
                <h1 
                    className="text-xl font-bold cursor-pointer" 
                    onClick={() => { speak("Inclusive StudAI UCV"); navigate('/'); }}
                    aria-label="Ir al inicio"
                >
                    Inclusive StudAI
                </h1>
                <div className="text-sm font-semibold" aria-hidden="true">UCV</div>
            </header>

            {/* Contenido Principal */}
            <main className="flex-1 p-4 pb-24 overflow-y-auto relative">
                {children}
            </main>

            {/* BOTÓN FLOTANTE DE MICROFONO IA */}
            {location.pathname !== '/login' && (
                <button
                    onClick={toggleMic}
                    className={`fixed bottom-24 right-4 w-16 h-16 rounded-full shadow-2xl z-50 flex items-center justify-center transition-all transform hover:scale-110 active:scale-90 ${
                        isListening 
                        ? 'bg-red-600 animate-pulse ring-4 ring-red-300' 
                        : (preferences.highContrast ? 'bg-yellow-400 text-black' : 'bg-ucv-blue text-white')
                    }`}
                    aria-label={isListening ? "Detener escucha" : "Activar comandos de voz"}
                >
                    <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} text-2xl`}></i>
                </button>
            )}

            {/* Barra de Navegación Inferior (Sticky) */}
            {location.pathname !== '/login' && (
                <nav className={`fixed bottom-0 w-full p-2 border-t-2 flex justify-around items-center z-40 ${preferences.highContrast ? 'bg-black border-white' : 'bg-white border-gray-200'}`}>
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                speak(item.label);
                                navigate(item.path);
                            }}
                            className={`flex flex-col items-center p-3 rounded-lg w-1/4 ${location.pathname === item.path ? 'font-bold underline' : ''} ${preferences.highContrast ? 'text-yellow-300 focus:bg-gray-800' : 'text-gray-600 focus:bg-gray-100'}`}
                            aria-label={item.label}
                        >
                            <i className={`fas ${item.icon} text-xl mb-1`}></i>
                            <span className="text-xs">{item.label}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
};