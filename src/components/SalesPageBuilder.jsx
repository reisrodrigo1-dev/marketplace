import React, { useState, useEffect } from 'react';
// Integração OpenAI
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
import SalesWebPage from './SalesWebPage';
import { useAuth } from '../contexts/AuthContext';
import { salesPageService } from '../firebase/salesPageService';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { courseService } from '../firebase/courseService';

const AREAS_JURIDICAS = [
  'Direito Civil',
  'Direito Criminal',
  'Direito Trabalhista',
  'Direito Tributário',
  'Direito Empresarial',
  'Direito Administrativo',
  'Direito Constitucional',
  'Direito Previdenciário',
  'Direito do Consumidor',
  'Direito de Família',
  'Direito Sucessório',
  'Direito Imobiliário',
  'Direito Ambiental',
  'Direito Digital',
  'Direito Bancário',
  'Direito Internacional',
  'Direito Médico',
  'Direito Eleitoral',
  'Direito Agrário',
  'Direito da Propriedade Intelectual',
  'Direito Marítimo',
  'Direito Aeronáutico',
  'Direito Desportivo',
  'Direito do Entretenimento',
  'Direito Educacional'
];

const SalesPageBuilder = ({ onBack, onPageCreated, onPageUpdated, editingPage = null }) => {
  const { user } = useAuth();
  const isEditing = !!editingPage;

  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    async function fetchCourses() {
      if (user?.uid) {
        console.log('[SalesPageBuilder] user.uid:', user.uid);
        const result = await courseService.getPublishedCoursesByUser(user.uid);
        console.log('[SalesPageBuilder] Cursos publicados retornados:', result);
        if (result.success) setAvailableProducts(result.data);
      } else {
        console.log('[SalesPageBuilder] Usuário não logado ou user.uid indefinido');
      }
    }
    fetchCourses();
  }, [user]);

  const defaultFormData = {
    tipoPagina: 'vendas',
    nomePagina: '',
    titulo: '',
    descricao: '',
    produtosSelecionados: [],
    produtosAoVivo: {}, // { [productId]: { aoVivo: boolean, data: string, hora: string } }
    corPrincipal: '#1e40af', // Azul profissional e confiável (inspirado em HeroSpark)
    corSecundaria: '#3b82f6', // Azul complementar mais claro
    corDestaque: '#059669', // Verde para CTAs (alta conversão)
  };

  const initialFormData = isEditing ? {
    ...defaultFormData,
    ...editingPage
  } : defaultFormData;

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (isEditing && editingPage) {
      const newFormData = {
        ...defaultFormData,
        ...editingPage
      };
      setFormData(newFormData);
      setVideoLinks(editingPage.videos || []);
    }
    if (!isEditing) {
      setFormData(defaultFormData);
      setVideoLinks([]);
    }
  }, [editingPage, isEditing]);

  const [logoPreview, setLogoPreview] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [videoInput, setVideoInput] = useState('');
  const [videoLinks, setVideoLinks] = useState(formData.videos || []);
  const [videoError, setVideoError] = useState('');
  // Estado para modal de exemplo IA
  const [showIaExample, setShowIaExample] = useState(false);
  // Estados para integração com IA
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState('');

  const validateStep1 = () => !!formData.nomePagina;
  const validateStep2 = () => !!formData.corPrincipal && !!formData.corSecundaria && !!formData.corDestaque;
  const validateStep3 = () => true;
  const validateStep4 = () => formData.produtosSelecionados.length > 0;

  function isValidYoutubeUrl(url) {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&.*)?$/;
    return regex.test(url);
  }

  const handleAddVideo = () => {
    setVideoError('');
    if (!isValidYoutubeUrl(videoInput)) {
      setVideoError('Insira um link válido do YouTube.');
      return;
    }
    if (videoLinks.includes(videoInput)) {
      setVideoError('Este vídeo já foi adicionado.');
      return;
    }
    const newLinks = [...videoLinks, videoInput];
    setVideoLinks(newLinks);
    setFormData(prev => ({ ...prev, videos: newLinks }));
    setVideoInput('');
  };

  const handleRemoveVideo = (urlToRemove) => {
    const newLinks = videoLinks.filter(url => url !== urlToRemove);
    setVideoLinks(newLinks);
    setFormData(prev => ({ ...prev, videos: newLinks }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
  };

  // Corrige para permitir até a etapa 5 (Preview)
  const nextStep = () => {
    setCurrentStep((prev) => (prev < 5 ? prev + 1 : prev));
  };

  const handleAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      areasAtuacao: prev.areasAtuacao.includes(area)
        ? prev.areasAtuacao.filter(a => a !== area)
        : [...prev.areasAtuacao, area]
    }));
  };

  const handleFileUpload = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (type === 'logo') {
          setLogoPreview(e.target.result);
          setFormData(prev => ({ ...prev, logo: file }));
        } else if (type === 'foto') {
          setFotoPreview(e.target.result);
          setFormData(prev => ({ ...prev, fotoPerfil: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const formatCNPJ = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com design moderno */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-50"></div>

          <div className="flex items-center justify-between relative z-10">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {isEditing ? 'Editar Página de Vendas' : 'Criar Página de Vendas'}
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Crie sua página de vendas personalizada em poucos passos
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center px-6 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
            )}
          </div>

          {/* Progress Bar Melhorado */}
          <div className="mt-8">
            <div className="flex items-center w-full">
              {[1, 2, 3, 4, 5].map((step, idx) => (
                <React.Fragment key={step}>
                  <div className={`flex flex-col items-center flex-1`}>
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full text-sm font-bold border-2 transition-all duration-300 ${
                      step <= currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-transparent shadow-lg scale-110'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {step <= currentStep - 1 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : step}
                    </div>
                    <span className={`mt-3 text-xs font-semibold ${step === currentStep ? 'text-blue-700' : 'text-gray-500'}`}>
                      {['Básico', 'Cor', 'Textos', 'Produtos', 'Preview'][idx]}
                    </span>
                  </div>
                  {step < 5 && (
                    <div className={`flex-1 h-1 mx-2 transition-all duration-300 rounded-full ${
                      step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSuccessMsg('');
              setErrorMsg('');
              if (isSubmitting || !validateStep1() || !validateStep2() || !validateStep4()) return;
              setIsSubmitting(true);
              try {
                let logoUrl = formData.logoUrl || '';
                if (formData.logo && formData.logo instanceof File) {
                  const logoRef = ref(storage, `salesPagesLogos/${user?.uid || 'anon'}/${Date.now()}_${formData.logo.name}`);
                  await uploadBytes(logoRef, formData.logo);
                  logoUrl = await getDownloadURL(logoRef);
                }
                const pageData = {
                  ...formData,
                  logoUrl,
                  produtosSelecionados: formData.produtosSelecionados,
                  status: 'ativo',
                };
                let result;
                if (isEditing && editingPage?.id) {
                  result = await salesPageService.updateSalesPage(editingPage.id, pageData);
                } else {
                  result = await salesPageService.createSalesPage(user?.uid || '', pageData);
                }
                if (result.success) {
                  setSuccessMsg(isEditing ? 'Página de vendas atualizada com sucesso!' : 'Página de vendas criada com sucesso!');
                  setTimeout(() => {
                    setSuccessMsg('');
                    if (isEditing && onPageUpdated) onPageUpdated(editingPage.id);
                    if (!isEditing && onPageCreated) onPageCreated(result.id);
                    if (onBack) onBack();
                  }, 1200);
                } else {
                  setErrorMsg((isEditing ? 'Erro ao atualizar página de vendas: ' : 'Erro ao criar página de vendas: ') + (result.error || 'Tente novamente.'));
                }
              } catch (err) {
                setErrorMsg(isEditing ? 'Erro ao atualizar página de vendas.' : 'Erro ao criar página de vendas.');
              }
              setIsSubmitting(false);
            }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex-1"
          >
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Informações Básicas</h3>
                  <p className="text-gray-600">Vamos começar com o essencial da sua página</p>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                  <label className="block text-lg font-bold mb-3 text-gray-800">
                    Nome da Página <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-gray-900 text-lg transition-all duration-200"
                    placeholder="Ex: Minha Academia Jurídica"
                    value={formData.nomePagina}
                    onChange={e => setFormData(prev => ({ ...prev, nomePagina: e.target.value }))}
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">Este será o nome identificador da sua página</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Personalização Visual</h3>
                  <p className="text-gray-600">Escolha as cores da sua página de vendas</p>
                </div>

                <div className="space-y-6">
                  {/* Cor Principal */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold mb-4 text-gray-800">Cor Principal</h4>
                    <p className="text-sm text-gray-600 mb-4">Esta cor será usada nos botões principais e elementos de destaque</p>
                    <div className="flex justify-center">
                      <label className="flex flex-col items-center cursor-pointer group">
                        <div 
                          className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                          style={{ background: formData.corPrincipal || '#6366f1' }}
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                          </svg>
                        </div>
                        <input
                          type="color"
                          className="w-14 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                          value={formData.corPrincipal || '#6366f1'}
                          onChange={e => handleInputChange('corPrincipal', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Cor Secundária */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold mb-4 text-gray-800">Cor Secundária</h4>
                    <p className="text-sm text-gray-600 mb-4">Usada em gradientes e elementos de apoio</p>
                    <div className="flex justify-center">
                      <label className="flex flex-col items-center cursor-pointer group">
                        <div 
                          className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                          style={{ background: formData.corSecundaria || '#8b5cf6' }}
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <input
                          type="color"
                          className="w-14 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                          value={formData.corSecundaria || '#8b5cf6'}
                          onChange={e => handleInputChange('corSecundaria', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Cor de Destaque */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold mb-4 text-gray-800">Cor de Destaque</h4>
                    <p className="text-sm text-gray-600 mb-4">Para preços, ofertas especiais e chamadas de ação</p>
                    <div className="flex justify-center">
                      <label className="flex flex-col items-center cursor-pointer group">
                        <div 
                          className="w-20 h-20 rounded-full border-4 border-white shadow-lg mb-3 flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                          style={{ background: formData.corDestaque || '#10b981' }}
                        >
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                        <input
                          type="color"
                          className="w-14 h-10 border-2 border-gray-200 rounded-lg cursor-pointer"
                          value={formData.corDestaque || '#10b981'}
                          onChange={e => handleInputChange('corDestaque', e.target.value)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preview das Cores */}
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h4 className="text-lg font-bold mb-4 text-gray-800">Preview das Cores</h4>
                    <div className="flex items-center justify-center space-x-4">
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-lg shadow-md mb-2"
                          style={{ background: `linear-gradient(135deg, ${formData.corPrincipal || '#6366f1'}, ${formData.corSecundaria || '#8b5cf6'})` }}
                        ></div>
                        <span className="text-xs text-gray-600">Gradiente Principal</span>
                      </div>
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-lg shadow-md mb-2 flex items-center justify-center text-white font-bold"
                          style={{ background: formData.corDestaque || '#10b981' }}
                        >
                          R$ 497
                        </div>
                        <span className="text-xs text-gray-600">Preço/CTA</span>
                      </div>
                    </div>
                  </div>
                </div>

                {(!formData.corPrincipal || !formData.corSecundaria || !formData.corDestaque) && (
                  <div className="text-red-500 text-sm mt-4 text-center font-medium">
                    Escolha todas as cores para sua página
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                {/* Briefing IA + Botão */}
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
                  <label className="block text-lg font-bold mb-3 text-gray-800">Briefing para IA (descreva seu curso)</label>
                  <div className="flex flex-col md:flex-row gap-2 mb-2">
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-yellow-100 focus:border-yellow-500 transition-all duration-200"
                      placeholder="Descreva o curso, público, benefícios, bônus, resultados, etc."
                      value={formData.iaBriefing || ''}
                      onChange={e => handleInputChange('iaBriefing', e.target.value)}
                      rows={4}
                    />
                    <button
                      type="button"
                      className="md:w-40 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold border border-blue-200 hover:bg-blue-200 transition-all"
                      onClick={() => setShowIaExample((v) => !v)}
                    >
                      {showIaExample ? 'Ocultar exemplo' : 'Ver exemplo'}
                    </button>
                  </div>
                  {showIaExample && (
                    <div className="mt-2 bg-gray-50 border border-blue-200 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-line">
                      <strong>Exemplo de briefing:</strong>
                      <br />
                      Curso completo de Processo Civil voltado para advogados iniciantes e atuantes que querem dominar a prática processual e aumentar seus honorários.

Com linguagem clara e foco total na prática forense, o curso é ministrado pelo Prof. Dr. Marcelo Oliveira, advogado com mais de 20 anos de experiência na área cível, mestre em Processo Civil e autor de livros jurídicos.

Formato: 100% online, com aulas gravadas e ao vivo, simulados com correção, plantão de dúvidas, modelos prontos de peças processuais e acesso por 1 ano.

Certificação: 60h com validade nacional.

Já impactamos mais de 3.500 advogados em todo o Brasil, com uma taxa de satisfação de 98,7%. Muitos alunos relatam ter triplicado seus honorários após aplicar os conhecimentos.

Bônus inclusos:
Banco de peças processuais (atualizado)
E-book com mapas mentais de toda a matéria
Sessão de mentoria coletiva

Investimento: de R$ 997 por apenas R$ 397 à vista ou em até 12x.

Garantia de 7 dias. Acesse sem risco e veja se é pra você!
                    </div>
                  )}
                  <button
                    type="button"
                    className="mt-2 px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-bold shadow hover:scale-105 transition-all disabled:opacity-60"
                    disabled={!formData.iaBriefing || iaLoading}
                    onClick={async () => {
                {/* Modal de exemplo IA */}
                {showIaExample && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8 relative">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        onClick={() => setShowIaExample(false)}
                        aria-label="Fechar"
                      >×</button>
                      <h2 className="text-xl font-bold mb-4 text-blue-900">Exemplo de Briefing para IA</h2>
                      <pre className="bg-gray-100 rounded-lg p-4 text-sm whitespace-pre-wrap text-gray-800">
Curso completo de Processo Civil voltado para advogados iniciantes e atuantes que querem dominar a prática processual e aumentar seus honorários.

Com linguagem clara e foco total na prática forense, o curso é ministrado pelo Prof. Dr. Marcelo Oliveira, advogado com mais de 20 anos de experiência na área cível, mestre em Processo Civil e autor de livros jurídicos.

Formato: 100% online, com aulas gravadas e ao vivo, simulados com correção, plantão de dúvidas, modelos prontos de peças processuais e acesso por 1 ano.

Certificação: 60h com validade nacional.

Já impactamos mais de 3.500 advogados em todo o Brasil, com uma taxa de satisfação de 98,7%. Muitos alunos relatam ter triplicado seus honorários após aplicar os conhecimentos.

Bônus inclusos:

Banco de peças processuais (atualizado)

E-book com mapas mentais de toda a matéria

Sessão de mentoria coletiva

Investimento: de R$ 997 por apenas R$ 397 à vista ou em até 12x.

Garantia de 7 dias. Acesse sem risco e veja se é pra você!
                      </pre>
                    </div>
                  </div>
                )}
// ...existing code...
// Estado para modal de exemplo IA
const [showIaExample, setShowIaExample] = useState(false);
                      setIaLoading(true);
                      setIaError('');
                      try {
                        const prompt = `Você é um copywriter especialista em páginas de vendas de cursos online. Com base no briefing abaixo, gere um JSON com os seguintes campos: heroBadge_text, heroTitle_text, heroSubtitle_text, beneficios_mock (array de strings), ctaPrincipal_text, provaSocial_numeroAdvogados, provaSocial_honorariosGerados, provaSocial_taxaSatisfacao, provaSocial_tempoResultado, depoimentos_mock (array de objetos com nome, texto), videosSection_title, videosSection_subtitle, beneficiosDetalhados_mock (array de strings), ofertaEspecial_badge, produto_mock_title, produto_mock_description, produto_mock_priceOriginal, produto_mock_priceSale, produto_mock_discount, produto_mock_cta, produto_mock_infoPagamento, bonus_mock (array de bônus, com nome e descrição), garantia_titulo, garantia_descricao, garantia_lista (array de tópicos), faq_mock (array com objetos {pergunta, resposta}), ultimaChance_title, ultimaChance_subtitle, ultimaChance_infoPreco. Responda apenas com o JSON.\n\nBriefing:\n${formData.iaBriefing}`;
                        const response = await fetch('https://api.openai.com/v1/chat/completions', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${OPENAI_API_KEY}`
                          },
                          body: JSON.stringify({
                            model: 'gpt-4',
                            messages: [
                              { role: 'system', content: 'Você é um copywriter especialista em páginas de vendas de cursos online.' },
                              { role: 'user', content: prompt }
                            ],
                            temperature: 0.7,
                            max_tokens: 1800
                          })
                        });
                        const data = await response.json();
                        let content = data.choices?.[0]?.message?.content || '';
                        // Tenta extrair JSON
                        let json;
                        try {
                          json = JSON.parse(content);
                        } catch {
                          // Tenta extrair JSON de resposta "formatada"
                          const match = content.match(/\{[\s\S]*\}/);
                          if (match) json = JSON.parse(match[0]);
                        }
                        if (!json) throw new Error('Não foi possível interpretar a resposta da IA.');
                        // Preenche campos do formulário
                        setFormData(prev => ({
                          ...prev,
                          heroBadge: json.heroBadge_text,
                          heroTitle: json.heroTitle_text,
                          heroSubtitle: json.heroSubtitle_text,
                          beneficiosRaw: (json.beneficios_mock || []).join('\n'),
                          ctaPrincipal: json.ctaPrincipal_text,
                          numeroAdvogados: json.provaSocial_numeroAdvogados,
                          honorariosGerados: json.provaSocial_honorariosGerados,
                          taxaSatisfacao: json.provaSocial_taxaSatisfacao,
                          tempoResultado: json.provaSocial_tempoResultado,
                          depoimentosRaw: (json.depoimentos_mock || []).map(dep => `${dep.nome||''};${dep.texto||''}`).join('\n'),
                          videosSectionTitle: json.videosSection_title,
                          videosSectionSubtitle: json.videosSection_subtitle,
                          beneficiosDetalhadosRaw: (json.beneficiosDetalhados_mock || []).join('\n'),
                          ofertaEspecialBadge: json.ofertaEspecial_badge,
                          produtoTitle: json.produto_mock_title,
                          produtoDescription: json.produto_mock_description,
                          produtoPriceOriginal: json.produto_mock_priceOriginal,
                          produtoPriceSale: json.produto_mock_priceSale,
                          produtoDiscount: json.produto_mock_discount,
                          produtoCta: json.produto_mock_cta,
                          produtoInfoPagamento: json.produto_mock_infoPagamento,
                          bonusRaw: (json.bonus_mock || []).map(b => `${b.nome||''};${b.descricao||''}`).join('\n'),
                          garantiaTitulo: json.garantia_titulo,
                          garantiaDescricao: json.garantia_descricao,
                          garantiaListaRaw: (json.garantia_lista || []).join('\n'),
                          faqRaw: (json.faq_mock || []).map(f => `${f.pergunta||''};${f.resposta||''}`).join('\n'),
                          ultimaChanceTitle: json.ultimaChance_title,
                          ultimaChanceSubtitle: json.ultimaChance_subtitle,
                          ultimaChanceInfoPreco: json.ultimaChance_infoPreco
                        }));
                      } catch (err) {
                        setIaError('Erro ao gerar com IA: ' + (err.message || err));
                      }
                      setIaLoading(false);
                    }}
                  >
                    {iaLoading ? 'Gerando...' : 'Gerar Página com IA'}
                  </button>
                  {iaError && <div className="text-red-600 text-sm mt-2">{iaError}</div>}
                </div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Conteúdo da Página</h3>
                  <p className="text-gray-600">Adicione textos, benefícios, depoimentos, provas sociais, bônus, garantia, FAQ e vídeos para engajar seus visitantes</p>
                </div>

                <div className="space-y-6">
                  {/* Estados para IA */}
                  {/* ...existing code... */}
                  {/* Hero Badge */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">Hero Badge</label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ex: Mais de 1.000 advogados transformaram suas carreiras"
                      value={formData.heroBadge || ''}
                      onChange={e => handleInputChange('heroBadge', e.target.value)}
                    />
                  </div>
                  {/* Hero Title */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">Hero Title</label>
                    <input
                      type="text"
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ex: Transforme sua carreira jurídica em 90 Dias"
                      value={formData.heroTitle || ''}
                      onChange={e => handleInputChange('heroTitle', e.target.value)}
                    />
                  </div>
                  {/* Hero Subtitle */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">Hero Subtitle</label>
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      placeholder="Ex: Descubra o método comprovado que está transformando advogados comuns em especialistas requisitados no mercado jurídico"
                      value={formData.heroSubtitle || ''}
                      onChange={e => handleInputChange('heroSubtitle', e.target.value)}
                      rows={2}
                    />
                  </div>
                  {/* Benefícios (array) */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">Benefícios (um por linha, formato: emoji;Título;Descrição)</label>
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      placeholder={"Ex:\n💰;Aumente Seus Honorários;Multiplique sua receita por 3x em até 6 meses\n⚡;Resultados Rápidos;Primeiros resultados em 30 dias"}
                      value={formData.beneficiosRaw || ''}
                      onChange={e => handleInputChange('beneficiosRaw', e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-2">Separe cada benefício por linha. Exemplo: 💰;Aumente Seus Honorários;Multiplique sua receita por 3x em até 6 meses</p>
                  </div>
                  {/* Depoimentos (array) */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">Depoimentos (um por linha, formato: Nome;Especialidade;Depoimento;Iniciais)</label>
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      placeholder={"Ex:\nDr. Roberto Silva;Direito Empresarial;Em 3 meses aumentei meus honorários em 250%. O método é realmente transformador!;DR"}
                      value={formData.depoimentosRaw || ''}
                      onChange={e => handleInputChange('depoimentosRaw', e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-2">Separe cada depoimento por linha. Exemplo: Nome;Especialidade;Depoimento;Iniciais</p>
                  </div>
                  {/* Prova Social */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-bold mb-3 text-gray-800">Nº Advogados Formados</label>
                      <input type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-lg" value={formData.numeroAdvogados || ''} onChange={e => handleInputChange('numeroAdvogados', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-lg font-bold mb-3 text-gray-800">Honorários Gerados</label>
                      <input type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-lg" value={formData.honorariosGerados || ''} onChange={e => handleInputChange('honorariosGerados', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-lg font-bold mb-3 text-gray-800">Taxa de Satisfação</label>
                      <input type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-lg" value={formData.taxaSatisfacao || ''} onChange={e => handleInputChange('taxaSatisfacao', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-lg font-bold mb-3 text-gray-800">Tempo p/ 1º Resultado</label>
                      <input type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-lg" value={formData.tempoResultado || ''} onChange={e => handleInputChange('tempoResultado', e.target.value)} />
                    </div>
                  </div>
                  {/* Bônus (array) */}
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">Bônus (um por linha)</label>
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      placeholder={"Ex:\nPlanilha de Gestão Financeira\nKit Modelos de Contratos\nAcesso ao Grupo VIP"}
                      value={formData.bonusRaw || ''}
                      onChange={e => handleInputChange('bonusRaw', e.target.value)}
                      rows={3}
                    />
                  </div>
                  {/* Garantia */}
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">Título da Garantia</label>
                    <input type="text" className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-lg mb-2" value={formData.garantiaTitulo || ''} onChange={e => handleInputChange('garantiaTitulo', e.target.value)} />
                    <label className="block text-lg font-bold mb-3 text-gray-800">Descrição da Garantia</label>
                    <textarea className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 text-lg" value={formData.garantiaDescricao || ''} onChange={e => handleInputChange('garantiaDescricao', e.target.value)} rows={2} />
                  </div>
                  {/* FAQ (array) */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">FAQ (um por linha, formato: Pergunta;Resposta)</label>
                    <textarea
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                      placeholder={"Ex:\nComo funciona o acesso ao curso?;Após a confirmação do pagamento, você recebe imediatamente os dados de acesso à nossa plataforma exclusiva, onde poderá assistir às aulas quantas vezes quiser."}
                      value={formData.faqRaw || ''}
                      onChange={e => handleInputChange('faqRaw', e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-2">Separe cada FAQ por linha. Exemplo: Pergunta;Resposta</p>
                  </div>
                  {/* Vídeos (YouTube) */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                    <label className="block text-lg font-bold mb-3 text-gray-800">Vídeos (YouTube)</label>
                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                        placeholder="Cole o link do vídeo do YouTube"
                        value={videoInput}
                        onChange={e => setVideoInput(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddVideo}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg font-semibold transition-all duration-200"
                      >
                        Adicionar
                      </button>
                    </div>
                    {videoError && <div className="text-red-500 text-sm mb-3 font-medium">{videoError}</div>}
                    <div className="space-y-3">
                      {videoLinks.map((url, idx) => (
                        <div key={url} className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="truncate flex-1 text-gray-700">{url}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(url)}
                            className="text-red-500 hover:text-red-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Cole o link completo do vídeo do YouTube e clique em Adicionar.</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Selecione os Produtos</h3>
                  <p className="text-gray-600">Escolha quais cursos você deseja vender nesta página</p>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                  {availableProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                        </svg>
                      </div>
                      <span className="text-gray-500 text-lg">Nenhum curso publicado encontrado.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableProducts.map(course => (
                        <label key={course.id} className="group">
                          <div className={`flex items-start gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                            formData.produtosSelecionados.includes(course.id)
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }`}>
                            <input
                              type="checkbox"
                              checked={formData.produtosSelecionados.includes(course.id)}
                              onChange={e => {
                                setFormData(prev => ({
                                  ...prev,
                                  produtosSelecionados: e.target.checked
                                    ? [...prev.produtosSelecionados, course.id]
                                    : prev.produtosSelecionados.filter(id => id !== course.id)
                                }));
                              }}
                              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                            />
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 mb-1">{course.title}</h4>
                              <div className="flex gap-3 items-center">
                                {course.priceOriginal && (
                                  <span className="text-gray-400 line-through text-sm">
                                    R$ {Number(course.priceOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                                {course.priceSale && (
                                  <span className="text-green-600 font-bold text-lg">
                                    R$ {Number(course.priceSale).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="w-full">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Pré-visualização</h3>
                  <p className="text-gray-600">Veja como ficará sua página antes de publicar</p>
                </div>

                <div className="rounded-2xl shadow-xl border border-gray-200 p-4 bg-white">
                  <SalesWebPage
                    salesData={{
                      ...formData,
                      logo: logoPreview || formData.logo,
                      videos: videoLinks,
                      produtosDetalhes: availableProducts.filter(prod => formData.produtosSelecionados.includes(prod.id)),
                    }}
                    isPreview={true}
                  />
                </div>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700 font-semibold">{successMsg}</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 font-semibold">{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Navegação */}
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={currentStep === 1 ? onBack : prevStep}
                className="inline-flex items-center px-8 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !validateStep1()) ||
                    (currentStep === 2 && !validateStep2()) ||
                    (currentStep === 4 && !validateStep4())
                  }
                  className={`inline-flex items-center px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    (currentStep === 1 && !validateStep1()) ||
                    (currentStep === 2 && !validateStep2()) ||
                    (currentStep === 4 && !validateStep4())
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {currentStep === 4 ? 'Pré-visualizar' : 'Próximo'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting || !validateStep4()}
                  className={`inline-flex items-center px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isSubmitting || !validateStep4()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-teal-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {isSubmitting
                    ? (isEditing ? 'Salvando...' : 'Criando...')
                    : (isEditing ? 'Salvar Alterações' : 'Criar Página de Vendas')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SalesPageBuilder;