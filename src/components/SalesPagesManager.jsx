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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Principal */}
      <div className="bg-white shadow-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Minhas Páginas de Vendas
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Gerencie e crie páginas de vendas profissionais para seus cursos
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBuilder(true)}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Criar Nova Página
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showBuilder ? null : salesPages.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Sua primeira página de vendas
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Crie páginas de vendas profissionais e atrativas para seus cursos. 
                Aumente suas conversões com design otimizado e funcionalidades completas.
              </p>
              <button 
                onClick={() => setShowBuilder(true)}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Começar Agora
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {salesPages.map((page) => (
              <div
                key={page.id}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
              >
                {/* Header do Card */}
                <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>
                  </div>
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-2 truncate">
                      {page.nomePagina || page.titulo || 'Página sem nome'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm opacity-90">Ativa</span>
                    </div>
                  </div>
                </div>

                {/* Conteúdo do Card */}
                <div className="p-6">
                  {page.titulo && (
                    <div className="text-blue-700 font-semibold text-base mb-3 line-clamp-2">
                      {page.titulo}
                    </div>
                  )}

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">-</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Visualizações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">-</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Conversões</div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={() => window.open(`/minha-pagina-de-vendas/web?id=${page.id}`, '_blank')}
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Visualizar
                    </button>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => { setEditingPage(page); setShowBuilder(true); }}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Tem certeza que deseja excluir esta página?')) {
                            await salesPageService.deleteSalesPage(page.id);
                            setSalesPages(salesPages.filter(p => p.id !== page.id));
                          }
                        }}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
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