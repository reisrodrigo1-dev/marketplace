import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { salesPageService } from '../firebase/salesPageService';
import SalesPageBuilder from './SalesPageBuilder';
import InviteNotifications from './InviteNotifications';
import CollaboratorAccess from './CollaboratorAccess';
import CollaborationManager from './CollaborationManager';
import CollaboratorManager from './CollaboratorManager';

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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gerenciar Minhas Páginas de Vendas
            </h1>
            <p className="text-gray-600 mt-1">
              Crie e gerencie suas páginas de vendas personalizadas
            </p>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md font-semibold hover:bg-blue-700 transition-colors"
            onClick={() => setShowBuilder(true)}
          >
            Criar nova Página
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6">
        {showBuilder ? (
          <SalesPageBuilder
            onBack={() => { setShowBuilder(false); setEditingPage(null); }}
            editingPage={editingPage}
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
        ) : salesPages.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-lg font-semibold text-gray-800">
              Nenhuma página de vendas encontrada
            </h2>
            <p className="text-gray-500 mt-2">
              Você ainda não criou nenhuma página de vendas. Clique no botão abaixo
              para criar sua primeira página.
            </p>
            <div className="mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md" onClick={() => setShowBuilder(true)}>
                Criar Página de Vendas
              </button>
            </div>
          </div>
        ) : (
          salesPages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">
                {page.nomePagina || page.titulo || 'Página sem nome'}
              </h3>
              {page.titulo && (
                <div className="text-blue-700 font-bold text-base mb-1">{page.titulo}</div>
              )}
              <p className="text-gray-500 mt-1">{page.descricao}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded-md shadow-md"
                  onClick={() => { setEditingPage(page); setShowBuilder(true); }}
                >
                  Editar Página
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded-md shadow-md"
                  onClick={async () => {
                    if (window.confirm('Tem certeza que deseja excluir esta página?')) {
                      await salesPageService.deleteSalesPage(page.id);
                      setSalesPages(salesPages.filter(p => p.id !== page.id));
                    }
                  }}
                >
                  Excluir Página
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-md"
                  onClick={() => window.open(`/minha-pagina-de-vendas/web?id=${page.id}`, '_blank')}
                >
                  Visualizar Página
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
