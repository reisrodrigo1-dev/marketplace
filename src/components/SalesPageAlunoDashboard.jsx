import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import { alunoService } from '../firebase/alunoService';
import { courseService } from '../firebase/courseService';
import CoursePlayer from './CoursePlayer';
import AlunoCourseCard from './AlunoCourseCard';
import { progressoService } from '../firebase/progressoService';

const SalesPageAlunoDashboard = () => {
  const { paginaId } = useParams();
  const { aluno, logout } = useAlunoAuth();
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseData, setSelectedCourseData] = useState(null);
  const [progressoCursos, setProgressoCursos] = useState({});

  // Carrega os acessos do aluno para esta página
  useEffect(() => {
    if (!aluno || !paginaId) return;
    setLoading(true);
    alunoService.getAcessosPorAluno(aluno.uid, paginaId).then(result => {
      if (result.success) setAcessos(result.data);
      setLoading(false);
    });
  }, [aluno, paginaId]);

  // Busca dados completos do curso selecionado
  useEffect(() => {
    if (!selectedCourse) {
      setSelectedCourseData(null);
      return;
    }
    const fetchCourse = async () => {
      const result = await courseService.getCoursesByIds([selectedCourse.cursoId]);
      if (result.success && result.data.length > 0) {
        const course = result.data[0];
        let modulos = [];
        if (course.sections && Array.isArray(course.sections)) {
          modulos = course.sections.map(section => ({
            id: section.id,
            titulo: section.title,
            aulas: (section.lessons || []).map(lesson => ({
              id: lesson.id,
              titulo: lesson.title,
              descricao: lesson.description || '',
              videoUrl: getYoutubeEmbedUrl(lesson.youtubeUrl) || lesson.videoUrl || lesson.url || '',
            }))
          }));
        }
        setSelectedCourseData({ ...course, ...selectedCourse, modulos });
      } else {
        setSelectedCourseData(null);
      }
    };
    fetchCourse();
  }, [selectedCourse]);

  // Busca progresso real de todos os cursos do aluno
  useEffect(() => {
    async function fetchProgresso() {
      if (!aluno || !acessos.length) return;
      const progressoObj = {};
      for (const acesso of acessos) {
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
  }, [aluno, acessos]);

  // Função utilitária para extrair embed do YouTube
  function getYoutubeEmbedUrl(url) {
    if (!url) return '';
    const match = url.match(/(?:v=|youtu.be\/|embed\/)([\w-]{11})/);
    if (!match) return '';
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  if (!aluno) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-10">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Faça login como aluno para acessar seus cursos.</p>
          <a 
            href={`/pagina-vendas/${paginaId}/aluno/login`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  // Se um curso está selecionado, mostra o player
  if (selectedCourse && selectedCourseData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <CoursePlayer
          course={selectedCourseData}
          onBack={() => setSelectedCourse(null)}
        />
      </div>
    );
  }

  if (selectedCourse && !selectedCourseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
          <div className="text-gray-600">Carregando curso...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header do Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                {aluno.displayName?.[0] || aluno.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Olá, {aluno.displayName || aluno.email}! 👋
                </h1>
                <p className="text-gray-600">{aluno.email}</p>
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800 underline mt-1" 
                  onClick={() => setShowProfile(v => !v)}
                >
                  {showProfile ? 'Ocultar Perfil' : 'Ver Perfil'}
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                onClick={logout}
              >
                Sair
              </button>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline">
                Precisa de ajuda?
              </a>
            </div>
          </div>

          {showProfile && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Nome:</span>
                  <p className="text-gray-800">{aluno.displayName || 'Não informado'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <p className="text-gray-800">{aluno.email}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">ID do Aluno:</span>
                  <p className="text-gray-600 text-sm">{aluno.uid}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seção dos Cursos */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📚</span>
            </div>
            Meus Cursos
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-gray-600">Carregando seus cursos...</span>
            </div>
          ) : acessos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum curso encontrado</h3>
              <p className="text-gray-600">Você ainda não possui cursos nesta página.</p>
            </div>
          ) : (
            <>
              {/* Estatísticas dos Cursos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-semibold text-sm">Total de Cursos</p>
                      <p className="text-2xl font-bold text-blue-800">{acessos.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 text-xl">📚</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-semibold text-sm">Concluídos</p>
                      <p className="text-2xl font-bold text-green-800">
                        {Object.values(progressoCursos).filter(p => p >= 100).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                      <span className="text-green-700 text-xl">✅</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-600 font-semibold text-sm">Em progresso</p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {Object.values(progressoCursos).filter(p => p > 0 && p < 100).length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center">
                      <span className="text-yellow-700 text-xl">⏳</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Cursos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Mensagem de Parabéns se houver cursos concluídos */}
              {Object.values(progressoCursos).filter(p => p >= 100).length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Parabéns!</h3>
                  <p className="text-green-700">
                    Você concluiu {Object.values(progressoCursos).filter(p => p >= 100).length} curso(s). 
                    Continue assim e alcance seus objetivos!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesPageAlunoDashboard;