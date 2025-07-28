// Animação pulsar para CTAs
// Animação pulsar para CTAs
const pulseStyle = {
  animation: 'pulse-cta 1.8s infinite',
};

  // ...existing code...
// Hook para cronômetro regressivo
function useCountdown(minutes = 30) {
  const [secondsLeft, setSecondsLeft] = React.useState(minutes * 60);
  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);
  const min = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const sec = String(secondsLeft % 60).padStart(2, '0');
  return `${min}:${sec}`;
}
// CTAs para exibição aleatória
const CTAS = [
  'Quero Me Inscrever Agora!',
  'Garanta Minha Vaga!',
  'Comece Seu Curso Hoje!',
  'Aproveitar Essa Oportunidade!',
  'Sim, Quero Aprender Agora!',
  'Inscreva-se Antes que Acabe!',
  'Últimas Vagas – Reserve a Sua!',
  'Oferta Por Tempo Limitado – Comece Já!'
];

function getRandomCtas(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAlunoAuth } from '../contexts/AlunoAuthContext';
import AppointmentModal from './AppointmentModal';
import { appointmentService } from '../firebase/firestore';
import { salesPageService } from '../firebase/salesPageService';
import { courseService } from '../firebase/courseService';
import { alunoService } from '../firebase/alunoService';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';


const SalesWebPage = ({ salesData: propSalesData, isPreview = false }) => {
  const { user, loginModal } = useAuth();
  const { aluno, loading: loadingAluno, login, register, logout } = useAlunoAuth();
  const [searchParams] = useSearchParams();
  const [salesData, setSalesData] = useState(propSalesData || null);
  const [produtosDetalhes, setProdutosDetalhes] = useState([]);
  const [loading, setLoading] = useState(!propSalesData);
  const [appointmentModal, setAppointmentModal] = useState({
    isOpen: false,
    selectedDate: null,
    selectedTime: null
  });
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const navigate = useNavigate();

  // Busca dados da página se não vierem por prop
  useEffect(() => {
    if (!propSalesData) {
      const id = searchParams.get('id');
      if (id) {
        setLoading(true);
        salesPageService.getSalesPageById(id).then(async result => {
          if (result.success) {
            setSalesData(result.data);
            // Buscar detalhes dos produtos
            if (result.data.produtosSelecionados && result.data.produtosSelecionados.length > 0) {
              console.log('IDs recebidos:', result.data.produtosSelecionados);
              const produtos = await courseService.getCoursesByIds(result.data.produtosSelecionados);
              console.log('Produtos retornados:', produtos);
              if (produtos.success) setProdutosDetalhes(produtos.data);
            }
          }
          setLoading(false);
        });
      }
    }
  }, [propSalesData, searchParams]);

  // Atualiza produtosDetalhes se vier por prop (apenas se não for preview)
  useEffect(() => {
    if (
      propSalesData &&
      propSalesData.produtosSelecionados &&
      propSalesData.produtosSelecionados.length > 0 &&
      !isPreview
    ) {
      courseService.getCoursesByIds(propSalesData.produtosSelecionados).then(result => {
        if (result.success) setProdutosDetalhes(result.data);
      });
    } else if (
      isPreview &&
      propSalesData &&
      Array.isArray(propSalesData.produtosDetalhes) &&
      propSalesData.produtosDetalhes.length > 0
    ) {
      setProdutosDetalhes(propSalesData.produtosDetalhes);
    }
  }, [propSalesData, isPreview]);

  useEffect(() => {
    if (salesData?.userId && !isPreview) {
      loadOccupiedSlots();
    } else {
      setLoadingSlots(false);
    }
    // eslint-disable-next-line
  }, [salesData?.userId, isPreview]);

  const loadOccupiedSlots = async () => {
    try {
      setLoadingSlots(true);
      const result = await appointmentService.getAppointmentsByLawyer(salesData.userId);
      if (result.success) {
        const activeAppointments = result.data.filter(appointment =>
          appointment.status === 'pendente' ||
          appointment.status === 'aguardando_pagamento' ||
          appointment.status === 'pago' ||
          appointment.status === 'confirmado'
        );
        const slots = activeAppointments.map(appointment => {
          try {
            return {
              date: appointment.data,
              time: appointment.horario
            };
          } catch {
            return null;
          }
        }).filter(Boolean);
        setOccupiedSlots(slots);
      }
    } catch (error) {
      setOccupiedSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const openAppointmentModal = (date, time) => {
    setAppointmentModal({ isOpen: true, selectedDate: date, selectedTime: time });
  };
  const closeAppointmentModal = () => {
    setAppointmentModal({ isOpen: false, selectedDate: null, selectedTime: null });
  };

  // Hooks SEMPRE no topo do componente!
  const countdown = useCountdown(30);
  const [randomCtas] = React.useState(() => getRandomCtas(CTAS, 3));


  // Modal de login/cadastro
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  // Modal de registro de acesso
  const [showAcessoModal, setShowAcessoModal] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [acessoOk, setAcessoOk] = useState(false);

  // Função para lidar com compra e integração de acesso
  const handleComprar = async (produto) => {
    // Se o advogado estiver logado, faz logout dele antes de abrir o fluxo de aluno
    if (user && logout) {
      await logout(); // logout do advogado
    }
    setPendingProduct(produto);
    setShowAcessoModal(true);
    // Só abre o link se o aluno já estiver logado e o link for válido e diferente da página atual
    if (aluno && produto.linkCompra && produto.linkCompra !== window.location.href) {
      window.open(produto.linkCompra, '_blank', 'noopener');
    }
  };

  // Após login, se havia produto pendente, redireciona para compra e exibe modal de acesso
  useEffect(() => {
    if (aluno && pendingProduct && showAcessoModal) {
      if (pendingProduct.linkCompra && pendingProduct.linkCompra !== window.location.href) {
        window.open(pendingProduct.linkCompra, '_blank', 'noopener');
      }
    }
    // eslint-disable-next-line
  }, [aluno, pendingProduct, showAcessoModal]);

  // Função para registrar acesso do aluno após compra
  const registrarAcesso = async () => {
    if (!aluno || !pendingProduct) return;
    setRegistrando(true);
    await alunoService.criarOuAtualizarAcesso({
      paginaId: salesData?.id || salesData?.paginaId || 'pagina_padrao',
      alunoId: aluno.uid,
      nome: aluno.displayName || aluno.name || aluno.email,
      email: aluno.email,
      cursoId: pendingProduct.id,
      cursoTitulo: pendingProduct.title,
      cursoDescricao: pendingProduct.description || '',
      linkAcesso: pendingProduct.linkAcesso || pendingProduct.linkCompra || '#'
    });
    setAcessoOk(true);
    setRegistrando(false);
    setShowAcessoModal(false);
    setPendingProduct(null);
  };

  // Botão acessar como aluno
  const handleAcessarComoAluno = () => {
    if (!salesData?.id) return;
    navigate(`/minha-pagina-de-vendas/aluno-dashboard?paginaId=${salesData.id}`);
  };

  if (loading) {
    return <div className="text-center py-20 text-lg text-gray-500">Carregando página de vendas...</div>;
  }

  // Processamento dos dados de vendas para exibição
  const pageData = salesData || {};
  const {
    nomePagina,
    titulo,
    descricao,
    corPrincipal,
    videos = [],
    contatoWhatsapp,
    contatoEmail,
    imagemCapa,
    logoUrl
  } = pageData;

  // Helper para extrair ID do YouTube
  const getYoutubeId = (url) => {
    if (!url) return '';
    if (url.includes('watch?v=')) return url.split('watch?v=')[1].substring(0, 11);
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].substring(0, 11);
    return '';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Cronômetro de oferta, urgência e escassez */}
      <div className="w-full bg-black text-white py-4 flex flex-col items-center justify-center gap-2" role="region" aria-label="Oferta especial">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-mono font-bold tracking-widest" aria-live="polite">{countdown}</span>
          <span className="text-lg font-semibold">Oferta especial expira em 30 minutos!</span>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3 mt-2">
          <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold animate-pulse" aria-live="polite">Apenas 7 vagas restantes!</span>
          <span className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold animate-pulse">23 pessoas estão vendo agora</span>
        </div>
        <span
          className="mt-3 font-bold rounded-2xl px-10 py-5 shadow-lg text-center block"
          style={{
            background: corPrincipal || '#0ea5e9',
            color: '#fff',
            fontSize: '2rem',
            letterSpacing: '0.02em',
            lineHeight: 1.2
          }}
        >
          {randomCtas[0]}
        </span>
      </div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            {logoUrl && (
              <>
                <img src={logoUrl} alt="Logo" className="h-16 mb-2 object-contain" />
                <h1 className="text-3xl font-bold" style={{ color: corPrincipal }}>{nomePagina}</h1>
                {titulo && <p className="text-lg text-gray-700 mt-2">{titulo}</p>}
                {descricao && <p className="text-base text-gray-600 mt-2">{descricao}</p>}
                <div className="flex gap-3 mt-4">
                  {contatoWhatsapp && (
                    <a href={`https://wa.me/55${contatoWhatsapp?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                  WhatsApp
                </a>
                  )}
                  {contatoEmail && (
                    <a href={`mailto:${contatoEmail}`} className="inline-flex items-center px-4 py-2 border-2 rounded-lg text-sm font-medium"
                      style={{ borderColor: corPrincipal, color: corPrincipal }}>
                      Email
                    </a>
                  )}
                </div>
              </>
            )}
            {imagemCapa && (
              <img src={imagemCapa} alt="Capa" className="w-40 h-40 object-cover rounded-xl shadow-md" />
            )}
          </div>
        </div>
      </header>

      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-yellow-400 text-blue-900 rounded-lg font-bold shadow hover:bg-yellow-500 transition"
          onClick={handleAcessarComoAluno}
        >
          Acessar como Aluno
        </button>
      </div>

      {/* Seção de Vídeos */}
      {videos.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Vídeos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.map((url, idx) => (
                <div key={url} className="aspect-video w-full rounded overflow-hidden border border-gray-300 bg-black">
                  <iframe
                    title={`Vídeo ${idx+1}`}
                    width="100%"
                    height="220"
                    src={`https://www.youtube.com/embed/${getYoutubeId(url)}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-56"
                  />
                </div>
              ))}
            </div>
            {/* CTA 2 embaixo do vídeo */}
            <div className="mt-8 flex justify-center">
              <span
                className="block text-center font-bold rounded-2xl px-10 py-5 shadow-lg"
                style={{
                  background: corPrincipal || '#0ea5e9',
                  color: '#fff',
                  fontSize: '2rem',
                  letterSpacing: '0.02em',
                  lineHeight: 1.2,
                  ...pulseStyle
                }}
              >
                {randomCtas[1]}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Descrição da página */}
      {descricao && (
        <section className="py-6">
          <div className="max-w-3xl mx-auto px-4">
            <p className="text-lg text-gray-700 text-center whitespace-pre-line">{descricao}</p>
          </div>
        </section>
      )}

      {/* Seção de Benefícios */}
      <section className="py-10 bg-blue-50 border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-blue-900 mb-6">Por que escolher este produto?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-2" role="img" aria-label="Acesso imediato">⚡</span>
              <span className="font-semibold text-blue-800">Acesso imediato</span>
              <span className="text-sm text-blue-700 mt-1">Comece a aprender assim que finalizar sua inscrição.</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-2" role="img" aria-label="Certificado">🎓</span>
              <span className="font-semibold text-blue-800">Certificado reconhecido</span>
              <span className="text-sm text-blue-700 mt-1">Receba certificado válido ao concluir o curso.</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-2" role="img" aria-label="Suporte">🤝</span>
              <span className="font-semibold text-blue-800">Suporte dedicado</span>
              <span className="text-sm text-blue-700 mt-1">Equipe pronta para tirar suas dúvidas rapidamente.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Garantia */}
      <section className="py-10 bg-green-50 border-b border-green-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white border border-green-200 rounded-lg px-6 py-4 shadow">
            <span className="text-3xl" role="img" aria-label="Garantia">✅</span>
            <span className="text-lg font-bold text-green-800">7 dias de garantia incondicional</span>
          </div>
          <p className="mt-4 text-green-700">Se não ficar satisfeito, devolvemos 100% do seu dinheiro. Sem perguntas.</p>
        </div>
      </section>

      {/* Seção de Produtos */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Produtos em Destaque</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {produtosDetalhes.length > 0 ? (
          <>
            {produtosDetalhes.map((produto) => (
              <div key={produto.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{produto.title}</h4>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div>
                    {produto.priceOriginal && (
                      <span className="text-gray-400 line-through mr-2">R$ {Number(produto.priceOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    )}
                    {produto.priceSale && (
                      <span className="text-green-700 font-bold">R$ {Number(produto.priceSale).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    )}
                  </div>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    onClick={() => handleComprar(produto)}
                    aria-label="Comprar curso"
                  >
                    Comprar
                  </button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div>
            <p className="text-gray-500">Nenhum produto cadastrado.</p>
            {pageData.produtosSelecionados && pageData.produtosSelecionados.length > 0 && (
              <div className="text-xs text-gray-400 mt-2">
                <span>IDs selecionados:</span>
                <pre>{JSON.stringify(pageData.produtosSelecionados, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
          {/* CTA 3 embaixo dos produtos */}
          <div className="mt-10 flex justify-center">
            <span
              className="block text-center font-bold rounded-2xl px-10 py-5 shadow-lg"
              style={{
                background: corPrincipal || '#0ea5e9',
                color: '#fff',
                fontSize: '2rem',
                letterSpacing: '0.02em',
                lineHeight: 1.2,
                ...pulseStyle
              }}
              tabIndex="0"
            >
              {randomCtas[2]}
            </span>
          </div>
        </div>
      </section>

      {/* Modal de login/cadastro */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Acesse sua conta</h2>
            <p className="mb-6 text-gray-700">Para comprar este curso, faça login ou crie sua conta nesta página. Assim, seu acesso será registrado corretamente.</p>
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 mb-3"
              onClick={() => {
                if (loginModal) {
                  loginModal.open();
                } else {
                  window.location.href = '/login';
                }
              }}
            >
              Fazer login / Criar conta
            </button>
            <button
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              onClick={() => setShowLoginModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {/* Modal de finalização de compra/registro de acesso */}
      {showAcessoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-900">Finalizar Compra</h2>
            {!aluno ? (
              <AlunoLoginCadastroForm onSuccess={() => {}} onClose={() => setShowAcessoModal(false)} login={login} register={register} />
            ) : (
              <>
                <div className="mb-4 text-left">
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Nome:</span> <span className="text-gray-900">{aluno.displayName || aluno.name || aluno.email}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Email:</span> <span className="text-gray-900">{aluno.email}</span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Página:</span> <span className="text-gray-900">{salesData?.nomePagina || salesData?.id || 'Página atual'}</span>
                  </div>
                  {pendingProduct && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">Curso:</span> <span className="text-gray-900">{pendingProduct.title}</span>
                    </div>
                  )}
                </div>
                <p className="mb-6 text-gray-700">Clique abaixo para finalizar sua compra e liberar o acesso ao curso nesta página.</p>
                <button
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 mb-3"
                  onClick={registrarAcesso}
                  disabled={registrando}
                >
                  {registrando ? 'Finalizando compra...' : 'Finalizar compra e liberar acesso'}
                </button>
                <button
                  className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
                  onClick={() => setShowAcessoModal(false)}
                  disabled={registrando}
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8" role="contentinfo">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {nomePagina}. Todos os direitos reservados.
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            Página criada com DireitoHub
          </p>
        </div>
      </footer>

      {/* SEO e Performance: meta tags e lazy loading */}
      {/* Para Next.js/React Helmet, mas exemplo para React puro: */}
      {typeof document !== 'undefined' && document.title !== (titulo || nomePagina) && (document.title = (titulo || nomePagina))}
      {/* Imagens já usam lazy loading nativo em navegadores modernos, mas pode-se adicionar loading="lazy" em imagens grandes se necessário. */}
    </div>
  );
};

export default SalesWebPage;

// Formulário de login/cadastro de aluno inline
function AlunoLoginCadastroForm({ onSuccess, onClose, login, register }) {
  const [isRegister, setIsRegister] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      setLoading(false);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Erro ao autenticar.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="mb-2 text-gray-700">{isRegister ? 'Crie sua conta de aluno para acessar o curso.' : 'Acesse sua conta de aluno para continuar.'}</p>
      <input
        type="email"
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full px-4 py-2 border rounded-lg"
        placeholder="Senha"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? (isRegister ? 'Criando conta...' : 'Entrando...') : (isRegister ? 'Criar conta' : 'Entrar')}
      </button>
      <button
        type="button"
        className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
        onClick={onClose}
        disabled={loading}
      >
        Cancelar
      </button>
      <div className="text-xs mt-2">
        {isRegister ? (
          <>
            Já tem conta?{' '}
            <button type="button" className="text-blue-700 underline" onClick={() => setIsRegister(false)} disabled={loading}>
              Fazer login
            </button>
          </>
        ) : (
          <>
            Não tem conta?{' '}
            <button type="button" className="text-blue-700 underline" onClick={() => setIsRegister(true)} disabled={loading}>
              Criar conta
            </button>
          </>
        )}
      </div>
    </form>
  );
}
