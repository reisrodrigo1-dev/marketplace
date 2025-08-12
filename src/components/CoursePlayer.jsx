import React, { useState, useEffect, useRef } from 'react';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import { notesService } from '../firebase/notesService';
import { progressoService } from '../firebase/progressoService';

// CoursePlayer: Player moderno inspirado no Hotmart/Alura
const CoursePlayer = ({ course, onBack }) => {
  // ...existing code...
  // DEBUG: loga o objeto completo do curso recebido
  // eslint-disable-next-line no-console
  console.log('DEBUG: Objeto completo do curso recebido pelo CoursePlayer:', course);
  const { aluno } = useAlunoAuth();
  const [showSidebar, setShowSidebar] = useState(true);
  const [notes, setNotes] = useState('');
  const [loadingNote, setLoadingNote] = useState(false);
  const saveTimeout = useRef(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showMaterials, setShowMaterials] = useState(false);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  if (!course) return null;
  // Suporte a ambas as estruturas: modulos/aulas (antigo) e sections/lessons (novo)
  const modules = course.modulos || course.sections || [];
  // Prioriza modulos/aulas para garantir que os campos estejam presentes
  const getLessons = (mod) => Array.isArray(mod.aulas) ? mod.aulas : (Array.isArray(mod.lessons) ? mod.lessons : []);
  const currentModule = modules[selectedModuleIdx] || {};
  const lessons = getLessons(currentModule);
  const currentLesson = lessons[selectedLessonIdx] || {};
  // DEBUG: loga o objeto completo da aula atual
  // eslint-disable-next-line no-console
  console.log('DEBUG: currentLesson recebido pelo CoursePlayer:', currentLesson);
  // Fallback para nomes alternativos dos campos de data/hora ao vivo
  const dataAoVivo = currentLesson.dataAoVivo || currentLesson.data_aovivo || currentLesson.data_ao_vivo || currentLesson.dataaovivo || '';
  const horaAoVivo = currentLesson.horaAoVivo || currentLesson.hora_aovivo || currentLesson.hora_ao_vivo || currentLesson.horaaovivo || '';
  const totalLessons = modules.reduce((acc, m) => acc + getLessons(m).length, 0);
  const allLessonIds = modules.flatMap(m => getLessons(m).map(a => a.id));
  const uniqueCompleted = Array.from(new Set(completedLessons)).filter(id => allLessonIds.includes(id));
  const completedCount = uniqueCompleted.length;
  const courseProgress = totalLessons ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

  // Loga nome e status ao vivo da aula ao entrar no curso ou trocar de aula
  useEffect(() => {
    if (lessons && lessons[selectedLessonIdx]) {
      const l = lessons[selectedLessonIdx];
      // eslint-disable-next-line no-console
      console.log('Aula objeto completo:', l);
      console.log(`Aula: ${l.title || l.titulo} | AO VIVO: ${!!(l.aoVivo === true || l.aoVivo === 'true')}`);
    }
  }, [selectedLessonIdx, lessons]);

  // Encontrar próxima aula
  const getNextLesson = () => {
    if (selectedLessonIdx < lessons.length - 1) {
      return { moduleIdx: selectedModuleIdx, lessonIdx: selectedLessonIdx + 1 };
    }
    if (selectedModuleIdx < modules.length - 1) {
      return { moduleIdx: selectedModuleIdx + 1, lessonIdx: 0 };
    }
    return null;
  };

  const getPrevLesson = () => {
    if (selectedLessonIdx > 0) {
      return { moduleIdx: selectedModuleIdx, lessonIdx: selectedLessonIdx - 1 };
    }
    if (selectedModuleIdx > 0) {
      const prevModule = modules[selectedModuleIdx - 1];
      return { moduleIdx: selectedModuleIdx - 1, lessonIdx: (prevModule.aulas?.length || 1) - 1 };
    }
    return null;
  };

  // Carrega anotação ao trocar de aula
  useEffect(() => {
    if (!aluno || !course?.id || !lessons[selectedLessonIdx]?.id) {
      setNotes('');
      return;
    }
    setLoadingNote(true);
    notesService.getNote({
      alunoId: aluno.uid,
      cursoId: course.id,
      aulaId: lessons[selectedLessonIdx].id
    }).then(res => {
      setNotes(res.success ? res.nota : '');
      setLoadingNote(false);
    });
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [aluno, course?.id, selectedLessonIdx, lessons]);

  // Salva anotação com debounce
  useEffect(() => {
    if (!aluno || !course?.id || !lessons[selectedLessonIdx]?.id) return;
    if (loadingNote) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      notesService.saveNote({
        alunoId: aluno.uid,
        cursoId: course.id,
        aulaId: lessons[selectedLessonIdx].id,
        nota: notes
      });
    }, 800);
  }, [notes]);

  // Marca aula como concluída ao trocar de aula
  useEffect(() => {
    const id = lessons[selectedLessonIdx]?.id;
    if (id) {
      setCompletedLessons(prev => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    }
  }, [selectedLessonIdx, lessons]);

  // Sincroniza progresso com Firestore
  useEffect(() => {
    if (!aluno || !course?.id) return;
    progressoService.getProgresso({ alunoId: aluno.uid, cursoId: course.id }).then(res => {
      if (res.success && Array.isArray(res.aulasConcluidas)) {
        setCompletedLessons(res.aulasConcluidas);
      }
    });
  }, [aluno, course?.id]);

  // Controla a exibição do modal de conclusão
  useEffect(() => {
    if (completedCount === totalLessons && totalLessons > 0) {
      setShowCompletionModal(true);
    }
  }, [completedCount, totalLessons]);

  // Salva progresso ao marcar aula como concluída
  useEffect(() => {
    if (!aluno || !course?.id) return;
    progressoService.saveProgresso({
      alunoId: aluno.uid,
      cursoId: course.id,
      aulasConcluidas: Array.from(new Set(completedLessons))
    });
  }, [completedLessons]);

  const nextLesson = getNextLesson();
  const prevLesson = getPrevLesson();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo no topo */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs md:max-w-md">
              {course.titulo}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Progresso */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-gray-600">Progresso</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">{courseProgress}%</span>
            </div>
            
            {/* Toggle sidebar */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar com conteúdo do curso */}
        <aside className={`${showSidebar ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col`}>
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Conteúdo do Curso</h2>
            <div className="text-sm text-gray-600">
              {completedCount} de {totalLessons} aulas concluídas
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {modules.map((module, mIdx) => (
              <div key={module.id || mIdx} className="border-b border-gray-100">
                <button
                  onClick={() => {
                    setSelectedModuleIdx(mIdx);
                    setSelectedLessonIdx(0);
                  }}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    mIdx === selectedModuleIdx ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        mIdx === selectedModuleIdx 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {mIdx + 1}
                      </div>
                      <span className="font-medium text-gray-900">{module.titulo}</span>
                    </div>
                    <svg 
                      className={`w-4 h-4 text-gray-400 transition-transform ${
                        mIdx === selectedModuleIdx ? 'rotate-90' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                
                {mIdx === selectedModuleIdx && (
                  <div className="bg-gray-50">
                    {(module.aulas || module.lessons || []).map((lesson, lIdx) => (
                      <button
                        key={lesson.id || lIdx}
                        onClick={() => {
                          setSelectedModuleIdx(mIdx);
                          setSelectedLessonIdx(lIdx);
                        }}
                        className={`w-full px-6 py-3 text-left hover:bg-gray-100 transition-colors flex items-center gap-3 ${
                          mIdx === selectedModuleIdx && lIdx === selectedLessonIdx
                            ? 'bg-blue-100 border-r-2 border-blue-500'
                            : ''
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          completedLessons.includes(lesson.id)
                            ? 'bg-green-500'
                            : mIdx === selectedModuleIdx && lIdx === selectedLessonIdx
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}>
                          {completedLessons.includes(lesson.id) ? (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 5v10l8-5-8-5z" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${
                          mIdx === selectedModuleIdx && lIdx === selectedLessonIdx
                            ? 'text-blue-900 font-medium'
                            : 'text-gray-700'
                        }`}>
                          {lesson.title || lesson.titulo}
                          {(lesson.aoVivo === true || lesson.aoVivo === 'true' || String(lesson.title || lesson.titulo).startsWith('AO VIVO')) ? (
                            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold align-middle">AO VIVO
                              {(lesson.dataAoVivo || lesson.horaAoVivo) && (
                                <span className="ml-1 font-normal text-white">
                                  {lesson.dataAoVivo && <span>{new Date(lesson.dataAoVivo).toLocaleDateString('pt-BR')}</span>}
                                  {lesson.horaAoVivo && <span> {lesson.horaAoVivo.slice(0,5)}</span>}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="ml-2 px-2 py-0.5 bg-gray-300 text-gray-700 text-[10px] rounded-full font-bold align-middle">Gravada</span>
                          )}
                        </span>
                        {completedLessons.includes(lesson.id) && (
                          <span className="ml-auto text-xs text-green-600 font-medium">Concluída</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Área principal do player */}
        <main className="flex-1 flex flex-col bg-gray-900">
          {/* Video player */}
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl">
              {currentLesson.videoUrl ? (
                <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.titulo}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full aspect-video"
                    style={{ minHeight: '400px' }}
                  />
                  {/* Controles overlay */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-75 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
                    </svg>
                    <p className="text-lg">Vídeo não disponível</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informações da aula e controles */}
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-5xl mx-auto p-6">
              {/* Título e descrição da aula */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Módulo {selectedModuleIdx + 1}
                  </span>
                  <span className="text-sm text-gray-500">
                    Aula {selectedLessonIdx + 1} de {lessons.length}
                  </span>
                </div>
                {/* --- Área principal: data/hora da aula ao vivo --- */}
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLesson.title || currentLesson.titulo}
                  {(currentLesson.aoVivo === true || String(currentLesson.title || currentLesson.titulo).startsWith('AO VIVO')) && (
                    <span className="ml-3 px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold align-middle">
                      AO VIVO
                    </span>
                  )}
                  {currentLesson.dataAoVivo && (
                    <div className="mt-2 text-sm text-blue-700 font-semibold">
                      Data da aula ao vivo: <span className="font-bold">{currentLesson.dataAoVivo}</span>
                    </div>
                  )}
                  {currentLesson.horaAoVivo && (
                    <div className="mt-1 text-sm text-blue-700 font-semibold">
                      Horário da aula ao vivo: <span className="font-bold">{currentLesson.horaAoVivo}</span>
                    </div>
                  )}
                  {/* DEBUG: Exibe todos os campos da aula atual para facilitar troubleshooting */}
                  <div className="mt-2 text-xs text-gray-500 border border-dashed border-red-400 p-2 rounded">
                    <div className="font-bold text-red-700 mb-1">DEBUG: Dados da aula</div>
                    {Object.entries(currentLesson).map(([key, value]) => (
                      <div key={key}><strong>{key}:</strong> {String(value)}</div>
                    ))}
                    <div className="mt-1 text-red-700">dataAoVivo (direto): <strong>{currentLesson.dataAoVivo}</strong></div>
                    <div className="mt-1 text-red-700">horaAoVivo (direto): <strong>{currentLesson.horaAoVivo}</strong></div>
                  </div>
                  {/* DEBUG: Exibe todos os campos da aula atual para facilitar troubleshooting */}
                  <div className="mt-2 text-xs text-gray-500 border border-dashed border-red-400 p-2 rounded">
                    <div className="font-bold text-red-700 mb-1">DEBUG: Dados da aula</div>
                    {Object.entries(currentLesson).map(([key, value]) => (
                      <div key={key}><strong>{key}:</strong> {String(value)}</div>
                    ))}
                  </div>
                  {/* Exibe todos os campos extras da aula para debug/validação */}
                  <div className="mt-2 text-xs text-gray-500">
                    {Object.entries(currentLesson).map(([key, value]) => (
                      <div key={key}><strong>{key}:</strong> {String(value)}</div>
                    ))}
                  </div>
                </h2>
                {(currentLesson.aoVivo === true || String(currentLesson.title || currentLesson.titulo).startsWith('AO VIVO')) && (currentLesson.dataAoVivo || currentLesson.horaAoVivo) && (
                  <div className="mb-2 text-sm text-red-700 font-semibold flex items-center gap-2">
                    <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span>Início da transmissão:</span>
                    {dataAoVivo && (
                      <span className="font-bold">{new Date(dataAoVivo).toLocaleDateString('pt-BR')}</span>
                    )}
                    {horaAoVivo && (
                      <span className="font-bold">{horaAoVivo}</span>
                    )}
                  </div>
                )}
                {currentLesson.descricao && (
                  <p className="text-gray-600 leading-relaxed">
                    {currentLesson.descricao}
                  </p>
                )}
              </div>

              {/* Controles de navegação */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    if (prevLesson) {
                      setSelectedModuleIdx(prevLesson.moduleIdx);
                      setSelectedLessonIdx(prevLesson.lessonIdx);
                    }
                  }}
                  disabled={!prevLesson}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Aula anterior
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowMaterials(!showMaterials)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Materiais
                  </button>
                  
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Anotações
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (nextLesson) {
                      setSelectedModuleIdx(nextLesson.moduleIdx);
                      setSelectedLessonIdx(nextLesson.lessonIdx);
                    }
                  }}
                  disabled={!nextLesson}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Próxima aula
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Materiais e anotações */}
              {(showMaterials || showNotes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                  {showMaterials && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Materiais da Aula</h3>
                      {currentLesson.pdfUrl ? (
                        <a
                          href={currentLesson.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Material PDF da aula</span>
                        </a>
                      ) : (
                        <p className="text-gray-500 text-sm">Nenhum material disponível para esta aula</p>
                      )}
                    </div>
                  )}

                  {showNotes && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Minhas Anotações</h3>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={loadingNote}
                        className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Faça suas anotações sobre esta aula..."
                      />
                      {loadingNote && (
                        <p className="text-xs text-gray-500 mt-1">Carregando anotações...</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Feedback de conclusão do curso */}
      {showCompletionModal && completedCount === totalLessons && totalLessons > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Parabéns! 🎉</h3>
            <p className="text-gray-600 mb-6">Você concluiu o curso com sucesso!</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continuar Assistindo
              </button>
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  onBack();
                }}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePlayer;
