import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getStudentCourses } from '../services/databaseService';
import { Course } from '../types';
import { Button } from '../components/Button';

export const CoursesView = () => {
    const { user, preferences, speak } = useApp();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourses = async () => {
            if (user?.id) {
                try {
                    const data = await getStudentCourses(user.id);
                    setCourses(data);
                    speak(`Se encontraron ${data.length} cursos asignados.`);
                } catch (error) {
                    console.error(error);
                    speak("Error al cargar los horarios.");
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchCourses();
    }, [user, speak]);

    const handleCourseClick = (course: Course) => {
        const text = `Curso: ${course.name}. Profesor: ${course.professor}. Horario: ${course.schedule}.`;
        speak(text);
    };

    const containerClass = preferences.highContrast 
        ? "bg-black text-yellow-300 border-2 border-yellow-300"
        : "bg-white text-gray-800 border-l-4 border-ucv-blue shadow-md";

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <i className={`fas fa-spinner fa-spin text-4xl mb-4 ${preferences.highContrast ? 'text-yellow-300' : 'text-ucv-blue'}`}></i>
                <p className="text-xl font-bold">Cargando horarios...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <header>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <i className="fas fa-calendar-alt"></i>
                    Mis Horarios
                </h2>
                <p className="opacity-80">Ciclo Académico Actual: {user?.cycle || '2025-I'}</p>
            </header>

            {courses.length === 0 ? (
                <div className="p-6 text-center border rounded-lg">
                    <p>No tienes cursos registrados en este momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {courses.map((course) => (
                        <div 
                            key={course.id}
                            onClick={() => handleCourseClick(course)}
                            className={`p-5 rounded-lg cursor-pointer transition-transform active:scale-95 ${containerClass}`}
                            tabIndex={0}
                            role="button"
                            aria-label={`Ver detalles de ${course.name}`}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleCourseClick(course);
                                }
                            }}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold leading-tight w-3/4">{course.name}</h3>
                                <i className="fas fa-volume-up opacity-50"></i>
                            </div>
                            
                            <div className="space-y-2 mt-3">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-clock w-5 text-center"></i>
                                    <span className="font-semibold">{course.schedule}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-chalkboard-teacher w-5 text-center"></i>
                                    <span>{course.professor}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-4">
                <Button 
                    label="Actualizar Lista" 
                    icon="fa-sync" 
                    variant="secondary"
                    onClick={() => {
                        setLoading(true);
                        setTimeout(() => setLoading(false), 1000);
                        speak("Actualizando lista de cursos");
                    }}
                    className="w-full"
                />
            </div>
        </div>
    );
};