import React, { useState, useEffect, Suspense } from 'react';
import DebateHistory from '../pages/DebateHistory';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProcessesScreen from './ProcessesScreen';
import JuriAI from './JuriAI';
import Calendar from './Calendar';
import JobsScreen from './JobsScreen';
import DireitoHubFlix from './DireitoHubFlix';
import UltimasNoticiasFlix from './UltimasNoticiasFlix';
import UserProfile from './UserProfile';
import LawyerPagesManager from './LawyerPagesManager';
import SalesPageManager from './SalesPageManager';
import LawyerAppointments from './LawyerAppointments';
import ClientsScreen from './ClientsScreen';
import FinancialDashboardWithPermissions from './FinancialDashboardWithPermissions';
import FinancialTest from './FinancialTest';
import ProductCreator from './ProductCreator';
import FinancesPage from './FinancesPage';
import UserCodeDisplay from './UserCodeDisplay';
import AlunosManager from './AlunosManager';

const AdminDashboard = () => {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Dados fictícios para demonstração
  const stats = {
    totalClients: 15,
    activeCases: 8,
    pendingTasks: 3,
    upcomingHearings: 2
  };

  const recentActivities = [
    { id: 1, type: 'client', message: 'Novo cliente: Maria Silva', time: '2 horas atrás' },
    { id: 2, type: 'case', message: 'Processo 123456 atualizado', time: '4 horas atrás' },
    { id: 3, type: 'document', message: 'Documento enviado para João Santos', time: '1 dia atrás' },
    { id: 4, type: 'hearing', message: 'Audiência agendada para 15/08', time: '2 dias atrás' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da tela admin */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <img 
                  src="/logo_Marketplace.png" 
                  alt="Marketplace" 
                  className="h-12 w-auto mr-3"
                />
                <span className="text-xl font-inter-bold text-gray-900">Marketplace Admin</span>
              </div>
              
              {/* Código do Advogado */}
              <div className="hidden lg:block">
                <UserCodeDisplay showLabel={true} />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Dropdown do usuário */}
              <div className="relative user-dropdown">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-inter-medium">
                      {userData?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-inter-medium text-gray-900">
                      {userData?.name || user?.displayName || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email}
                    </p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                    {/* Informações do usuário */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-medium text-gray-900">
                        {userData?.name || user?.displayName || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      {userData?.oabNumber && (
                        <p className="text-xs text-blue-600 mt-1">OAB: {userData.oabNumber}</p>
                      )}
                      
                      {/* Código do Advogado no dropdown mobile */}
                      <div className="mt-2 lg:hidden">
                        <UserCodeDisplay showLabel={true} size="small" />
                      </div>
                    </div>

                    {/* Opções do menu */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setShowUserProfile(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Meu Perfil
                      </button>
                      
                      <button
                        onClick={() => {
                          setActiveTab('dashboard');
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard
                      </button>

                      <div className="border-t my-1"></div>

                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aviso de versão global */}
      <div className="w-full bg-yellow-200 text-yellow-900 text-center py-2 text-sm font-semibold shadow-sm z-40">
        ⚠️ Sistema em Versão V.1.6.0 BETA — Algumas funcionalidades estão em teste. Caso encontre instabilidades, reporte ao suporte.
      </div>

      {/* Navegação lateral */}
      <div className="flex">
        <div className="w-64 bg-white shadow-sm h-screen">
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
                </svg>
                Dashboard
              </button>

              {/* Dropdown 'Criador de Conteúdo' */}
              <div className="relative group">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                    activeTab === 'content-creator' 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Criador de Conteúdo
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => setActiveTab('meus-produtos')}
                    className={`w-full text-left px-4 py-2 text-sm font-inter-medium rounded-lg hover:bg-yellow-50 ${activeTab === 'meus-produtos' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-700'}`}
                  >Meus Produtos</button>
                  <button
                    onClick={() => setActiveTab('minha-pagina-vendas')}
                    className={`w-full text-left px-4 py-2 text-sm font-inter-medium rounded-lg hover:bg-yellow-50 ${activeTab === 'minha-pagina-vendas' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-700'}`}
                  >Minha Página de Vendas</button>
                  <button
                    onClick={() => setActiveTab('financeiro')}
                    className={`w-full text-left px-4 py-2 text-sm font-inter-medium rounded-lg hover:bg-yellow-50 ${activeTab === 'financeiro' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-700'}`}
                  >Financeiro</button>
                  <button
                    onClick={() => setActiveTab('gerenciar-alunos')}
                    className={`w-full text-left px-4 py-2 text-sm font-inter-medium rounded-lg hover:bg-yellow-50 ${activeTab === 'gerenciar-alunos' ? 'bg-yellow-100 text-yellow-700' : 'text-gray-700'}`}
                  >Gerenciar Alunos</button>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-inter-bold text-gray-900 mb-8">Dashboard</h1>
              {/* Cards de estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-inter-medium text-gray-600">Total de Clientes</p>
                      <p className="text-2xl font-inter-bold text-gray-900">{stats.totalClients}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-inter-medium text-gray-600">Processos Ativos</p>
                      <p className="text-2xl font-inter-bold text-gray-900">{stats.activeCases}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-inter-medium text-gray-600">Tarefas Pendentes</p>
                      <p className="text-2xl font-inter-bold text-gray-900">{stats.pendingTasks}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-inter-medium text-gray-600">Próximas Audiências</p>
                      <p className="text-2xl font-inter-bold text-gray-900">{stats.upcomingHearings}</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Atividades recentes */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">Atividades Recentes</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          activity.type === 'client' ? 'bg-blue-500' :
                          activity.type === 'case' ? 'bg-green-500' :
                          activity.type === 'document' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'debate-history' && (
            <Suspense fallback={<div className="text-gray-500">Carregando histórico de debates...</div>}>
              <DebateHistory />
            </Suspense>
          )}
          
          {activeTab === 'clients' && (
            <ClientsScreen />
          )}
          
          {activeTab === 'cases' && (
            <ProcessesScreen />
          )}
          
          {activeTab === 'documents' && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Documentos</h1>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-600">Sistema de gerenciamento de documentos em desenvolvimento...</p>
              </div>
            </div>
          )}
          
          {activeTab === 'agenda' && (
            <Calendar />
          )}
          
          {activeTab === 'juri-ai' && (
            <JuriAI />
          )}
          
          {activeTab === 'jobs' && (
            <JobsScreen />
          )}
          

          {activeTab === 'direitohub-flix' && (
            <DireitoHubFlix />
          )}

          {activeTab === 'news' && (
            <UltimasNoticiasFlix />
          )}
          
          {activeTab === 'lawyer-pages' && (
            <LawyerPagesManager onBack={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'minha-pagina-vendas' && (
            <SalesPageManager onBack={() => setActiveTab('dashboard')} />
          )}
          
          {activeTab === 'appointments' && (
            <LawyerAppointments />
          )}
          
          {activeTab === 'financial' && (
            <FinancesPage />
          )}

          {activeTab === 'meus-produtos' && (
            <ProductCreator faseada enableLessonsPerModule />
          )}

          {activeTab === 'gerenciar-alunos' && (
            <AlunosManager />
          )}
        </div>
      </div>

      {/* Modal de Perfil do Usuário */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => setShowUserProfile(false)}
      />
    </div>
  );
};

export default AdminDashboard;