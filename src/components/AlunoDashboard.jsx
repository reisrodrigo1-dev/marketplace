import React, { useEffect, useState } from 'react';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import { alunoService } from '../firebase/alunoService';
import CoursePlayer from './CoursePlayer';
import { courseService } from '../firebase/courseService';

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
        // Tenta mapear para o padrão esperado pelo player
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

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
            {aluno.displayName?.[0] || aluno.email[0]}
          </div>
          <div className="text-left">
            <div className="font-bold text-lg text-blue-900">{aluno.displayName || aluno.email}</div>
            <div className="text-gray-600 text-sm">{aluno.email}</div>
            <button className="text-xs text-blue-700 underline mt-1" onClick={() => setShowProfile(v => !v)}>
              {showProfile ? 'Ocultar Perfil' : 'Ver Perfil'}
            </button>
          </div>
        </div>
        <button
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
          onClick={logout}
        >
          Sair
        </button>
      </div>
      {showProfile && (
        <div className="bg-gray-50 border rounded-lg p-4 mb-8 text-left">
          <div><span className="font-semibold">Nome:</span> {aluno.displayName || 'Não informado'}</div>
          <div><span className="font-semibold">Email:</span> {aluno.email}</div>
          <div><span className="font-semibold">ID do Aluno:</span> {aluno.uid}</div>
        </div>
      )}
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Meus Cursos nesta Página</h2>
      {loading ? (
        <div className="text-center text-gray-500">Carregando...</div>
      ) : acessos.length === 0 ? (
        <div className="text-center text-gray-600">Você ainda não possui cursos nesta página.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {acessos.map(acesso => (
            <div key={acesso.id} className="bg-white rounded-lg shadow border p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{acesso.cursoTitulo}</h3>
                <p className="text-gray-700 text-sm mb-2">{acesso.cursoDescricao}</p>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium mb-2">Acesso concedido em {new Date(acesso.dataAcesso).toLocaleDateString('pt-BR')}</span>
              </div>
              <button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-center"
                onClick={() => setSelectedCourse(acesso)}
              >
                Acessar Curso
              </button>
            </div>
          ))}
        </div>
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
