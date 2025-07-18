import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { lawyerPageService } from '../firebase/firestore';

const SlugMatcher = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [allPages, setAllPages] = useState([]);
  const [matchedPage, setMatchedPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [possibleMatches, setPossibleMatches] = useState([]);

  useEffect(() => {
    const findMatchingPages = async () => {
      try {
        console.log('🔍 Slug recebido:', slug);
        console.log('🌐 URL completa:', location.pathname);

        // Buscar todas as páginas diretamente no Firestore
        const { 
          collection, 
          getDocs 
        } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');

        const pagesSnapshot = await getDocs(collection(db, 'lawyerPages'));
        const pages = [];
        
        pagesSnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          pages.push(data);
        });

        console.log('📋 Todas as páginas encontradas:', pages.length);
        setAllPages(pages);

        // Tentar correspondências exatas e aproximadas
        const exactMatch = pages.find(page => page.slug === slug);
        const withHyphen = pages.find(page => page.slug === `${slug}-`);
        const withoutHyphen = pages.find(page => page.slug === slug.replace(/-$/, ''));
        const similarSlugs = pages.filter(page => 
          page.slug.includes(slug) || slug.includes(page.slug)
        );

        console.log('🎯 Correspondência exata:', exactMatch);
        console.log('➕ Com hífen final:', withHyphen);
        console.log('➖ Sem hífen final:', withoutHyphen);
        console.log('🔗 Slugs similares:', similarSlugs);

        if (exactMatch) {
          setMatchedPage(exactMatch);
        } else if (withHyphen) {
          setMatchedPage(withHyphen);
        } else if (withoutHyphen) {
          setMatchedPage(withoutHyphen);
        }

        setPossibleMatches(similarSlugs);

      } catch (error) {
        console.error('❌ Erro ao buscar páginas:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      findMatchingPages();
    }
  }, [slug, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Procurando página...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🔍 Análise de Slug</h1>
        
        <div className="space-y-6">
          {/* Informações da URL */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900">📍 Informações da Requisição</h2>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-blue-800">
                <strong>Slug capturado:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{slug}</code>
              </p>
              <p className="text-sm text-blue-800">
                <strong>URL completa:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{location.pathname}</code>
              </p>
              <p className="text-sm text-blue-800">
                <strong>Tamanho do slug:</strong> {slug?.length || 0} caracteres
              </p>
            </div>
          </div>

          {/* Página encontrada */}
          {matchedPage && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h2 className="font-semibold text-green-900">✅ Página Encontrada!</h2>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-green-800">
                  <strong>Nome:</strong> {matchedPage.nomePagina}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Slug correto:</strong> <code className="bg-green-100 px-2 py-1 rounded">{matchedPage.slug}</code>
                </p>
                <p className="text-sm text-green-800">
                  <strong>Status:</strong> {matchedPage.isActive ? '✅ Ativa' : '❌ Inativa'}
                </p>
                <p className="text-sm text-green-800">
                  <strong>ID:</strong> {matchedPage.id}
                </p>
                {matchedPage.isActive && (
                  <div className="mt-3">
                    <button
                      onClick={() => window.location.href = `/advogado/${matchedPage.slug}`}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      🔄 Carregar Página
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Correspondências similares */}
          {possibleMatches.length > 0 && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h2 className="font-semibold text-yellow-900">🔗 Páginas Similares</h2>
              <div className="mt-2 space-y-2">
                {possibleMatches.map((page) => (
                  <div key={page.id} className="bg-yellow-100 p-2 rounded">
                    <p className="text-sm text-yellow-800">
                      <strong>{page.nomePagina}</strong>
                    </p>
                    <p className="text-xs text-yellow-700">
                      Slug: <code>{page.slug}</code> | 
                      Status: {page.isActive ? 'Ativa' : 'Inativa'}
                    </p>
                    {page.isActive && (
                      <button
                        onClick={() => window.location.href = `/advogado/${page.slug}`}
                        className="mt-1 px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                      >
                        Acessar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Todas as páginas */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="font-semibold text-gray-900">📋 Todas as Páginas ({allPages.length})</h2>
            <div className="mt-2 max-h-60 overflow-y-auto space-y-2">
              {allPages.map((page) => (
                <div key={page.id} className="bg-white p-2 rounded border text-xs">
                  <p className="font-medium">{page.nomePagina}</p>
                  <p className="text-gray-600">
                    Slug: <code className="bg-gray-100 px-1 rounded">{page.slug}</code>
                  </p>
                  <p className="text-gray-600">
                    Status: {page.isActive ? '✅ Ativa' : '❌ Inativa'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Variações do slug atual */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h2 className="font-semibold text-purple-900">🧪 Variações do Slug</h2>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-purple-800">
                <strong>Original:</strong> <code className="bg-purple-100 px-1 rounded">{slug}</code>
              </p>
              <p className="text-sm text-purple-800">
                <strong>Com hífen:</strong> <code className="bg-purple-100 px-1 rounded">{slug}-</code>
              </p>
              <p className="text-sm text-purple-800">
                <strong>Sem hífen final:</strong> <code className="bg-purple-100 px-1 rounded">{slug?.replace(/-$/, '')}</code>
              </p>
              <p className="text-sm text-purple-800">
                <strong>Lowercase:</strong> <code className="bg-purple-100 px-1 rounded">{slug?.toLowerCase()}</code>
              </p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🏠 Voltar ao Início
            </button>
            <button
              onClick={() => window.location.href = '/debug-paginas'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🐛 Debug Completo
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🔄 Recarregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlugMatcher;
