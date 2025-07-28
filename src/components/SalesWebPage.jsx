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
import AppointmentModal from './AppointmentModal';
import { appointmentService } from '../firebase/firestore';
import { salesPageService } from '../firebase/salesPageService';
import { courseService } from '../firebase/courseService';
import { useSearchParams } from 'react-router-dom';


const SalesWebPage = ({ salesData: propSalesData, isPreview = false }) => {
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

  // Atualiza produtosDetalhes se vier por prop
  useEffect(() => {
    if (propSalesData && propSalesData.produtosSelecionados && propSalesData.produtosSelecionados.length > 0) {
      console.log('IDs recebidos (prop):', propSalesData.produtosSelecionados);
      courseService.getCoursesByIds(propSalesData.produtosSelecionados).then(result => {
        console.log('Produtos retornados (prop):', result);
        if (result.success) setProdutosDetalhes(result.data);
      });
    }
  }, [propSalesData]);

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
      {/* Cronômetro de oferta */}
      <div className="w-full bg-black text-white py-4 flex flex-col items-center justify-center gap-2">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-mono font-bold tracking-widest">{countdown}</span>
          <span className="text-lg font-semibold">Oferta especial expira em 30 minutos!</span>
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
              <img src={logoUrl} alt="Logo" className="h-16 mb-2 object-contain" />
            )}
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
          </div>
          {imagemCapa && (
            <img src={imagemCapa} alt="Capa" className="w-40 h-40 object-cover rounded-xl shadow-md" />
          )}
        </div>
      </header>




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

      {/* Seção de Produtos */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Produtos em Destaque</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {produtosDetalhes.length > 0 ? (
              produtosDetalhes.map((produto) => (
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
                    <a href={produto.linkCompra || '#'} target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                      Comprar
                    </a>
                  </div>
                </div>
              ))
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
            >
              {randomCtas[2]}
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} {nomePagina}. Todos os direitos reservados.
          </p>
          <p className="text-gray-400 mt-2 text-sm">
            Página criada com DireitoHub
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SalesWebPage;
