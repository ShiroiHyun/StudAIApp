import React, { useState } from 'react';
import { BookOpenIcon, DocumentTextIcon, SpeakerWaveIcon, FolderIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Course, Material } from '../types';

interface AcademicContentProps {
  courses: Course[];
}

const AcademicContent: React.FC<AcademicContentProps> = ({ courses }) => {
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  const handleSpeakMaterial = (content?: string) => {
    if (!content) {
      alert("Contenido no legible.");
      return;
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(content);
    u.lang = 'es-ES';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <h2 className="text-xl font-bold text-slate-900 mb-2">Mis Cursos</h2>

      <div className="grid gap-4">
        {courses.map(course => (
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
                <div className="space-y-2">
                    {course.materials.map(material => (
                        <div key={material.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl active:bg-slate-50">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <DocumentTextIcon className={`w-5 h-5 shrink-0 ${
                                    material.type === 'pdf' ? 'text-red-500' : 
                                    material.type === 'audio' ? 'text-purple-500' : 'text-slate-500'
                                }`} />
                                <div className="flex flex-col min-w-0">
                                    <span className="text-slate-700 text-sm font-medium truncate pr-2">{material.title}</span>
                                    <span className="text-[10px] text-slate-400 uppercase">{material.type}</span>
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <button 
                                    onClick={() => handleSpeakMaterial(material.content)}
                                    className="p-2 text-indigo-600 bg-indigo-50 rounded-lg"
                                >
                                    <SpeakerWaveIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setSelectedMaterial(material)}
                                    className="p-2 text-slate-600 bg-slate-100 rounded-lg font-bold text-xs flex items-center"
                                >
                                    Ver
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Viewer Full Screen */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-[70] bg-white flex flex-col animate-fadeIn">
            <div className="bg-slate-900 text-white p-4 pt-safe-top flex justify-between items-center shrink-0">
                <h3 className="font-bold truncate pr-4 text-sm">{selectedMaterial.title}</h3>
                <button onClick={() => setSelectedMaterial(null)} className="bg-white/20 p-1 rounded-full">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white prose prose-lg max-w-none pb-24">
                 {selectedMaterial.type === 'audio' ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-6 mt-10">
                        <div className="p-8 bg-indigo-50 rounded-full animate-pulse">
                             <SpeakerWaveIcon className="w-20 h-20 text-indigo-400" />
                        </div>
                        <p className="text-center font-medium">Reproduciendo audio...</p>
                    </div>
                ) : (
                    <p className="text-slate-800 leading-8 whitespace-pre-line text-lg">
                        {selectedMaterial.content || "Sin contenido."}
                    </p>
                )}
            </div>

            <div className="bg-white border-t border-slate-200 p-4 pb-safe-bottom">
                 <button 
                    onClick={() => handleSpeakMaterial(selectedMaterial.content)}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                    <SpeakerWaveIcon className="w-5 h-5" /> Escuchar Todo
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default AcademicContent;