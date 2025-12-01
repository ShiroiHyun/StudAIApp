import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { loginUser, registerUser } from '../services/databaseService';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const LoginView = () => {
    const { setUser, speak, preferences, voiceInput, setVoiceInput } = useApp();
    const navigate = useNavigate();
    
    const [isRegistering, setIsRegistering] = useState(false);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [name, setName] = useState('');
    const [career, setCareer] = useState('');
    const [cycle, setCycle] = useState('');

    const [loading, setLoading] = useState(false);

    // --- ESCUCHA DE DATOS POR VOZ ---
    useEffect(() => {
        if (voiceInput) {
            // Sanitización extra de espacios
            const val = voiceInput.value.trim();
            
            if (voiceInput.field === 'email') {
                setEmail(val.toLowerCase()); // Correos siempre minúsculas
            } else if (voiceInput.field === 'password') {
                setPassword(val);
            }
            // Limpiar comando después de usarlo para evitar loops
            setVoiceInput(null);
        }
    }, [voiceInput, setVoiceInput]);

    const handleAction = async () => {
        if (!email.trim() || !password.trim()) {
            speak("Faltan datos. Di 'Mi correo es...' para rellenar.");
            return;
        }

        setLoading(true);
        const actionText = isRegistering ? "Registrando" : "Iniciando";
        speak(`${actionText}, espera un momento`);

        try {
            let user;
            if (isRegistering) {
                user = await registerUser(email.trim(), password.trim(), { name, career, cycle });
                speak(`Bienvenido ${user.name}`);
            } else {
                user = await loginUser(email.trim(), password.trim());
                speak(`Hola de nuevo ${user.name}`);
            }
            setUser(user);
            navigate('/');
        } catch (error) {
            console.error(error);
            speak("Error. Verifica tus credenciales o conexión.");
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        speak(isRegistering ? "Modo Ingreso" : "Modo Registro");
    };

    const handleExitApp = () => {
        speak("Cerrando aplicación. Hasta luego.");
        setTimeout(() => {
            // Intento genérico de cerrar ventana/app
            try {
                window.close();
                // Específico para Android/Cordova
                if ((navigator as any).app) {
                    (navigator as any).app.exitApp();
                }
            } catch (e) {
                console.log("No se puede cerrar por script en navegador web estándar.");
            }
        }, 1000);
    };

    const inputClass = preferences.highContrast 
        ? "bg-black border-2 border-yellow-300 text-yellow-300 placeholder-yellow-600"
        : "bg-white border border-gray-300 text-gray-900";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4 overflow-y-auto">
            <div className="text-center space-y-4 mb-6">
                <i className={`fas fa-universal-access text-6xl ${preferences.highContrast ? 'text-yellow-300' : 'text-ucv-red'}`}></i>
                <h2 className="text-3xl font-bold">{isRegistering ? 'Registro' : 'Ingreso UCV'}</h2>
                <p className="text-sm">Di "Mi correo es..." para escribir.</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
                {isRegistering && (
                    <>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre Completo"
                            className={`w-full p-4 rounded-lg text-lg mb-2 ${inputClass}`}
                        />
                        <input
                            type="text"
                            value={career}
                            onChange={(e) => setCareer(e.target.value)}
                            placeholder="Carrera"
                            className={`w-full p-4 rounded-lg text-lg mb-2 ${inputClass}`}
                        />
                        <input
                            type="text"
                            value={cycle}
                            onChange={(e) => setCycle(e.target.value)}
                            placeholder="Ciclo (Ej: VIII)"
                            className={`w-full p-4 rounded-lg text-lg mb-2 ${inputClass}`}
                        />
                    </>
                )}

                <div className="relative">
                    <label className="sr-only">Correo</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo UCV"
                        className={`w-full p-4 rounded-lg text-lg mb-4 ${inputClass}`}
                    />
                    {email && email.includes('@') && <i className="fas fa-check absolute right-4 top-5 text-green-500"></i>}
                </div>
                
                <div className="relative">
                    <label className="sr-only">Contraseña</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className={`w-full p-4 rounded-lg text-lg ${inputClass}`}
                    />
                </div>
                
                <div className="h-4"></div>

                <Button 
                    label={loading ? "Cargando..." : (isRegistering ? "Crear Cuenta" : "Ingresar")} 
                    onClick={handleAction}
                    disabled={loading}
                    className="w-full shadow-lg"
                    icon={isRegistering ? "fa-user-plus" : "fa-sign-in-alt"}
                />

                <button 
                    onClick={toggleMode}
                    className="w-full text-center text-sm underline py-2 mt-2"
                >
                    {isRegistering ? "Volver al Login" : "Crear cuenta nueva"}
                </button>

                {/* BOTÓN SALIR DE LA APP */}
                <div className="pt-8 border-t border-gray-300 mt-4">
                    <Button 
                        label="Salir de la Aplicación" 
                        variant="danger"
                        icon="fa-power-off"
                        onClick={handleExitApp}
                        className="w-full opacity-80 hover:opacity-100"
                    />
                </div>
            </div>
            
            {/* Instrucciones de Voz flotantes */}
            <div className="fixed bottom-4 text-xs opacity-60 text-center w-full px-4">
                Prueba decir: <br/>
                "Mi correo es juan arroba gmail punto com"
            </div>
        </div>
    );
};