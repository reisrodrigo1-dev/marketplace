import React from 'react';

export default function LessonEditor({ lessons, onAddLesson, onEditLesson, onDeleteLesson, onReorderLessons }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-yellow-600">Aulas da Seção</h3>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          onClick={onAddLesson}
        >Adicionar Aula</button>
      </div>
      <ul className="space-y-2">
        {lessons.map((lesson, idx) => (
          <li key={lesson.id} className="flex items-center justify-between bg-gray-50 rounded p-2">
            <span className="font-medium text-gray-800">{lesson.title} <span className="text-xs text-gray-500">({lesson.type})</span></span>
            <div className="flex gap-2">
              <button className="text-blue-500 hover:underline" onClick={() => onEditLesson(lesson.id)}>Editar</button>
              <button className="text-red-500 hover:underline" onClick={() => onDeleteLesson(lesson.id)}>Excluir</button>
              {/* Drag handle para reordenação (drag and drop será implementado) */}
              <span className="cursor-move text-gray-400" title="Arrastar para reordenar">↕</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
