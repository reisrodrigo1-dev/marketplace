import React, { useState, useEffect } from 'react';
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
import LawyerAppointments from './LawyerAppointments';
import ClientsScreen from './ClientsScreen';
import FinancialDashboardWithPermissions from './FinancialDashboardWithPermissions';
import FinancialTest from './FinancialTest';
import FinancesPage from './FinancesPage';
import UserCodeDisplay from './UserCodeDisplay';

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
                  src="/logo_direitoHub.png" 
                  alt="DireitoHub" 
                  className="h-12 w-auto mr-3"
                />
                <span className="text-xl font-inter-bold text-gray-900">DireitoHub Admin</span>
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
              
              <button
                onClick={() => setActiveTab('clients')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'clients' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Clientes
              </button>
              
              <button
                onClick={() => setActiveTab('cases')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'cases' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Processos
              </button>
              
              <button
                onClick={() => setActiveTab('documents')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'documents' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707L15.586 5.586A1 1 0 0015 5.293V3a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
                </svg>
                Documentos
              </button>
              
              <button
                onClick={() => setActiveTab('agenda')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'agenda' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                </svg>
                Agenda
              </button>
              
              <button
                onClick={() => setActiveTab('appointments')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'appointments' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v16a2 2 0 002 2z" />
                </svg>
                Agendamentos
              </button>
              
              <button
                onClick={() => setActiveTab('juri-ai')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'juri-ai' 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Juri.AI
              </button>
              
              <button
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'jobs' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.5" />
                </svg>
                Vagas de Emprego
              </button>

              {/* Botão Últimas Notícias */}
              <button
                onClick={() => setActiveTab('news')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'news'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v11" />
                </svg>
                Últimas Notícias
              </button>
              
              <button
                onClick={() => setActiveTab('direitohub-flix')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'direitohub-flix' 
                    ? 'bg-red-100 text-red-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.8 8s-.195-1.377-.795-1.984c-.76-.797-1.613-.8-2.004-.847-2.799-.203-6.996-.203-6.996-.203h-.01s-4.197 0-6.996.203c-.391.047-1.243.05-2.004.847C2.395 6.623 2.2 8 2.2 8S2 9.62 2 11.24v1.517c0 1.618.2 3.237.2 3.237s.195 1.378.795 1.985c.761.796 1.76.77 2.205.855 1.6.154 6.8.202 6.8.202s4.203-.006 7.001-.209c.391-.047 1.243-.05 2.004-.847.6-.607.795-1.985.795-1.985s.2-1.618.2-3.237v-1.517C22 9.62 21.8 8 21.8 8zM9.935 14.595V9.405l5.403 2.595-5.403 2.595z"/>
                </svg>
                DireitoHub Flix
              </button>
              
              <button
                onClick={() => setActiveTab('lawyer-pages')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'lawyer-pages' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v11" />
                </svg>
                Página do Advogado
              </button>
              
              <button
                onClick={() => setActiveTab('financial')}
                className={`w-full flex items-center px-4 py-3 text-sm font-inter-medium rounded-lg transition-colors ${
                  activeTab === 'financial' 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Finanças
              </button>
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
          
          {activeTab === 'appointments' && (
            <LawyerAppointments />
          )}
          
          {activeTab === 'financial' && (
            <FinancesPage />
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