
import React, { useState, useEffect } from 'react';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import { salesPageService } from '../firebase/salesPageService';
import { alunoService } from '../firebase/alunoService';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SalesPageAlunoLogin = () => {
  const { aluno, login, register, loading: authLoading } = useAlunoAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const paginaId = searchParams.get('paginaId');

  // Busca dados da página de vendas
  useEffect(() => {
    async function fetchSalesPage() {
      if (!paginaId) {
        setError('ID da página não fornecido');
        setLoading(false);
        return;
      }

      try {
        const result = await salesPageService.getSalesPageById(paginaId);
        if (result.success) {
          setSalesData(result.data);
        } else {
          setError('Página de vendas não encontrada');
        }
      } catch (err) {
        setError('Erro ao carregar página');
      }
      setLoading(false);
    }

    fetchSalesPage();
  }, [paginaId]);

  // Redireciona se já estiver logado
  useEffect(() => {
    if (aluno && paginaId) {
      navigate(`/minha-pagina-de-vendas/aluno-dashboard?paginaId=${paginaId}`);
    }
  }, [aluno, paginaId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('As senhas não coincidem');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres');
          setIsSubmitting(false);
          return;
        }
        if (!name.trim()) {
          setError('Nome é obrigatório');
          setIsSubmitting(false);
          return;
        }

        await register(email, password);
        // Após o registro, o useEffect irá redirecionar
      } else {
        await login(email, password);
        // Após o login, o useEffect irá redirecionar
      }
    } catch (err) {
      let errorMessage = 'Erro ao autenticar';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Senha muito fraca';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      }
      
      setError(errorMessage);
    }
    setIsSubmitting(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error && !salesData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ {error}</div>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // Cores da página de vendas
  const cores = {
    principal: salesData?.corPrincipal || '#1e40af',
    secundaria: salesData?.corSecundaria || '#3b82f6',
    destaque: salesData?.corDestaque || '#059669'
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ 
        background: `linear-gradient(135deg, ${cores.principal}15, ${cores.secundaria}15, ${cores.destaque}15)` 
      }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header com logo da página */}
        <div className="text-center">
          {salesData?.logoUrl && (
            <img 
              src={salesData.logoUrl} 
              alt="Logo" 
              className="h-16 w-auto mx-auto mb-6"
            />
          )}
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isRegister ? 'Criar Conta' : 'Área do Aluno'}
          </h2>
          <p className="text-gray-600">
            {salesData?.nomePagina && `${salesData.nomePagina} - `}
            {isRegister ? 'Crie sua conta para acessar os cursos' : 'Faça login para acessar seus cursos'}
          </p>
        </div>

        {/* Formulário */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {isRegister && (
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isRegister}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-20 focus:border-opacity-70 transition-all duration-200"
                  style={{ 
                    focusRingColor: `${cores.principal}33`,
                    focusBorderColor: cores.principal 
                  }}
                  placeholder="Digite seu nome completo"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-20 focus:border-opacity-70 transition-all duration-200"
                style={{ 
                  focusRingColor: `${cores.principal}33`,
                  focusBorderColor: cores.principal 
                }}
                placeholder="Digite seu email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-20 focus:border-opacity-70 transition-all duration-200"
                style={{ 
                  focusRingColor: `${cores.principal}33`,
                  focusBorderColor: cores.principal 
                }}
                placeholder={isRegister ? "Crie uma senha (min. 6 caracteres)" : "Digite sua senha"}
              />
            </div>

            {isRegister && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={isRegister}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-opacity-20 focus:border-opacity-70 transition-all duration-200"
                  style={{ 
                    focusRingColor: `${cores.principal}33`,
                    focusBorderColor: cores.principal 
                  }}
                  placeholder="Confirme sua senha"
                />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ 
                background: `linear-gradient(to right, ${cores.principal}, ${cores.secundaria})` 
              }}
              onMouseEnter={e => {
                if (!isSubmitting) {
                  e.target.style.background = `linear-gradient(to right, ${cores.secundaria}, ${cores.destaque})`;
                }
              }}
              onMouseLeave={e => {
                if (!isSubmitting) {
                  e.target.style.background = `linear-gradient(to right, ${cores.principal}, ${cores.secundaria})`;
                }
              }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isRegister ? 'Criando conta...' : 'Entrando...'}
                </div>
              ) : (
                isRegister ? 'CRIAR CONTA' : 'FAZER LOGIN'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setName('');
                }}
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: cores.principal }}
              >
                {isRegister 
                  ? 'Já tem uma conta? Faça login' 
                  : 'Não tem uma conta? Cadastre-se'
                }
              </button>
            </div>
          </div>
        </form>

        {/* Informações da página */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            🔒 Login seguro • ✅ Acesso aos seus cursos • 📱 Disponível 24/7
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalesPageAlunoLogin;
