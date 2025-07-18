# Armazenamento de Dados de Processos - DireitoHub

## Visão Geral

O DireitoHub foi projetado para armazenar **TODAS** as informações dos processos, especialmente aqueles importados do DataJud. Esta documentação explica como os dados são estruturados, salvos e podem ser visualizados.

## Estrutura de Dados

### Processo Básico
```javascript
{
  id: string,
  number: string,
  title: string,
  client: string,
  court: string,
  status: string,
  priority: string,
  startDate: string,
  lastUpdate: string,
  nextHearing: string,
  description: string
}
```

### Processo com Dados do DataJud
Quando um processo é importado do DataJud, **TODAS** as informações são preservadas:

```javascript
{
  // Dados básicos do sistema
  id: string,
  number: string,
  title: string,
  client: string,
  court: string,
  status: string,
  priority: string,
  startDate: string,
  lastUpdate: string,
  nextHearing: string,
  description: string,
  
  // Metadados de importação
  isFromDataJud: true,
  dataJudImportDate: string,
  
  // Informações estruturadas do DataJud
  tribunal: string,
  tribunalNome: string,
  grau: string,
  classe: {
    codigo: number,
    nome: string
  },
  assuntos: [
    {
      codigo: number,
      nome: string
    }
  ],
  movimentos: [
    {
      codigo: number,
      nome: string,
      dataHora: string
    }
  ],
  orgaoJulgador: {
    codigo: number,
    nome: string,
    codigoMunicipioIBGE: number
  },
  sistema: {
    codigo: number,
    nome: string
  },
  formato: {
    codigo: number,
    nome: string
  },
  nivelSigilo: number,
  dataAjuizamento: string,
  dataHoraUltimaAtualizacao: string,
  
  // Dados técnicos do DataJud
  dataJudId: string,
  dataJudScore: number,
  dataJudIndex: string,
  dataJudSource: object,
  
  // Dados originais completos (backup)
  dataJudOriginal: object
}
```

## Funcionalidades de Visualização

### 1. Listagem de Processos
- **Indicador DataJud**: Processos importados do DataJud são marcados com um badge amarelo
- **Informações básicas**: Número, título, cliente, tribunal, status, prioridade
- **Audiências**: Indicador especial para processos com audiências marcadas

### 2. Detalhes Completos
Clique no ícone de documento para ver **TODOS** os dados salvos:

#### Informações Básicas
- Cliente, tribunal, status, prioridade
- Datas de ajuizamento e próxima audiência
- Descrição do processo

#### Dados do DataJud (se disponível)
- **Classe Processual**: Código e nome da classe
- **Assuntos**: Lista completa de assuntos com códigos
- **Órgão Julgador**: Nome, código e município IBGE
- **Sistema e Formato**: Informações sobre o sistema processual
- **Movimentos Processuais**: Histórico completo de movimentações
- **Informações Técnicas**: Nível de sigilo, datas de atualização, IDs técnicos

### 3. Histórico de Movimentos
Os movimentos processuais são exibidos em ordem cronológica com:
- Nome do movimento
- Código do movimento
- Data e hora
- Formatação visual clara

### 4. Integração com Calendário
- Detecção automática de audiências nos movimentos
- Sugestão para adicionar ao calendário
- Suporte a múltiplos tipos de calendário

## Implementação Técnica

### Conversão de Dados
A função `converterDadosDataJud()` no arquivo `dataJudService.js` é responsável por:
1. Mapear dados da API DataJud para o formato do sistema
2. Preservar **TODAS** as informações originais
3. Extrair datas de audiência dos movimentos
4. Gerar descrições resumidas
5. Mapear status baseado nos movimentos

### Salvamento
O componente `ProcessesScreen.jsx` implementa:
1. Preservação completa dos dados do DataJud
2. Logging detalhado das informações salvas
3. Metadados de importação (data, origem)
4. Identificação visual de processos do DataJud

### Visualização
O componente `ProcessDetails.jsx` exibe:
1. Informações básicas formatadas
2. Dados técnicos do DataJud
3. Movimentos processuais organizados
4. Informações do órgão julgador
5. Assuntos e classificações

## Exemplo de Uso

1. **Buscar no DataJud**: Use o botão "Buscar DataJud" para encontrar processos
2. **Selecionar Processo**: Clique em "Selecionar" no processo desejado
3. **Editar se necessário**: Ajuste informações básicas no modal
4. **Salvar**: Todas as informações do DataJud são preservadas automaticamente
5. **Visualizar**: Use o ícone de documento para ver todos os dados salvos

## Benefícios

- **Preservação Total**: Nenhuma informação do DataJud é perdida
- **Auditoria**: Histórico completo de movimentos e atualizações
- **Integração**: Calendário automático baseado em movimentos
- **Transparência**: Visualização clara de todas as informações
- **Backup**: Dados originais sempre disponíveis

## Futuras Melhorias

1. **Persistência**: Integração com banco de dados
2. **Sincronização**: Atualização automática dos dados
3. **Relatórios**: Análise de dados processuais
4. **Notificações**: Alertas baseados em movimentos
5. **Exportação**: Relatórios em PDF/Excel

---

*Esta documentação é atualizada conforme novas funcionalidades são implementadas.*
