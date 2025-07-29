
import React, { useState, useEffect } from 'react';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import { salesPageService } from '../firebase/salesPageService';
import { alunoService } from '../firebase/alunoService';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SalesPageAlunoDashboard = () => {
  const { aluno, logout } = useAlunoAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [salesData, setSalesData] = useState(null);
  const [acessos, setAcessos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const paginaId = searchParams.get('paginaId');

  // Busca dados da página e acessos do aluno
  useEffect(() => {
    async function fetchData() {
      if (!paginaId || !aluno) {
        setError('Dados insuficientes para carregar dashboard');
        setLoading(false);
        return;
      }

      try {
        // Busca dados da página de vendas
        const salesResult = await salesPageService.getSalesPageById(paginaId);
        if (salesResult.success) {
          setSalesData(salesResult.data);
        }

        // Busca acessos do aluno nesta página
        const acessosResult = await alunoService.getAcessosPorAluno(aluno.uid, paginaId);
        if (acessosResult.success) {
          setAcessos(acessosResult.data);
        }
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error('Erro:', err);
      }
      setLoading(false);
    }

    fetchData();
  }, [paginaId, aluno]);

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!aluno && !loading) {
      navigate(`/minha-pagina-de-vendas/aluno-login?paginaId=${paginaId}`);
    }
  }, [aluno, loading, paginaId, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/minha-pagina-de-vendas/aluno-login?paginaId=${paginaId}`);
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button
            onClick={() => navigate(`/minha-pagina-de-vendas/aluno-login?paginaId=${paginaId}`)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Cores da página de vendas
  const cores = {
    principal: salesData?.corPrincipal || '#1e40af',
    secundaria: salesData?.corSecundaria || '#3b82f6',
    destaque: salesData?.corDestaque || '#059669'
  };

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(135deg, ${cores.principal}08, ${cores.secundaria}08, ${cores.destaque}05)` 
      }}
    >
      {/* Header */}
      <header 
        className="shadow-lg text-white"
        style={{ background: `linear-gradient(to right, ${cores.principal}, ${cores.secundaria})` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              {salesData?.logoUrl && (
                <img 
                  src={salesData.logoUrl} 
                  alt="Logo" 
                  className="h-10 w-auto filter brightness-0 invert"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">
                  {salesData?.nomePagina || 'Área do Aluno'}
                </h1>
                <p className="text-blue-100">
                  Bem-vindo, {aluno?.displayName || aluno?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right text-sm">
                <div className="font-medium">{aluno?.displayName || 'Aluno'}</div>
                <div className="text-blue-100">{aluno?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumo de Acessos */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📚 Seus Cursos
            </h2>
            
            {acessos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Nenhum curso encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Você ainda não tem acesso a nenhum curso nesta página.
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{ 
                    backgroundColor: cores.principal,
                    color: 'white'
                  }}
                >
                  Voltar à Página de Vendas
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {acessos.map((acesso) => (
                  <div 
                    key={acesso.id} 
                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: cores.principal }}
                      >
                        📚
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        Acesso em<br/>
                        {new Date(acesso.dataAcesso).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {acesso.cursoTitulo}
                    </h3>
                    
                    {acesso.cursoDescricao && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {acesso.cursoDescricao}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cores.destaque }}
                        ></div>
                        <span className="text-sm font-medium" style={{ color: cores.destaque }}>
                          Ativo
                        </span>
                      </div>
                      
                      {acesso.linkAcesso && acesso.linkAcesso !== '#' && (
                        <a
                          href={acesso.linkAcesso}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
                          style={{ backgroundColor: cores.principal }}
                        >
                          Acessar
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informações da Conta */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            👤 Informações da Conta
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  {aluno?.displayName || 'Não informado'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  {aluno?.email}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Total de Cursos
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  {acessos.length} {acessos.length === 1 ? 'curso' : 'cursos'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Membro desde
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  {aluno?.metadata?.creationTime ? 
                    new Date(aluno.metadata.creationTime).toLocaleDateString('pt-BR') : 
                    'Data não disponível'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Suporte */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                💬 Precisa de Ajuda?
              </h3>
              <p className="text-gray-600">
                Entre em contato conosco se tiver alguma dúvida sobre seus cursos.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              {salesData?.contatoWhatsapp && (
                <a
                  href={`https://wa.me/55${salesData.contatoWhatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-center"
                >
                  📱 WhatsApp
                </a>
              )}
              {salesData?.contatoEmail && (
                <a
                  href={`mailto:${salesData.contatoEmail}`}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
                >
                  ✉️ Email
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesPageAlunoDashboard;
