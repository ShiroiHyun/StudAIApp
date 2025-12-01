import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { OCRView } from './views/OCRView';
import { ProfileView } from './views/ProfileView';
import { CoursesView } from './views/CoursesView';
import { NavigationView } from './views/NavigationView';
import { VoiceController } from './components/VoiceController'; // Importar Controlador de Voz

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const { user } = useApp();
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
    return (
        <>
            {/* El controlador de voz debe estar dentro del Router para poder navegar */}
            <VoiceController /> 
            
            <Routes>
                <Route path="/login" element={<LoginView />} />
                
                <Route path="/" element={
                    <ProtectedRoute>
                        <DashboardView />
                    </ProtectedRoute>
                } />
                
                <Route path="/ocr" element={
                    <ProtectedRoute>
                        <OCRView />
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfileView />
                    </ProtectedRoute>
                } />

                <Route path="/courses" element={
                    <ProtectedRoute>
                        <CoursesView />
                    </ProtectedRoute>
                } />

                <Route path="/map" element={
                    <ProtectedRoute>
                        <NavigationView />
                    </ProtectedRoute>
                } />
            </Routes>
        </>
    );
};

export default function App() {
    return (
        <AppProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </AppProvider>
    );
}