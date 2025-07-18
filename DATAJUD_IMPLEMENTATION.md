# Implementação da Busca DataJud

## Funcionalidade Implementada

A funcionalidade de busca de processos através da API pública do DataJud foi implementada com sucesso. A implementação inclui:

### 1. Serviço DataJud (`dataJudService.js`)
- **Integração com API**: Configuração completa para todos os tribunais brasileiros
- **Tipos de busca**: 
  - Por número de processo
  - Busca avançada (classe, órgão, assunto, datas)
  - Busca por texto livre
- **Suporte a múltiplos tribunais**: STF, STJ, TRFs, TJs, TRTs, TREs
- **Conversão de dados**: Transformação dos dados da API para o formato do sistema

### 2. Modal de Busca (`DataJudSearchModal.jsx`)
- **Interface intuitiva**: Formulários para diferentes tipos de busca
- **Seleção de tribunais**: Organizados por categorias
- **Formatação automática**: Número de processo com formatação CNJ
- **Validação**: Validação de entrada e tratamento de erros
- **Resultados**: Exibição clara dos processos encontrados

### 3. Integração com Sistema
- **Botão de busca**: Adicionado à tela de processos
- **Preenchimento automático**: Dados da API preenchem o formulário
- **Dados do DataJud**: Exibição especial para processos originados da API

## Modo de Demonstração

### Problema de CORS
A API do DataJud não permite requisições diretas do navegador devido à política CORS. Isso é normal em APIs públicas para prevenir abuso.

### Solução Implementada
1. **Proxy Vite**: Configurado para desenvolvimento local
2. **Dados Mock**: Em desenvolvimento, usa dados simulados realistas
3. **Produção**: Em produção, funcionará através de servidor backend

### Dados de Exemplo
Os dados mock incluem:
- Processos de diferentes tribunais (TJSP, TJRJ, TRF1)
- Classes processuais variadas
- Movimentações processuais
- Órgãos julgadores
- Assuntos processuais

## Como Usar

1. **Acesse a tela de processos**
2. **Clique em "Buscar DataJud"**
3. **Escolha o tipo de busca**:
   - **Por número**: Digite o número do processo
   - **Avançada**: Use múltiplos critérios
   - **Por texto**: Busca livre por termos
4. **Selecione tribunais** ou marque "todos"
5. **Execute a busca**
6. **Selecione um processo** dos resultados
7. **Complete o cadastro** com dados adicionais

## Próximos Passos

Para usar em produção:
1. **Backend**: Implementar endpoints no servidor
2. **Autenticação**: Configurar chave da API no backend
3. **Rate Limiting**: Implementar controle de requisições
4. **Cache**: Otimizar performance com cache de resultados

## Tribunais Suportados

- **Superiores**: STF, STJ, TST, TSE, STM
- **Regionais Federais**: TRF1 a TRF6
- **Estaduais**: Todos os TJs do Brasil
- **Trabalho**: TRT1 a TRT24
- **Eleitorais**: TREs principais

A implementação está completa e funcional para demonstração e desenvolvimento!
