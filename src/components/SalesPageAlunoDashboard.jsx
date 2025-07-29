import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import { alunoService } from '../firebase/alunoService';
import { courseService } from '../firebase/courseService';
import { salesPageService } from '../firebase/salesPageService';
import CoursePlayer from './CoursePlayer';
import AlunoCourseCard from './AlunoCourseCard';
import { progressoService } from '../firebase/progressoService';

const SalesPageAlunoDashboard = () => {
  const [searchParams] = useSearchParams();
  const paginaId = searchParams.get('paginaId');
  const { aluno, logout } = useAlunoAuth();
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCourseData, setSelectedCourseData] = useState(null);
  const [progressoCursos, setProgressoCursos] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: '',
    endereco: ''
  });
  const [salesPageData, setSalesPageData] = useState(null);
  const [pageColors, setPageColors] = useState({
    principal: '#1e40af',
    secundaria: '#3b82f6', 
    destaque: '#059669'
  });

  // Carrega dados da página de vendas para estilização
  useEffect(() => {
    if (!paginaId) return;

    const fetchSalesPageData = async () => {
      try {
        const result = await salesPageService.getSalesPageById(paginaId);
        if (result.success) {
          setSalesPageData(result.data);

          // Define as cores da página ou usa padrões profissionais
          const cores = {
            principal: result.data.corPrincipal || '#1e40af',
            secundaria: result.data.corSecundaria || '#3b82f6',
            destaque: result.data.corDestaque || '#059669'
          };
          setPageColors(cores);
        }
      } catch (error) {
        console.error('Erro ao buscar dados da página de vendas:', error);
      }
    };

    fetchSalesPageData();
  }, [paginaId]);

  // Carrega os acessos do aluno para esta página
  useEffect(() => {
    if (!aluno || !paginaId) {
      console.log('🚨 [DASHBOARD] Carregamento cancelado - dados faltando:', { 
        aluno: !!aluno, 
        paginaId: !!paginaId 
      });
      return;
    }

    console.log('🚀 [DASHBOARD] Iniciando carregamento de acessos...');
    console.log('🚀 [DASHBOARD] Dados do contexto:', { 
      alunoId: aluno.uid, 
      alunoEmail: aluno.email,
      alunoName: aluno.displayName,
      paginaId: paginaId 
    });

    setLoading(true);

    const loadAcessos = async () => {
      try {
        console.log('📞 [DASHBOARD] Chamando alunoService.getAcessosPorAluno...');
        let result = await alunoService.getAcessosPorAluno(aluno.uid, paginaId);

        console.log('📨 [DASHBOARD] Resposta recebida do service:', result);

        // Se não encontrou acessos, tenta verificar e criar dados de teste
        if (result.success && result.data.length === 0) {
          console.log('🔧 [DASHBOARD] Nenhum acesso encontrado. Tentando criar dados de teste...');
          result = await alunoService.verificarECriarDadosTeste(aluno.uid, paginaId);
          console.log('🔧 [DASHBOARD] Resultado após tentar criar dados de teste:', result);
        }

        console.log('✅ [DASHBOARD] Resultado final dos acessos:', {
          success: result.success,
          dataLength: result.data?.length || 0,
          error: result.error || 'nenhum',
          data: result.data
        });

        if (result.success) {
          console.log('💾 [DASHBOARD] Salvando acessos no estado...');
          setAcessos(result.data);

          console.log('👤 [DASHBOARD] Acessos salvos. Detalhes dos cursos:');
          result.data.forEach((acesso, index) => {
            console.log(`📚 [DASHBOARD] Curso ${index + 1}:`, {
              id: acesso.id,
              cursoId: acesso.cursoId,
              cursoTitulo: acesso.cursoTitulo || acesso.nomeProduto,
              nome: acesso.nome,
              email: acesso.email,
              dataAcesso: acesso.dataAcesso,
              ativo: acesso.ativo
            });
          });

          // Inicializa dados do perfil
          if (result.data.length > 0) {
            const primeiroAcesso = result.data[0];
            const profileDataToSet = {
              nome: primeiroAcesso.nome || aluno.displayName || aluno.email || '',
              endereco: primeiroAcesso.endereco || ''
            };

            console.log('👤 [DASHBOARD] Inicializando dados do perfil:', profileDataToSet);
            setProfileData(profileDataToSet);
          } else {
            console.log('⚠️ [DASHBOARD] Nenhum acesso após todas as tentativas - usando dados básicos');
            const basicProfileData = {
              nome: aluno.displayName || aluno.email || '',
              endereco: ''
            };
            console.log('👤 [DASHBOARD] Dados básicos do perfil:', basicProfileData);
            setProfileData(basicProfileData);
          }
        } else {
          console.error('❌ [DASHBOARD] Erro ao carregar acessos:', result.error);
          const errorProfileData = {
            nome: aluno.displayName || aluno.email || '',
            endereco: ''
          };
          console.log('👤 [DASHBOARD] Dados de perfil após erro:', errorProfileData);
          setProfileData(errorProfileData);
        }
      } catch (error) {
        console.error('💥 [DASHBOARD] ERRO FATAL na função de carregamento:', error);
        console.error('💥 [DASHBOARD] Stack trace:', error.stack);

        const fallbackProfileData = {
          nome: aluno.displayName || aluno.email || '',
          endereco: ''
        };
        console.log('👤 [DASHBOARD] Dados de perfil de fallback:', fallbackProfileData);
        setProfileData(fallbackProfileData);
      } finally {
        console.log('🏁 [DASHBOARD] Finalizando carregamento. setLoading(false)');
        setLoading(false);
      }
    };

    loadAcessos();
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

  // Função para salvar as alterações do perfil
  const handleSaveProfile = async () => {
    try {
      console.log('Salvando perfil com dados:', profileData);

      const result = await alunoService.atualizarPerfilAluno(aluno.uid, {
        name: profileData.nome,
        endereco: profileData.endereco
      });

      console.log('Resultado da atualização:', result);

      if (result.success) {
        setEditingProfile(false);

        // Recarrega os acessos para atualizar os dados
        console.log('Recarregando acessos após atualização...');
        const acessosResult = await alunoService.getAcessosPorAluno(aluno.uid, paginaId);
        if (acessosResult.success) {
          setAcessos(acessosResult.data);
          console.log('Acessos recarregados:', acessosResult.data);
        }

        alert('Perfil atualizado com sucesso!');
      } else {
        console.error('Erro no resultado:', result.error);
        alert('Erro ao atualizar perfil: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      alert('Erro ao atualizar perfil: ' + error.message);
    }
  };

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
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(135deg, ${pageColors.principal}08, ${pageColors.secundaria}08, ${pageColors.destaque}08)` 
      }}
    >
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header do Dashboard */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-t-4" style={{ borderTopColor: pageColors.principal }}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${pageColors.principal}, ${pageColors.secundaria})` 
                }}
              >
                {aluno.displayName?.[0] || aluno.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                  Olá, {aluno.displayName || aluno.email}! 👋
                </h1>
                <p className="text-gray-600">{aluno.email}</p>
                <button 
                  className="text-sm underline mt-1 hover:opacity-80 transition-opacity" 
                  style={{ color: pageColors.principal }}
                  onClick={() => setShowProfile(v => !v)}
                >
                  {showProfile ? 'Ocultar Perfil' : 'Ver Perfil'}
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: pageColors.principal }}
                onClick={logout}
              >
                Sair
              </button>
              <a 
                href="#" 
                className="text-sm underline hover:opacity-80 transition-opacity"
                style={{ color: pageColors.destaque }}
              >
                Precisa de ajuda?
              </a>
            </div>
          </div>

          {showProfile && (
            <div 
              className="mt-6 rounded-lg p-4 animate-fade-in border"
              style={{ 
                backgroundColor: `${pageColors.principal}08`,
                borderColor: `${pageColors.principal}30`
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Informações do Perfil</h3>
                {!editingProfile ? (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                    style={{ backgroundColor: pageColors.principal }}
                  >
                    Editar Perfil
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                      style={{ backgroundColor: pageColors.destaque }}
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        // Reseta os dados do formulário
                        if (acessos.length > 0) {
                          const primeiroAcesso = acessos[0];
                          setProfileData({
                            nome: primeiroAcesso.nome || aluno.displayName || '',
                            endereco: primeiroAcesso.endereco || ''
                          });
                        }
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold text-gray-700">Nome:</span>
                  {editingProfile ? (
                    <input
                      type="text"
                      value={profileData.nome}
                      onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
                      style={{ 
                        '--tw-ring-color': pageColors.principal,
                        '--tw-border-opacity': '1'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = pageColors.principal;
                        e.target.style.boxShadow = `0 0 0 3px ${pageColors.principal}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Seu nome completo"
                    />
                  ) : (
                    <p className="text-gray-800">{acessos[0]?.nome || aluno.displayName || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <p className="text-gray-800">{aluno.email}</p>
                  <p className="text-xs text-gray-500">O email não pode ser alterado</p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">CPF:</span>
                  <p className="text-gray-800">{acessos[0]?.cpf || 'Não informado'}</p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">Data de Nascimento:</span>
                  <p className="text-gray-800">
                    {acessos[0]?.dataNascimento ? 
                      new Date(acessos[0].dataNascimento).toLocaleDateString('pt-BR') : 
                      'Não informado'
                    }
                  </p>
                </div>

                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">Endereço:</span>
                  {editingProfile ? (
                    <textarea
                      value={profileData.endereco}
                      onChange={(e) => setProfileData(prev => ({ ...prev, endereco: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg transition-colors"
                      onFocus={(e) => {
                        e.target.style.borderColor = pageColors.principal;
                        e.target.style.boxShadow = `0 0 0 3px ${pageColors.principal}20`;
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#d1d5db';
                        e.target.style.boxShadow = 'none';
                      }}
                      placeholder="Seu endereço completo"
                      rows="2"
                    />
                  ) : (
                    <p className="text-gray-800">{acessos[0]?.endereco || 'Não informado'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">ID do Aluno:</span>
                  <p className="text-gray-600 text-sm">{aluno.uid}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seção dos Cursos */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4" style={{ borderTopColor: pageColors.destaque }}>
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${pageColors.destaque}, ${pageColors.secundaria})` 
              }}
            >
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
              <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
                <p><strong>Debug:</strong></p>
                <p>Aluno ID: {aluno?.uid}</p>
                <p>Página ID: {paginaId}</p>
                <p>Verifique se existem registros na coleção 'acessos' com estes IDs.</p>
                <button
                  onClick={async () => {
                    console.log('Forçando criação de dados de teste...');
                    setLoading(true);
                    try {
                      const result = await alunoService.criarAcessoTeste(aluno.uid, paginaId);
                      if (result.success) {
                        console.log('Dados de teste criados. Recarregando...');
                        window.location.reload();
                      } else {
                        alert('Erro ao criar dados de teste: ' + result.error);
                      }
                    } catch (error) {
                      console.error('Erro:', error);
                      alert('Erro: ' + error.message);
                    }
                    setLoading(false);
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar Dados de Teste
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Estatísticas dos Cursos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div 
                  className="p-4 rounded-xl border"
                  style={{ 
                    background: `linear-gradient(135deg, ${pageColors.principal}08, ${pageColors.principal}15)`,
                    borderColor: `${pageColors.principal}30`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: pageColors.principal }}>Total de Cursos</p>
                      <p className="text-2xl font-bold" style={{ color: pageColors.principal }}>{acessos.length}</p>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${pageColors.principal}20` }}
                    >
                      <span className="text-xl" style={{ color: pageColors.principal }}>📚</span>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-xl border"
                  style={{ 
                    background: `linear-gradient(135deg, ${pageColors.destaque}08, ${pageColors.destaque}15)`,
                    borderColor: `${pageColors.destaque}30`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: pageColors.destaque }}>Concluídos</p>
                      <p className="text-2xl font-bold" style={{ color: pageColors.destaque }}>
                        {Object.values(progressoCursos).filter(p => p >= 100).length}
                      </p>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${pageColors.destaque}20` }}
                    >
                      <span className="text-xl" style={{ color: pageColors.destaque }}>✅</span>
                    </div>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-xl border"
                  style={{ 
                    background: `linear-gradient(135deg, ${pageColors.secundaria}08, ${pageColors.secundaria}15)`,
                    borderColor: `${pageColors.secundaria}30`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: pageColors.secundaria }}>Em progresso</p>
                      <p className="text-2xl font-bold" style={{ color: pageColors.secundaria }}>
                        {Object.values(progressoCursos).filter(p => p > 0 && p < 100).length}
                      </p>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${pageColors.secundaria}20` }}
                    >
                      <span className="text-xl" style={{ color: pageColors.secundaria }}>⏳</span>
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
                      pageColors={pageColors}
                      onContinue={() => setSelectedCourse(acesso)}
                    />
                  );
                })}
              </div>

              {/* Mensagem de Parabéns se houver cursos concluídos */}
              {Object.values(progressoCursos).filter(p => p >= 100).length > 0 && (
                <div 
                  className="mt-8 border rounded-xl p-6 text-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${pageColors.destaque}08, ${pageColors.destaque}15)`,
                    borderColor: `${pageColors.destaque}30`
                  }}
                >
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: pageColors.destaque }}>Parabéns!</h3>
                  <p style={{ color: pageColors.destaque }}>
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