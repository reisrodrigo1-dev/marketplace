import React, { useEffect, useState } from 'react';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import { alunoService } from '../firebase/alunoService';
import CoursePlayer from './CoursePlayer';
import { courseService } from '../firebase/courseService';
import AlunoCourseCard from './AlunoCourseCard';
import { progressoService } from '../firebase/progressoService';

// Dashboard do Aluno: mostra cursos comprados e acesso por página
const AlunoDashboard = ({ paginaId }) => {
  const { aluno, logout } = useAlunoAuth();
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null); // Para exibir o player
  const [selectedCourseData, setSelectedCourseData] = useState(null); // Estrutura real do curso

  useEffect(() => {
    if (!aluno || !paginaId) return;
    setLoading(true);
    alunoService.getAcessosPorAluno(aluno.uid, paginaId).then(result => {
      if (result.success) setAcessos(result.data);
      setLoading(false);
    });
  }, [aluno, paginaId]);


  if (!aluno) {
    return <div className="text-center py-10 text-lg">Faça login como aluno para acessar seus cursos.</div>;
  }

  // Se um curso está selecionado, busca e mostra o player
  useEffect(() => {
    if (!selectedCourse) {
      setSelectedCourseData(null);
      return;
    }
    // Busca a estrutura real do curso pelo ID
    const fetchCourse = async () => {
      const result = await courseService.getCoursesByIds([selectedCourse.cursoId]);
      if (result.success && result.data.length > 0) {
        // eslint-disable-next-line no-console
        console.log('Curso completo do Firestore:', result.data[0]);
        // Tenta mapear para o padrão esperado pelo player
        const course = result.data[0];
        let modulos = [];
        if (course.sections && Array.isArray(course.sections)) {
          modulos = course.sections.map(section => ({
            id: section.id,
            titulo: section.title,
            aulas: (section.lessons || []).map(lesson => {
              // eslint-disable-next-line no-console
              console.log('Lesson do banco:', lesson);
              return {
                id: lesson.id,
                titulo: lesson.title,
                descricao: lesson.description || '',
                videoUrl: getYoutubeEmbedUrl(lesson.youtubeUrl) || lesson.videoUrl || lesson.url || '',
                aoVivo: lesson.aoVivo,
                dataAoVivo: lesson.dataAoVivo,
                horaAoVivo: lesson.horaAoVivo,
              };
            })
          }));
        }
        setSelectedCourseData({ ...course, ...selectedCourse, modulos });
      } else {
        setSelectedCourseData(null);
      }
    };
    fetchCourse();
  }, [selectedCourse]);

// Função utilitária para extrair embed do YouTube
/*
  Esta função deve estar FORA de qualquer bloco, classe ou função React.
  O erro de sintaxe ocorre se ela estiver dentro de outro bloco.
*/
function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]{11})/);
  if (!match) return '';
  return `https://www.youtube.com/embed/${match[1]}`;
}

  if (selectedCourse && selectedCourseData) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-2">
        <CoursePlayer
          course={selectedCourseData}
          onBack={() => setSelectedCourse(null)}
        />
      </div>
    );
  }
  if (selectedCourse && !selectedCourseData) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-2 flex items-center justify-center min-h-[300px]">
        <div className="text-gray-500">Carregando curso...</div>
      </div>
    );
  }

  // Função para simular progresso (substitua por real futuramente)
  function getProgressoDoCurso(acesso) {
    // Exemplo: progresso fake aleatório
    // return Math.floor(Math.random() * 100);
    // TODO: buscar progresso real do aluno neste curso
    return acesso.progresso || 0;
  }

  // Busca progresso real de todos os cursos do aluno
  const [progressoCursos, setProgressoCursos] = useState({});
  useEffect(() => {
    async function fetchProgresso() {
      if (!aluno || !acessos.length) return;
      const progressoObj = {};
      for (const acesso of acessos) {
        // Busca estrutura do curso para contar aulas
        const result = await courseService.getCoursesByIds([acesso.cursoId]);
        if (result.success && result.data.length > 0) {
          const course = result.data[0];
          const allLessonIds = (course.sections || []).flatMap(sec => (sec.lessons || []).map(lesson => lesson.id));
          const res = await progressoService.getProgresso({ alunoId: aluno.uid, cursoId: acesso.cursoId });
          const concluidas = (res.aulasConcluidas || []).filter(id => allLessonIds.includes(id));
          progressoObj[acesso.id] = allLessonIds.length ? Math.round((concluidas.length / allLessonIds.length) * 100) : 0;
        } else {
          progressoObj[acesso.id] = 0;
        }
      }
      setProgressoCursos(progressoObj);
    }
    fetchProgresso();
    // eslint-disable-next-line
  }, [aluno, acessos]);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 border-4 border-yellow-300 shadow-lg">
            {aluno.displayName?.[0] || aluno.email[0]}
          </div>
          <div className="text-left">
            <div className="font-bold text-2xl text-blue-900 mb-1">Olá, {aluno.displayName || aluno.email}!</div>
            <div className="text-gray-600 text-sm mb-1">{aluno.email}</div>
            <button className="text-xs text-blue-700 underline mt-1" onClick={() => setShowProfile(v => !v)}>
              {showProfile ? 'Ocultar Perfil' : 'Ver Perfil'}
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
            onClick={logout}
          >
            Sair
          </button>
          <a href="#" className="text-xs text-blue-600 underline hover:text-blue-800">Precisa de ajuda?</a>
        </div>
      </div>
      {showProfile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left animate-fade-in">
          <div className="mb-1"><span className="font-semibold">Nome:</span> {aluno.displayName || 'Não informado'}</div>
          <div className="mb-1"><span className="font-semibold">Email:</span> {aluno.email}</div>
          <div className="mb-1"><span className="font-semibold">ID do Aluno:</span> {aluno.uid}</div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-blue-900 flex items-center gap-2">
        <span className="material-icons text-yellow-400 text-3xl">school</span>
        Meus Cursos nesta Página
      </h2>
      {loading ? (
        <div className="text-center text-gray-500 animate-pulse">Carregando...</div>
      ) : acessos.length === 0 ? (
        <div className="text-center text-gray-600">Você ainda não possui cursos nesta página.</div>
      ) : (
        <>
          {/* Conquistas e feedback visual */}
          <div className="mb-8 flex flex-wrap gap-4 items-center">
            {acessos.filter(a => (a.progresso || 0) >= 100).length > 0 && (
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold flex items-center gap-2 animate-bounce-in">
                <span className="material-icons text-green-500">emoji_events</span>
                Parabéns! Você concluiu {acessos.filter(a => (a.progresso || 0) >= 100).length} curso(s) 🎉
              </div>
            )}
            {/* Espaço para alertas de novidades, promoções, etc. */}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {acessos.map(acesso => {
              const progresso = progressoCursos[acesso.id] ?? 0;
              const concluido = progresso >= 100;
              return (
                <AlunoCourseCard
                  key={acesso.id}
                  acesso={acesso}
                  progresso={progresso}
                  concluido={concluido}
                  onContinue={() => setSelectedCourse(acesso)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};


// Função utilitária para extrair embed do YouTube

/*
  Esta função deve estar FORA de qualquer bloco, classe ou função React.
  O erro de sintaxe ocorre se ela estiver dentro de outro bloco.
*/

function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]{11})/);
  if (!match) return '';
  return `https://www.youtube.com/embed/${match[1]}`;
}

export default AlunoDashboard;
