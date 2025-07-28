
import React, { useState, useEffect, useRef } from 'react';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import { notesService } from '../firebase/notesService';

// CoursePlayer: Hotmart/Alura-style course viewer
// Props: course (object with modules/lessons), onBack (function)
const CoursePlayer = ({ course, onBack }) => {
  const { aluno } = useAlunoAuth();
  // --- Hotmart/Alura-style visual improvements ---
  const [showSidebar, setShowSidebar] = useState(true);
  const [notes, setNotes] = useState('');
  const [loadingNote, setLoadingNote] = useState(false);
  const saveTimeout = useRef(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showMaterials, setShowMaterials] = useState(false);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(0);
  const [selectedLessonIdx, setSelectedLessonIdx] = useState(0);

  if (!course) return null;
  const modules = course.modulos || [];
  const currentModule = modules[selectedModuleIdx] || {};
  const lessons = currentModule.aulas || [];
  const currentLesson = lessons[selectedLessonIdx] || {};
  const totalLessons = modules.reduce((acc, m) => acc + (m.aulas?.length || 0), 0);
  // Corrige progresso: só conta IDs únicos e que existem nas aulas
  const allLessonIds = modules.flatMap(m => (m.aulas || []).map(a => a.id));
  // Garante IDs únicos e válidos
  const uniqueCompleted = Array.from(new Set(completedLessons)).filter(id => allLessonIds.includes(id));
  const completedCount = uniqueCompleted.length;
  const courseProgress = totalLessons ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;

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
    // Limpa timeout de save ao trocar de aula
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
    // eslint-disable-next-line
  }, [aluno, course?.id, selectedLessonIdx, lessons]);


  // Salva anotação com debounce
  useEffect(() => {
    if (!aluno || !course?.id || !lessons[selectedLessonIdx]?.id) return;
    if (loadingNote) return; // Não salva enquanto carrega
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      notesService.saveNote({
        alunoId: aluno.uid,
        cursoId: course.id,
        aulaId: lessons[selectedLessonIdx].id,
        nota: notes
      });
    }, 800);
    // eslint-disable-next-line
  }, [notes]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setSelectedLessonIdx(idx => Math.max(0, idx - 1));
      if (e.key === 'ArrowRight') setSelectedLessonIdx(idx => Math.min(lessons.length - 1, idx + 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lessons.length]);

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

  return (
    <div className="flex flex-col md:flex-row min-h-[80vh] bg-gray-100">
      {/* Sidebar: Modules & Lessons */}
      <aside className={`z-10 fixed md:static top-0 left-0 h-full md:h-auto w-72 bg-white border-r shadow-lg transition-transform duration-300 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b">
          <button onClick={onBack} className="text-blue-600 hover:underline font-bold">← Voltar</button>
          <button className="md:hidden text-gray-500" onClick={() => setShowSidebar(false)} aria-label="Fechar menu">✕</button>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg mb-4 text-blue-900">Conteúdo do Curso</h3>
          <ul>
            {modules.map((mod, mIdx) => (
              <li key={mod.id || mIdx} className="mb-2">
                <div
                  className={`flex items-center gap-2 font-semibold cursor-pointer px-2 py-1 rounded ${mIdx === selectedModuleIdx ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`}
                  onClick={() => { setSelectedModuleIdx(mIdx); setSelectedLessonIdx(0); }}
                >
                  <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: mIdx === selectedModuleIdx ? '#0ea5e9' : '#e5e7eb', border: mIdx === selectedModuleIdx ? '2px solid #0ea5e9' : '2px solid #e5e7eb' }}></span>
                  {mod.titulo}
                </div>
                <ul className="ml-4 mt-1">
                  {mod.aulas?.map((aula, aIdx) => (
                    <li key={aula.id || aIdx}>
                      <button
                        className={`flex items-center gap-2 w-full px-2 py-1 rounded text-sm text-left ${mIdx === selectedModuleIdx && aIdx === selectedLessonIdx ? 'bg-yellow-200 text-yellow-900 font-bold' : 'hover:bg-yellow-50'} ${completedLessons.includes(aula.id) ? 'line-through text-green-600' : ''}`}
                        onClick={() => { setSelectedModuleIdx(mIdx); setSelectedLessonIdx(aIdx); }}
                        aria-label={aula.titulo}
                      >
                        <span className="material-icons text-xs">{completedLessons.includes(aula.id) ? 'check_circle' : 'play_circle'}</span>
                        {aula.titulo}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t text-xs text-gray-400 text-center">Powered by DireitoHub</div>
      </aside>

      {/* Main: Video Player & Lesson Info */}
      <main className="flex-1 flex flex-col items-center justify-center p-0 md:p-8">
        {/* Topbar: título, progresso, avatar, professor */}
        <div className="w-full max-w-3xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 px-4 pt-6 md:pt-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-blue-900">{course.titulo}</span>
              {course.autor && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">com {course.autor}</span>}
            </div>
            <div className="text-sm text-gray-500 font-medium">Módulo: <span className="text-blue-800 font-semibold">{currentModule.titulo}</span></div>
            <div className="text-xs text-gray-400">Aula {selectedLessonIdx + 1} de {lessons.length}</div>
          </div>
          <div className="flex items-center gap-3">
            {/* Avatar fake do aluno */}
            <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-lg font-bold text-yellow-800 border-2 border-yellow-400">👤</div>
            {/* Progresso do curso */}
            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 mb-1">Progresso do curso</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${courseProgress}%` }}></div>
              </div>
              <span className="text-xs text-blue-700 font-bold mt-1">{courseProgress}%</span>
            </div>
          </div>
        </div>

        {/* Video player com fundo escuro e sombra */}
        <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-2xl mb-6 p-2 md:p-6 flex flex-col items-center">
          {currentLesson.videoUrl ? (
            <div className="w-full aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden border-4 border-gray-800 shadow-lg">
              <iframe
                src={currentLesson.videoUrl}
                title={currentLesson.titulo}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-72 md:h-[420px] rounded-xl"
              />
            </div>
          ) : (
            <div className="mb-6 text-gray-400 text-center">Vídeo não disponível</div>
          )}
        </div>

        {/* Navegação rápida */}
        <div className="flex justify-between items-center w-full max-w-3xl mb-6 px-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-300"
            onClick={() => setSelectedLessonIdx(idx => Math.max(0, idx - 1))}
            disabled={selectedLessonIdx === 0}
          >
            ← Aula anterior
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            onClick={() => setSelectedLessonIdx(idx => Math.min(lessons.length - 1, idx + 1))}
            disabled={selectedLessonIdx === lessons.length - 1}
          >
            Próxima aula →
          </button>
        </div>

        {/* Materiais extras e anotações */}
        <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 mb-8 px-4">
          <div className="flex-1">
            <button className="text-xs text-yellow-700 underline mb-2" onClick={() => setShowMaterials(v => !v)}>
              {showMaterials ? 'Ocultar materiais' : 'Ver materiais da aula'}
            </button>
            {showMaterials && currentLesson.pdfUrl && (
              <div className="mb-2">
                <a href={currentLesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Baixar PDF da aula</a>
              </div>
            )}
            {/* Espaço para comentários/dúvidas futuros */}
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Minhas anotações</label>
            <textarea
              className="w-full border border-yellow-200 rounded-xl px-3 py-2 text-base focus:ring-2 focus:ring-yellow-400"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Escreva suas anotações sobre esta aula..."
              disabled={loadingNote}
            />
            {loadingNote && <div className="text-xs text-gray-400 mt-1">Carregando anotações...</div>}
          </div>
        </div>

        {/* Feedback visual de conclusão */}
        {completedCount === totalLessons && totalLessons > 0 && (
          <div className="w-full max-w-3xl mb-8 flex flex-col items-center">
            <div className="text-2xl text-green-600 font-bold mb-2">Parabéns! Você concluiu o curso 🎉</div>
            <div className="text-sm text-gray-500">Certificado disponível em breve.</div>
          </div>
        )}
      </main>

      {/* Botão para abrir sidebar no mobile */}
      {!showSidebar && (
        <button
          className="fixed bottom-6 left-6 z-20 bg-blue-600 text-white rounded-full shadow-lg p-4 md:hidden"
          onClick={() => setShowSidebar(true)}
          aria-label="Abrir menu do curso"
        >
          <span className="material-icons">menu</span>
        </button>
      )}
    </div>
  );
};

export default CoursePlayer;
