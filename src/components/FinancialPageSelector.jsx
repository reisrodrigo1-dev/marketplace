import React, { useState, useEffect } from 'react';
import { collaborationService, financialService } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

const FinancialPageSelector = ({ onPageSelect, selectedPageId }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadPagesWithFinancialAccess();
  }, [user]);

  const loadPagesWithFinancialAccess = async () => {
    if (!user?.uid) {
      console.log('❌ FinancialPageSelector: usuário não encontrado');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 FinancialPageSelector: Carregando páginas com acesso financeiro para usuário:', user.uid);
      console.log('🔧 FinancialPageSelector: collaborationService disponível:', typeof collaborationService);
      console.log('🔧 FinancialPageSelector: getPagesWithFinancialAccess disponível:', typeof collaborationService.getPagesWithFinancialAccess);
      
      const result = await collaborationService.getPagesWithFinancialAccess(user.uid);
      
      console.log('📊 FinancialPageSelector: Resultado completo:', result);
      
      if (result.success) {
        console.log('✅ FinancialPageSelector: Páginas carregadas com sucesso:', result.data);
        console.log('📄 FinancialPageSelector: Quantidade de páginas:', result.data.length);
        console.log('📋 FinancialPageSelector: Detalhes das páginas:', result.data.map(p => ({
          id: p.id,
          nome: p.nomePagina,
          accessType: p.accessType,
          role: p.role
        })));
        
        setPages(result.data);
        
        // Se só há uma página, selecionar automaticamente
        if (result.data.length === 1 && !selectedPageId) {
          console.log('🎯 FinancialPageSelector: Selecionando automaticamente a única página disponível');
          onPageSelect(result.data[0]);
        }
      } else {
        console.error('❌ FinancialPageSelector: Erro ao carregar páginas:', result.error);
        setError(result.error);
      }
    } catch (error) {
      console.error('💥 FinancialPageSelector: Erro inesperado:', error);
      setError('Erro ao carregar páginas com acesso financeiro');
    } finally {
      setLoading(false);
    }
  };

  const handlePageSelect = (page) => {
    console.log('📄 Página selecionada:', page);
    onPageSelect(page);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="text-yellow-800 text-sm">
            Você não tem acesso financeiro a nenhuma página
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Selecionar Página para Visualização Financeira
      </label>
      
      <div className="grid gap-3">
        {pages.map((page) => (
          <div
            key={page.id}
            onClick={() => handlePageSelect(page)}
            className={`
              p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${selectedPageId === page.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {page.nomePagina || 'Página sem nome'}
                </h3>
                
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm text-gray-500">
                    {page.tipoPagina === 'individual' ? 'Advogado Individual' : 'Escritório'}
                  </span>
                  
                  <span className={`
                    text-xs px-2 py-1 rounded-full
                    ${page.accessType === 'owner' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                    }
                  `}>
                    {page.accessType === 'owner' ? 'Proprietário' : `${page.role}`}
                  </span>
                </div>
                
                {page.oab && (
                  <p className="text-sm text-gray-500 mt-1">
                    OAB: {page.oab}
                  </p>
                )}
              </div>
              
              <div className="ml-4">
                {selectedPageId === page.id ? (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedPageId && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          💡 Você está visualizando as informações financeiras da página selecionada acima
        </div>
      )}
    </div>
  );
};

export default FinancialPageSelector;
