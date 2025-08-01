import React, { useState, useEffect } from 'react';
import { lawyerPageService } from '../firebase/firestore';
import { Search, MapPin, Star, Phone, Mail, Globe, Filter, ChevronDown, Eye } from 'lucide-react';

// Função utilitária para formatação de telefone
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

const FindLawyerPage = () => {
  const [lawyers, setLawyers] = useState([]);
  const [filteredLawyers, setFilteredLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Lista de especialidades disponíveis
  const specialties = [
    'Direito Civil',
    'Direito Penal',
    'Direito Trabalhista',
    'Direito Empresarial',
    'Direito de Família',
    'Direito Previdenciário',
    'Direito Tributário',
    'Direito Imobiliário',
    'Direito do Consumidor',
    'Direito Digital',
    'Outros'
  ];

  useEffect(() => {
    loadLawyers();
  }, []);

  useEffect(() => {
    filterLawyers();
  }, [lawyers, searchTerm, selectedSpecialty, selectedLocation]);

  const loadLawyers = async () => {
    try {
      setLoading(true);
      
      // Buscar todas as páginas ativas de advogados
      const result = await lawyerPageService.getAllActivePages();
      
      if (result.success) {
        console.log('📋 Páginas de advogados carregadas:', result.data.length);
        setLawyers(result.data);
      } else {
        throw new Error(result.error || 'Erro ao carregar advogados');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar advogados:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterLawyers = () => {
    let filtered = [...lawyers];

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(lawyer => {
        const searchIn = [
          lawyer.nomePagina,
          lawyer.nomeCompleto,
          lawyer.especialidade,
          lawyer.descricao,
          ...(lawyer.especialidades || [])
        ].filter(Boolean).join(' ').toLowerCase();
        
        return searchIn.includes(searchTerm.toLowerCase());
      });
    }

    // Filtro por especialidade
    if (selectedSpecialty) {
      filtered = filtered.filter(lawyer => 
        lawyer.especialidade === selectedSpecialty ||
        (lawyer.especialidades && lawyer.especialidades.includes(selectedSpecialty))
      );
    }

    // Filtro por localização
    if (selectedLocation) {
      filtered = filtered.filter(lawyer => 
        lawyer.cidade?.toLowerCase().includes(selectedLocation.toLowerCase()) ||
        lawyer.estado?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    setFilteredLawyers(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedLocation('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando advogados especialistas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Erro ao carregar advogados: {error}</p>
          </div>
          <button
            onClick={loadLawyers}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Header fixo com logo e navegação */}
      <header className="w-full fixed top-0 left-0 z-30 bg-white/90 border-b border-blue-100 shadow-sm backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <img src="/logo_Marketplace.png" alt="Marketplace Logo" className="h-10 w-auto object-contain" />
            <span className="text-2xl font-extrabold text-blue-700 tracking-tight">Marketplace</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-colors"
            >
              Voltar para Início
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow"
            >
              Entrar
            </button>
          </div>
        </div>
      </header>
      {/* Header da Página */}
      {/* Espaço para o header fixo */}
      <div className="h-20" />
      <div className="bg-white/80 backdrop-blur border-b border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-blue-700 mb-2 tracking-tight drop-shadow">
              Encontre um Advogado Especialista
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Conecte-se com profissionais qualificados na área jurídica que você precisa
            </p>

            {/* Barra de Busca Principal */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Busque por nome, especialidade ou área de atuação..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white/80 shadow-sm text-lg"
                />
              </div>
            </div>

            {/* Botão de Filtros */}
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors shadow"
              >
                <Filter className="w-4 h-4" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Painel de Filtros */}
          {showFilters && (
            <div className="mt-8 p-8 bg-white/80 rounded-2xl shadow-md border border-blue-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro por Especialidade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Especialidade
                  </label>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as especialidades</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Localização */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização
                  </label>
                  <input
                    type="text"
                    placeholder="Cidade ou estado"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Botão Limpar Filtros */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contador de Resultados */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredLawyers.length === 0 
              ? 'Nenhum advogado encontrado' 
              : `${filteredLawyers.length} ${filteredLawyers.length === 1 ? 'advogado encontrado' : 'advogados encontrados'}`
            }
          </p>
        </div>

        {/* Lista de Advogados */}
        <div className="space-y-8">
          {filteredLawyers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum advogado encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Tente ajustar os filtros ou termos de busca
              </p>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            filteredLawyers.map(lawyer => (
              <LawyerCard key={lawyer.id} lawyer={lawyer} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Card do Advogado
const LawyerCard = ({ lawyer }) => {
  // Log completo do objeto lawyer para debug
  console.log('LawyerCard lawyer:', lawyer);

  // Usar areasAtuacao como especialidades principais da página
  const especialidadesPagina = Array.isArray(lawyer.areasAtuacao)
    ? lawyer.areasAtuacao.filter(e => !!e && e.trim() !== '')
    : (typeof lawyer.areasAtuacao === 'string' && lawyer.areasAtuacao.trim() !== '' ? [lawyer.areasAtuacao] : []);
  {/* Especialidade da página (string ou array) */}
  {Array.isArray(lawyer.especialidadePagina) && lawyer.especialidadePagina.filter(e => !!e && e.trim() !== '').length > 0 && (
    lawyer.especialidadePagina.filter(e => !!e && e.trim() !== '').map((esp, idx) => (
      <span key={`esp-pg-main-${idx}`} className="px-3 py-1 bg-blue-200 text-blue-900 text-sm rounded-full font-semibold border border-blue-300">
        {esp}
      </span>
    ))
  )}
  {typeof lawyer.especialidadePagina === 'string' && lawyer.especialidadePagina.trim() !== '' && (
    <span className="px-3 py-1 bg-blue-200 text-blue-900 text-sm rounded-full font-semibold border border-blue-300">
      {lawyer.especialidadePagina}
    </span>
  )}
  // Permitir busca dos campos tanto na raiz quanto em subobjetos
  const cidade = lawyer.cidade || lawyer.endereco?.cidade;
  const estado = lawyer.estado || lawyer.endereco?.estado;
  // Busca ampliada para valores de consulta
  function getValorFaixa(lawyer) {
    // Busca todos os campos possíveis
    const v =
      lawyer.valorMin ||
      lawyer.valores?.valorMin ||
      lawyer.valorConsulta ||
      lawyer.preco ||
      lawyer.precoConsulta ||
      lawyer.valores?.valorConsulta ||
      lawyer.valores?.preco ||
      lawyer.valores?.precoConsulta;
    const vMax =
      lawyer.valorMax ||
      lawyer.valores?.valorMax ||
      lawyer.valorConsultaMax ||
      lawyer.precoMax ||
      lawyer.precoConsultaMax ||
      lawyer.valores?.valorConsultaMax ||
      lawyer.valores?.precoMax ||
      lawyer.valores?.precoConsultaMax;

    // Caso venha como objeto {minimo, maximo}
    if (v && typeof v === 'object' && 'minimo' in v && 'maximo' in v) {
      return { min: v.minimo, max: v.maximo };
    }
    // Caso venha como objeto {valor}
    if (v && typeof v === 'object' && 'valor' in v) {
      return { min: v.valor };
    }
    // Caso venha como Firestore Number
    if (v && typeof v === 'object' && typeof v.toNumber === 'function') {
      return { min: v.toNumber() };
    }
    // Se ambos são números/strings
    if (v && vMax) {
      return { min: v, max: vMax };
    }
    if (v) return { min: v };
    if (vMax) return { max: vMax };
    return {};
  }
  const faixa = getValorFaixa(lawyer);
  // Debug visual dos dados recebidos
  console.log('LawyerCard props:', { nomePagina: lawyer.nomePagina, cidade, estado, faixa });

  function getImageUrl() {
    if (lawyer.logoUrl) {
      return lawyer.logoUrl;
    }
    return '/logo_Marketplace.png';
  }

  const handleContact = (type) => {
    switch (type) {
      case 'email':
        if (lawyer.email) {
          window.open(`mailto:${lawyer.email}`, '_blank');
        }
        break;
      case 'phone':
        if (lawyer.telefone) {
          const cleanPhone = lawyer.telefone.replace(/\D/g, '');
          window.open(`https://wa.me/55${cleanPhone}`, '_blank');
        }
        break;
      case 'website':
        if (lawyer.website) {
          window.open(lawyer.website.startsWith('http') ? lawyer.website : `https://${lawyer.website}`, '_blank');
        }
        break;
      case 'viewPage':
        // Redirecionar para página pública do advogado
        if (lawyer.slug) {
          window.open(`/advogado/${lawyer.slug}`, '_blank');
        }
        break;
      case 'schedule':
        // Redirecionar para página de agendamento
        if (lawyer.slug) {
          window.open(`/agendar/${lawyer.slug}`, '_blank');
        }
        break;
    }
  };

  return (
    <div className="bg-white/90 rounded-2xl shadow-lg border border-blue-100 hover:shadow-xl transition-shadow duration-300">
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-start gap-8">
          {/* Logo/Avatar */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white border-2 border-blue-200 rounded-full overflow-hidden flex items-center justify-center shadow-md">
              <img
                src={getImageUrl()}
                alt={lawyer.nomePagina}
                className="w-full h-full object-contain object-center"
                style={{ background: 'white' }}
                onError={(e) => {
                  e.target.src = '/logo_Marketplace.png';
                }}
              />
            </div>
          </div>

          {/* Informações Principais */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="flex-grow mb-4 md:mb-0">
                <h3 className="text-2xl font-extrabold text-blue-800 mb-1 tracking-tight">
                  {lawyer.nomePagina}
                </h3>
                {lawyer.nomeCompleto && (
                  <p className="text-gray-600 mb-3 text-lg font-medium">
                    {lawyer.nomeCompleto}
                  </p>
                )}

                {/* Sistema de Avaliações */}
                {(lawyer.rating || lawyer.totalReviews) && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= (lawyer.rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-base text-gray-700 font-semibold">
                      {lawyer.rating ? `${lawyer.rating.toFixed(1)}` : '0.0'}
                      {lawyer.totalReviews && ` (${lawyer.totalReviews} avaliações)`}
                    </span>
                  </div>
                )}


                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {/* Áreas de Atuação (Especialidades da Página) */}
                  {especialidadesPagina.length > 0 && especialidadesPagina.map((esp, idx) => (
                    <span key={`esp-area-${idx}`} className="px-4 py-1 bg-blue-200 text-blue-900 text-base rounded-full font-semibold border border-blue-300 shadow-sm">
                      {esp}
                    </span>
                  ))}

                  {/* Especialidade Principal (fallback antigo) */}
                  {lawyer.especialidade && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                      {lawyer.especialidade}
                    </span>
                  )}

                  {/* Especialidades Adicionais (fallback antigo) */}
                  {Array.isArray(lawyer.especialidades) && lawyer.especialidades.length > 0 && (
                    lawyer.especialidades.slice(0, 3).map((esp, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {esp}
                      </span>
                    ))
                  )}

                  {/* Mais especialidades (fallback antigo) */}
                  {Array.isArray(lawyer.especialidades) && lawyer.especialidades.length > 3 && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                      +{lawyer.especialidades.length - 3} mais
                    </span>
                  )}

                  {/* Especializações da página (fallback antigo) */}
                  {Array.isArray(lawyer.especializacoes) && lawyer.especializacoes.filter(e => !!e && e.trim() !== '').length > 0 && (
                    lawyer.especializacoes.filter(e => !!e && e.trim() !== '').map((esp, idx) => (
                      <span key={`esp-pg-${idx}`} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-300">
                        {esp}
                      </span>
                    ))
                  )}
                  {/* Alternativa: especializacoesPagina (fallback antigo) */}
                  {Array.isArray(lawyer.especializacoesPagina) && lawyer.especializacoesPagina.filter(e => !!e && e.trim() !== '').length > 0 && (
                    lawyer.especializacoesPagina.filter(e => !!e && e.trim() !== '').map((esp, idx) => (
                      <span key={`esp-pg-alt-${idx}`} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-300">
                        {esp}
                      </span>
                    ))
                  )}
                  {/* Fallback: especializacoes como string única (fallback antigo) */}
                  {typeof lawyer.especializacoes === 'string' && lawyer.especializacoes.trim() !== '' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-300">
                      {lawyer.especializacoes}
                    </span>
                  )}
                  {typeof lawyer.especializacoesPagina === 'string' && lawyer.especializacoesPagina.trim() !== '' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-300">
                      {lawyer.especializacoesPagina}
                    </span>
                  )}
                </div>

                {/* Range de valores/honorários */}
                {(faixa.min || faixa.max) && (
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-base font-semibold text-yellow-700 bg-yellow-100 rounded-full px-4 py-1 shadow">
                      Honorários:{' '}
                      {faixa.min && faixa.max
                        ? `R$ ${Math.min(faixa.min, faixa.max)} a R$ ${Math.max(faixa.min, faixa.max)}`
                        : faixa.min
                        ? `A partir de R$ ${faixa.min}`
                        : `Até R$ ${faixa.max}`}
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-6 mb-4">
                  {lawyer.oab && (
                    <span className="text-sm text-gray-600">
                      OAB: {lawyer.oab}
                    </span>
                  )}

                  {(cidade || estado) && (
                    <div className="flex items-center gap-1 text-sm text-blue-700 font-semibold">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {[cidade, estado].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Experiência */}
                  {lawyer.anosExperiencia && (
                    <span className="text-sm text-gray-600">
                      {lawyer.anosExperiencia} anos de experiência
                    </span>
                  )}
                </div>

                {lawyer.descricao && (
                  <p className="text-gray-700 mb-4 text-base line-clamp-3">
                    {lawyer.descricao}
                  </p>
                )}

                {/* Informações de Contato */}
                <div className="flex flex-wrap items-center gap-6 text-base text-gray-600">
                  {lawyer.telefone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{formatPhoneNumber(lawyer.telefone)}</span>
                    </div>
                  )}

                  {lawyer.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{lawyer.email}</span>
                    </div>
                  )}

                  {lawyer.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col gap-3 md:ml-8">
                <button
                  onClick={() => handleContact('viewPage')}
                  className="px-5 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-900 transition-colors font-semibold flex items-center gap-2 justify-center shadow"
                >
                  <Eye className="w-5 h-5" />
                  Ver Página
                </button>
                <button
                  onClick={() => handleContact('schedule')}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow"
                >
                  Agendar Consulta
                </button>

                <div className="flex gap-3">
                  {lawyer.telefone && (
                    <button
                      onClick={() => handleContact('phone')}
                      className="p-3 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors shadow"
                      title="WhatsApp"
                    >
                      <Phone className="w-5 h-5" />
                    </button>
                  )}

                  {lawyer.email && (
                    <button
                      onClick={() => handleContact('email')}
                      className="p-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors shadow"
                      title="Email"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  )}

                  {lawyer.website && (
                    <button
                      onClick={() => handleContact('website')}
                      className="p-3 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors shadow"
                      title="Website"
                    >
                      <Globe className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindLawyerPage;
