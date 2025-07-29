import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import Footer from './Footer';
import NewsList from './NewsList';
import ManualDebateModal from './ManualDebateModal';

import { useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const HomePage = () => {
  const navigate = useNavigate();
  const [showManualDebate, setShowManualDebate] = useState(false);
  const [manualDebateText, setManualDebateText] = useState(null);
  const [showLegalDebateModal, setShowLegalDebateModal] = useState(false);
  const [manualNewsObj, setManualNewsObj] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const db = getFirestore();
        const snapshot = await getDocs(collection(db, 'users'));
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Contas cadastradas:', users);
        users.forEach(u => {
          console.log(`- Nome: ${u.name || 'N/A'} | Email: ${u.email || 'N/A'} | ID: ${u.id}`);
        });
      } catch (error) {
        console.error('Erro ao buscar contas cadastradas:', error);
      }
    }
    fetchUsers();
  }, []);

  const handleLoginClick = () => {
    navigate('/escolher-perfil');
  };

  const handleOpenManualDebate = () => {
    setShowManualDebate(true);
  };

  const handleCloseManualDebate = () => {
    setShowManualDebate(false);
    setManualDebateText(null);
  };

  const handleStartManualDebate = (text) => {
    setManualDebateText(text);
    setShowManualDebate(false);
    setManualNewsObj({ title: 'Notícia Manual', summary: text, description: text });
    setShowLegalDebateModal(true);
  };

  const handleCloseLegalDebateModal = () => {
    setShowLegalDebateModal(false);
    setManualNewsObj(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onLoginClick={handleLoginClick} />
      <Hero />
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-blue-600 mb-2">Criação de Conteúdo Jurídico</h2>
          <p className="text-lg text-yellow-500 font-semibold mb-4">Compartilhe conhecimento, inspire colegas e transforme o Direito!</p>
          <p className="text-xl text-gray-700 mb-8">
            Nossa plataforma é dedicada à produção e divulgação de conteúdo relevante para advogados e profissionais do direito. Aqui você pode publicar artigos, gravar vídeos, compartilhar podcasts e materiais exclusivos, ampliando sua presença digital e construindo autoridade no universo jurídico.
          </p>
          <div className="flex flex-col gap-6 items-center">
            <div id="artigos" className="bg-white rounded-xl shadow-lg p-8 w-full scroll-mt-32">
              <h3 className="text-2xl font-semibold text-yellow-500 mb-2">Publique Artigos</h3>
              <p className="text-gray-600 mb-2">Compartilhe sua experiência, análises e opiniões sobre temas jurídicos atuais.</p>
              <ul className="text-left text-gray-500 text-sm list-disc list-inside">
                <li>Artigos doutrinários e práticos</li>
                <li>Estudos de caso e comentários de jurisprudência</li>
                <li>Resenhas de livros e novidades legislativas</li>
              </ul>
            </div>
            <div id="videos" className="bg-white rounded-xl shadow-lg p-8 w-full scroll-mt-32">
              <h3 className="text-2xl font-semibold text-blue-500 mb-2">Grave Vídeos & Podcasts</h3>
              <p className="text-gray-600 mb-2">Ensine, explique e eduque através de vídeos práticos, entrevistas e podcasts.</p>
              <ul className="text-left text-gray-500 text-sm list-disc list-inside">
                <li>Tutoriais e dicas práticas</li>
                <li>Debates e entrevistas com especialistas</li>
                <li>Conteúdo em áudio e vídeo para todas as áreas do Direito</li>
              </ul>
            </div>
            <div id="autoridade" className="bg-white rounded-xl shadow-lg p-8 w-full scroll-mt-32">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Construa sua Autoridade</h3>
              <p className="text-gray-600 mb-2">Aumente sua visibilidade, conecte-se com outros profissionais e seja referência no seu nicho.</p>
              <ul className="text-left text-gray-500 text-sm list-disc list-inside">
                <li>Receba feedback e comentários da comunidade</li>
                <li>Amplie seu networking e oportunidades profissionais</li>
                <li>Participe de rankings e destaques mensais</li>
              </ul>
            </div>
          </div>
          <div className="mt-10">
            <a href="#criar-conteudo" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-all duration-200">
              Comece a criar conteúdo agora
            </a>
            <p className="text-gray-500 text-sm mt-4">Formatos aceitos: artigos, vídeos, podcasts, e-books e mais.</p>
          </div>
          <div className="mt-8 text-gray-400 text-xs">
            Junte-se à nossa comunidade e ajude a transformar o Direito através do compartilhamento de conhecimento.
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;
