import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './components/HomePage';
import AdminDashboard from './components/AdminDashboard';
import ClientDashboard from './components/ClientDashboard';
import PublicLawyerPage from './components/PublicLawyerPage';
import UserTypeSelection from './components/UserTypeSelection';
import LawyerLogin from './components/LawyerLogin';
import ClientLogin from './components/ClientLogin';
import LawyerPageDebug from './components/LawyerPageDebug';
import RouteTest from './components/RouteTest';
import SlugMatcher from './components/SlugMatcher';

// Componente para proteger rotas de dashboard
const DashboardRoute = ({ userType }) => {
  const { isAuthenticated, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirecionar para login apropriado se não autenticado
    if (userType === 'cliente') {
      window.location.href = '/login-cliente';
    } else {
      window.location.href = '/login-advogado';
    }
    return null;
  }

  // Verificar se o usuário tem o tipo correto
  const currentUserType = userData?.userType || 'advogado';
  if (currentUserType !== userType) {
    // Redirecionar para dashboard correto
    if (currentUserType === 'cliente') {
      window.location.href = '/dashboard-cliente';
    } else {
      window.location.href = '/dashboard-advogado';
    }
    return null;
  }

  // Renderizar dashboard apropriado
  if (userType === 'cliente') {
    return <ClientDashboard />;
  } else {
    return <AdminDashboard />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Tela home original */}
          <Route path="/" element={<HomePage />} />
          
          {/* Tela de seleção de tipo de usuário */}
          <Route path="/escolher-perfil" element={<UserTypeSelection />} />
          
          {/* Rotas de login específicas */}
          <Route path="/login-advogado" element={<LawyerLogin />} />
          <Route path="/login-cliente" element={<ClientLogin />} />
          
          {/* Rotas de dashboard específicas */}
          <Route path="/dashboard-advogado" element={<DashboardRoute userType="advogado" />} />
          <Route path="/dashboard-cliente" element={<DashboardRoute userType="cliente" />} />
          
          {/* Página pública do advogado */}
          <Route path="/advogado/:slug" element={<PublicLawyerPage />} />
          
          {/* Debug de páginas - TEMPORÁRIO */}
          <Route path="/debug-paginas" element={<LawyerPageDebug />} />
          
          {/* Teste de roteamento - TEMPORÁRIO */}
          <Route path="/teste-rota/:slug" element={<RouteTest />} />
          
          {/* Análise de slug - TEMPORÁRIO */}
          <Route path="/slug-matcher/:slug" element={<SlugMatcher />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
