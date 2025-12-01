import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCampusLocations } from '../services/databaseService';
import { CampusLocation } from '../types';
import { Button } from '../components/Button';

export const NavigationView = () => {
    const { speak, stopSpeak, preferences } = useApp();
    const [locations, setLocations] = useState<CampusLocation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<CampusLocation | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await getCampusLocations();
            setLocations(data);
        };
        load();
    }, []);

    const handleSelect = (loc: CampusLocation) => {
        setSelectedLocation(loc);
        speak(`Seleccionaste ${loc.name}. ${loc.description}. Pulsa Iniciar Navegación para comenzar.`);
        setIsNavigating(false);
        setCurrentStep(0);
    };

    const startNavigation = () => {
        if (!selectedLocation) return;
        setIsNavigating(true);
        setCurrentStep(0);
        speak(`Iniciando ruta a ${selectedLocation.name}. Paso 1: ${selectedLocation.stepsFromEntrance[0]}`);
    };

    const nextStep = () => {
        if (!selectedLocation) return;
        if (currentStep < selectedLocation.stepsFromEntrance.length - 1) {
            const next = currentStep + 1;
            setCurrentStep(next);
            speak(`Paso ${next + 1}: ${selectedLocation.stepsFromEntrance[next]}`);
        } else {
            speak("Has llegado a tu destino.");
        }
    };

    const prevStep = () => {
        if (!selectedLocation) return;
        if (currentStep > 0) {
            const prev = currentStep - 1;
            setCurrentStep(prev);
            speak(`Paso ${prev + 1}: ${selectedLocation.stepsFromEntrance[prev]}`);
        }
    };

    const containerClass = preferences.highContrast 
        ? "bg-black border-2 border-yellow-300 text-yellow-300" 
        : "bg-white border border-gray-200 shadow-md text-gray-800";

    const activeItemClass = preferences.highContrast
        ? "bg-yellow-900 border-yellow-300"
        : "bg-blue-50 border-ucv-blue";

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <i className="fas fa-map-marked-alt"></i>
                    Navegación Campus
                </h2>
                <p className="opacity-80">Guía paso a paso por voz.</p>
            </header>

            {!isNavigating ? (
                // MODO SELECCIÓN
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">Puntos de Interés</h3>
                    <div className="grid grid-cols-1 gap-3">
                        {locations.map(loc => (
                            <button
                                key={loc.id}
                                onClick={() => handleSelect(loc)}
                                className={`p-4 rounded-lg text-left transition-all ${containerClass} ${selectedLocation?.id === loc.id ? `border-l-8 ${activeItemClass}` : ''}`}
                            >
                                <div className="font-bold text-lg">{loc.name}</div>
                                <div className="text-sm opacity-80">{loc.category.toUpperCase()}</div>
                            </button>
                        ))}
                    </div>

                    {selectedLocation && (
                        <div className="fixed bottom-20 left-4 right-4 z-10">
                            <Button 
                                label="Iniciar Ruta" 
                                icon="fa-walking" 
                                onClick={startNavigation}
                                className="w-full py-4 text-xl shadow-2xl"
                            />
                        </div>
                    )}
                </div>
            ) : (
                // MODO NAVEGACIÓN ACTIVA
                <div className="flex flex-col h-[60vh] justify-between">
                    <div className={`p-6 rounded-xl text-center flex-1 flex flex-col justify-center items-center ${containerClass}`}>
                        <h3 className="text-xl opacity-70 mb-4">Hacia: {selectedLocation?.name}</h3>
                        
                        <div className="text-3xl font-bold mb-6">
                            Paso {currentStep + 1} de {selectedLocation?.stepsFromEntrance.length}
                        </div>
                        
                        <p className="text-2xl font-medium mb-8">
                            "{selectedLocation?.stepsFromEntrance[currentStep]}"
                        </p>

                        <div className="flex gap-4 w-full">
                            <Button 
                                label="Repetir" 
                                icon="fa-redo" 
                                variant="secondary" 
                                onClick={() => speak(selectedLocation?.stepsFromEntrance[currentStep] || '')}
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                         <Button 
                            label="Anterior" 
                            icon="fa-arrow-left" 
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            variant="secondary"
                            className="flex-1 py-6"
                        />
                        <Button 
                            label={currentStep === (selectedLocation?.stepsFromEntrance.length || 0) - 1 ? "Finalizar" : "Siguiente"} 
                            icon={currentStep === (selectedLocation?.stepsFromEntrance.length || 0) - 1 ? "fa-flag-checkered" : "fa-arrow-right"} 
                            onClick={() => {
                                if (currentStep === (selectedLocation?.stepsFromEntrance.length || 0) - 1) {
                                    setIsNavigating(false);
                                    speak("Navegación finalizada.");
                                } else {
                                    nextStep();
                                }
                            }}
                            className="flex-1 py-6 text-xl"
                        />
                    </div>
                    
                    <button 
                        onClick={() => setIsNavigating(false)}
                        className="text-center mt-4 underline opacity-70"
                    >
                        Cancelar navegación
                    </button>
                </div>
            )}
        </div>
    );
};