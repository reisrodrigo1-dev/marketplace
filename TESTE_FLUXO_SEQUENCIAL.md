# Teste do Fluxo Sequencial - Juri.AI

## Cenário de Teste: Contestação

### Objetivo
Testar o fluxo sequencial completo para geração de uma contestação.

### Passos do Teste

#### 1. Inicialização
- Acessar Juri.AI
- Selecionar "Contestação" 
- Verificar se primeira pergunta é gerada automaticamente

#### 2. Fluxo de Perguntas
**Pergunta esperada 1**: Informações sobre o processo e autor
**Resposta teste**: "Processo nº 1234567-89.2023.4.03.6100, autor João Silva, ação de cobrança no valor de R$ 50.000,00"

**Pergunta esperada 2**: Detalhes sobre os pedidos da inicial
**Resposta teste**: "Autor pede cobrança de suposta dívida de contrato de prestação de serviços, com juros e correção monetária"

**Pergunta esperada 3**: Estratégia defensiva
**Resposta teste**: "Defesa: prescrição trienal, falta de comprovação da prestação dos serviços, valor excessivo sem justificativa"

#### 3. Geração do Resultado
- Verificar se aparece indicador "Pronto para gerar"
- Digitar "GERAR"
- Verificar se documento de contestação é gerado

### Verificações Esperadas

#### Interface
- [ ] Indicador de progresso aparece corretamente
- [ ] Contador de informações coletadas funciona
- [ ] Botão "Copiar" aparece no resultado final
- [ ] Mensagens de estado são contextualizadas

#### Funcionalidade
- [ ] Primeira pergunta é gerada automaticamente
- [ ] Cada resposta gera próxima pergunta relevante
- [ ] Sistema reconhece quando pode gerar resultado
- [ ] Comando "GERAR" funciona corretamente
- [ ] Documento final é completo e bem estruturado

#### Qualidade do Resultado
- [ ] Contestação inclui dados do processo
- [ ] Defesas mencionadas são incorporadas
- [ ] Fundamentação jurídica é adequada
- [ ] Formatação é profissional

### Resultado Esperado

```
CONTESTAÇÃO

Excelentíssimo Senhor Doutor Juiz de Direito da [Vara]

Processo nº 1234567-89.2023.4.03.6100
Requerente: João Silva
Requerido: [Nome do cliente]

[Nome do advogado], advogado devidamente inscrito na OAB/[UF] sob o nº [número], vem, respeitosamente, perante Vossa Excelência, nos autos do processo em epígrafe, apresentar CONTESTAÇÃO...

[Documento completo com fundamentação jurídica adequada]
```

### Casos de Erro a Testar

#### Respostas Incompletas
- Resposta muito curta (menos de 20 caracteres)
- Resposta sem informações essenciais
- Resposta não relacionada à pergunta

#### Problemas de Conectividade
- Erro na API da IA
- Timeout de resposta
- Resposta mal formatada

### Métricas de Sucesso

#### Tempo de Resposta
- Primeira pergunta: < 3 segundos
- Perguntas subsequentes: < 2 segundos
- Geração final: < 10 segundos

#### Qualidade
- Documento gerado é utilizável profissionalmente
- Todas as informações fornecidas são incorporadas
- Fundamentação jurídica é adequada
- Formatação está correta

### Outros Prompts para Testar

#### Habeas Corpus
- Informações do paciente
- Tipo de constrangimento
- Autoridade coatora
- Urgência

#### Busca de Jurisprudência
- Tema específico
- Tribunal preferido
- Período desejado
- Tipo de decisão

#### Apelação Criminal
- Dados da sentença
- Pontos a recorrer
- Fundamentação defensiva
- Pedidos específicos

### Observações de Teste

Data: [Data do teste]
Versão: Juri.IA v1 (BIPETech)
Tester: [Nome]

#### Resultados
- [ ] Teste passou completamente
- [ ] Teste passou parcialmente
- [ ] Teste falhou

#### Problemas Encontrados
[Documentar qualquer problema encontrado]

#### Sugestões de Melhoria
[Documentar sugestões para otimização]

### Conclusão

O fluxo sequencial deve proporcionar uma experiência fluida e profissional, garantindo que os documentos gerados sejam completos e úteis para a prática jurídica cotidiana.
