
import React, { useState, useEffect } from 'react';
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
  // Cursos publicados disponíveis para seleção
  const [availableProducts, setAvailableProducts] = useState([]);
  useEffect(() => {
    async function fetchCourses() {
      if (user?.uid) {
        const result = await courseService.getPublishedCoursesByUser(user.uid);
        if (result.success) setAvailableProducts(result.data);
      }
    }
    fetchCourses();
  }, [user]);
  const defaultFormData = {
    tipoPagina: 'vendas',
    nomePagina: '', // Nome curto da página (obrigatório)
    titulo: '',    // Título de destaque
    descricao: '', // Texto de apresentação
    produtosSelecionados: [], // IDs dos produtos selecionados
  };
  // ...
  const initialFormData = isEditing ? {
    ...defaultFormData,
    ...editingPage
  } : defaultFormData;
  const [formData, setFormData] = useState(initialFormData);

  // Atualiza formData ao entrar em modo de edição
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

  // Validação de cada etapa
  const validateStep1 = () => !!formData.nomePagina;
  const validateStep2 = () => !!formData.corPrincipal;
  const validateStep3 = () => true; // Título, descrição e vídeos são opcionais
  const validateStep4 = () => formData.produtosSelecionados.length > 0;

  // Função para validar link do YouTube
  function isValidYoutubeUrl(url) {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}(&.*)?$/;
    return regex.test(url);
  }

  // Adicionar vídeo validado
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

  // ...demais funções e lógica...

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Página de Vendas' : 'Criar Página de Vendas'}
              </h1>
              <p className="text-gray-600 mt-1">
                Crie sua página de vendas personalizada em poucos passos
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* ...etapas 1 a 4 do formulário aqui... */}
          {currentStep === 5 && (
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pré-visualização da Página</h3>
              <div className="rounded-xl shadow-lg border border-gray-200 p-2 bg-white">
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
        </div>
      </div>
    </div>
  );
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
  // ...restante da lógica e JSX igual ao LawyerPageBuilder...
  // Atualizar barra de progresso para 4 etapas
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Editar Página de Vendas' : 'Criar Página de Vendas'}
              </h1>
              <p className="text-gray-600 mt-1">
                Crie sua página de vendas personalizada em poucos passos
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Voltar
              </button>
            )}
          </div>
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((step) => (
                <React.Fragment key={step}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Básico</span>
              <span>Cor</span>
              <span>Textos</span>
              <span>Produtos</span>
              <span>Pré-visualizar</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {currentStep < 5 && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSuccessMsg('');
                setErrorMsg('');
                if (isSubmitting || !validateStep1() || !validateStep2() || !validateStep4()) return;
                setIsSubmitting(true);
                try {
                  let logoUrl = formData.logoUrl || '';
                  // Se for um novo arquivo de logo (File), faz upload
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
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
                  <div>
                    <label className="block font-bold mb-2 text-lg text-gray-800">Nome da Página <span className="text-red-500">*</span></label>
                    {/* ...restante do conteúdo da etapa 1... */}
                  </div>
                </div>
              )}
            </form>
          )}
          {currentStep === 5 && (
            <div className="w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pré-visualização da Página</h3>
              <div className="rounded-xl shadow-lg border border-gray-200 p-2 bg-white">
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
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Cor Principal da Página</h3>
              <div className="flex gap-6 items-center">
                <label className="flex flex-col items-center cursor-pointer">
                  <span
                    className="w-10 h-10 rounded-full border-4 border-gray-300 mb-1 flex items-center justify-center"
                    style={{ background: formData.corPrincipal || '#fff' }}
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                  <input
                    type="color"
                    name="corPrincipalCustom"
                    className="w-8 h-8 mt-1 border-none p-0 bg-transparent"
                    value={formData.corPrincipal || '#000000'}
                    onChange={e => handleInputChange('corPrincipal', e.target.value)}
                  />
                  <span className="text-xs text-gray-600 font-semibold">Escolha a cor</span>
                </label>
              </div>
              {!formData.corPrincipal && (
                <div className="text-red-500 text-sm mt-2">Escolha uma cor para sua página</div>
              )}
            </div>
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Textos da Página</h3>
              <div>
                <label className="block font-bold mb-2 text-lg text-gray-800">Título de Destaque</label>
                <input
                  type="text"
                  className="w-full border-2 border-blue-100 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 font-inter-medium"
                  placeholder="Ex: Transforme sua carreira com nossos cursos!"
                  value={formData.titulo}
                  onChange={e => handleInputChange('titulo', e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold mb-2 text-lg text-gray-800">Descrição/Texto de Apresentação</label>
                <textarea
                  className="w-full border-2 border-blue-100 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-200 font-inter-medium"
                  placeholder="Conte um pouco sobre sua página, seus diferenciais, etc."
                  value={formData.descricao}
                  onChange={e => handleInputChange('descricao', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-bold mb-2 text-lg text-gray-800">Vídeos (YouTube)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    className="flex-1 border-2 border-blue-100 rounded-xl px-4 py-2 text-base focus:ring-2 focus:ring-blue-200 font-inter-medium"
                    placeholder="Cole o link do vídeo do YouTube"
                    value={videoInput}
                    onChange={e => setVideoInput(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddVideo}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    Validar & Adicionar
                  </button>
                </div>
                {videoError && <div className="text-red-500 text-sm mb-2">{videoError}</div>}
                <ul className="space-y-2">
                  {videoLinks.map((url, idx) => (
                    <li key={url} className="flex items-center gap-2 bg-blue-50 rounded px-3 py-1">
                      <span className="truncate flex-1 text-blue-700">{url}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(url)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                      >Remover</button>
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-gray-500 mt-1">Cole o link completo do vídeo do YouTube e clique em Validar & Adicionar.</div>
              </div>
            </div>
          )}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Selecione os Produtos para Vender</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableProducts.length === 0 ? (
                  <span className="text-gray-500">Nenhum curso publicado.</span>
                ) : (
                  availableProducts.map(course => (
                    <label key={course.id} className="flex items-center gap-2 border rounded p-2">
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
                      />
                      <span className="font-semibold">{course.title}</span>
                      <span className="ml-2 flex gap-2 items-center">
                        {course.priceOriginal && (
                          <span className="text-gray-400 line-through">R$ {Number(course.priceOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                        {course.priceSale && (
                          <span className="text-green-700 font-semibold">R$ {Number(course.priceSale).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        )}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}
          {successMsg && <div className="mb-4 text-green-700 font-bold text-center">{successMsg}</div>}
          {errorMsg && <div className="mb-4 text-red-600 font-bold text-center">{errorMsg}</div>}
          {/* Navegação */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
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
                className={`px-6 py-2 rounded-lg text-sm font-medium ${
                  (currentStep === 1 && !validateStep1()) ||
                  (currentStep === 2 && !validateStep2()) ||
                  (currentStep === 4 && !validateStep4())
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {currentStep === 4 ? 'Pré-visualizar' : 'Próximo'}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !validateStep4()}
                className={`px-8 py-2 rounded-lg text-sm font-medium ${
                  isSubmitting || !validateStep4()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting
                  ? (isEditing ? 'Salvando...' : 'Criando...')
                  : (isEditing ? 'Salvar Alterações' : 'Criar Página de Vendas')}
              </button>
            )}
          </div>
        {/* Etapa 5: Preview final antes de salvar */}
        {currentStep === 5 && (
          <div className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pré-visualização da Página</h3>
            <div className="rounded-xl shadow-lg border border-gray-200 p-2 bg-white">
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
        </div>
      </div>
    </div>
  );
};

export default SalesPageBuilder;
