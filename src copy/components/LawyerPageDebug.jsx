import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lawyerPageService } from '../firebase/firestore';

const LawyerPageDebug = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testSlug, setTestSlug] = useState('rodrigo-munhoz-reis-');
  const [testResult, setTestResult] = useState(null);

  const loadUserPages = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await lawyerPageService.getUserPages(user.uid);
      if (result.success) {
        setPages(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSlugSearch = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testando slug:', testSlug);
      const result = await lawyerPageService.getPageBySlug(testSlug);
      console.log('📄 Resultado:', result);
      setTestResult(result);
    } catch (error) {
      console.error('Erro no teste:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testDirectFirestore = async () => {
    setLoading(true);
    try {
      console.log('🔥 Testando busca direta no Firestore...');
      
      const { 
        collection, 
        getDocs, 
        query, 
        where 
      } = await import('firebase/firestore');
      const { db } = await import('../firebase/config');

      // Buscar todas as páginas
      const allPagesSnapshot = await getDocs(collection(db, 'lawyerPages'));
      console.log('📊 Total de páginas no banco:', allPagesSnapshot.size);

      const allPages = [];
      allPagesSnapshot.forEach((doc) => {
        allPages.push({
          id: doc.id,
          slug: doc.data().slug,
          nomePagina: doc.data().nomePagina,
          isActive: doc.data().isActive,
          lawyerId: doc.data().lawyerId
        });
      });

      console.log('📋 Todas as páginas:', allPages);

      // Buscar especificamente o slug
      const specificQuery = query(
        collection(db, 'lawyerPages'),
        where('slug', '==', testSlug)
      );
      const specificSnapshot = await getDocs(specificQuery);
      console.log('🎯 Páginas com slug específico:', specificSnapshot.size);

      const specificPages = [];
      specificSnapshot.forEach((doc) => {
        specificPages.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setTestResult({
        success: true,
        data: {
          totalPages: allPages.length,
          allPages: allPages,
          specificSlugResults: specificPages,
          searchedSlug: testSlug
        }
      });

    } catch (error) {
      console.error('Erro no teste direto:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserPages();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Usuário não logado. Faça login para debug das páginas.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">🐛 Debug - Páginas do Advogado</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Suas Páginas</h3>
        {loading && <p className="text-gray-600">Carregando...</p>}
        {pages.length > 0 ? (
          <div className="space-y-2">
            {pages.map((page) => (
              <div key={page.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{page.nomePagina}</p>
                    <p className="text-sm text-gray-600">Slug: <code className="bg-gray-200 px-1 rounded">{page.slug}</code></p>
                    <p className="text-sm text-gray-600">
                      Status: <span className={page.isActive ? 'text-green-600' : 'text-red-600'}>
                        {page.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </p>
                  </div>
                  <a 
                    href={`/advogado/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver página →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhuma página encontrada.</p>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Teste de Slug</h3>
        <div className="flex gap-3 mb-3">
          <input
            type="text"
            value={testSlug}
            onChange={(e) => setTestSlug(e.target.value)}
            placeholder="Digite o slug para testar"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={testSlugSearch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Testar Slug
          </button>
          <button
            onClick={testDirectFirestore}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Busca Direta
          </button>
        </div>
      </div>

      {testResult && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Resultado do Teste</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            {testResult.success ? (
              <div>
                {testResult.data?.totalPages !== undefined ? (
                  // Resultado da busca direta
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900">📊 Estatísticas</h4>
                      <p className="text-sm text-gray-600">Total de páginas no banco: {testResult.data.totalPages}</p>
                      <p className="text-sm text-gray-600">Resultados para slug "{testResult.data.searchedSlug}": {testResult.data.specificSlugResults.length}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900">📋 Todas as Páginas</h4>
                      <div className="mt-2 space-y-2">
                        {testResult.data.allPages.map((page) => (
                          <div key={page.id} className="text-sm bg-white p-2 rounded border">
                            <p><strong>Nome:</strong> {page.nomePagina}</p>
                            <p><strong>Slug:</strong> <code className="bg-gray-200 px-1 rounded">{page.slug}</code></p>
                            <p><strong>Ativa:</strong> {page.isActive ? '✅' : '❌'}</p>
                            <p><strong>ID:</strong> {page.id}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {testResult.data.specificSlugResults.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900">🎯 Resultados do Slug Específico</h4>
                        <div className="mt-2 space-y-2">
                          {testResult.data.specificSlugResults.map((page) => (
                            <div key={page.id} className="text-sm bg-green-50 p-2 rounded border border-green-200">
                              <p><strong>✅ Página encontrada!</strong></p>
                              <p><strong>Nome:</strong> {page.nomePagina}</p>
                              <p><strong>Slug:</strong> {page.slug}</p>
                              <p><strong>Ativa:</strong> {page.isActive ? 'Sim' : 'Não'}</p>
                              <p><strong>Lawyer ID:</strong> {page.lawyerId}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Resultado da busca via service
                  <div>
                    <h4 className="font-medium text-green-800">✅ Página encontrada via lawyerPageService</h4>
                    <pre className="mt-2 text-sm bg-green-50 p-2 rounded overflow-auto">
                      {JSON.stringify(testResult.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h4 className="font-medium text-red-800">❌ Erro</h4>
                <p className="text-sm text-red-600">{testResult.error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>💡 Dica:</strong> Abra o Console do navegador (F12) para ver logs detalhados.
        </p>
      </div>
    </div>
  );
};

export default LawyerPageDebug;
