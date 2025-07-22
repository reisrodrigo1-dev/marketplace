import React, { useState } from 'react';

const ManualDebateModal = ({ onClose, onStartDebate }) => {
  const [newsText, setNewsText] = useState('');

  const handleStart = () => {
    if (newsText.trim()) {
      onStartDebate(newsText);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Iniciar Debate Jurídico</h2>
        <label className="block mb-2 font-medium">Cole ou digite o texto da notícia:</label>
        <textarea
          className="w-full h-32 p-2 border rounded mb-4"
          value={newsText}
          onChange={e => setNewsText(e.target.value)}
          placeholder="Digite o texto da notícia aqui..."
        />
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleStart}
            disabled={!newsText.trim()}
          >
            Iniciar Debate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualDebateModal;
