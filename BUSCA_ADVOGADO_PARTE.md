# Busca por Advogado e Parte - DataJud API

## Funcionalidades Implementadas

### 1. Busca por Nome do Advogado

**Endpoint:** `POST /api/datajud/buscar-advogado`

**Parâmetros:**
- `nomeAdvogado` (string): Nome do advogado a ser pesquisado
- `tribunais` (array): Lista de tribunais para buscar (opcional)

**Exemplo de uso:**
```javascript
const resultados = await buscarProcessosPorAdvogado("João Silva Santos", ["TJSP", "TJRJ"]);
```

**Interface:**
- Nova opção "Por advogado" no modal de busca
- Campo de texto para nome do advogado
- Aviso sobre limitações de privacidade

### 2. Busca por Nome da Parte

**Endpoint:** `POST /api/datajud/buscar-parte`

**Parâmetros:**
- `nomeParte` (string): Nome da parte (requerente/requerido) a ser pesquisada
- `tribunais` (array): Lista de tribunais para buscar (opcional)

**Exemplo de uso:**
```javascript
const resultados = await buscarProcessosPorParte("Maria dos Santos", ["TJSP", "TJRJ"]);
```

**Interface:**
- Nova opção "Por parte" no modal de busca
- Campo de texto para nome da parte
- Aviso sobre limitações de privacidade

## Limitações Importantes

### 🔒 Restrições de Privacidade

A API DataJud **NÃO** permite busca direta por:
- Nomes de advogados
- Números de inscrição na OAB
- Nomes de partes (requerentes/requeridos)
- Dados pessoais em geral

### 🔍 Como Funciona a Busca

As buscas implementadas funcionam através de:

1. **Busca por texto livre** nos campos públicos disponíveis
2. **Procura por menções** ao nome em documentos públicos
3. **Filtragem** dos resultados mais relevantes

### 📋 Campos Pesquisados

- `numeroProcesso`: Número do processo
- `classe.nome`: Nome da classe processual
- `orgaoJulgador.nome`: Nome do órgão julgador
- `assuntos.nome`: Nomes dos assuntos
- `movimentos.nome`: Nomes das movimentações

## Avisos ao Usuário

Ambas as funcionalidades exibem avisos claros:

> ⚠️ **Importante:** Esta busca é limitada devido a restrições de privacidade do DataJud. Procura por menções ao nome em documentos públicos disponíveis.

## Resultados

Os resultados seguem o mesmo formato das outras buscas:
- Dados do processo
- Tribunal de origem
- Score de relevância
- Conversão para formato do sistema

## Recomendações

Para obter melhores resultados:

1. **Use nomes completos** ou partes específicas
2. **Combine com outros filtros** (tribunal, período)
3. **Teste variações** do nome
4. **Use busca por número** quando possível

## Exemplo Prático

```javascript
// Buscar processos de um advogado
const processosAdvogado = await buscarProcessosPorAdvogado("João Silva Santos", ["TJSP"]);

// Buscar processos de uma parte
const processosParte = await buscarProcessosPorParte("Empresa XYZ Ltda", ["TJSP", "TJRJ"]);

// Converter para formato do sistema
const processosConvertidos = processosAdvogado.map(converterDadosDataJud);
```

## Notas Técnicas

- **Timeout:** 30 segundos por tribunal
- **Batch size:** 5 tribunais por vez
- **Limite de resultados:** 10 por tribunal
- **Campos indexados:** Somente campos públicos
- **Privacidade:** Respeita todas as restrições do CNJ

---

*Esta implementação oferece as melhores alternativas possíveis dentro das limitações da API DataJud e regulamentações de privacidade.*
