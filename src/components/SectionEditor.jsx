import React from 'react';

export default function SectionEditor({ sections, onAddSection, onEditSection, onDeleteSection, onReorderSections }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-blue-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-600 font-inter-bold">Módulos do Curso</h3>
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition"
          onClick={onAddSection}
        >+ Novo Módulo</button>
      </div>
      <ul className="space-y-4">
        {sections.map((section, idx) => (
          <li key={section.id} className="flex items-center justify-between bg-blue-50 rounded-xl p-5 shadow border border-blue-200">
            <span className="font-bold text-blue-900 text-lg font-inter-bold">{section.title}</span>
            <div className="flex gap-2 items-center">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition" onClick={() => onEditSection(section.id)}>Editar</button>
              <button className="bg-red-100 text-red-700 px-4 py-2 rounded-xl font-bold shadow hover:bg-red-200 transition" onClick={() => onDeleteSection(section.id)}>Excluir</button>
              {/* Drag handle para reordenação (drag and drop será implementado) */}
              <span className="cursor-move text-gray-400 ml-2" title="Arrastar para reordenar">↕</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
