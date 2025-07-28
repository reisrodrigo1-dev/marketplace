import React, { useState, useEffect } from 'react';
import { financialService } from '../firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import FinancialPageSelector from './FinancialPageSelector';

const FinancialDashboardWithPermissions = () => {
  const [selectedPage, setSelectedPage] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handlePageSelect = async (page) => {
    setSelectedPage(page);
    setError(null);
    
    if (page) {
      await loadFinancialData(page.id);
    } else {
      setFinancialData(null);
    }
  };

  const loadFinancialData = async (pageId) => {
    if (!user?.uid || !pageId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('💰 Carregando dados financeiros para página:', pageId);
      
      // Carregar resumo financeiro com verificação de acesso
      const summaryResult = await financialService.getFinancialSummaryByPage(pageId, user.uid);
      
      if (summaryResult.success) {
        console.log('✅ Dados financeiros carregados:', summaryResult.data);
        setFinancialData(summaryResult.data);
      } else {
        console.error('❌ Erro ao carregar dados financeiros:', summaryResult.error);
        setError(summaryResult.error);
      }
    } catch (error) {
      console.error('💥 Erro inesperado:', error);
      setError('Erro ao carregar informações financeiras');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <p className="text-gray-600 mt-1">
          Visualize informações financeiras das páginas que você tem acesso
        </p>
      </div>

      {/* Seletor de Página */}
      <div className="bg-white rounded-lg shadow p-6">
        <FinancialPageSelector
          onPageSelect={handlePageSelect}
          selectedPageId={selectedPage?.id}
        />
      </div>

      {/* Dados Financeiros */}
      {selectedPage && (
        <div className="space-y-6">
          {/* Informações da Página Selecionada */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Página Selecionada
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Nome:</span>
                <p className="font-medium">
                  {selectedPage.nomePagina}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Tipo:</span>
                <p className="font-medium">
                  {selectedPage.tipoPagina === 'individual' ? 'Advogado Individual' : 'Escritório'}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Seu Acesso:</span>
                <p className="font-medium">
                  {selectedPage.accessType === 'owner' ? 'Proprietário' : selectedPage.role}
                </p>
              </div>
              {selectedPage.oab && (
                <div>
                  <span className="text-sm text-gray-500">OAB:</span>
                  <p className="font-medium">{selectedPage.oab}</p>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="grid md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Resumo Financeiro */}
          {financialData && !loading && !error && (
            <>
              {/* Cards de Resumo */}
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-green-600">Total Recebido</p>
                      <p className="text-2xl font-bold text-green-900">
                        {formatCurrency(financialData.totalReceived)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-blue-600">Disponível</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(financialData.availableForWithdrawal)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-yellow-600">Bloqueado (D+30)</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {formatCurrency(financialData.pendingAmount)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-purple-600">Este Mês</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {formatCurrency(financialData.monthlyReceived)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Histórico Recente */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Últimas Transações
                </h3>
                
                {financialData.payments && financialData.payments.length > 0 ? (
                  <div className="space-y-3">
                    {financialData.payments.map((payment, index) => (
                      <div key={payment.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.description || 'Receita'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.date instanceof Date 
                              ? payment.date.toLocaleDateString('pt-BR')
                              : 'Data não disponível'
                            }
                          </p>
                        </div>
                        <span className="text-green-600 font-bold">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Nenhuma transação encontrada</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Estado Inicial */}
      {!selectedPage && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <svg className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione uma Página
          </h3>
          <p className="text-gray-600">
            Escolha uma página acima para visualizar suas informações financeiras
          </p>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboardWithPermissions;
