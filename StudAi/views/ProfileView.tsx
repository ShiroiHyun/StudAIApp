import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../services/databaseService';

export const ProfileView = () => {
    const { user, preferences, updatePreferences, speak, setUser } = useApp();
    const navigate = useNavigate();

    // Estado para edición
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        career: user?.career || '',
        cycle: user?.cycle || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleLogout = () => {
        setUser(null);
        navigate('/login');
        speak("Sesión cerrada");
    };

    const toggleContrast = () => {
        const newVal = !preferences.highContrast;
        updatePreferences({ highContrast: newVal });
        speak(newVal ? "Alto contraste activado" : "Alto contraste desactivado");
    };

    const changeSize = () => {
        const sizes: ('normal' | 'large' | 'extra-large')[] = ['normal', 'large', 'extra-large'];
        const currentIndex = sizes.indexOf(preferences.fontSize);
        const nextIndex = (currentIndex + 1) % sizes.length;
        updatePreferences({ fontSize: sizes[nextIndex] });
        speak(`Tamaño de letra: ${sizes[nextIndex]}`);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSaving(true);
        speak("Guardando cambios en el perfil...");
        
        try {
            // 1. Actualizar en Base de Datos (Firebase/Mock)
            await updateUserProfile(user.id, editForm);
            
            // 2. Actualizar Estado Global
            setUser({ ...user, ...editForm });
            
            setIsEditing(false);
            speak("Perfil actualizado correctamente.");
        } catch (error) {
            console.error(error);
            speak("Error al guardar cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = preferences.highContrast 
        ? "bg-gray-900 border-yellow-300 text-yellow-300 w-full p-2 rounded"
        : "bg-white border-gray-300 text-gray-900 w-full p-2 border rounded";

    return (
        <div className="space-y-8 pb-20">
            {/* Header del Perfil */}
            <div className="flex flex-col items-center gap-4 text-center">
                <img 
                    src={user?.photoUrl || "https://picsum.photos/200"} 
                    alt="Foto de perfil" 
                    className="w-24 h-24 rounded-full border-4 border-ucv-blue"
                />
                
                {isEditing ? (
                    <div className="w-full space-y-3">
                         <div className="text-left">
                            <label className="text-sm font-bold">Nombre</label>
                            <input 
                                type="text" 
                                value={editForm.name}
                                onChange={e => setEditForm({...editForm, name: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                        <div className="text-left">
                            <label className="text-sm font-bold">Carrera</label>
                            <input 
                                type="text" 
                                value={editForm.career}
                                onChange={e => setEditForm({...editForm, career: e.target.value})}
                                className={inputClass}
                            />
                        </div>
                        <div className="text-left">
                            <label className="text-sm font-bold">Ciclo</label>
                            <input 
                                type="text" 
                                value={editForm.cycle}
                                onChange={e => setEditForm({...editForm, cycle: e.target.value})}
                                className={inputClass}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                             <Button 
                                label="Cancelar" 
                                variant="danger" 
                                onClick={() => { setIsEditing(false); speak("Edición cancelada"); }}
                                className="flex-1 py-2"
                            />
                            <Button 
                                label={isSaving ? "Guardando..." : "Guardar"} 
                                variant="primary" 
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="flex-1 py-2"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <h2 className="text-2xl font-bold">{user?.name}</h2>
                            <p className="opacity-80">{user?.email}</p>
                        </div>
                        <div className="bg-opacity-10 bg-gray-500 p-4 rounded-lg w-full">
                            <p className="font-semibold">{user?.career}</p>
                            <p>Ciclo: {user?.cycle}</p>
                        </div>
                        <Button 
                            label="Editar Perfil" 
                            icon="fa-edit"
                            variant="secondary"
                            onClick={() => {
                                setEditForm({
                                    name: user?.name || '',
                                    career: user?.career || '',
                                    cycle: user?.cycle || ''
                                });
                                setIsEditing(true);
                                speak("Modo edición de perfil activado");
                            }}
                            className="py-2 text-sm"
                        />
                    </>
                )}
            </div>

            <section>
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Preferencias de Accesibilidad</h3>
                
                <div className="space-y-4">
                    <Button 
                        label={`Alto Contraste: ${preferences.highContrast ? 'ON' : 'OFF'}`}
                        icon="fa-adjust"
                        variant="secondary"
                        onClick={toggleContrast}
                        className="w-full justify-start"
                    />

                    <Button 
                        label={`Tamaño Texto: ${preferences.fontSize === 'normal' ? 'Normal' : preferences.fontSize === 'large' ? 'Grande' : 'Muy Grande'}`}
                        icon="fa-text-height"
                        variant="secondary"
                        onClick={changeSize}
                        className="w-full justify-start"
                    />

                    <div className={`flex items-center gap-4 p-4 border rounded-lg ${preferences.highContrast ? 'border-yellow-300' : 'border-gray-300'}`}>
                        <i className="fas fa-tachometer-alt text-xl"></i>
                        <div className="flex-1">
                            <label htmlFor="speed" className="block font-bold mb-1">Velocidad de Voz</label>
                            <input 
                                id="speed"
                                type="range" 
                                min="0.5" 
                                max="2" 
                                step="0.1"
                                value={preferences.ttsSpeed}
                                onChange={(e) => updatePreferences({ ttsSpeed: parseFloat(e.target.value) })}
                                className="w-full h-4 rounded-lg appearance-none cursor-pointer bg-gray-300"
                                aria-label={`Velocidad de voz ${preferences.ttsSpeed}x`}
                            />
                        </div>
                        <span className="font-bold text-xl">{preferences.ttsSpeed}x</span>
                    </div>
                </div>
            </section>

            <Button 
                label="Cerrar Sesión" 
                variant="danger" 
                icon="fa-sign-out-alt" 
                onClick={handleLogout}
                className="w-full mt-8"
            />
        </div>
    );
};