import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import SectionEditor from './SectionEditor';
import LessonEditor from './LessonEditor';
import LessonFormModal from './LessonFormModal';

export default function CourseManager({ course, onUpdateCourse }) {
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState(course.sections[0]?.id || null);

  // Funções de manipulação de seções
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  function handleAddSection() {
    if (!newSectionTitle.trim()) return;
    const newSection = {
      id: uuidv4(),
      title: newSectionTitle,
      lessons: [],
    };
    const updatedCourse = {
      ...course,
      sections: [...course.sections, newSection],
    };
    onUpdateCourse(updatedCourse);
    setNewSectionTitle('');
    setShowSectionForm(false);
    setSelectedSectionId(newSection.id);
  }
  function handleEditSection(id) {
    // ...implementação de edição de seção...
  }
  function handleDeleteSection(id) {
    // ...implementação de exclusão de seção...
  }
  function handleReorderSections(result) {
    if (!result.destination) return;
    const reordered = Array.from(course.sections);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onUpdateCourse({ ...course, sections: reordered });
  }

  // Funções de manipulação de aulas
  function handleAddLesson() {
    setEditingLesson(null);
    setShowLessonModal(true);
  }

  function handleSaveLesson(lessonData) {
    if (!selectedSectionId) return;
    const newLesson = {
      id: uuidv4(),
      ...lessonData,
      type: 'video',
    };
    const updatedSections = course.sections.map(section => {
      if (section.id === selectedSectionId) {
        return {
          ...section,
          lessons: [...section.lessons, newLesson],
        };
      }
      return section;
    });
    onUpdateCourse({ ...course, sections: updatedSections });
    setShowLessonModal(false);
  }
  function handleEditLesson(id) {
    if (!selectedSectionId) return;
    const sectionIdx = course.sections.findIndex(s => s.id === selectedSectionId);
    if (sectionIdx === -1) return;
    const lessonIdx = course.sections[sectionIdx].lessons.findIndex(l => l.id === id);
    if (lessonIdx === -1) return;
    const lessonData = course.sections[sectionIdx].lessons[lessonIdx];
    setEditingLesson({ ...lessonData, idx: lessonIdx });
    setShowLessonModal(true);
  }

  function handleUpdateLesson(lessonData) {
    if (!selectedSectionId || editingLesson == null) return;
    const sectionIdx = course.sections.findIndex(s => s.id === selectedSectionId);
    if (sectionIdx === -1) return;
    const updatedSections = course.sections.map((section, sIdx) => {
      if (sIdx === sectionIdx) {
        return {
          ...section,
          lessons: section.lessons.map((lesson, lIdx) =>
            lIdx === editingLesson.idx ? { ...lesson, ...lessonData } : lesson
          ),
        };
      }
      return section;
    });
    onUpdateCourse({ ...course, sections: updatedSections });
    setShowLessonModal(false);
    setEditingLesson(null);
  }
  function handleDeleteLesson(id) {
    if (!selectedSectionId) return;
    if (!window.confirm('Tem certeza que deseja excluir esta aula?')) return;
    const updatedSections = course.sections.map(section => {
      if (section.id === selectedSectionId) {
        return {
          ...section,
          lessons: section.lessons.filter(lesson => lesson.id !== id),
        };
      }
      return section;
    });
    onUpdateCourse({ ...course, sections: updatedSections });
  }
  function handleReorderLessons(result) {
    if (!result.destination) return;
    const sectionIdx = course.sections.findIndex(s => s.id === selectedSectionId);
    if (sectionIdx === -1) return;
    const lessons = Array.from(course.sections[sectionIdx].lessons);
    const [removed] = lessons.splice(result.source.index, 1);
    lessons.splice(result.destination.index, 0, removed);
    const updatedSections = course.sections.map((section, idx) =>
      idx === sectionIdx ? { ...section, lessons } : section
    );
    onUpdateCourse({ ...course, sections: updatedSections });
  }

  // Seleciona as aulas da seção ativa
  const activeSection = course.sections.find(s => s.id === selectedSectionId) || { lessons: [] };

  return (
    <DragDropContext
      onDragEnd={result => {
        if (result.type === 'SECTION') {
          handleReorderSections(result);
        } else if (result.type === 'LESSON') {
          handleReorderLessons(result);
        }
      }}
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Painel lateral de seções */}
        <aside className="md:w-1/3 w-full bg-white rounded-2xl shadow-2xl p-8 sticky top-8 h-fit border border-blue-100">
          <h3 className="text-2xl font-bold text-blue-600 mb-6 font-inter-bold">Módulos do Curso</h3>
          <Droppable droppableId="sections-droppable" type="SECTION">
            {(provided) => (
              <ul className="space-y-2" ref={provided.innerRef} {...provided.droppableProps}>
                {course.sections.map((section, idx) => (
                  <Draggable key={section.id} draggableId={section.id} index={idx}>
                    {(dragProvided) => (
                      <li ref={dragProvided.innerRef} {...dragProvided.draggableProps} className="flex items-center">
                        <span className="cursor-move text-gray-400 mr-2" title="Arrastar para reordenar" {...dragProvided.dragHandleProps}>↕</span>
                        <button
                          className={`w-full text-left px-4 py-3 rounded-xl font-inter-medium transition-colors flex items-center gap-2 border ${selectedSectionId === section.id ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-lg' : 'hover:bg-gray-50 text-gray-700 border-gray-200'}`}
                          onClick={() => setSelectedSectionId(section.id)}
                        >
                          <span className="font-bold">{section.title}</span>
                          <span className="ml-auto text-xs text-gray-400">{section.lessons.length} aulas</span>
                        </button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
          {showSectionForm ? (
            <div className="mt-6">
              <input
                type="text"
                value={newSectionTitle}
                onChange={e => setNewSectionTitle(e.target.value)}
                placeholder="Título do módulo"
                className="w-full border-2 border-blue-200 rounded-xl px-4 py-2 text-lg mb-2"
              />
              <div className="flex gap-2">
                <button onClick={handleAddSection} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition">Salvar Módulo</button>
                <button onClick={() => { setShowSectionForm(false); setNewSectionTitle(''); }} className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition">Cancelar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowSectionForm(true)} className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow hover:bg-blue-700 transition">+ Novo Módulo</button>
          )}
        </aside>
        {/* Editor de aulas */}
        <main className="flex-1">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-yellow-100">
            <h3 className="text-2xl font-bold text-yellow-600 mb-6 font-inter-bold">Aulas do Módulo</h3>
            <Droppable droppableId="lessons-droppable" type="LESSON">
              {(provided) => (
                <ul className="space-y-4" ref={provided.innerRef} {...provided.droppableProps}>
                  {activeSection.lessons.map((lesson, idx) => (
                    <Draggable key={lesson.id} draggableId={lesson.id} index={idx}>
                      {(dragProvided) => (
                        <li ref={dragProvided.innerRef} {...dragProvided.draggableProps} className="flex items-center justify-between bg-yellow-50 rounded-xl p-5 shadow border border-yellow-200">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-lg font-inter-bold">{lesson.title}</span>
                            {lesson.aoVivo && (
                              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold align-middle">AO VIVO</span>
                            )}
                            <span className="ml-2 text-xs text-yellow-700 font-inter-medium">({lesson.type})</span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition" onClick={() => handleEditLesson(lesson.id)}>Editar</button>
                            <button className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-red-200 transition" onClick={() => handleDeleteLesson(lesson.id)}>Excluir</button>
                            <span className="cursor-move text-gray-400 ml-2" title="Arrastar para reordenar" {...dragProvided.dragHandleProps}>↕</span>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          <button className="mt-8 w-full bg-yellow-400 text-blue-900 py-3 rounded-xl font-bold shadow hover:bg-yellow-500 transition" onClick={handleAddLesson}>+ Nova Aula</button>
          <LessonFormModal
            isOpen={showLessonModal}
            onClose={() => { setShowLessonModal(false); setEditingLesson(null); }}
            onSave={editingLesson ? handleUpdateLesson : handleSaveLesson}
            initialData={editingLesson}
          />
          </div>
        </main>
      </div>
    </DragDropContext>
  );
}
