# Implementação da API ViaCEP - Busca Automática de Endereço

## Descrição
Implementada integração com a API ViaCEP no formulário de cadastro de páginas de advogado (LawyerPageBuilder.jsx) para buscar automaticamente o endereço ao digitar o CEP.

## Funcionalidades Implementadas

### 1. Busca Automática de CEP
- Campo CEP reorganizado para ser o primeiro campo do formulário de endereço
- Busca automática quando o CEP está completo (8 dígitos)
- Formatação automática do CEP (00000-000)
- Preenchimento automático dos campos: rua, bairro, cidade e estado

### 2. Interface do Usuário
- Indicador visual de loading durante a busca
- Texto explicativo informando sobre o preenchimento automático
- Validação de CEP antes da busca
- Tratamento de erros com alertas amigáveis

### 3. Estrutura do Código

#### Estados Adicionados
```jsx
const [isLoadingCep, setIsLoadingCep] = useState(false);
```

#### Funções Implementadas

**buscarCep(cep)**
- Remove caracteres não numéricos
- Valida se o CEP tem 8 dígitos
- Faz requisição para a API ViaCEP
- Trata erros e CEPs não encontrados
- Preenche automaticamente os campos de endereço

**handleCepChange(value)**
- Formata o CEP durante a digitação
- Dispara busca automática quando completo
- Limita entrada a 9 caracteres (formato 00000-000)

### 4. Layout do Formulário - Passo 2
Ordem dos campos reorganizada:
1. CEP (com busca automática)
2. Rua
3. Número
4. Bairro
5. Cidade
6. Estado

### 5. Recursos Visuais
- Spinner de loading no campo CEP
- Texto explicativo sobre funcionalidade
- Campos marcados como obrigatórios (*)
- Formatação automática durante digitação

## API Utilizada
- **ViaCEP**: https://viacep.com.br/ws/{cep}/json/
- Serviço gratuito para consulta de CEPs brasileiros
- Não requer autenticação
- Retorna dados em formato JSON

## Tratamento de Erros
- CEP inválido: Não faz busca até ter 8 dígitos
- CEP não encontrado: Alerta informativo
- Erro de rede: Alerta de erro genérico
- Mantém dados já digitados em caso de erro

## Exemplo de Uso
1. Usuário digita CEP: "01310-100"
2. Sistema busca automaticamente na API ViaCEP
3. Campos são preenchidos automaticamente:
   - Rua: "Avenida Paulista"
   - Bairro: "Bela Vista"
   - Cidade: "São Paulo"
   - Estado: "SP"
4. Usuário só precisa preencher o número

## Benefícios
- Melhora experiência do usuário
- Reduz erros de digitação
- Acelera preenchimento do formulário
- Padroniza formato de endereços
- Mantém consistência dos dados

## Arquivos Modificados
- `src/components/LawyerPageBuilder.jsx`: Implementação principal
- Estados, funções e renderização do passo 2 atualizados

## Validações
- CEP deve ter formato válido (8 dígitos)
- Todos os campos de endereço continuam obrigatórios
- Usuário pode editar campos preenchidos automaticamente
- Validação mantida para campos não preenchidos pela API

## Status
✅ **IMPLEMENTADO E FUNCIONAL**

A funcionalidade de busca automática de CEP está totalmente implementada e integrada ao formulário de cadastro de páginas de advogado.
