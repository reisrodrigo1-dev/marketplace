import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r shadow-lg z-50 flex flex-col pt-8">
      <div className="px-6 mb-8">
        <img src="/logo_direitoHub.png" alt="DireitoHub" className="h-12 mb-4 mx-auto" />
      </div>
      <nav className="flex-1 px-6 space-y-2">
        <Link to="/" className={`block py-2 px-4 rounded font-semibold text-gray-700 hover:bg-blue-100 transition ${location.pathname === '/' ? 'bg-blue-50 text-blue-700' : ''}`}>Dashboard</Link>
        <Link to="/clientes" className={`block py-2 px-4 rounded font-semibold text-gray-700 hover:bg-blue-100 transition ${location.pathname === '/clientes' ? 'bg-blue-50 text-blue-700' : ''}`}>Clientes</Link>
        <Link to="/processos" className={`block py-2 px-4 rounded font-semibold text-gray-700 hover:bg-blue-100 transition ${location.pathname === '/processos' ? 'bg-blue-50 text-blue-700' : ''}`}>Processos</Link>
        <Link to="/debate-history" className={`block py-2 px-4 rounded font-semibold text-gray-700 hover:bg-blue-100 transition ${location.pathname === '/debate-history' ? 'bg-blue-50 text-blue-700' : ''}`}>Histórico de Debates</Link>
        <Link to="/noticias" className={`block py-2 px-4 rounded font-semibold text-gray-700 hover:bg-blue-100 transition ${location.pathname === '/noticias' ? 'bg-blue-50 text-blue-700' : ''}`}>Notícias Jurídicas</Link>
        {/* Adicione outros links conforme necessário */}
      </nav>
    </aside>
  );
};

export default Sidebar;
