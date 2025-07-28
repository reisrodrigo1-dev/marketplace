import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import FindLawyerSection from './FindLawyerSection';
import Solutions from './Solutions';
// import Blog from './Blog';
import HowTo from './HowTo';
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
      <FindLawyerSection />
      <Solutions />
      {/* <Blog /> Removido conforme solicitado */}
      {/* Seção de Notícias e botão 'O QUE VC FARIA?' removidos conforme solicitado */}
      <HowTo />
      <Footer />
      {showManualDebate && (
        <ManualDebateModal
          onClose={handleCloseManualDebate}
          onStartDebate={handleStartManualDebate}
        />
      )}
      {showLegalDebateModal && manualNewsObj && (
        <LegalDebateModal
          news={manualNewsObj}
          onClose={handleCloseLegalDebateModal}
        />
      )}
    </div>
  );
};

export default HomePage;
