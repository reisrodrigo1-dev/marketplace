import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import Solutions from './Solutions';
import Blog from './Blog';
import HowTo from './HowTo';
import Footer from './Footer';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/escolher-perfil');
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onLoginClick={handleLoginClick} />
      <Hero />
      <Solutions />
      <Blog />
      <HowTo />
      <Footer />
    </div>
  );
};

export default HomePage;
