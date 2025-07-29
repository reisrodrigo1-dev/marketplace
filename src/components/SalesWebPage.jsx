
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

// Animação pulsar para CTAs
const pulseStyle = {
  animation: 'pulse-cta 1.8s infinite',
};

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
  'QUERO GARANTIR MINHA VAGA AGORA!',
  'SIM, EU QUERO COMEÇAR HOJE!',
  'APROVEITAR ESTA OPORTUNIDADE!',
  'QUERO TRANSFORMAR MINHA CARREIRA!',
  'GARANTIR MEU ACESSO VITALÍCIO!',
  'INSCREVER-ME COM DESCONTO!',
  'COMEÇAR MINHA JORNADA AGORA!',
  'QUERO SER O PRÓXIMO SUCESSO!'
];

function getRandomCtas(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

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

  // Utilitários para converter campos string em arrays/objetos
  function parseBeneficios(raw) {
    if (!raw) return undefined;
    return raw.split('\n').map(line => {
      const [icon, titulo, descricao] = line.split(';');
      return icon && titulo && descricao ? { icon: icon.trim(), titulo: titulo.trim(), descricao: descricao.trim() } : null;
    }).filter(Boolean);
  }
  function parseDepoimentos(raw) {
    if (!raw) return undefined;
    return raw.split('\n').map(line => {
      const [nome, especialidade, depoimento, iniciais] = line.split(';');
      return nome && especialidade && depoimento && iniciais ? { nome: nome.trim(), especialidade: especialidade.trim(), depoimento: depoimento.trim(), iniciais: iniciais.trim() } : null;
    }).filter(Boolean);
  }
  function parseBonus(raw) {
    if (!raw) return undefined;
    return raw.split('\n').map(line => line.trim()).filter(Boolean);
  }
  function parseFAQ(raw) {
    if (!raw) return undefined;
    return raw.split('\n').map(line => {
      const [pergunta, resposta] = line.split(';');
      return pergunta && resposta ? { pergunta: pergunta.trim(), resposta: resposta.trim() } : null;
    }).filter(Boolean);
  }
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const navigate = useNavigate();

  // Hooks SEMPRE no topo do componente!
  const countdown = useCountdown(30);
  const [randomCtas] = React.useState(() => getRandomCtas(CTAS, 5));

  // Modal de login/cadastro
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  // Modal de registro de acesso
  const [showAcessoModal, setShowAcessoModal] = useState(false);
  const [registrando, setRegistrando] = useState(false);
  const [acessoOk, setAcessoOk] = useState(false);

  // Busca dados da página se não vierem por prop
  useEffect(() => {
    if (!propSalesData) {
      const id = searchParams.get('id');
      if (id) {
        setLoading(true);
        salesPageService.getSalesPageById(id).then(async result => {
          if (result.success) {
            setSalesData(result.data);
            if (result.data.produtosSelecionados && result.data.produtosSelecionados.length > 0) {
              const produtos = await courseService.getCoursesByIds(result.data.produtosSelecionados);
              if (produtos.success) setProdutosDetalhes(produtos.data);
            }
          }
          setLoading(false);
        });
      }
    }
  }, [propSalesData, searchParams]);

  // Atualiza produtosDetalhes se vier por prop
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

  // Função para lidar com compra e integração de acesso
  const handleComprar = async (produto) => {
    if (user && logout) {
      await logout();
    }
    setPendingProduct(produto);
    setShowAcessoModal(true);
    if (aluno && produto.linkCompra && produto.linkCompra !== window.location.href) {
      window.open(produto.linkCompra, '_blank', 'noopener');
    }
  };

  useEffect(() => {
    if (aluno && pendingProduct && showAcessoModal) {
      if (pendingProduct.linkCompra && pendingProduct.linkCompra !== window.location.href) {
        window.open(pendingProduct.linkCompra, '_blank', 'noopener');
      }
    }
  }, [aluno, pendingProduct, showAcessoModal]);

  const registrarAcesso = async () => {
    if (!aluno || !pendingProduct || !pendingProduct.id) {
      alert('Erro ao finalizar compra: curso não encontrado. Tente novamente.');
      return;
    }
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

  const handleAcessarComoAluno = () => {
    if (!salesData?.id) return;
    
    // Se o aluno já estiver logado, vai direto para o dashboard
    if (aluno) {
      navigate(`/minha-pagina-de-vendas/aluno-dashboard?paginaId=${salesData.id}`);
    } else {
      // Se não estiver logado, vai para a tela de login
      navigate(`/minha-pagina-de-vendas/aluno-login?paginaId=${salesData.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando página de vendas...</p>
        </div>
      </div>
    );
  }

  const pageData = salesData || {};
  // Parse campos customizados se existirem
  const beneficios = pageData.beneficios && Array.isArray(pageData.beneficios)
    ? pageData.beneficios
    : parseBeneficios(pageData.beneficiosRaw);
  const depoimentos = pageData.depoimentos && Array.isArray(pageData.depoimentos)
    ? pageData.depoimentos
    : parseDepoimentos(pageData.depoimentosRaw);
  const bonusItens = pageData.bonus?.itens && Array.isArray(pageData.bonus.itens)
    ? pageData.bonus.itens
    : parseBonus(pageData.bonusRaw);
  const faq = pageData.faq && Array.isArray(pageData.faq)
    ? pageData.faq
    : parseFAQ(pageData.faqRaw);
  // Prova social
  const provaSocial = pageData.provaSocial || {
    numeroAdvogados: pageData.numeroAdvogados,
    honorariosGerados: pageData.honorariosGerados,
    taxaSatisfacao: pageData.taxaSatisfacao,
    tempoResultado: pageData.tempoResultado,
    depoimentos: depoimentos
  };
  // Garantia
  const garantia = pageData.garantia || {
    titulo: pageData.garantiaTitulo,
    descricao: pageData.garantiaDescricao,
    dias: pageData.garantiaDias || '7'
  };
  // Bônus
  const bonus = pageData.bonus || {
    valor: pageData.bonusValor || 'R$ 897',
    itens: bonusItens
  };
  // Videos
  const videos = pageData.videos || [];
  // Restante dos campos
  const {
    nomePagina,
    titulo,
    descricao,
    corPrincipal,
    corSecundaria,
    corDestaque,
    contatoWhatsapp,
    contatoEmail,
    imagemCapa,
    logoUrl
  } = pageData;

  // Cores padrão caso não estejam definidas - esquema profissional baseado em players do mercado
  const cores = {
    principal: corPrincipal || '#1e40af', // Azul profissional (credibilidade jurídica)
    secundaria: corSecundaria || '#3b82f6', // Azul complementar (harmonioso)
    destaque: corDestaque || '#059669' // Verde esmeralda (alta conversão em CTAs)
  };

  const getYoutubeId = (url) => {
    if (!url) return '';
    if (url.includes('watch?v=')) return url.split('watch?v=')[1].substring(0, 11);
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].substring(0, 11);
    return '';
  };

  const mainProduct = produtosDetalhes[0] || {};
  const originalPrice = mainProduct.priceOriginal || 997;
  const salePrice = mainProduct.priceSale || 497;
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de Urgência Fixa */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 text-white py-2 shadow-lg"
        style={{ background: `linear-gradient(to right, ${cores.principal}, ${cores.secundaria})` }}
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <span className="animate-pulse text-yellow-300">🔥</span>
            <span className="font-bold text-sm md:text-base">OFERTA EXPIRA EM:</span>
            <span className="bg-white text-red-600 px-3 py-1 rounded-full font-mono font-bold text-sm md:text-base">
              {countdown}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs md:text-sm">
            <span className="bg-yellow-400 text-red-800 px-2 py-1 rounded-full font-bold animate-pulse">
              🚨 Apenas 7 vagas restantes
            </span>
            <span className="bg-green-400 text-green-900 px-2 py-1 rounded-full font-bold">
              👥 23 pessoas vendo agora
            </span>
          </div>
        </div>
      </div>

      {/* Espaçamento para barra fixa */}
      <div className="h-16 md:h-12"></div>

      {/* Hero Section */}
      <section 
        className="text-white py-20 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #1f2937, ${cores.principal}aa, #1f2937)` }}
      >
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* Badge de Credibilidade */}
            <div 
              className="inline-flex items-center rounded-full px-6 py-2 mb-6"
              style={{ 
                backgroundColor: `${cores.principal}20`, 
                border: `1px solid ${cores.principal}30` 
              }}
            >
              <span className="mr-2" style={{ color: `${cores.principal}` }}>✓</span>
              <span className="text-sm font-medium">
                {pageData.heroBadge || 'Mais de 1.000 advogados transformaram suas carreiras'}
              </span>
            </div>

            {/* Headline Principal */}
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              {pageData.heroTitle ? (
                <span dangerouslySetInnerHTML={{ __html: pageData.heroTitle.replace(/\b(Transforme|90 Dias)\b/g, (match) => 
                  match === 'Transforme' ? '<span class="text-yellow-400">Transforme</span>' :
                  '<span class="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">90 Dias</span>'
                ) }} />
              ) : (
                <>
                  <span className="text-yellow-400">Transforme</span> Sua Carreira Jurídica em{' '}
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    90 Dias
                  </span>
                </>
              )}
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {pageData.heroSubtitle || (
                <>
                  Descubra o método comprovado que está transformando advogados comuns em 
                  <strong className="text-yellow-400"> especialistas requisitados</strong> no mercado jurídico
                </>
              )}
            </p>

            {/* Benefícios Principais */}
            <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
              {(beneficios && beneficios.length > 0 ? beneficios : [
                { icon: '💰', titulo: 'Aumente Seus Honorários', descricao: 'Multiplique sua receita por 3x em até 6 meses' },
                { icon: '⚡', titulo: 'Resultados Rápidos', descricao: 'Primeiros resultados em 30 dias' },
                { icon: '🎯', titulo: 'Método Comprovado', descricao: 'Sistema testado por milhares de advogados' }
              ]).map((beneficio, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                  <div className="text-3xl mb-3">{beneficio.icon}</div>
                  <h3 className="font-bold mb-2">{beneficio.titulo}</h3>
                  <p className="text-gray-300 text-sm">{beneficio.descricao}</p>
                </div>
              ))}
            </div>

            {/* CTA Principal */}
            <div className="text-center">
              <button 
                onClick={() => handleComprar(mainProduct)}
                className="inline-block text-white font-bold text-xl px-12 py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
                style={{
                  background: `linear-gradient(to right, ${cores.destaque}, ${cores.principal})`,
                  ...pulseStyle
                }}
                onMouseEnter={e => {
                  e.target.style.background = `linear-gradient(to right, ${cores.principal}, ${cores.destaque})`;
                }}
                onMouseLeave={e => {
                  e.target.style.background = `linear-gradient(to right, ${cores.destaque}, ${cores.principal})`;
                }}
              >
                <span className="relative z-10">
                  {randomCtas[0]}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <p className="text-gray-400 text-sm mt-3">
                🔒 Compra 100% Segura | ✅ Garantia de 7 dias
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Prova Social */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Resultados que Falam por Si
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Veja o que nossos alunos estão conquistando
            </p>
          </div>

          {/* Números de Impacto */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: cores.principal }}>
                {provaSocial?.numeroAdvogados || '1.247'}
              </div>
              <div className="text-gray-600">Advogados Formados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: cores.destaque }}>
                {provaSocial?.honorariosGerados || 'R$ 2.3M'}
              </div>
              <div className="text-gray-600">Em Honorários Gerados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: cores.secundaria }}>
                {provaSocial?.taxaSatisfacao || '94%'}
              </div>
              <div className="text-gray-600">Taxa de Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2" style={{ color: cores.principal }}>
                {provaSocial?.tempoResultado || '30 dias'}
              </div>
              <div className="text-gray-600">Média p/ 1º Resultado</div>
            </div>
          </div>

          {/* Depoimentos */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {(provaSocial?.depoimentos && provaSocial.depoimentos.length > 0 ? 
              provaSocial.depoimentos : [
                { nome: 'Dr. Roberto Silva', especialidade: 'Direito Empresarial', depoimento: 'Em 3 meses aumentei meus honorários em 250%. O método é realmente transformador!', iniciais: 'DR' },
                { nome: 'Dra. Ana Martins', especialidade: 'Direito Trabalhista', depoimento: 'Consegui me especializar e hoje sou referência na minha área. Recomendo!', iniciais: 'AM' },
                { nome: 'Dr. Carlos Santos', especialidade: 'Direito Civil', depoimento: 'Método prático e direto ao ponto. Resultados desde a primeira semana!', iniciais: 'CS' }
              ]
            ).map((depoimento, idx) => {
              const colors = ['blue', 'pink', 'green'];
              const color = colors[idx % colors.length];
              return (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center mr-4`}>
                      <span className={`text-${color}-600 font-bold`}>{depoimento.iniciais}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{depoimento.nome}</div>
                      <div className="text-gray-600 text-sm">{depoimento.especialidade}</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">
                    "{depoimento.depoimento}"
                  </p>
                  <div className="flex text-yellow-400">
                    ⭐⭐⭐⭐⭐
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seção de Vídeos */}
      {videos.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Veja Como Funciona na Prática
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Assista aos vídeos e descubra o método completo
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {videos.map((url, idx) => (
                <div key={url} className="relative group">
                  <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border-4 border-gray-200 group-hover:border-blue-400 transition-all duration-300">
                    <iframe
                      title={`Vídeo ${idx+1}`}
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${getYoutubeId(url)}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* CTA após vídeos */}
            <div className="text-center mt-12">
              <button 
                onClick={() => handleComprar(mainProduct)}
                className="inline-block text-white font-bold text-xl px-10 py-5 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-300"
                style={{
                  background: `linear-gradient(to right, ${cores.principal}, ${cores.secundaria})`,
                  ...pulseStyle
                }}
                onMouseEnter={e => {
                  e.target.style.background = `linear-gradient(to right, ${cores.secundaria}, ${cores.principal})`;
                }}
                onMouseLeave={e => {
                  e.target.style.background = `linear-gradient(to right, ${cores.principal}, ${cores.secundaria})`;
                }}
              >
                {randomCtas[1]}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Seção de Benefícios Detalhados */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Por Que Milhares de Advogados Escolheram Este Método?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um sistema completo que vai muito além do que você encontra em outros cursos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acesso Imediato</h3>
              <p className="text-gray-600 leading-relaxed">
                Comece a aprender assim que finalizar sua inscrição. Todo o conteúdo disponível na sua área de membros.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🎓</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Certificado Reconhecido</h3>
              <p className="text-gray-600 leading-relaxed">
                Receba certificado válido ao concluir o curso. Comprove sua especialização no mercado.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Suporte VIP</h3>
              <p className="text-gray-600 leading-relaxed">
                Grupo exclusivo no WhatsApp + suporte direto com a equipe para tirar todas suas dúvidas.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Material Completo</h3>
              <p className="text-gray-600 leading-relaxed">
                Mais de 100 modelos de petições, contratos e documentos prontos para usar na sua prática.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Método Testado</h3>
              <p className="text-gray-600 leading-relaxed">
                Sistema desenvolvido e refinado ao longo de 10 anos, testado por milhares de profissionais.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">♾️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Acesso Vitalício</h3>
              <p className="text-gray-600 leading-relaxed">
                Pague uma vez e tenha acesso para sempre. Todas as atualizações futuras incluídas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Oferta Principal */}
      <section 
        className="py-20 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, #1f2937, ${cores.principal}dd, ${cores.secundaria}dd, #1f2937)` }}
      >
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm mb-6 animate-pulse">
              🔥 OFERTA ESPECIAL POR TEMPO LIMITADO
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Transforme Sua Carreira Jurídica
              <span className="block text-yellow-400 mt-2">Hoje Mesmo!</span>
            </h2>

            {/* Cards de Produtos */}
            {produtosDetalhes.length > 0 ? (
              <div className="grid md:grid-cols-1 gap-8 max-w-2xl mx-auto mb-12">
                {produtosDetalhes.map((produto) => (
                  <div key={produto.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-yellow-400 relative">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm">
                      MAIS VENDIDO
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4">{produto.title}</h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">{produto.description}</p>
                    
                    <div className="mb-8">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        {produto.priceOriginal && (
                          <span className="text-2xl text-gray-400 line-through">
                            R$ {Number(produto.priceOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        {produto.priceSale && (
                          <span className="text-4xl font-bold" style={{ color: cores.destaque }}>
                            R$ {Number(produto.priceSale).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                      {discount > 0 && (
                        <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm inline-block">
                          ECONOMIZE {discount}% - R$ {(originalPrice - salePrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleComprar(produto)}
                      className="w-full text-white font-bold text-xl py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 mb-4"
                      style={{
                        background: `linear-gradient(to right, ${cores.destaque}, ${cores.principal})`,
                        ...pulseStyle
                      }}
                      onMouseEnter={e => {
                        e.target.style.background = `linear-gradient(to right, ${cores.principal}, ${cores.destaque})`;
                      }}
                      onMouseLeave={e => {
                        e.target.style.background = `linear-gradient(to right, ${cores.destaque}, ${cores.principal})`;
                      }}
                    >
                      {randomCtas[2]}
                    </button>
                    
                    <p className="text-gray-300 text-sm">
                      🔒 Pagamento 100% Seguro | 📱 Acesso Imediato | ✅ Garantia de 7 dias
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border-2 border-yellow-400 max-w-2xl mx-auto mb-12">
                <h3 className="text-2xl font-bold mb-4">Curso Completo de Especialização Jurídica</h3>
                <p className="text-gray-300 mb-6">
                  O método mais completo para transformar sua carreira jurídica em 90 dias
                </p>
                
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-2xl text-gray-400 line-through">R$ 997,00</span>
                    <span className="text-4xl font-bold text-yellow-400">R$ 497,00</span>
                  </div>
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm inline-block">
                    ECONOMIZE 50% - R$ 500,00
                  </div>
                </div>

                <button
                  onClick={() => handleComprar({})}
                  className="w-full text-white font-bold text-xl py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 mb-4"
                  style={{
                    background: `linear-gradient(to right, ${cores.destaque}, ${cores.principal})`,
                    ...pulseStyle
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = `linear-gradient(to right, ${cores.principal}, ${cores.destaque})`;
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = `linear-gradient(to right, ${cores.destaque}, ${cores.principal})`;
                  }}
                >
                  {randomCtas[2]}
                </button>
                
                <p className="text-gray-300 text-sm">
                  🔒 Pagamento 100% Seguro | 📱 Acesso Imediato | ✅ Garantia de 7 dias
                </p>
              </div>
            )}

            {/* Bonificações */}
            <div className="bg-yellow-400 text-gray-900 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">
                🎁 BÔNUS EXCLUSIVOS (Valor: {bonus?.valor || 'R$ 897'})
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                {(bonus?.itens && bonus.itens.length > 0 ? 
                  bonus.itens : 
                  ['Planilha de Gestão Financeira', 'Kit Modelos de Contratos', 'Acesso ao Grupo VIP']
                ).filter(item => item).map((item, idx) => (
                  <div key={idx}>✅ {item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Garantia */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🛡️</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-green-800 mb-6">
              {garantia?.titulo || `Garantia Incondicional de ${garantia?.dias || '7'} Dias`}
            </h2>
            <p className="text-xl text-green-700 mb-8 leading-relaxed">
              {garantia?.descricao || (
                <>
                  Experimente todo o conteúdo por {garantia?.dias || '7'} dias. Se não ficar completamente satisfeito, 
                  devolvemos 100% do seu investimento. <strong>Sem perguntas, sem burocracia.</strong>
                </>
              )}
            </p>
            <div className="bg-white rounded-xl p-6 shadow-lg inline-block">
              <p className="text-green-800 font-bold">
                ✅ Teste por 7 dias<br/>
                ✅ Satisfação garantida<br/>
                ✅ Reembolso imediato
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas antes de começar
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {(faq && faq.length > 0 ? faq : [
              { pergunta: 'Como funciona o acesso ao curso?', resposta: 'Após a confirmação do pagamento, você recebe imediatamente os dados de acesso à nossa plataforma exclusiva, onde poderá assistir às aulas quantas vezes quiser.' },
              { pergunta: 'Por quanto tempo tenho acesso?', resposta: 'O acesso é vitalício! Você paga uma única vez e tem acesso para sempre, incluindo todas as futuras atualizações do conteúdo.' },
              { pergunta: 'E se eu não conseguir resultados?', resposta: 'Oferecemos garantia incondicional de 7 dias. Se não estiver satisfeito, devolvemos 100% do valor investido, sem questionamentos.' },
              { pergunta: 'Preciso de conhecimento prévio?', resposta: 'Não! O curso foi desenvolvido tanto para advogados iniciantes quanto experientes. Começamos do básico e evoluímos gradualmente.' }
            ]).filter(item => item.pergunta && item.resposta).map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  ❓ {item.pergunta}
                </h3>
                <p className="text-gray-600">
                  {item.resposta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Última Chance CTA */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ⏰ Esta é Sua Última Chance!
            </h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              A oferta especial expira em <span className="font-mono font-bold bg-white text-red-600 px-4 py-2 rounded">{countdown}</span>
            </p>
            <p className="text-lg mb-8">
              Depois disso, o curso volta ao preço normal de R$ 997,00
            </p>
            
            <button
              onClick={() => handleComprar(mainProduct)}
              className="inline-block text-white font-bold text-2xl px-12 py-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 mb-4"
              style={{
                background: `linear-gradient(to right, ${cores.destaque}, ${cores.principal})`,
                ...pulseStyle
              }}
              onMouseEnter={e => {
                e.target.style.background = `linear-gradient(to right, ${cores.principal}, ${cores.destaque})`;
              }}
              onMouseLeave={e => {
                e.target.style.background = `linear-gradient(to right, ${cores.destaque}, ${cores.principal})`;
              }}
            >
              {randomCtas[3]}
            </button>
            
            <p className="text-sm opacity-75">
              🔒 Pagamento 100% Seguro | ✅ Garantia de 7 dias | 📱 Acesso Imediato
            </p>
          </div>
        </div>
      </section>

      {/* Botão Acessar como Aluno */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 px-4 py-2 rounded-lg font-bold shadow-lg transition-all duration-300"
          onClick={handleAcessarComoAluno}
        >
          👨‍🎓 Área do Aluno
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            {logoUrl && (
              <img src={logoUrl} alt="Logo" className="h-12 mx-auto mb-4 filter brightness-0 invert" />
            )}
            <h3 className="text-xl font-bold mb-2">{nomePagina}</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
            {contatoWhatsapp && (
              <a 
                href={`https://wa.me/55${contatoWhatsapp?.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                📱 WhatsApp
              </a>
            )}
            {contatoEmail && (
              <a 
                href={`mailto:${contatoEmail}`} 
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-colors"
              >
                ✉️ Email
              </a>
            )}
          </div>

          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-400 text-sm mb-2">
              © {new Date().getFullYear()} {nomePagina}. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-xs">
              Página criada com DireitoHub - CNPJ: XX.XXX.XXX/XXXX-XX
            </p>
          </div>
        </div>
      </footer>

      {/* Modais */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">Acesse sua conta</h2>
            <p className="mb-6 text-gray-700">Para comprar este curso, faça login ou crie sua conta.</p>
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

      {showAcessoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-green-900">Finalizar Compra</h2>
            {!aluno ? (
              <AlunoLoginCadastroForm onSuccess={() => {}} onClose={() => setShowAcessoModal(false)} login={login} register={register} />
            ) : (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Nome:</span> {aluno.displayName || aluno.name || aluno.email}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold text-gray-700">Email:</span> {aluno.email}
                  </div>
                  {pendingProduct && (
                    <div className="mb-2">
                      <span className="font-semibold text-gray-700">Curso:</span> {pendingProduct.title}
                    </div>
                  )}
                </div>
                <p className="mb-6 text-gray-700">Clique abaixo para finalizar sua compra e liberar o acesso.</p>
                <button
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 mb-3 disabled:opacity-50"
                  onClick={registrarAcesso}
                  disabled={registrando}
                >
                  {registrando ? 'Finalizando...' : 'Finalizar compra e liberar acesso'}
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

      {acessoOk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-4 text-green-900">Parabéns!</h2>
            <p className="mb-6 text-gray-700">Seu acesso foi liberado com sucesso!</p>
            <button
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
              onClick={() => setAcessoOk(false)}
            >
              Começar Agora!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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
      <p className="mb-4 text-gray-700">
        {isRegister ? 'Crie sua conta de aluno para acessar o curso.' : 'Acesse sua conta de aluno para continuar.'}
      </p>
      <input
        type="email"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Senha"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
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
      <div className="text-center text-sm">
        {isRegister ? (
          <>
            Já tem conta?{' '}
            <button type="button" className="text-blue-600 hover:underline font-medium" onClick={() => setIsRegister(false)} disabled={loading}>
              Fazer login
            </button>
          </>
        ) : (
          <>
            Não tem conta?{' '}
            <button type="button" className="text-blue-600 hover:underline font-medium" onClick={() => setIsRegister(true)} disabled={loading}>
              Criar conta
            </button>
          </>
        )}
      </div>
    </form>
  );
}

export default SalesWebPage;
