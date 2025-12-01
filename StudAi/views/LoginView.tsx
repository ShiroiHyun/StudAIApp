import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { loginUser, registerUser } from '../services/databaseService';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const LoginView = () => {
    const { setUser, speak, preferences } = useApp();
    const navigate = useNavigate();
    
    // Estado para alternar entre Login y Registro
    const [isRegistering, setIsRegistering] = useState(false);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Campos extra para registro
    const [name, setName] = useState('');
    const [career, setCareer] = useState('');
    const [cycle, setCycle] = useState('');

    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        if (!email || !password) {
            speak("Por favor ingresa correo y contraseña");
            return;
        }

        if (isRegistering && (!name || !career || !cycle)) {
            speak("Por favor completa todos los datos de registro");
            return;
        }

        setLoading(true);
        const actionText = isRegistering ? "Registrando usuario" : "Iniciando sesión";
        speak(`${actionText}, por favor espera`);

        try {
            let user;
            if (isRegistering) {
                // Registro
                user = await registerUser(email, password, { name, career, cycle });
                speak(`Registro exitoso. Bienvenido ${user.name}`);
            } else {
                // Login
                user = await loginUser(email, password);
                speak(`Bienvenido de nuevo ${user.name}`);
            }
            
            setUser(user);
            navigate('/');
        } catch (error) {
            console.error(error);
            speak(`Error al ${isRegistering ? 'registrar' : 'iniciar sesión'}. Verifique los datos.`);
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        speak(isRegistering ? "Cambiando a modo inicio de sesión" : "Cambiando a modo registro de nuevo estudiante");
    };

    const inputClass = preferences.highContrast 
        ? "bg-black border-2 border-yellow-300 text-yellow-300 placeholder-yellow-600"
        : "bg-white border border-gray-300 text-gray-900";

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4 overflow-y-auto">
            <div className="text-center space-y-4 mb-8">
                <i className={`fas fa-universal-access text-6xl ${preferences.highContrast ? 'text-yellow-300' : 'text-ucv-red'}`}></i>
                <h2 className="text-3xl font-bold">{isRegistering ? 'Nuevo Estudiante' : 'Acceso UCV'}</h2>
                <p>Plataforma Inclusiva StudAI</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <div role="group" aria-label={isRegistering ? "Datos de registro" : "Credenciales de acceso"}>
                    
                    {/* Campos adicionales solo para Registro */}
                    {isRegistering && (
                        <>
                            <label className="block text-sm font-bold mb-1" htmlFor="name">Nombre Completo</label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className={`w-full p-4 rounded-lg text-lg mb-4 focus:ring-4 focus:ring-blue-500 ${inputClass}`}
                                onFocus={() => speak("Campo Nombre Completo")}
                            />

                            <label className="block text-sm font-bold mb-1" htmlFor="career">Carrera Profesional</label>
                            <input
                                id="career"
                                type="text"
                                value={career}
                                onChange={(e) => setCareer(e.target.value)}
                                placeholder="Ej: Ingeniería de Sistemas"
                                className={`w-full p-4 rounded-lg text-lg mb-4 focus:ring-4 focus:ring-blue-500 ${inputClass}`}
                                onFocus={() => speak("Campo Carrera Profesional")}
                            />

                            <label className="block text-sm font-bold mb-1" htmlFor="cycle">Ciclo Actual</label>
                            <input
                                id="cycle"
                                type="text"
                                value={cycle}
                                onChange={(e) => setCycle(e.target.value)}
                                placeholder="Ej: VI"
                                className={`w-full p-4 rounded-lg text-lg mb-4 focus:ring-4 focus:ring-blue-500 ${inputClass}`}
                                onFocus={() => speak("Campo Ciclo")}
                            />
                        </>
                    )}

                    <label className="block text-sm font-bold mb-1" htmlFor="email">Correo UCV</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="usuario@ucvvirtual.edu.pe"
                        className={`w-full p-4 rounded-lg text-lg mb-4 focus:outline-none focus:ring-4 focus:ring-blue-500 ${inputClass}`}
                        onFocus={() => speak("Campo de correo electrónico")}
                    />
                    
                    <label className="block text-sm font-bold mb-1" htmlFor="password">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full p-4 rounded-lg text-lg focus:outline-none focus:ring-4 focus:ring-blue-500 ${inputClass}`}
                        onFocus={() => speak("Campo de contraseña")}
                    />
                </div>
                
                <div aria-hidden="true" className="h-4"></div>

                <Button 
                    label={loading ? "Procesando..." : (isRegistering ? "Registrarme" : "Ingresar")} 
                    onClick={handleAction}
                    disabled={loading}
                    className="w-full"
                    icon={isRegistering ? "fa-user-plus" : "fa-sign-in-alt"}
                />

                <button 
                    onClick={toggleMode}
                    className="w-full text-center text-sm underline py-2 mt-4 hover:text-ucv-blue focus:text-ucv-blue"
                >
                    {isRegistering 
                        ? "¿Ya tienes cuenta? Inicia sesión aquí" 
                        : "¿No tienes cuenta? Regístrate aquí"}
                </button>

                {!isRegistering && (
                    <div className="flex justify-between gap-4 mt-8">
                        <Button 
                            label="Voz" 
                            variant="secondary" 
                            icon="fa-microphone"
                            className="flex-1"
                            onClick={() => speak("Escuchando credenciales...")}
                        />
                        <Button 
                            label="Huella" 
                            variant="secondary" 
                            icon="fa-fingerprint"
                            className="flex-1"
                            onClick={() => speak("Coloque su dedo en el sensor")}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};