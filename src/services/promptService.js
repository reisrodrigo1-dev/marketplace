// Serviço para gerenciar os tipos de prompts disponíveis
// Função para carregar dinamicamente os prompts dos arquivos
export const loadPromptFiles = async () => {
  try {
    // Lista de arquivos de prompt disponíveis (em produção, seria obtida via API)
    const promptFiles = [
      'Acrescentar Argumentos.odt',
      'Agravo de instrumento.docx',
      'Analisar laudos médicos.doc',
      'Analisar PEC - Defensoria.odt',
      'Analisar PEC.odt',
      'Apelação (Dir. Privado, exceto trabalhista).docx',
      'Apelação Criminal.odt',
      'Apelação trabalhista.docx',
      'Atualizar Valores pelo CC.odt',
      'Busca de Jurisprudência.doc',
      'contestação.doc',
      'Contrarrazões cível-família.doc',
      'Contrarrazões de Apelação Criminal.odt',
      'Contrarrazões de Recurso Especial.odt',
      'Contrarrazões de Recurso Extraordinário.odt',
      'Correção do Português e Sugestões para peças.odt',
      'Corrigir o Português e Deixar mais claro.odt',
      'Depoimento da vítima x laudo médico.doc',
      'Despacho Judicial.docx',
      'Dosimetria da pena.doc',
      'Ementa CNJ.odt',
      'Ementa.odt',
      'Encontrar contradições nos relatos das testemunhas.odt',
      'Habeas Corpus.docx',
      'Inicial de Alimentos.odt',
      'Inserir fundamentos legais - cpc.odt',
      'Inserir fundamentos legais.odt',
      'Liberdade Provisória.docx',
      'Linguagem Simples.odt',
      'Localizador de endereço.odt',
      'Manual de como usar.odt',
      'Maximizar o impacto retórico.odt',
      'Memoriais - Ministério Público.odt',
      'Memoriais civel-consumidor.doc',
      'Memoriais criminais.doc',
      'Memoriais Previdenciários.doc',
      'Memoriais Trabalhistas.doc',
      'Perguntas parte contrária ou testemunhas.odt',
      'Português mantendo a escrita.odt',
      'Preparação de audiência trabalhista - Reclamando.docx',
      'Preparação de audiência trabalhista - reclamante.docx',
      'Projeto de Lei.odt',
      'Quesitos.odt',
      'Razões de RESE.doc',
      'Rebater argumentos.odt',
      'Relatório Criminal.odt',
      'Relatório para Contestação ou Réplica.odt',
      'Resume processos de familia para audiências..doc',
      'Resumir processos criminais para a Defesa.odt',
      'Resumo para assistidos - DPE.odt',
      'Resumo para cliente.odt',
      'Réplica.docx',
      'Vítima x depoimentoi.odt'
    ];

    const prompts = promptFiles.map(fileName => {
      const nameWithoutExtension = fileName.replace(/\.(odt|docx|doc|pdf|zip)$/, '');
      return createPromptFromFileName(nameWithoutExtension);
    });

    return prompts;
  } catch (error) {
    console.error('Erro ao carregar arquivos de prompt:', error);
    return promptTypes; // Fallback para lista hardcoded
  }
};

// Função para criar objeto prompt baseado no nome do arquivo
const createPromptFromFileName = (fileName) => {
  const id = fileName.toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return {
    id: id,
    name: fileName,
    description: getDescriptionForPrompt(fileName),
    icon: getIconForPrompt(fileName),
    category: getCategoryForPrompt(fileName)
  };
};

// Função para obter descrição baseada no nome do arquivo
const getDescriptionForPrompt = (fileName) => {
  const descriptions = {
    'Acrescentar Argumentos': 'Adiciona argumentos jurídicos sólidos a petições e manifestações',
    'Agravo de instrumento': 'Elaboração e revisão de agravos de instrumento',
    'Analisar laudos médicos': 'Análise técnica de laudos médicos para processos judiciais',
    'Analisar PEC - Defensoria': 'Análise de PEC específica para Defensoria Pública',
    'Analisar PEC': 'Análise de Propostas de Emenda Constitucional',
    'Apelação (Dir. Privado, exceto trabalhista)': 'Elaboração de apelações cíveis, exceto trabalhista',
    'Apelação Criminal': 'Elaboração de apelações criminais',
    'Apelação trabalhista': 'Elaboração de apelações trabalhistas',
    'Atualizar Valores pelo CC': 'Atualização de valores conforme Código Civil',
    'Busca de Jurisprudência': 'Pesquisa inteligente de jurisprudências relevantes',
    'contestação': 'Elaboração de contestações processuais',
    'Contrarrazões cível-família': 'Elaboração de contrarrazões cíveis e de família',
    'Contrarrazões de Apelação Criminal': 'Elaboração de contrarrazões criminais',
    'Contrarrazões de Recurso Especial': 'Elaboração de contrarrazões de RESP',
    'Contrarrazões de Recurso Extraordinário': 'Elaboração de contrarrazões de RE',
    'Correção do Português e Sugestões para peças': 'Correção gramatical e sugestões para peças jurídicas',
    'Corrigir o Português e Deixar mais claro': 'Correção e clarificação de textos jurídicos',
    'Depoimento da vítima x laudo médico': 'Análise comparativa entre depoimentos e laudos médicos',
    'Despacho Judicial': 'Elaboração e análise de despachos judiciais',
    'Dosimetria da pena': 'Cálculo e análise de dosimetria da pena',
    'Ementa CNJ': 'Elaboração de ementas conforme padrões do CNJ',
    'Ementa': 'Elaboração de ementas jurisprudenciais',
    'Encontrar contradições nos relatos das testemunhas': 'Identificação de contradições em depoimentos',
    'Habeas Corpus': 'Elaboração de habeas corpus',
    'Inicial de Alimentos': 'Elaboração de ação de alimentos',
    'Inserir fundamentos legais - cpc': 'Inserção de fundamentos legais do CPC',
    'Inserir fundamentos legais': 'Inserção de fundamentos legais gerais',
    'Liberdade Provisória': 'Elaboração de pedidos de liberdade provisória',
    'Linguagem Simples': 'Conversão de textos jurídicos para linguagem simples',
    'Localizador de endereço': 'Localização de endereços para citações',
    'Manual de como usar': 'Guia de uso da plataforma',
    'Maximizar o impacto retórico': 'Otimização retórica de peças jurídicas',
    'Memoriais - Ministério Público': 'Elaboração de memoriais para o MP',
    'Memoriais civel-consumidor': 'Elaboração de memoriais cíveis e de consumidor',
    'Memoriais criminais': 'Elaboração de memoriais criminais',
    'Memoriais Previdenciários': 'Elaboração de memoriais previdenciários',
    'Memoriais Trabalhistas': 'Elaboração de memoriais trabalhistas',
    'Perguntas parte contrária ou testemunhas': 'Elaboração de perguntas para audiências',
    'Português mantendo a escrita': 'Correção mantendo estilo de escrita',
    'Preparação de audiência trabalhista - Reclamando': 'Preparação para audiência trabalhista (reclamado)',
    'Preparação de audiência trabalhista - reclamante': 'Preparação para audiência trabalhista (reclamante)',
    'Projeto de Lei': 'Elaboração de projetos de lei',
    'Quesitos': 'Elaboração de quesitos para perícias',
    'Razões de RESE': 'Elaboração de razões de recurso especial',
    'Rebater argumentos': 'Estratégias para rebater argumentos da parte contrária',
    'Relatório Criminal': 'Elaboração de relatórios criminais',
    'Relatório para Contestação ou Réplica': 'Relatórios para contestação ou tréplica',
    'Resume processos de familia para audiências.': 'Resumo de processos de família para audiências',
    'Resumir processos criminais para a Defesa': 'Resumo de processos criminais para defesa',
    'Resumo para assistidos - DPE': 'Resumo para assistidos da Defensoria Pública',
    'Resumo para cliente': 'Resumo de processos para clientes',
    'Réplica': 'Elaboração de tréplicas',
    'Vítima x depoimentoi': 'Análise de depoimentos de vítimas'
  };

  return descriptions[fileName] || `Assistente especializado em ${fileName}`;
};

// Função para obter ícone baseado no nome do arquivo
const getIconForPrompt = (fileName) => {
  if (fileName.includes('Criminal') || fileName.includes('Habeas') || fileName.includes('Liberdade')) return '🔒';
  if (fileName.includes('Trabalhista') || fileName.includes('trabalhista')) return '👷';
  if (fileName.includes('Família') || fileName.includes('família') || fileName.includes('Alimentos')) return '👨‍👩‍👧‍👦';
  if (fileName.includes('Apelação') || fileName.includes('Recurso') || fileName.includes('Agravo') || fileName.includes('Contrarrazões')) return '📄';
  if (fileName.includes('médico') || fileName.includes('laudo') || fileName.includes('Dosimetria')) return '🏥';
  if (fileName.includes('Jurisprudência') || fileName.includes('Busca') || fileName.includes('Pesquisa')) return '🔍';
  if (fileName.includes('Português') || fileName.includes('Correção') || fileName.includes('Linguagem')) return '📝';
  if (fileName.includes('Valor') || fileName.includes('Cálculo') || fileName.includes('Atualizar')) return '💰';
  if (fileName.includes('Ementa') || fileName.includes('CNJ')) return '📋';
  if (fileName.includes('Memoriais') || fileName.includes('Memorial')) return '📄';
  if (fileName.includes('Defensoria') || fileName.includes('DPE')) return '🛡️';
  if (fileName.includes('Ministério Público') || fileName.includes('MP')) return '⚖️';
  if (fileName.includes('Audiência') || fileName.includes('Preparação')) return '🎯';
  if (fileName.includes('Projeto') || fileName.includes('Lei')) return '📜';
  if (fileName.includes('Relatório') || fileName.includes('Resumo')) return '📊';
  if (fileName.includes('Quesitos') || fileName.includes('Perguntas')) return '❓';
  if (fileName.includes('Endereço') || fileName.includes('Localizador')) return '📍';
  if (fileName.includes('Manual') || fileName.includes('Guia')) return '📚';
  return '⚖️';
};

// Função para obter categoria baseada no nome do arquivo
const getCategoryForPrompt = (fileName) => {
  if (fileName.includes('Criminal') || fileName.includes('Habeas') || fileName.includes('Liberdade') || fileName.includes('Dosimetria')) return 'Criminal';
  if (fileName.includes('Trabalhista') || fileName.includes('trabalhista')) return 'Trabalhista';
  if (fileName.includes('Família') || fileName.includes('família') || fileName.includes('Alimentos')) return 'Família';
  if (fileName.includes('Apelação') || fileName.includes('Recurso') || fileName.includes('Agravo') || fileName.includes('Contrarrazões')) return 'Recursos';
  if (fileName.includes('Analisar') || fileName.includes('médico') || fileName.includes('laudo') || fileName.includes('Análise')) return 'Análise';
  if (fileName.includes('Jurisprudência') || fileName.includes('Busca') || fileName.includes('Pesquisa')) return 'Pesquisa';
  if (fileName.includes('Português') || fileName.includes('Correção') || fileName.includes('Linguagem')) return 'Revisão';
  if (fileName.includes('Valor') || fileName.includes('Cálculo') || fileName.includes('Atualizar')) return 'Cálculos';
  if (fileName.includes('Ementa') || fileName.includes('CNJ')) return 'Jurisprudência';
  if (fileName.includes('Memoriais') || fileName.includes('Memorial')) return 'Memoriais';
  if (fileName.includes('Defensoria') || fileName.includes('DPE')) return 'Defensoria';
  if (fileName.includes('Ministério Público') || fileName.includes('MP')) return 'Ministério Público';
  if (fileName.includes('Audiência') || fileName.includes('Preparação')) return 'Audiência';
  if (fileName.includes('Projeto') || fileName.includes('Lei')) return 'Legislação';
  if (fileName.includes('Relatório') || fileName.includes('Resumo')) return 'Relatórios';
  if (fileName.includes('Quesitos') || fileName.includes('Perguntas')) return 'Perícia';
  if (fileName.includes('Endereço') || fileName.includes('Localizador')) return 'Utilitários';
  if (fileName.includes('Manual') || fileName.includes('Guia')) return 'Ajuda';
  if (fileName.includes('Contestação') || fileName.includes('contestação') || fileName.includes('Réplica')) return 'Defesa';
  if (fileName.includes('Previdenciário') || fileName.includes('Previdenciários')) return 'Previdenciário';
  if (fileName.includes('Consumidor') || fileName.includes('Cível') || fileName.includes('cível')) return 'Cível';
  return 'Geral';
};

// Lista estática como fallback (mantida para compatibilidade)
export const promptTypes = [
  {
    id: 'acrescentar-argumentos',
    name: 'Acrescentar Argumentos',
    description: 'Adiciona argumentos jurídicos sólidos a petições e manifestações',
    icon: '⚖️',
    category: 'Aprimoramento'
  },
  {
    id: 'agravo-instrumento',
    name: 'Agravo de Instrumento',
    description: 'Elaboração e revisão de agravos de instrumento',
    icon: '📄',
    category: 'Recursos'
  },
  {
    id: 'analisar-laudos',
    name: 'Analisar Laudos Médicos',
    description: 'Análise técnica de laudos médicos para processos judiciais',
    icon: '🏥',
    category: 'Análise'
  },
  {
    id: 'analisar-pec',
    name: 'Analisar PEC',
    description: 'Análise de Propostas de Emenda Constitucional',
    icon: '📋',
    category: 'Análise'
  },
  {
    id: 'analisar-pec-defensoria',
    name: 'Analisar PEC - Defensoria',
    description: 'Análise de PEC específica para Defensoria Pública',
    icon: '🛡️',
    category: 'Análise'
  },
  {
    id: 'apelacao-privado',
    name: 'Apelação (Direito Privado)',
    description: 'Elaboração de apelações cíveis, exceto trabalhista',
    icon: '⚖️',
    category: 'Recursos'
  },
  {
    id: 'apelacao-criminal',
    name: 'Apelação Criminal',
    description: 'Elaboração de apelações criminais',
    icon: '🔒',
    category: 'Criminal'
  },
  {
    id: 'apelacao-trabalhista',
    name: 'Apelação Trabalhista',
    description: 'Elaboração de apelações trabalhistas',
    icon: '👷',
    category: 'Trabalhista'
  },
  {
    id: 'atualizar-valores',
    name: 'Atualizar Valores pelo CC',
    description: 'Atualização de valores conforme Código Civil',
    icon: '💰',
    category: 'Cálculos'
  },
  {
    id: 'busca-jurisprudencia',
    name: 'Busca de Jurisprudência',
    description: 'Pesquisa inteligente de jurisprudências relevantes',
    icon: '🔍',
    category: 'Pesquisa'
  },
  {
    id: 'contestacao',
    name: 'Contestação',
    description: 'Elaboração de contestações processuais',
    icon: '🛡️',
    category: 'Defesa'
  },
  {
    id: 'contrarrazoes-civel',
    name: 'Contrarrazões Cível-Família',
    description: 'Elaboração de contrarrazões cíveis e de família',
    icon: '👨‍👩‍👧‍👦',
    category: 'Recursos'
  },
  {
    id: 'contrarrazoes-criminal',
    name: 'Contrarrazões de Apelação Criminal',
    description: 'Elaboração de contrarrazões criminais',
    icon: '🔒',
    category: 'Criminal'
  },
  {
    id: 'contrarrazoes-resp',
    name: 'Contrarrazões de Recurso Especial',
    description: 'Elaboração de contrarrazões de RESP',
    icon: '🏛️',
    category: 'Recursos'
  },
  {
    id: 'contrarrazoes-re',
    name: 'Contrarrazões de Recurso Extraordinário',
    description: 'Elaboração de contrarrazões de RE',
    icon: '🏛️',
    category: 'Recursos'
  },
  {
    id: 'correcao-portugues',
    name: 'Correção do Português e Sugestões',
    description: 'Correção gramatical e sugestões para peças',
    icon: '✍️',
    category: 'Revisão'
  },
  {
    id: 'corrigir-portugues',
    name: 'Corrigir o Português e Deixar mais claro',
    description: 'Correção e clarificação de textos jurídicos',
    icon: '📝',
    category: 'Revisão'
  },
  {
    id: 'depoimento-vitima',
    name: 'Depoimento da vítima x laudo médico',
    description: 'Análise comparativa entre depoimentos e laudos',
    icon: '🔍',
    category: 'Análise'
  },
  {
    id: 'despacho-judicial',
    name: 'Despacho Judicial',
    description: 'Elaboração de despachos judiciais',
    icon: '👨‍⚖️',
    category: 'Judicial'
  },
  {
    id: 'dosimetria-pena',
    name: 'Dosimetria da Pena',
    description: 'Cálculo e análise de dosimetria penal',
    icon: '⚖️',
    category: 'Criminal'
  },
  {
    id: 'ementa-cnj',
    name: 'Ementa CNJ',
    description: 'Elaboração de ementas conforme padrão CNJ',
    icon: '📋',
    category: 'Documentos'
  },
  {
    id: 'ementa',
    name: 'Ementa',
    description: 'Elaboração de ementas jurídicas',
    icon: '📄',
    category: 'Documentos'
  },
  {
    id: 'encontrar-contradicoes',
    name: 'Encontrar contradições nos relatos das testemunhas',
    description: 'Análise de inconsistências em depoimentos',
    icon: '🔍',
    category: 'Análise'
  },
  {
    id: 'habeas-corpus',
    name: 'Habeas Corpus',
    description: 'Elaboração de habeas corpus',
    icon: '🔓',
    category: 'Criminal'
  },
  {
    id: 'inicial-alimentos',
    name: 'Inicial de Alimentos',
    description: 'Elaboração de ação de alimentos',
    icon: '👶',
    category: 'Família'
  },
  {
    id: 'inserir-fundamentos-cpc',
    name: 'Inserir fundamentos legais - CPC',
    description: 'Inserção de fundamentos do CPC',
    icon: '📚',
    category: 'Fundamentação'
  },
  {
    id: 'inserir-fundamentos',
    name: 'Inserir fundamentos legais',
    description: 'Inserção de fundamentos jurídicos',
    icon: '📖',
    category: 'Fundamentação'
  },
  {
    id: 'liberdade-provisoria',
    name: 'Liberdade Provisória',
    description: 'Elaboração de pedidos de liberdade provisória',
    icon: '🔓',
    category: 'Criminal'
  },
  {
    id: 'linguagem-simples',
    name: 'Linguagem Simples',
    description: 'Conversão para linguagem simples e acessível',
    icon: '💬',
    category: 'Comunicação'
  },
  {
    id: 'localizador-endereco',
    name: 'Localizador de endereço',
    description: 'Localização e verificação de endereços',
    icon: '📍',
    category: 'Pesquisa'
  },
  {
    id: 'maximizar-impacto',
    name: 'Maximizar o impacto retórico',
    description: 'Aprimoramento retórico de peças',
    icon: '🎯',
    category: 'Aprimoramento'
  },
  {
    id: 'memoriais-mp',
    name: 'Memoriais - Ministério Público',
    description: 'Elaboração de memoriais para o MP',
    icon: '🏛️',
    category: 'Memoriais'
  },
  {
    id: 'memoriais-civel',
    name: 'Memoriais Cível-Consumidor',
    description: 'Elaboração de memoriais cíveis e de consumidor',
    icon: '🛒',
    category: 'Memoriais'
  },
  {
    id: 'memoriais-criminais',
    name: 'Memoriais Criminais',
    description: 'Elaboração de memoriais criminais',
    icon: '🔒',
    category: 'Memoriais'
  },
  {
    id: 'memoriais-previdenciarios',
    name: 'Memoriais Previdenciários',
    description: 'Elaboração de memoriais previdenciários',
    icon: '👴',
    category: 'Memoriais'
  },
  {
    id: 'memoriais-trabalhistas',
    name: 'Memoriais Trabalhistas',
    description: 'Elaboração de memoriais trabalhistas',
    icon: '👷',
    category: 'Memoriais'
  },
  {
    id: 'perguntas-parte-contraria',
    name: 'Perguntas parte contrária ou testemunhas',
    description: 'Elaboração de perguntas para audiências',
    icon: '❓',
    category: 'Audiência'
  },
  {
    id: 'portugues-mantendo-escrita',
    name: 'Português mantendo a escrita',
    description: 'Correção preservando o estilo do autor',
    icon: '✏️',
    category: 'Revisão'
  },
  {
    id: 'preparacao-audiencia-reclamando',
    name: 'Preparação de audiência trabalhista - Reclamando',
    description: 'Preparação para audiência trabalhista (reclamado)',
    icon: '⚖️',
    category: 'Trabalhista'
  },
  {
    id: 'preparacao-audiencia-reclamante',
    name: 'Preparação de audiência trabalhista - Reclamante',
    description: 'Preparação para audiência trabalhista (reclamante)',
    icon: '👷',
    category: 'Trabalhista'
  },
  {
    id: 'projeto-lei',
    name: 'Projeto de Lei',
    description: 'Elaboração de projetos de lei',
    icon: '📜',
    category: 'Legislativo'
  },
  {
    id: 'quesitos',
    name: 'Quesitos',
    description: 'Elaboração de quesitos para perícias',
    icon: '📋',
    category: 'Perícia'
  },
  {
    id: 'razoes-rese',
    name: 'Razões de RESE',
    description: 'Elaboração de razões de recurso especial',
    icon: '📄',
    category: 'Recursos'
  },
  {
    id: 'rebater-argumentos',
    name: 'Rebater argumentos',
    description: 'Elaboração de teses para rebater argumentos',
    icon: '🛡️',
    category: 'Defesa'
  },
  {
    id: 'relatorio-criminal',
    name: 'Relatório Criminal',
    description: 'Elaboração de relatórios criminais',
    icon: '📊',
    category: 'Criminal'
  },
  {
    id: 'relatorio-contestacao',
    name: 'Relatório para Contestação ou Réplica',
    description: 'Relatórios para contestações e tréplicas',
    icon: '📋',
    category: 'Defesa'
  },
  {
    id: 'resumir-processos-familia',
    name: 'Resumir processos de família para audiências',
    description: 'Resumos para audiências de família',
    icon: '👨‍👩‍👧‍👦',
    category: 'Família'
  },
  {
    id: 'resumir-processos-criminais',
    name: 'Resumir processos criminais para a Defesa',
    description: 'Resumos de processos criminais',
    icon: '🔒',
    category: 'Criminal'
  },
  {
    id: 'resumo-assistidos',
    name: 'Resumo para assistidos - DPE',
    description: 'Resumos para assistidos da Defensoria',
    icon: '🛡️',
    category: 'Defensoria'
  },
  {
    id: 'resumo-cliente',
    name: 'Resumo para cliente',
    description: 'Resumos em linguagem acessível para clientes',
    icon: '👤',
    category: 'Comunicação'
  },
  {
    id: 'replica',
    name: 'Réplica',
    description: 'Elaboração de tréplicas processuais',
    icon: '↩️',
    category: 'Defesa'
  },
  {
    id: 'vitima-depoimento',
    name: 'Vítima x depoimento',
    description: 'Análise comparativa entre vítima e depoimentos',
    icon: '🔍',
    category: 'Análise'
  }
];

// Função para agrupar prompts por categoria
export const getPromptsByCategory = () => {
  const categories = {};
  promptTypes.forEach(prompt => {
    if (!categories[prompt.category]) {
      categories[prompt.category] = [];
    }
    categories[prompt.category].push(prompt);
  });
  return categories;
};

// Função para buscar prompt por ID
export const getPromptById = (id) => {
  return promptTypes.find(prompt => prompt.id === id);
};

// Função para buscar prompts por categoria
export const getPromptsBySpecificCategory = (category) => {
  return promptTypes.filter(prompt => prompt.category === category);
};

// Categorias disponíveis
export const categories = [
  { id: 'Análise', name: 'Análise', icon: '🔍', color: 'blue' },
  { id: 'Aprimoramento', name: 'Aprimoramento', icon: '⚡', color: 'purple' },
  { id: 'Audiência', name: 'Audiência', icon: '🎤', color: 'green' },
  { id: 'Cálculos', name: 'Cálculos', icon: '💰', color: 'yellow' },
  { id: 'Comunicação', name: 'Comunicação', icon: '💬', color: 'cyan' },
  { id: 'Criminal', name: 'Criminal', icon: '🔒', color: 'red' },
  { id: 'Defesa', name: 'Defesa', icon: '🛡️', color: 'indigo' },
  { id: 'Defensoria', name: 'Defensoria', icon: '🛡️', color: 'teal' },
  { id: 'Documentos', name: 'Documentos', icon: '📄', color: 'gray' },
  { id: 'Família', name: 'Família', icon: '👨‍👩‍👧‍👦', color: 'pink' },
  { id: 'Fundamentação', name: 'Fundamentação', icon: '📚', color: 'orange' },
  { id: 'Judicial', name: 'Judicial', icon: '👨‍⚖️', color: 'slate' },
  { id: 'Legislativo', name: 'Legislativo', icon: '📜', color: 'lime' },
  { id: 'Memoriais', name: 'Memoriais', icon: '📋', color: 'emerald' },
  { id: 'Perícia', name: 'Perícia', icon: '🔬', color: 'violet' },
  { id: 'Pesquisa', name: 'Pesquisa', icon: '🔍', color: 'sky' },
  { id: 'Recursos', name: 'Recursos', icon: '⚖️', color: 'rose' },
  { id: 'Revisão', name: 'Revisão', icon: '✍️', color: 'amber' },
  { id: 'Trabalhista', name: 'Trabalhista', icon: '👷', color: 'stone' }
];

// Função para carregar o conteúdo de um arquivo de prompt específico
export const loadPromptContent = async (promptId) => {
  try {
    // Mapear ID do prompt para nome do arquivo
    const promptFile = getPromptFileName(promptId);
    
    if (!promptFile) {
      throw new Error('Prompt não encontrado');
    }

    // Tentar carregar o arquivo da pasta public/prompts
    const response = await fetch(`/prompts/${promptFile}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao carregar arquivo: ${response.status}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error('Erro ao carregar conteúdo do prompt:', error);
    return null;
  }
};

// Função para mapear ID do prompt para nome do arquivo
const getPromptFileName = (promptId) => {
  const fileMapping = {
    'acrescentar-argumentos': 'Acrescentar Argumentos.odt',
    'agravo-de-instrumento': 'Agravo de instrumento.docx',
    'analisar-laudos-medicos': 'Analisar laudos médicos.doc',
    'analisar-pec---defensoria': 'Analisar PEC - Defensoria.odt',
    'analisar-pec': 'Analisar PEC.odt',
    'apelacao--dir--privado--exceto-trabalhista-': 'Apelação (Dir. Privado, exceto trabalhista).docx',
    'apelacao-criminal': 'Apelação Criminal.odt',
    'apelacao-trabalhista': 'Apelação trabalhista.docx',
    'atualizar-valores-pelo-cc': 'Atualizar Valores pelo CC.odt',
    'busca-de-jurisprudencia': 'Busca de Jurisprudência.doc',
    'contestacao': 'contestação.doc',
    'contrarrazoes-civel-familia': 'Contrarrazões cível-família.doc',
    'contrarrazoes-de-apelacao-criminal': 'Contrarrazões de Apelação Criminal.odt',
    'contrarrazoes-de-recurso-especial': 'Contrarrazões de Recurso Especial.odt',
    'contrarrazoes-de-recurso-extraordinario': 'Contrarrazões de Recurso Extraordinário.odt',
    'correcao-do-portugues-e-sugestoes-para-pecas': 'Correção do Português e Sugestões para peças.odt',
    'corrigir-o-portugues-e-deixar-mais-claro': 'Corrigir o Português e Deixar mais claro.odt',
    'depoimento-da-vitima-x-laudo-medico': 'Depoimento da vítima x laudo médico.doc',
    'despacho-judicial': 'Despacho Judicial.docx',
    'dosimetria-da-pena': 'Dosimetria da pena.doc',
    'ementa-cnj': 'Ementa CNJ.odt',
    'ementa': 'Ementa.odt',
    'encontrar-contradicoes-nos-relatos-das-testemunhas': 'Encontrar contradições nos relatos das testemunhas.odt',
    'habeas-corpus': 'Habeas Corpus.docx',
    'inicial-de-alimentos': 'Inicial de Alimentos.odt',
    'inserir-fundamentos-legais---cpc': 'Inserir fundamentos legais - cpc.odt',
    'inserir-fundamentos-legais': 'Inserir fundamentos legais.odt',
    'liberdade-provisoria': 'Liberdade Provisória.docx',
    'linguagem-simples': 'Linguagem Simples.odt',
    'localizador-de-endereco': 'Localizador de endereço.odt',
    'manual-de-como-usar': 'Manual de como usar.odt',
    'maximizar-o-impacto-retorico': 'Maximizar o impacto retórico.odt',
    'memoriais---ministerio-publico': 'Memoriais - Ministério Público.odt',
    'memoriais-civel-consumidor': 'Memoriais civel-consumidor.doc',
    'memoriais-criminais': 'Memoriais criminais.doc',
    'memoriais-previdenciarios': 'Memoriais Previdenciários.doc',
    'memoriais-trabalhistas': 'Memoriais Trabalhistas.doc',
    'perguntas-parte-contraria-ou-testemunhas': 'Perguntas parte contrária ou testemunhas.odt',
    'portugues-mantendo-a-escrita': 'Português mantendo a escrita.odt',
    'preparacao-de-audiencia-trabalhista---reclamando': 'Preparação de audiência trabalhista - Reclamando.docx',
    'preparacao-de-audiencia-trabalhista---reclamante': 'Preparação de audiência trabalhista - reclamante.docx',
    'projeto-de-lei': 'Projeto de Lei.odt',
    'quesitos': 'Quesitos.odt',
    'razoes-de-rese': 'Razões de RESE.doc',
    'rebater-argumentos': 'Rebater argumentos.odt',
    'relatorio-criminal': 'Relatório Criminal.odt',
    'relatorio-para-contestacao-ou-replica': 'Relatório para Contestação ou Réplica.odt',
    'resume-processos-de-familia-para-audiencias--': 'Resume processos de familia para audiências..doc',
    'resumir-processos-criminais-para-a-defesa': 'Resumir processos criminais para a Defesa.odt',
    'resumo-para-assistidos---dpe': 'Resumo para assistidos - DPE.odt',
    'resumo-para-cliente': 'Resumo para cliente.odt',
    'replica': 'Replica.txt',
    'vitima-x-depoimentoi': 'Vítima x depoimentoi.odt'
  };

  return fileMapping[promptId] || null;
};
