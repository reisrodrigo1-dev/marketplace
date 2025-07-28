import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { lawyerPageService } from '../firebase/firestore';
import LawyerWebPage from './LawyerWebPage';

const PublicLawyerPage = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPage = async () => {
      if (!slug) {
        console.error('❌ Slug não fornecido');
        setError('Página não encontrada - slug vazio');
        setLoading(false);
        return;
      }

      console.log('🔍 Procurando página com slug:', slug);

      try {
        // Tentativa 1: Busca exata via service
        console.log('📡 Tentativa 1: Busca exata via lawyerPageService...');
        let result = await lawyerPageService.getPageBySlug(slug);
        console.log('📊 Resultado busca exata:', result);
        
        if (result.success) {
          console.log('✅ Página encontrada (busca exata):', result.data);
          setPageData(result.data);
          return;
        }

        // Tentativa 2: Busca com variações do slug
        console.log('🔄 Tentativa 2: Testando variações do slug...');
        
        const slugVariations = [
          `${slug}-`,           // Adicionar hífen final
          slug.replace(/-$/, ''), // Remover hífen final
          slug.toLowerCase(),    // Lowercase
          slug.toUpperCase()     // Uppercase (improvável, mas...)
        ];

        for (const variation of slugVariations) {
          if (variation !== slug) {
            console.log(`🧪 Testando variação: "${variation}"`);
            result = await lawyerPageService.getPageBySlug(variation);
            if (result.success) {
              console.log(`✅ Página encontrada com variação "${variation}":`, result.data);
              // Redirecionar para URL correta
              window.history.replaceState(null, '', `/advogado/${variation}`);
              setPageData(result.data);
              return;
            }
          }
        }

        // Tentativa 3: Busca direta no Firestore com correspondência flexível
        console.log('🔥 Tentativa 3: Busca direta no Firestore...');
        const { 
          collection, 
          getDocs 
        } = await import('firebase/firestore');
        const { db } = await import('../firebase/config');

        const allPagesSnapshot = await getDocs(collection(db, 'lawyerPages'));
        console.log(`📊 Total de páginas no banco: ${allPagesSnapshot.size}`);

        let foundPage = null;
        const similarPages = [];

        allPagesSnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          
          // Correspondência exata
          if (data.slug === slug) {
            foundPage = data;
            return;
          }
          
          // Correspondências similares
          if (data.slug && (
            data.slug.includes(slug) || 
            slug.includes(data.slug) ||
            data.slug.toLowerCase() === slug.toLowerCase()
          )) {
            similarPages.push(data);
          }
        });

        if (foundPage && foundPage.isActive) {
          console.log('✅ Página encontrada (busca direta):', foundPage);
          setPageData(foundPage);
          return;
        }

        // Se encontrou páginas similares, sugerir
        if (similarPages.length > 0) {
          const activeSimilar = similarPages.filter(p => p.isActive);
          if (activeSimilar.length > 0) {
            console.log('🔗 Páginas similares encontradas:', activeSimilar);
            
            // Redirecionar automaticamente para a primeira correspondência ativa
            const bestMatch = activeSimilar[0];
            console.log(`🎯 Redirecionando para melhor correspondência: ${bestMatch.slug}`);
            window.location.href = `/advogado/${bestMatch.slug}`;
            return;
          }
        }

        // Se chegou até aqui, página não encontrada
        console.error('❌ Página não encontrada após todas as tentativas');
        setError(`Página não encontrada. Slug procurado: "${slug}"`);
        
      } catch (err) {
        console.error('💥 Erro ao carregar página:', err);
        setError(`Erro técnico: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando página...</p>
        </div>
      </div>
    );
  }

  if (error || !pageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Página não encontrada</h1>
          <p className="text-gray-600 mb-6">{error || 'A página que você está procurando não existe ou foi removida.'}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // Usar o mesmo componente LawyerWebPage que é usado no preview
  return <LawyerWebPage lawyerData={pageData} isPreview={false} />;
};

export default PublicLawyerPage;
