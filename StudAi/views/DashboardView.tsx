import React from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';

export const DashboardView = () => {
    const { user, preferences } = useApp();
    const navigate = useNavigate();

    const cardClass = preferences.highContrast
        ? "bg-black border-2 border-white p-6 rounded-xl"
        : "bg-white shadow-lg p-6 rounded-xl border border-gray-100";

    return (
        <div className="space-y-6">
            <div className={cardClass}>
                <h2 className="text-2xl font-bold mb-2">Hola, {user?.name.split(' ')[0]}</h2>
                <p className="text-lg opacity-90">{user?.career} - Ciclo {user?.cycle}</p>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4">Acciones Rápidas</h3>
            
            <div className="grid grid-cols-1 gap-4">
                <Button 
                    label="Escanear Documento con IA" 
                    icon="fa-camera" 
                    onClick={() => navigate('/ocr')}
                    className="h-24 text-xl"
                />
                
                <Button 
                    label="Mis Horarios" 
                    icon="fa-calendar-alt" 
                    variant="secondary"
                    onClick={() => navigate('/courses')}
                    className="h-20"
                />

                <Button 
                    label="Navegación Campus" 
                    icon="fa-map-marker-alt" 
                    variant="danger"
                    onClick={() => navigate('/map')}
                    className="h-20"
                />
            </div>
        </div>
    );
};
