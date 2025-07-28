import React, { useState, useEffect } from 'react';

export default function LessonFormModal({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [description, setDescription] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState(Array(5).fill(''));
  const [quizCorrect, setQuizCorrect] = useState(null);
  const [showYoutubePreview, setShowYoutubePreview] = useState(false);

  useEffect(() => {
    setTitle(initialData?.title || '');
    setYoutubeUrl(initialData?.youtubeUrl || '');
    setDescription(initialData?.description || '');
    setPdfUrl(initialData?.pdfUrl || '');
    setQuizQuestion(initialData?.quizQuestion || '');
    setQuizOptions(initialData?.quizOptions || Array(5).fill(''));
    setQuizCorrect(initialData?.quizCorrect ?? null);
  }, [initialData, isOpen]);

  const handleOptionChange = (idx, value) => {
    const newOptions = [...quizOptions];
    newOptions[idx] = value;
    setQuizOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      youtubeUrl,
      description,
      pdfUrl,
      quizQuestion,
      quizOptions,
      quizCorrect,
    });
    onClose();
  };

  if (!isOpen) return null;

  // Função para extrair o ID do vídeo do YouTube
  function getYoutubeId(url) {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]{11})/);
    return match ? match[1] : '';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-yellow-50 to-white">
      <form className="w-full h-full max-h-screen flex flex-col justify-center items-center" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-blue-600 text-center">{initialData ? 'Editar Aula' : 'Nova Aula'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="flex flex-col gap-4">
            <label className="block mb-1 font-semibold text-gray-700">Título da Aula</label>
            <input className="w-full border border-blue-200 rounded-xl px-3 py-2 text-base mb-1 focus:ring-2 focus:ring-blue-400" value={title} onChange={e => setTitle(e.target.value)} required />

            <label className="block mb-1 font-semibold text-gray-700">URL do YouTube</label>
            <div className="flex gap-2 mb-1">
              <input className="flex-1 border border-yellow-200 rounded-xl px-3 py-2 text-base" value={youtubeUrl} onChange={e => { setYoutubeUrl(e.target.value); setShowYoutubePreview(false); }} placeholder="https://youtube.com/watch?v=..." />
              <button type="button" className="bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-600 transition" onClick={() => setShowYoutubePreview(true)}>Verificar</button>
            </div>
            {showYoutubePreview && getYoutubeId(youtubeUrl) && (
              <div className="mb-2 rounded-xl overflow-hidden shadow-lg">
                <iframe className="w-full h-40" src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`} title="Prévia do vídeo" allowFullScreen />
              </div>
            )}

            <label className="block mb-1 font-semibold text-gray-700">Descrição</label>
            <textarea className="w-full border border-yellow-200 rounded-xl px-3 py-2 text-base mb-1 focus:ring-2 focus:ring-yellow-400" value={description} onChange={e => setDescription(e.target.value)} rows={3} />

            <label className="block mb-1 font-semibold text-gray-700">PDF da Aula (Google Drive)</label>
            <input className="w-full border border-blue-200 rounded-xl px-3 py-2 text-base mb-1" value={pdfUrl} onChange={e => setPdfUrl(e.target.value)} placeholder="https://drive.google.com/file/d/..." />
            {pdfUrl && (
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline mb-2 block">Ver PDF</a>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <label className="block mb-1 font-semibold text-gray-700">Quizz (1 pergunta, 5 alternativas)</label>
            <input className="w-full border border-yellow-200 rounded-xl px-3 py-2 text-base mb-1" value={quizQuestion} onChange={e => setQuizQuestion(e.target.value)} placeholder="Digite a pergunta do quizz" />
            <div className="flex flex-col gap-2">
              {quizOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-1">
                  <input
                    className="flex-1 border border-blue-200 rounded-xl px-3 py-2 text-base"
                    value={opt}
                    onChange={e => handleOptionChange(idx, e.target.value)}
                    placeholder={`Alternativa ${idx + 1}`}
                    required={quizQuestion}
                  />
                  <input
                    type="radio"
                    name="quizCorrect"
                    checked={quizCorrect === idx}
                    onChange={() => setQuizCorrect(idx)}
                    className="accent-blue-500"
                  />
                  <span className="text-xs text-blue-600 font-semibold">Correta</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 w-full">
          <button type="button" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold text-base hover:bg-gray-300 transition w-full sm:w-auto" onClick={onClose}>Cancelar</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-base hover:bg-blue-700 transition w-full sm:w-auto">Salvar Aula</button>
        </div>
      </form>
    </div>
  );
}
