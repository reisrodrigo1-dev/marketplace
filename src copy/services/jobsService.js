// Serviço para buscar vagas de emprego usando APIs gratuitas
class JobsService {
  constructor() {
    // Configurações das APIs (você precisará registrar-se para obter as chaves)
    this.adzunaConfig = {
      baseUrl: 'https://api.adzuna.com/v1/api/jobs/br/search',
      appId: import.meta.env.VITE_ADZUNA_APP_ID || 'demo_app_id',
      appKey: import.meta.env.VITE_ADZUNA_APP_KEY || 'demo_app_key'
    };

    this.jSearchConfig = {
      baseUrl: 'https://jsearch.p.rapidapi.com/search',
      apiKey: import.meta.env.VITE_JSEARCH_API_KEY || 'demo_key'
    };

    this.joobleConfig = {
      baseUrl: 'https://jooble.org/api',
      apiKey: import.meta.env.VITE_JOOBLE_API_KEY || 'demo_key'
    };
  }

  // Função principal para buscar vagas jurídicas
  async searchLegalJobs(location = 'São Paulo', keywords = 'advogado', filters = {}) {
    try {
      console.log('🔍 Iniciando busca de vagas:', { location, keywords, filters });

      // Verificar se as APIs estão configuradas
      const hasAdzunaConfig = this.adzunaConfig.appId !== 'demo_app_id' && this.adzunaConfig.appKey !== 'demo_app_key';
      const hasJSearchConfig = this.jSearchConfig.apiKey !== 'demo_key';
      const hasJoobleConfig = this.joobleConfig.apiKey !== 'demo_key';

      const configuredAPIs = [];
      if (hasAdzunaConfig) configuredAPIs.push('Adzuna');
      if (hasJSearchConfig) configuredAPIs.push('JSearch');
      if (hasJoobleConfig) configuredAPIs.push('Jooble');

      if (configuredAPIs.length === 0) {
        console.error('❌ Nenhuma API configurada');
        return {
          success: false,
          error: 'Nenhuma API de vagas configurada',
          metadata: {
            totalSources: 0,
            successfulSources: 0,
            failedSources: 0,
            totalJobs: 0,
            usingMockData: false,
            message: 'Configure as APIs no arquivo .env para usar esta funcionalidade',
            configurationRequired: true
          }
        };
      }

      console.log(`📡 APIs configuradas: ${configuredAPIs.join(', ')}`);

      // Executar buscas apenas nas APIs configuradas
      const searchPromises = [];
      const apiNames = [];

      if (hasAdzunaConfig) {
        searchPromises.push(this.searchAdzuna(keywords, location, filters));
        apiNames.push('Adzuna');
      }

      if (hasJSearchConfig) {
        searchPromises.push(this.searchJSearch(keywords, location, filters));
        apiNames.push('JSearch');
      }

      if (hasJoobleConfig) {
        searchPromises.push(this.searchJooble(keywords, location, filters));
        apiNames.push('Jooble');
      }

      const results = await Promise.allSettled(searchPromises);
      
      // Processar resultados
      const allJobs = [];
      const successfulAPIs = [];
      const failedAPIs = [];

      results.forEach((result, index) => {
        const apiName = apiNames[index];
        
        if (result.status === 'fulfilled' && result.value.success) {
          allJobs.push(...result.value.data);
          successfulAPIs.push(apiName);
          console.log(`✅ ${apiName}: ${result.value.data.length} vagas encontradas`);
        } else {
          const errorMessage = this.getErrorMessage(result.reason || result.value?.error || 'Erro desconhecido');
          failedAPIs.push({
            name: apiName,
            error: errorMessage
          });
          console.warn(`⚠️ ${apiName}: ${errorMessage}`);
        }
      });

      // Se não encontrou nenhuma vaga nas APIs
      if (allJobs.length === 0) {
        let errorMessage = 'Nenhuma vaga encontrada';
        
        // Se todas as APIs falharam
        if (failedAPIs.length === apiNames.length) {
          errorMessage = 'Todas as APIs estão temporariamente indisponíveis';
        } 
        // Se algumas APIs falharam mas outras funcionaram
        else if (failedAPIs.length > 0) {
          errorMessage = `Nenhuma vaga encontrada (${failedAPIs.length} API(s) indisponível(is))`;
        }
        
        console.warn('⚠️ Nenhuma vaga encontrada nas APIs configuradas');
        return {
          success: false,
          error: errorMessage,
          metadata: {
            totalSources: apiNames.length,
            successfulSources: successfulAPIs.length,
            failedSources: failedAPIs.length,
            totalJobs: 0,
            usingMockData: false,
            message: errorMessage,
            failedAPIs: failedAPIs,
            errors: failedAPIs.map(api => `${api.name}: ${api.error}`).join('; ')
          }
        };
      }

      // Consolidar e limpar resultados
      const consolidatedJobs = this.consolidateResults(allJobs);
      
      console.log(`📊 Resumo da busca: ${successfulAPIs.length} APIs com sucesso, ${failedAPIs.length} com erro`);
      console.log(`🎯 Total de vagas consolidadas: ${consolidatedJobs.length}`);

      return {
        success: true,
        data: consolidatedJobs,
        metadata: {
          totalSources: apiNames.length,
          successfulSources: successfulAPIs.length,
          failedSources: failedAPIs.length,
          totalJobs: consolidatedJobs.length,
          usingMockData: false,
          successfulAPIs: successfulAPIs,
          failedAPIs: failedAPIs,
          message: failedAPIs.length > 0 
            ? `${successfulAPIs.length} de ${apiNames.length} APIs funcionando`
            : `Todas as APIs funcionando corretamente`
        }
      };

    } catch (error) {
      console.error('❌ Erro geral na busca de vagas:', error);
      
      return {
        success: false,
        error: 'Erro interno no sistema de vagas',
        metadata: {
          totalSources: 3,
          successfulSources: 0,
          failedSources: 3,
          totalJobs: 0,
          usingMockData: false,
          message: 'Erro interno no sistema',
          errors: error.message
        }
      };
    }
  }

  // Buscar vagas na API Adzuna
  async searchAdzuna(keywords, location, filters) {
    try {
      // Simular delay para demonstração
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const params = new URLSearchParams({
        app_id: this.adzunaConfig.appId,
        app_key: this.adzunaConfig.appKey,
        what: keywords,
        where: location,
        results_per_page: '20',
        sort_by: 'date'
      });

      const response = await fetch(`${this.adzunaConfig.baseUrl}/1?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        if (response.status === 401) {
          errorMessage = 'Credenciais inválidas';
        } else if (response.status === 403) {
          errorMessage = 'Acesso negado - verifique suas credenciais';
        } else if (response.status === 429) {
          errorMessage = 'Limite de requisições excedido';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor da API';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const jobs = data.results?.map(job => ({
        id: `adzuna_${job.id}`,
        title: job.title,
        company: job.company?.display_name || 'Empresa não informada',
        location: job.location?.display_name || location,
        salary: job.salary_min || job.salary_max || null,
        description: job.description,
        url: job.redirect_url,
        publishedDate: job.created,
        source: 'adzuna',
        contractType: job.contract_type || null,
        category: job.category?.label || null,
        tags: []
      })) || [];

      return { success: true, data: jobs };

    } catch (error) {
      console.error('❌ Erro na API Adzuna:', error);
      return { success: false, error: error.message };
    }
  }

  // Buscar vagas na API JSearch
  async searchJSearch(keywords, location, filters) {
    try {
      // Simular delay para demonstração
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const params = new URLSearchParams({
        query: `${keywords} ${location}`,
        page: '1',
        num_pages: '1',
        country: 'BR'
      });

      // Adicionar parâmetros opcionais apenas se não forem 'all'
      if (filters.contractType && filters.contractType !== 'all') {
        params.append('employment_types', filters.contractType);
      }
      
      if (filters.experienceLevel && filters.experienceLevel !== 'all') {
        params.append('experience_level', filters.experienceLevel);
      }

      const finalUrl = `${this.jSearchConfig.baseUrl}?${params}`;
      console.log('🔍 JSearch URL:', finalUrl);

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.jSearchConfig.apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        if (response.status === 400) {
          errorMessage = 'Parâmetros de busca inválidos (400)';
        } else if (response.status === 401) {
          errorMessage = 'Chave da API inválida (401)';
        } else if (response.status === 403) {
          errorMessage = 'Acesso negado - verifique sua chave RapidAPI (403)';
        } else if (response.status === 429) {
          errorMessage = 'Limite de requisições excedido (429)';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor da API (500)';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const jobs = data.data?.map(job => ({
        id: `jsearch_${job.job_id}`,
        title: job.job_title,
        company: job.employer_name || 'Empresa não informada',
        location: job.job_city || job.job_state || job.job_country || location,
        salary: job.job_salary || null,
        description: job.job_description,
        url: job.job_apply_link,
        publishedDate: job.job_posted_at_datetime_utc,
        source: 'jsearch',
        contractType: job.job_employment_type || null,
        experienceLevel: job.job_experience_level || null,
        tags: job.job_highlights?.Qualifications || []
      })) || [];

      return { success: true, data: jobs };

    } catch (error) {
      console.error('❌ Erro na API JSearch:', error);
      return { success: false, error: error.message };
    }
  }

  // Buscar vagas na API Jooble
  async searchJooble(keywords, location, filters) {
    try {
      // Simular delay para demonstração
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const requestBody = {
        keywords: keywords,
        location: location,
        radius: '25',
        page: '1',
        resultsPerPage: '20'
      };

      const response = await fetch(`${this.joobleConfig.baseUrl}/${this.joobleConfig.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        if (response.status === 401) {
          errorMessage = 'Chave da API inválida';
        } else if (response.status === 403) {
          errorMessage = 'Acesso negado - verifique sua chave da API';
        } else if (response.status === 429) {
          errorMessage = 'Limite de requisições excedido';
        } else if (response.status === 500) {
          errorMessage = 'Erro interno do servidor da API';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const jobs = data.jobs?.map(job => ({
        id: `jooble_${job.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: job.title,
        company: job.company || 'Empresa não informada',
        location: job.location || location,
        salary: job.salary || null,
        description: job.snippet,
        url: job.link,
        publishedDate: job.updated,
        source: 'jooble',
        contractType: job.type || null,
        tags: []
      })) || [];

      return { success: true, data: jobs };

    } catch (error) {
      console.error('❌ Erro na API Jooble:', error);
      return { success: false, error: error.message };
    }
  }

  // Consolidar resultados removendo duplicatas e organizando
  consolidateResults(jobs) {
    // Remover duplicatas baseado no título e empresa
    const uniqueJobs = jobs.filter((job, index, self) => 
      index === self.findIndex(j => 
        j.title.toLowerCase() === job.title.toLowerCase() && 
        j.company.toLowerCase() === job.company.toLowerCase()
      )
    );

    // Ordenar por data de publicação (mais recente primeiro)
    return uniqueJobs.sort((a, b) => {
      const dateA = new Date(a.publishedDate || 0);
      const dateB = new Date(b.publishedDate || 0);
      return dateB - dateA;
    });
  }

  // Função para filtrar vagas por critérios específicos
  filterJobs(jobs, filters) {
    return jobs.filter(job => {
      // Filtro por nível de experiência
      if (filters.experienceLevel && filters.experienceLevel !== 'all') {
        if (job.experienceLevel !== filters.experienceLevel) {
          return false;
        }
      }

      // Filtro por tipo de contrato
      if (filters.contractType && filters.contractType !== 'all') {
        if (job.contractType !== filters.contractType) {
          return false;
        }
      }

      // Filtro por faixa salarial
      if (filters.salaryRange && filters.salaryRange !== 'all') {
        const salary = this.extractSalaryNumber(job.salary);
        if (salary) {
          const [min, max] = filters.salaryRange.split('-').map(s => parseInt(s.replace('+', '')));
          if (max) {
            if (salary < min || salary > max) {
              return false;
            }
          } else {
            if (salary < min) {
              return false;
            }
          }
        }
      }

      return true;
    });
  }

  // Extrair número do salário para comparação
  extractSalaryNumber(salary) {
    if (!salary) return null;
    const match = salary.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  // Processar mensagem de erro para ser mais amigável ao usuário
  getErrorMessage(error) {
    const errorStr = error.toString().toLowerCase();
    
    // Erros de parâmetros inválidos
    if (errorStr.includes('400') || errorStr.includes('bad request')) {
      return 'Parâmetros de busca inválidos (400)';
    }
    
    // Erros de rate limit / limite de requisições
    if (errorStr.includes('429') || errorStr.includes('rate limit') || errorStr.includes('too many requests')) {
      return 'Limite de requisições atingido (429)';
    }
    
    // Erros de autenticação
    if (errorStr.includes('401') || errorStr.includes('unauthorized')) {
      return 'Chave API inválida (401)';
    }
    
    // Erros de acesso negado
    if (errorStr.includes('403') || errorStr.includes('forbidden')) {
      return 'Acesso negado - verifique permissões (403)';
    }
    
    // Erros de não encontrado
    if (errorStr.includes('404') || errorStr.includes('not found')) {
      return 'Endpoint não encontrado (404)';
    }
    
    // Erros de servidor
    if (errorStr.includes('500') || errorStr.includes('internal server error')) {
      return 'Erro interno do servidor (500)';
    }
    
    // Erros de rede
    if (errorStr.includes('network') || errorStr.includes('fetch')) {
      return 'Erro de conexão - verifique sua internet';
    }
    
    // Retorna erro original se não conseguir classificar
    return error.toString();
  }
}

// Instância única do serviço
export const jobsService = new JobsService();
