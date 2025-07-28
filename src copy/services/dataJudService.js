// Serviço para integração com a API Pública do DataJud
// Documentação: https://datajud-wiki.cnj.jus.br/api-publica/
// Este serviço utiliza um backend Node.js para fazer as requisições reais ao DataJud

const BACKEND_BASE_URL = 'http://localhost:3001/api/datajud';

// Lista de tribunais disponíveis
export const TRIBUNAIS = {
  // Tribunais Superiores
  STF: { alias: 'api_publica_stf', nome: 'Supremo Tribunal Federal' },
  STJ: { alias: 'api_publica_stj', nome: 'Superior Tribunal de Justiça' },
  TST: { alias: 'api_publica_tst', nome: 'Tribunal Superior do Trabalho' },
  TSE: { alias: 'api_publica_tse', nome: 'Tribunal Superior Eleitoral' },
  STM: { alias: 'api_publica_stm', nome: 'Superior Tribunal Militar' },
  
  // Tribunais Regionais Federais
  TRF1: { alias: 'api_publica_trf1', nome: 'Tribunal Regional Federal da 1ª Região' },
  TRF2: { alias: 'api_publica_trf2', nome: 'Tribunal Regional Federal da 2ª Região' },
  TRF3: { alias: 'api_publica_trf3', nome: 'Tribunal Regional Federal da 3ª Região' },
  TRF4: { alias: 'api_publica_trf4', nome: 'Tribunal Regional Federal da 4ª Região' },
  TRF5: { alias: 'api_publica_trf5', nome: 'Tribunal Regional Federal da 5ª Região' },
  TRF6: { alias: 'api_publica_trf6', nome: 'Tribunal Regional Federal da 6ª Região' },
  
  // Tribunais de Justiça Estaduais (principais)
  TJSP: { alias: 'api_publica_tjsp', nome: 'Tribunal de Justiça de São Paulo' },
  TJRJ: { alias: 'api_publica_tjrj', nome: 'Tribunal de Justiça do Rio de Janeiro' },
  TJMG: { alias: 'api_publica_tjmg', nome: 'Tribunal de Justiça de Minas Gerais' },
  TJRS: { alias: 'api_publica_tjrs', nome: 'Tribunal de Justiça do Rio Grande do Sul' },
  TJPR: { alias: 'api_publica_tjpr', nome: 'Tribunal de Justiça do Paraná' },
  TJSC: { alias: 'api_publica_tjsc', nome: 'Tribunal de Justiça de Santa Catarina' },
  TJBA: { alias: 'api_publica_tjba', nome: 'Tribunal de Justiça da Bahia' },
  TJGO: { alias: 'api_publica_tjgo', nome: 'Tribunal de Justiça de Goiás' },
  TJDF: { alias: 'api_publica_tjdft', nome: 'Tribunal de Justiça do Distrito Federal' },
  TJPE: { alias: 'api_publica_tjpe', nome: 'Tribunal de Justiça de Pernambuco' },
  TJCE: { alias: 'api_publica_tjce', nome: 'Tribunal de Justiça do Ceará' },
  TJMT: { alias: 'api_publica_tjmt', nome: 'Tribunal de Justiça de Mato Grosso' },
  TJMS: { alias: 'api_publica_tjms', nome: 'Tribunal de Justiça de Mato Grosso do Sul' },
  TJPB: { alias: 'api_publica_tjpb', nome: 'Tribunal de Justiça da Paraíba' },
  TJAL: { alias: 'api_publica_tjal', nome: 'Tribunal de Justiça de Alagoas' },
  TJSE: { alias: 'api_publica_tjse', nome: 'Tribunal de Justiça de Sergipe' },
  TJRN: { alias: 'api_publica_tjrn', nome: 'Tribunal de Justiça do Rio Grande do Norte' },
  TJPI: { alias: 'api_publica_tjpi', nome: 'Tribunal de Justiça do Piauí' },
  TJMA: { alias: 'api_publica_tjma', nome: 'Tribunal de Justiça do Maranhão' },
  TJPA: { alias: 'api_publica_tjpa', nome: 'Tribunal de Justiça do Pará' },
  TJAP: { alias: 'api_publica_tjap', nome: 'Tribunal de Justiça do Amapá' },
  TJAM: { alias: 'api_publica_tjam', nome: 'Tribunal de Justiça do Amazonas' },
  TJRR: { alias: 'api_publica_tjrr', nome: 'Tribunal de Justiça de Roraima' },
  TJAC: { alias: 'api_publica_tjac', nome: 'Tribunal de Justiça do Acre' },
  TJRO: { alias: 'api_publica_tjro', nome: 'Tribunal de Justiça de Rondônia' },
  TJTO: { alias: 'api_publica_tjto', nome: 'Tribunal de Justiça do Tocantins' },
  TJES: { alias: 'api_publica_tjes', nome: 'Tribunal de Justiça do Espírito Santo' },
  
  // Tribunais Regionais do Trabalho (principais)
  TRT1: { alias: 'api_publica_trt1', nome: 'Tribunal Regional do Trabalho da 1ª Região' },
  TRT2: { alias: 'api_publica_trt2', nome: 'Tribunal Regional do Trabalho da 2ª Região' },
  TRT3: { alias: 'api_publica_trt3', nome: 'Tribunal Regional do Trabalho da 3ª Região' },
  TRT4: { alias: 'api_publica_trt4', nome: 'Tribunal Regional do Trabalho da 4ª Região' },
  TRT5: { alias: 'api_publica_trt5', nome: 'Tribunal Regional do Trabalho da 5ª Região' },
  TRT6: { alias: 'api_publica_trt6', nome: 'Tribunal Regional do Trabalho da 6ª Região' },
  TRT7: { alias: 'api_publica_trt7', nome: 'Tribunal Regional do Trabalho da 7ª Região' },
  TRT8: { alias: 'api_publica_trt8', nome: 'Tribunal Regional do Trabalho da 8ª Região' },
  TRT9: { alias: 'api_publica_trt9', nome: 'Tribunal Regional do Trabalho da 9ª Região' },
  TRT10: { alias: 'api_publica_trt10', nome: 'Tribunal Regional do Trabalho da 10ª Região' },
  TRT11: { alias: 'api_publica_trt11', nome: 'Tribunal Regional do Trabalho da 11ª Região' },
  TRT12: { alias: 'api_publica_trt12', nome: 'Tribunal Regional do Trabalho da 12ª Região' },
  TRT13: { alias: 'api_publica_trt13', nome: 'Tribunal Regional do Trabalho da 13ª Região' },
  TRT14: { alias: 'api_publica_trt14', nome: 'Tribunal Regional do Trabalho da 14ª Região' },
  TRT15: { alias: 'api_publica_trt15', nome: 'Tribunal Regional do Trabalho da 15ª Região' },
  TRT16: { alias: 'api_publica_trt16', nome: 'Tribunal Regional do Trabalho da 16ª Região' },
  TRT17: { alias: 'api_publica_trt17', nome: 'Tribunal Regional do Trabalho da 17ª Região' },
  TRT18: { alias: 'api_publica_trt18', nome: 'Tribunal Regional do Trabalho da 18ª Região' },
  TRT19: { alias: 'api_publica_trt19', nome: 'Tribunal Regional do Trabalho da 19ª Região' },
  TRT20: { alias: 'api_publica_trt20', nome: 'Tribunal Regional do Trabalho da 20ª Região' },
  TRT21: { alias: 'api_publica_trt21', nome: 'Tribunal Regional do Trabalho da 21ª Região' },
  TRT22: { alias: 'api_publica_trt22', nome: 'Tribunal Regional do Trabalho da 22ª Região' },
  TRT23: { alias: 'api_publica_trt23', nome: 'Tribunal Regional do Trabalho da 23ª Região' },
  TRT24: { alias: 'api_publica_trt24', nome: 'Tribunal Regional do Trabalho da 24ª Região' },
  
  // Tribunais Regionais Eleitorais (principais)
  TRESP: { alias: 'api_publica_tresp', nome: 'Tribunal Regional Eleitoral de São Paulo' },
  TRERJ: { alias: 'api_publica_trerj', nome: 'Tribunal Regional Eleitoral do Rio de Janeiro' },
  TREMG: { alias: 'api_publica_tremg', nome: 'Tribunal Regional Eleitoral de Minas Gerais' },
  TRERS: { alias: 'api_publica_trers', nome: 'Tribunal Regional Eleitoral do Rio Grande do Sul' },
  TREPR: { alias: 'api_publica_trepr', nome: 'Tribunal Regional Eleitoral do Paraná' },
  TRESC: { alias: 'api_publica_tresc', nome: 'Tribunal Regional Eleitoral de Santa Catarina' },
  TREBA: { alias: 'api_publica_treba', nome: 'Tribunal Regional Eleitoral da Bahia' },
  TREGO: { alias: 'api_publica_trego', nome: 'Tribunal Regional Eleitoral de Goiás' },
  TREDF: { alias: 'api_publica_tredf', nome: 'Tribunal Regional Eleitoral do Distrito Federal' }
};

// Função para fazer requisições ao backend
const makeRequest = async (endpoint, data) => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro na requisição: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro na requisição ao backend:', error);
    throw error;
  }
};

// Função para buscar processo por número
export const buscarProcessoPorNumero = async (numeroProcesso, tribunais = []) => {
  try {
    const resultados = await makeRequest('buscar-numero', {
      numeroProcesso,
      tribunais
    });
    
    return resultados || [];
  } catch (error) {
    console.error('Erro ao buscar processo por número:', error);
    throw error;
  }
};

// Função para buscar processo por múltiplos critérios
export const buscarProcessoAvancado = async (criterios, tribunais = []) => {
  try {
    const resultados = await makeRequest('buscar-avancado', {
      criterios,
      tribunais
    });
    
    return resultados || [];
  } catch (error) {
    console.error('Erro ao buscar processo avançado:', error);
    throw error;
  }
};

// Função para buscar processo por texto livre
export const buscarProcessoPorTexto = async (texto, tribunais = []) => {
  try {
    const resultados = await makeRequest('buscar-texto', {
      texto,
      tribunais
    });
    
    return resultados || [];
  } catch (error) {
    console.error('Erro ao buscar processo por texto:', error);
    throw error;
  }
};

// Função para converter dados da API para o formato do sistema
export const converterDadosDataJud = (dadosDataJud) => {
  console.log('🔄 Convertendo dados do DataJud:', dadosDataJud);
  
  // Função auxiliar para limpar valores undefined
  const cleanData = (obj) => {
    const cleaned = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleanedObj = cleanData(value);
          if (Object.keys(cleanedObj).length > 0) {
            cleaned[key] = cleanedObj;
          }
        } else {
          cleaned[key] = value;
        }
      }
    });
    return cleaned;
  };
  
  const convertedData = cleanData({
    id: dadosDataJud._id || `datajud_${Date.now()}`,
    number: dadosDataJud.numeroProcesso,
    title: dadosDataJud.classe?.nome || 'Processo',
    client: 'Dados sigilosos (DataJud)', // DataJud não possui dados de partes por questões de sigilo
    court: dadosDataJud.orgaoJulgador?.nome || 'Órgão não informado',
    status: mapearStatusDataJud(dadosDataJud),
    priority: 'media',
    startDate: dadosDataJud.dataAjuizamento ? new Date(dadosDataJud.dataAjuizamento).toISOString().split('T')[0] : null,
    lastUpdate: dadosDataJud.dataHoraUltimaAtualizacao ? new Date(dadosDataJud.dataHoraUltimaAtualizacao).toISOString().split('T')[0] : null,
    nextHearing: extrairDataAudiencia(dadosDataJud.movimentos), // Tentar extrair audiência dos movimentos
    description: gerarDescricaoDataJud(dadosDataJud),
    
    // Dados específicos do DataJud - TODAS AS INFORMAÇÕES PRESERVADAS
    tribunal: dadosDataJud.tribunalNome || dadosDataJud.tribunal,
    tribunalNome: dadosDataJud.tribunalNome,
    grau: dadosDataJud.grau,
    classe: dadosDataJud.classe,
    assuntos: dadosDataJud.assuntos || [],
    movimentos: dadosDataJud.movimentos || [],
    orgaoJulgador: dadosDataJud.orgaoJulgador,
    sistema: dadosDataJud.sistema,
    formato: dadosDataJud.formato,
    nivelSigilo: dadosDataJud.nivelSigilo,
    dataAjuizamento: dadosDataJud.dataAjuizamento,
    dataHoraUltimaAtualizacao: dadosDataJud.dataHoraUltimaAtualizacao,
    
    // Dados técnicos do DataJud - apenas se existirem
    ...(dadosDataJud._id && { dataJudId: dadosDataJud._id }),
    ...(dadosDataJud._score && { dataJudScore: dadosDataJud._score }),
    ...(dadosDataJud._index && { dataJudIndex: dadosDataJud._index }),
    ...(dadosDataJud._source && { dataJudSource: dadosDataJud._source }),
    
    // Metadados de importação
    isFromDataJud: true,
    dataJudImportDate: new Date().toISOString(),
    
    // Preservar dados originais completos
    dataJudOriginal: dadosDataJud
  });
  
  console.log('✅ Dados convertidos com sucesso:', convertedData);
  return convertedData;
};

// Função auxiliar para mapear status
const mapearStatusDataJud = (dados) => {
  // Baseado nos últimos movimentos para determinar status
  if (dados.movimentos && dados.movimentos.length > 0) {
    const ultimoMovimento = dados.movimentos[dados.movimentos.length - 1];
    const codigoMovimento = ultimoMovimento.codigo;
    
    // Códigos comuns que indicam conclusão
    const codigosConclusao = [51, 203, 246, 267, 280, 11009];
    if (codigosConclusao.includes(codigoMovimento)) {
      return 'Concluído';
    }
    
    // Códigos que indicam suspensão
    const codigosSuspensao = [1030, 1031, 1032];
    if (codigosSuspensao.includes(codigoMovimento)) {
      return 'Suspenso';
    }
    
    // Códigos que indicam aguardando
    const codigosAguardando = [132, 193, 194, 195];
    if (codigosAguardando.includes(codigoMovimento)) {
      return 'Aguardando';
    }
  }
  
  return 'Em andamento';
};

// Função auxiliar para gerar descrição
const gerarDescricaoDataJud = (dados) => {
  const tribunal = dados.tribunalNome || dados.tribunal || 'Tribunal';
  const grau = dados.grau || 'Grau não informado';
  const classe = dados.classe?.nome || 'Classe não informada';
  const orgao = dados.orgaoJulgador?.nome || 'Órgão não informado';
  
  return `${classe} tramitando no ${orgao} - ${tribunal} (${grau})`;
};

// Função auxiliar para extrair data de audiência dos movimentos
const extrairDataAudiencia = (movimentos) => {
  if (!movimentos || movimentos.length === 0) return null;
  
  // Códigos de movimento que geralmente indicam audiência
  const codigosAudiencia = [
    193, // Designação de audiência
    194, // Designação de audiência de conciliação
    195, // Designação de audiência de instrução
    196, // Designação de audiência de julgamento
    197, // Designação de audiência de conciliação e julgamento
    198, // Designação de audiência de instrução e julgamento
    199, // Designação de audiência una
    861, // Redesignação de audiência
    862, // Cancelamento de audiência
    863, // Adiamento de audiência
    1114, // Audiência de conciliação
    1115, // Audiência de instrução
    1116, // Audiência de julgamento
  ];
  
  // Procurar pelos movimentos de audiência mais recentes
  const movimentosAudiencia = movimentos
    .filter(mov => codigosAudiencia.includes(mov.codigo))
    .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
  
  if (movimentosAudiencia.length > 0) {
    const proximaAudiencia = movimentosAudiencia[0];
    // Tentar extrair data futura da descrição do movimento
    const dataHoraMovimento = new Date(proximaAudiencia.dataHora);
    const agora = new Date();
    
    // Se a data do movimento for futura, usar como data da audiência
    if (dataHoraMovimento > agora) {
      return dataHoraMovimento.toISOString().split('T')[0];
    }
    
    // Se não, tentar extrair data da descrição (formato brasileiro)
    const descricao = proximaAudiencia.nome || '';
    const regexData = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const match = descricao.match(regexData);
    
    if (match) {
      const [, dia, mes, ano] = match;
      const dataExtraida = new Date(`${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`);
      if (dataExtraida > agora) {
        return dataExtraida.toISOString().split('T')[0];
      }
    }
  }
  
  return null;
};

// Função para buscar em todos os tribunais
export const buscarEmTodosTribunais = async (criterios) => {
  try {
    // Determinar qual endpoint usar baseado nos critérios
    if (criterios.numeroProcesso && Object.keys(criterios).length === 1) {
      return await buscarProcessoPorNumero(criterios.numeroProcesso, []);
    } else if (criterios.texto && Object.keys(criterios).length === 1) {
      return await buscarProcessoPorTexto(criterios.texto, []);
    } else {
      return await buscarProcessoAvancado(criterios, []);
    }
  } catch (error) {
    console.error('Erro ao buscar em todos os tribunais:', error);
    throw error;
  }
};

// Função para obter lista de tribunais por categoria
export const obterTribunaisPorCategoria = () => {
  const categorias = {
    'Tribunais Superiores': ['STF', 'STJ', 'TST', 'TSE', 'STM'],
    'Tribunais Regionais Federais': ['TRF1', 'TRF2', 'TRF3', 'TRF4', 'TRF5', 'TRF6'],
    'Tribunais de Justiça': ['TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR', 'TJSC', 'TJBA', 'TJGO', 'TJDF', 'TJPE', 'TJCE', 'TJMT', 'TJMS', 'TJPB', 'TJAL', 'TJSE', 'TJRN', 'TJPI', 'TJMA', 'TJPA', 'TJAP', 'TJAM', 'TJRR', 'TJAC', 'TJRO', 'TJTO', 'TJES'],
    'Tribunais Regionais do Trabalho': ['TRT1', 'TRT2', 'TRT3', 'TRT4', 'TRT5', 'TRT6', 'TRT7', 'TRT8', 'TRT9', 'TRT10', 'TRT11', 'TRT12', 'TRT13', 'TRT14', 'TRT15', 'TRT16', 'TRT17', 'TRT18', 'TRT19', 'TRT20', 'TRT21', 'TRT22', 'TRT23', 'TRT24'],
    'Tribunais Regionais Eleitorais': ['TRESP', 'TRERJ', 'TREMG', 'TRERS', 'TREPR', 'TRESC', 'TREBA', 'TREGO', 'TREDF']
  };
  
  return categorias;
};

// Função para buscar processos por nome de advogado (busca indireta)
export const buscarProcessosPorAdvogado = async (nomeAdvogado, tribunais = []) => {
  try {
    console.log('⚠️  Aviso: Busca por advogado é limitada devido a restrições de privacidade do DataJud');
    console.log('💡 Esta busca procura por menções ao nome em documentos públicos disponíveis');
    
    const resultados = await makeRequest('buscar-advogado', {
      nomeAdvogado,
      tribunais
    });
    
    return resultados || [];
  } catch (error) {
    console.error('Erro ao buscar processos por advogado:', error);
    throw error;
  }
};

// Função para buscar por número da OAB (limitada)
export const buscarProcessosPorOAB = async (numeroOAB, uf, tribunais = []) => {
  try {
    console.log('⚠️  Aviso: Busca por OAB não é suportada diretamente pela API DataJud');
    console.log('💡 Recomendamos usar o número de processos conhecidos onde o advogado atua');
    
    // Criar termo de busca mais específico
    const termoBusca = `OAB ${uf} ${numeroOAB}`;
    
    // Tentar busca por texto livre
    const resultados = await buscarProcessoPorTexto(termoBusca, tribunais);
    
    return resultados;
  } catch (error) {
    console.error('Erro ao buscar processos por OAB:', error);
    throw error;
  }
};

// Função para buscar processos por parte (requerente/requerido)
export const buscarProcessosPorParte = async (nomeParte, tribunais = []) => {
  try {
    console.log('⚠️  Aviso: Busca por parte é limitada devido a restrições de privacidade do DataJud');
    console.log('💡 Esta busca procura por menções ao nome em documentos públicos disponíveis');
    
    const resultados = await makeRequest('buscar-parte', {
      nomeParte,
      tribunais
    });
    
    return resultados || [];
  } catch (error) {
    console.error('Erro ao buscar processos por parte:', error);
    throw error;
  }
};

// Export default com todas as funções
export default {
  buscarProcessoPorNumero,
  buscarProcessoAvancado,
  buscarProcessoPorTexto,
  buscarProcessosPorAdvogado,
  buscarProcessosPorOAB,
  buscarProcessosPorParte,
  buscarEmTodosTribunais,
  converterDadosDataJud,
  obterTribunaisPorCategoria,
  TRIBUNAIS
};
