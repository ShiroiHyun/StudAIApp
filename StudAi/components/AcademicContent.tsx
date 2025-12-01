import React, { useState } from 'react';
import { BookOpenIcon, DocumentTextIcon, SpeakerWaveIcon, XMarkIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Course, Material } from '../types';
import { AppController } from '../controllers/appController';

interface AcademicContentProps {
  courses: Course[];
  userId: string;
  onRefresh: () => void;
}

const AcademicContent: React.FC<AcademicContentProps> = ({ courses, userId, onRefresh }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [search, setSearch] = useState('');

  const handleSpeakMaterial = (content?: string) => {
    if (!content) return;
    AppController.speak(content);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName) return;
    await AppController.addCourse(userId, newCourseName);
    setNewCourseName('');
    setIsModalOpen(false);
    onRefresh();
  };

  const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-slate-900">Mis Cursos</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white p-2 rounded-xl shadow-md active:scale-95"
        >
            <PlusIcon className="w-6 h-6" />
        </button>
      </div>

      {/* RF-F22 Buscador */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
        <input 
            type="text" 
            placeholder="Buscar materia..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="grid gap-4">
        {filteredCourses.length > 0 ? filteredCourses.map(course => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 p-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl shrink-0">
                        <BookOpenIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-base text-slate-800 leading-tight">{course.name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{course.code} • {course.professor}</p>
                    </div>
                </div>
            </div>
            
            <div className="p-3">
                {course.materials.length > 0 ? (
                    <div className="space-y-2">
                        {course.materials.map(material => (
                            <div key={material.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl active:bg-slate-50">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <DocumentTextIcon className="w-5 h-5 shrink-0 text-slate-500" />
                                    <span className="text-slate-700 text-sm font-medium truncate">{material.title}</span>
                                </div>
                                <button onClick={() => setSelectedMaterial(material)} className="p-2 text-slate-600 bg-slate-100 rounded-lg text-xs font-bold">Ver</button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-slate-400 text-xs py-2">Sin materiales aún.</p>
                )}
            </div>
          </div>
        )) : (
            <p className="text-center text-slate-500 mt-10">No se encontraron cursos.</p>
        )}
      </div>

      {/* Add Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeIn">
                <h3 className="text-lg font-bold mb-4">Agregar Curso</h3>
                <form onSubmit={handleAddCourse}>
                    <input 
                        type="text" 
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="Nombre de la materia"
                        className="w-full border border-slate-300 rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
                        autoFocus
                    />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold">Cancelar</button>
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Reader Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-fadeIn">
            <div className="bg-slate-900 text-white p-4 pt-10 flex justify-between items-center shrink-0">
                <h3 className="font-bold truncate pr-4 text-sm">{selectedMaterial.title}</h3>
                <button onClick={() => setSelectedMaterial(null)} className="bg-white/20 p-1 rounded-full"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-white prose prose-lg max-w-none pb-24">
                <p className="text-slate-800 leading-8 whitespace-pre-line text-lg">{selectedMaterial.content || "Sin contenido."}</p>
            </div>
            <div className="bg-white border-t border-slate-200 p-4 pb-10">
                 <button onClick={() => handleSpeakMaterial(selectedMaterial.content)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <SpeakerWaveIcon className="w-5 h-5" /> Escuchar Todo
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AcademicContent;