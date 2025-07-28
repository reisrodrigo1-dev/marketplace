
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { salesPageService } from '../firebase/salesPageService';
import SalesPageBuilder from './SalesPageBuilder';
import InviteNotifications from './InviteNotifications';
import CollaboratorAccess from './CollaboratorAccess';
import CollaborationManager from './CollaborationManager';
import CollaboratorManager from './CollaboratorManager';
import Modal from './Modal';

export default function SalesPagesManager() {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const { user } = useAuth();
  const [salesPages, setSalesPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPages() {
      setLoading(true);
      const userId = user?.uid;
      if (!userId) {
        setSalesPages([]);
        setLoading(false);
        return;
      }
      const result = await salesPageService.getUserSalesPages(userId);
      if (result.success) {
        setSalesPages(result.data);
      } else {
        setSalesPages([]);
      }
      setLoading(false);
    }
    fetchPages();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Carregando páginas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Principal */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                  Páginas de Vendas
                </h1>
                <p className="text-gray-600 text-xl mt-2 font-medium">
                  Crie páginas profissionais que convertem visitantes em clientes
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-500 font-medium">{salesPages.length} páginas ativas</span>
                  </div>
                  <div className="w-1 h-4 bg-gray-300 rounded-full"></div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm text-gray-500 font-medium">Analytics disponíveis</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowBuilder(true)}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <svg className="relative w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="relative text-lg">Criar Nova Página</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showBuilder ? null : salesPages.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              {/* Ilustração */}
              <div className="relative mb-12">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-100 via-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                  <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute top-4 right-1/3 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
                <div className="absolute bottom-8 left-1/4 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-500"></div>
              </div>

              {/* Conteúdo */}
              <h2 className="text-4xl font-black text-gray-900 mb-6">
                Sua primeira página de vendas
              </h2>
              <p className="text-gray-600 text-xl mb-8 leading-relaxed max-w-xl mx-auto">
                Transforme visitantes em clientes com páginas de vendas profissionais. 
                Design otimizado, alta conversão e resultados comprovados.
              </p>

              {/* Benefícios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Alta Conversão</h3>
                  <p className="text-gray-600 text-sm">Templates otimizados para vendas</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Responsivo</h3>
                  <p className="text-gray-600 text-sm">Perfeito em todos os dispositivos</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2">Rápido</h3>
                  <p className="text-gray-600 text-sm">Criação em poucos minutos</p>
                </div>
              </div>

              <button 
                onClick={() => setShowBuilder(true)}
                className="group inline-flex items-center px-10 py-5 bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 text-xl"
              >
                <svg className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Começar Agora - É Grátis
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Estatísticas Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total de Páginas</p>
                    <p className="text-3xl font-black text-gray-900">{salesPages.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Visualizações</p>
                    <p className="text-3xl font-black text-gray-900">-</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Conversões</p>
                    <p className="text-3xl font-black text-gray-900">-</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Taxa Conv.</p>
                    <p className="text-3xl font-black text-gray-900">-%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Páginas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {salesPages.map((page) => (
                <div
                  key={page.id}
                  className="group bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-500"
                >
                  {/* Header do Card com Gradiente */}
                  <div className="relative h-40 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-6">
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-semibold">Ativa</span>
                      </div>
                    </div>

                    {/* Título */}
                    <div className="text-white">
                      <h3 className="text-2xl font-black mb-3 truncate group-hover:text-yellow-200 transition-colors duration-300">
                        {page.nomePagina || page.titulo || 'Página sem nome'}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm opacity-90 font-medium">Online</span>
                      </div>
                    </div>

                    {/* Decoração */}
                    <div className="absolute bottom-0 right-0 opacity-20">
                      <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-6">
                    {page.titulo && (
                      <div className="text-gray-700 font-semibold text-lg mb-4 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
                        {page.titulo}
                      </div>
                    )}

                    {/* Métricas */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-2xl p-4 text-center group-hover:bg-blue-50 transition-colors duration-300">
                        <div className="text-2xl font-black text-gray-800 mb-1">-</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Visualizações</div>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 text-center group-hover:bg-green-50 transition-colors duration-300">
                        <div className="text-2xl font-black text-green-600 mb-1">-</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Conversões</div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="space-y-3">
                      <button
                        onClick={() => window.open(`/minha-pagina-de-vendas/web?id=${page.id}`, '_blank')}
                        className="w-full inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Visualizar Página
                      </button>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => { setEditingPage(page); setShowBuilder(true); }}
                          className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 hover:scale-[1.02] transition-all duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm('Tem certeza que deseja excluir esta página? Esta ação não pode ser desfeita.')) {
                              await salesPageService.deleteSalesPage(page.id);
                              setSalesPages(salesPages.filter(p => p.id !== page.id));
                            }
                          }}
                          className="px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl hover:scale-[1.02] transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showBuilder} onClose={() => { setShowBuilder(false); setEditingPage(null); }} title={editingPage ? 'Editar Página de Vendas' : 'Criar Página de Vendas'}>
        <SalesPageBuilder
          onBack={() => { setShowBuilder(false); setEditingPage(null); }}
          editingPage={editingPage}
          onPageCreated={async (id) => {
            // Atualiza a lista após criação
            const userId = user?.uid;
            if (!userId) return;
            const result = await salesPageService.getUserSalesPages(userId);
            if (result.success) setSalesPages(result.data);
            setShowBuilder(false);
            setEditingPage(null);
          }}
          onPageUpdated={async (id) => {
            // Atualiza a lista após edição
            const userId = user?.uid;
            if (!userId) return;
            const result = await salesPageService.getUserSalesPages(userId);
            if (result.success) setSalesPages(result.data);
            setShowBuilder(false);
            setEditingPage(null);
          }}
        />
      </Modal>
    </div>
  );
}
