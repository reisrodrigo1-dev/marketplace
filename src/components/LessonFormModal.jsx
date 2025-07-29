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
  // Estado para aula ao vivo
  const [aoVivo, setAoVivo] = useState(false);
  const [dataAoVivo, setDataAoVivo] = useState('');
  const [horaAoVivo, setHoraAoVivo] = useState('');

  useEffect(() => {
    setTitle(initialData?.title || '');
    setYoutubeUrl(initialData?.youtubeUrl || '');
    setDescription(initialData?.description || '');
    setPdfUrl(initialData?.pdfUrl || '');
    setQuizQuestion(initialData?.quizQuestion || '');
    setQuizOptions(initialData?.quizOptions || Array(5).fill(''));
    setQuizCorrect(initialData?.quizCorrect ?? null);
    setAoVivo(initialData?.aoVivo || false);
    setDataAoVivo(initialData?.dataAoVivo || '');
    setHoraAoVivo(initialData?.horaAoVivo || '');
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
      aoVivo,
      dataAoVivo,
      horaAoVivo,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                {initialData ? '✏️ Editar Aula' : '✨ Nova Aula'}
                {aoVivo && (
                  <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold align-middle">AO VIVO</span>
                )}
              </h2>
              <p className="text-blue-100">
                {initialData ? 'Atualize o conteúdo da sua aula' : 'Crie uma nova experiência de aprendizado'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna Esquerda - Informações Básicas */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">1</span>
                  Informações Básicas
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Título da Aula *
                    </label>
                    <input
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ex: Introdução ao Direito Empresarial"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Descrição da Aula
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 resize-none"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Descreva o que será abordado nesta aula..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">2</span>
                  Conteúdo em Vídeo
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      URL do YouTube
                    </label>
                    <div className="flex gap-3">
                      <input
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400"
                        value={youtubeUrl}
                        onChange={e => { setYoutubeUrl(e.target.value); setShowYoutubePreview(false); }}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                      <button
                        type="button"
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
                        onClick={() => setShowYoutubePreview(true)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Verificar
                      </button>
                    </div>
                    {showYoutubePreview && getYoutubeId(youtubeUrl) && (
                      <div className="mt-4 rounded-xl overflow-hidden shadow-lg">
                        <iframe
                          className="w-full h-48"
                          src={`https://www.youtube.com/embed/${getYoutubeId(youtubeUrl)}`}
                          title="Prévia do vídeo"
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">3</span>
                  Material Complementar
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    PDF da Aula (Google Drive)
                  </label>
                  <input
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400"
                    value={pdfUrl}
                    onChange={e => setPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                  />
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 underline mt-2 text-sm font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Visualizar PDF
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Coluna Direita - Quiz */}
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">4</span>
                  Quiz de Fixação
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Pergunta do Quiz
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 resize-none"
                      value={quizQuestion}
                      onChange={e => setQuizQuestion(e.target.value)}
                      rows={3}
                      placeholder="Digite uma pergunta para testar o conhecimento dos alunos..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-800">
                      Alternativas (5 opções)
                    </label>
                    {quizOptions.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400"
                            value={opt}
                            onChange={e => handleOptionChange(idx, e.target.value)}
                            placeholder={`Alternativa ${String.fromCharCode(65 + idx)} - Digite uma opção`}
                            required={quizQuestion}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="quizCorrect"
                            id={`option-${idx}`}
                            checked={quizCorrect === idx}
                            onChange={() => setQuizCorrect(idx)}
                            className="w-5 h-5 text-purple-500 focus:ring-purple-500 focus:ring-2"
                          />
                          <label htmlFor={`option-${idx}`} className="text-sm font-medium text-purple-600">
                            Correta
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  {quizQuestion && quizCorrect === null && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Selecione qual alternativa é a correta
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Aula ao vivo */}
          <div>
            <label className="block text-sm font-semibold text-blue-700 mb-2">Aula ao vivo</label>
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="aoVivo" checked={aoVivo} onChange={e => setAoVivo(e.target.checked)} />
              <label htmlFor="aoVivo" className="font-semibold text-blue-700">Esta aula será ao vivo</label>
            </div>
            {aoVivo && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Data da Aula ao Vivo</label>
                  <input type="date" value={dataAoVivo} onChange={e => setDataAoVivo(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Hora da Aula ao Vivo</label>
                  <input type="time" value={horaAoVivo} onChange={e => setHoraAoVivo(e.target.value)} className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl" />
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {initialData ? 'Atualizar Aula' : 'Criar Aula'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
