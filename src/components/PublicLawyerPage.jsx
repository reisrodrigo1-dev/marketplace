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
        // Debug mais detalhado
        console.log('📡 Chamando lawyerPageService.getPageBySlug...');
        const result = await lawyerPageService.getPageBySlug(slug);
        console.log('📊 Resultado da busca:', result);
        
        if (result.success) {
          console.log('✅ Página encontrada:', result.data);
          setPageData(result.data);
        } else {
          console.error('❌ Página não encontrada:', result.error);
          setError(`Página não encontrada: ${result.error}`);
          
          // Debug adicional - buscar diretamente no Firestore
          console.log('🔥 Tentando busca direta no Firestore...');
          try {
            const { 
              collection, 
              getDocs, 
              query, 
              where 
            } = await import('firebase/firestore');
            const { db } = await import('../firebase/config');

            const directQuery = query(
              collection(db, 'lawyerPages'),
              where('slug', '==', slug)
            );
            const directSnapshot = await getDocs(directQuery);
            console.log(`🎯 Busca direta encontrou ${directSnapshot.size} documentos`);
            
            if (directSnapshot.size > 0) {
              const doc = directSnapshot.docs[0];
              const data = { id: doc.id, ...doc.data() };
              console.log('📄 Documento encontrado diretamente:', data);
              
              if (data.isActive) {
                console.log('✅ Página ativa, carregando...');
                setPageData(data);
                return;
              } else {
                console.warn('⚠️ Página existe mas está inativa');
                setError('Esta página está temporariamente indisponível');
                return;
              }
            }
          } catch (directError) {
            console.error('💥 Erro na busca direta:', directError);
          }
        }
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
