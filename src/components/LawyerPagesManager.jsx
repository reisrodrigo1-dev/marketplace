import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lawyerPageService } from '../firebase/firestore';
import LawyerPageBuilder from './LawyerPageBuilder';
import LawyerWebPage from './LawyerWebPage';
import InviteNotifications from './InviteNotifications';
import CollaboratorAccess from './CollaboratorAccess';
import CollaborationManager from './CollaborationManager';
import CollaboratorManager from './CollaboratorManager';

const LawyerPagesManager = ({ onBack }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('list'); // 'list', 'create', 'preview', 'edit', 'collaboration'
  const [lawyerPages, setLawyerPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collaboratorPageAccess, setCollaboratorPageAccess] = useState(null); // Para acessar páginas de outros

  // Simular carregamento das páginas do usuário
  useEffect(() => {
    loadUserPages();
  }, [user]);

  const loadUserPages = async () => {
    setIsLoading(true);
    try {
      if (user?.uid) {
        console.log('🔄 Carregando páginas para usuário:', user.uid);
        
        // Carregar páginas próprias do Firebase
        const ownPagesResult = await lawyerPageService.getPagesByUser(user.uid);
        let allPages = [];
        
        if (ownPagesResult.success) {
          console.log('📄 Páginas próprias carregadas:', ownPagesResult.data.length);
          allPages = [...ownPagesResult.data];
        } else {
          console.error('Erro ao carregar páginas próprias:', ownPagesResult.error);
        }

        // Carregar páginas onde sou colaborador
        const { collaborationService } = await import('../firebase/firestore');
        const collaborationsResult = await collaborationService.getCollaboratorAccess(user.uid);
        
        if (collaborationsResult.success) {
          console.log('🤝 Colaborações encontradas:', collaborationsResult.data.length);
          
          // Para cada colaboração, buscar os dados da página
          for (const collaboration of collaborationsResult.data) {
            try {
              const pageResult = await collaborationService.getPageById(collaboration.pageId);
              if (pageResult.success) {
                const collaborationPage = {
                  ...pageResult.data,
                  isCollaboration: true,
                  collaborationRole: collaboration.role,
                  collaborationPermissions: collaboration.permissions,
                  ownerId: collaboration.ownerUserId,
                  ownerName: collaboration.ownerData?.name || 'Usuário'
                };
                allPages.push(collaborationPage);
                console.log('📄 Página de colaboração adicionada:', collaborationPage.name);
              }
            } catch (error) {
              console.error('Erro ao buscar página de colaboração:', error);
            }
          }
        } else {
          console.error('Erro ao buscar colaborações:', collaborationsResult.error);
        }

        setLawyerPages(allPages);
        console.log('📊 Total de páginas carregadas:', allPages.length);
      } else {
        // Fallback para localStorage se não estiver logado
        const savedPages = localStorage.getItem(`lawyer-pages-demo`);
        if (savedPages) {
          setLawyerPages(JSON.parse(savedPages));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
      setLawyerPages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageCreated = (pageData) => {
    const updatedPages = [...lawyerPages, pageData];
    setLawyerPages(updatedPages);
    
    setSelectedPage(pageData);
    setCurrentView('preview');
  };

  const handlePageUpdated = (updatedPageData) => {
    const updatedPages = lawyerPages.map(page => 
      page.id === updatedPageData.id ? updatedPageData : page
    );
    setLawyerPages(updatedPages);
    
    setSelectedPage(updatedPageData);
    setCurrentView('preview');
  };

  const handleDeletePage = async (pageId) => {
    if (window.confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) {
      try {
        const result = await lawyerPageService.deletePage(pageId);
        
        if (result.success) {
          const updatedPages = lawyerPages.filter(page => page.id !== pageId);
          setLawyerPages(updatedPages);
          alert('Página excluída com sucesso!');
        } else {
          alert('Erro ao excluir página: ' + result.error);
        }
      } catch (error) {
        console.error('Erro ao excluir página:', error);
        alert('Erro ao excluir página.');
      }
    }
  };

  const handleTogglePageStatus = async (pageId) => {
    try {
      const page = lawyerPages.find(p => p.id === pageId);
      const newStatus = !page.isActive;
      
      const result = await lawyerPageService.updatePage(pageId, { isActive: newStatus });
      
      if (result.success) {
        const updatedPages = lawyerPages.map(page => 
          page.id === pageId ? { ...page, isActive: newStatus } : page
        );
        setLawyerPages(updatedPages);
      } else {
        alert('Erro ao atualizar status da página: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status da página.');
    }
  };

  const getPageUrl = (page) => {
    return `${window.location.origin}/advogado/${page.slug}`;
  };

  const copyPageUrl = (page) => {
    const url = getPageUrl(page);
    navigator.clipboard.writeText(url);
    alert('URL copiada para a área de transferência!');
  };

  const handleCollaboratorPageSelect = (pageId, permissions) => {
    setCollaboratorPageAccess({ pageId, permissions });
    setCurrentView('collaboration');
  };

  const handleCollaborationChange = () => {
    // Recarregar dados quando colaborações mudarem
    loadUserPages();
  };

  if (currentView === 'create') {
    return (
      <LawyerPageBuilder 
        onBack={() => setCurrentView('list')}
        onPageCreated={handlePageCreated}
      />
    );
  }

  if (currentView === 'edit' && selectedPage) {
    return (
      <LawyerPageBuilder 
        onBack={() => setCurrentView('list')}
        onPageCreated={handlePageCreated}
        onPageUpdated={handlePageUpdated}
        editingPage={selectedPage}
      />
    );
  }

  if (currentView === 'preview' && selectedPage) {
    return (
      <div>
        <div className="bg-gray-100 border-b border-gray-200 px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('list')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar ao Gerenciador
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pré-visualização da Página</h2>
                <p className="text-sm text-gray-600">{selectedPage.nomePagina}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => copyPageUrl(selectedPage)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copiar URL
              </button>
              <span className={`px-3 py-2 rounded-full text-xs font-medium ${
                selectedPage.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {selectedPage.isActive ? 'Ativa' : 'Inativa'}
              </span>
            </div>
          </div>
        </div>
        <LawyerWebPage lawyerData={selectedPage} isPreview={true} />
      </div>
    );
  }

  if (currentView === 'collaboration' && collaboratorPageAccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Acesso Colaborativo</h1>
                <p className="text-gray-600 mt-1">
                  Você está acessando dados de uma página colaborativa
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentView('list');
                  setCollaboratorPageAccess(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
            </div>
          </div>

          {/* Abas de navegação baseadas nas permissões */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex">
                {collaboratorPageAccess.permissions.includes('appointments') && (
                  <button className="px-6 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600">
                    Agendamentos
                  </button>
                )}
                {collaboratorPageAccess.permissions.includes('clients') && (
                  <button className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                    Clientes
                  </button>
                )}
                {collaboratorPageAccess.permissions.includes('financial') && (
                  <button className="px-6 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                    Financeiro
                  </button>
                )}
              </nav>
            </div>
            <div className="p-6">
              <p className="text-gray-600">
                Interface para acessar dados colaborativos será implementada aqui.
                Permissões disponíveis: {collaboratorPageAccess.permissions.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View para gerenciar colaboradores
  if (currentView === 'manage-collaborators' && selectedPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gerenciar Colaboradores</h1>
                <p className="text-gray-600 mt-1">
                  {selectedPage.nomePagina || 'Página selecionada'}
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentView('list');
                  setSelectedPage(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
            </div>
          </div>

          {/* Componente de gerenciamento de colaboradores */}
          <CollaboratorManager 
            pageId={selectedPage.id}
            pageData={selectedPage}
            isOwner={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Páginas do Advogado</h1>
              <p className="text-gray-600 mt-1">
                Crie e gserencie suas páginas profissionais personalizadas
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
              <button
                onClick={() => setCurrentView('create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Página
              </button>
            </div>
          </div>
        </div>

        {/* Notificações de Convites */}
        <InviteNotifications />

        {/* Acesso Colaborativo */}
        <CollaboratorAccess onPageSelect={handleCollaboratorPageSelect} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Páginas</p>
                <p className="text-2xl font-bold text-gray-900">{lawyerPages.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Páginas Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lawyerPages.filter(page => page.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Visualizações</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Páginas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Suas Páginas</h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando páginas...</p>
            </div>
          ) : lawyerPages.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma página criada</h3>
              <p className="text-gray-600 mb-6">Crie sua primeira página profissional para começar a atrair clientes.</p>
              <button
                onClick={() => setCurrentView('create')}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Primeira Página
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {lawyerPages.map((page) => (
                <div key={page.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {page.logo && (
                        <img 
                          src={typeof page.logo === 'string' ? page.logo : URL.createObjectURL(page.logo)}
                          alt="Logo"
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{page.nomePagina || page.name}</h3>
                          {page.isCollaboration && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              🤝 Colaboração
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {page.isCollaboration 
                            ? `Dono: ${page.ownerName} • Nível: ${page.collaborationRole}`
                            : (page.tipoPagina === 'escritorio' ? page.nomeEscritorio : page.nomeAdvogado)
                          }
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            page.tipoPagina === 'escritorio' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {page.tipoPagina === 'escritorio' ? 'Escritório' : 'Advogado'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            page.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {page.isActive ? 'Ativa' : 'Inativa'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {page.areasAtuacao?.length || 0} áreas
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(page.createdAt || page.updatedAt || Date.now()).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setSelectedPage(page);
                          setCurrentView('preview');
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Visualizar
                      </button>

                      {/* Botão Editar - Apenas para donos da página */}
                      {!page.isCollaboration && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedPage(page);
                              setCurrentView('edit');
                            }}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>

                          {/* Botão Gerenciar Colaboradores - Apenas para donos da página */}
                          <button
                            onClick={() => {
                              setSelectedPage(page);
                              setCurrentView('manage-collaborators');
                            }}
                            className="inline-flex items-center px-3 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            Gerenciar Colaboradores
                          </button>
                        </>
                      )}

                      {/* Botão Acessar para páginas de colaboração */}
                      {page.isCollaboration && (
                        <button
                          onClick={() => handleCollaboratorPageSelect(page.id, page.collaborationPermissions)}
                          className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          Acessar
                        </button>
                      )}

                      <button
                        onClick={() => copyPageUrl(page)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copiar URL
                      </button>

                      {/* Botões administrativos - Apenas para donos da página */}
                      {!page.isCollaboration && (
                        <>
                          <button
                            onClick={() => handleTogglePageStatus(page.id)}
                            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                              page.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {page.isActive ? (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                                Desativar
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Ativar
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleDeletePage(page.id)}
                            className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* URL da página */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm text-gray-600 font-mono">{getPageUrl(page)}</span>
                      </div>
                      <button
                        onClick={() => copyPageUrl(page)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Áreas de atuação */}
                  {page.areasAtuacao && page.areasAtuacao.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {page.areasAtuacao.slice(0, 5).map((area, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {area}
                          </span>
                        ))}
                        {page.areasAtuacao.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{page.areasAtuacao.length - 5} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Gerenciador de Colaboração */}
                  <div className="mt-6">
                    <CollaborationManager 
                      pageId={page.id} 
                      onCollaborationChange={handleCollaborationChange}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerPagesManager;
