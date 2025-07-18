# Sistema de Páginas de Escritórios de Advocacia

## Descrição
Sistema implementado para permitir que advogados criem páginas tanto para si mesmos (advogado individual) quanto para escritórios de advocacia (com CNPJ).

## Funcionalidades

### 1. Tipos de Página
- **Advogado Individual**: Página pessoal de um advogado autônomo
- **Escritório de Advocacia**: Página institucional com CNPJ registrado

### 2. Campos Específicos

#### Advogado Individual
- Nome da Página
- Nome do Advogado
- OAB
- Dados de contato
- Informações profissionais

#### Escritório de Advocacia
- Nome da Página
- Nome do Escritório (razão social)
- **CNPJ** (obrigatório e único no sistema)
- Nome do Advogado Responsável
- OAB do Responsável
- Dados de contato
- Informações institucionais

### 3. Validações

#### CNPJ
- Validação de formato (xx.xxx.xxx/xxxx-xx)
- Validação matemática dos dígitos verificadores
- **Unicidade**: Não pode haver dois escritórios com o mesmo CNPJ
- Verificação automática durante criação/edição

#### Backend (Firebase)
```javascript
// Validação de CNPJ único
async checkCNPJExists(cnpj, excludePageId = null)

// Criação com validação
async createPage(userId, pageData)

// Atualização com validação
async updatePage(pageId, pageData)
```

### 4. Interface de Usuário

#### Seleção do Tipo
- Radio buttons visuais para escolher tipo de página
- Campos condicionais baseados na seleção
- Placeholders e labels adaptados

#### Exibição na Lista
- Badge indicando tipo (Escritório/Advogado)
- Informações específicas do tipo selecionado
- Status de ativação

#### Página Pública
- Layout adaptado para mostrar:
  - Nome do escritório ou advogado
  - CNPJ formatado (para escritórios)
  - Advogado responsável (para escritórios)
  - Informações institucionais

### 5. Arquivos Modificados

#### Backend
- `src/firebase/firestore.js`: Adicionada validação de CNPJ único

#### Componentes
- `src/components/LawyerPageBuilder.jsx`: Interface para seleção e criação
- `src/components/LawyerWebPage.jsx`: Exibição pública adaptada
- `src/components/LawyerPagesManager.jsx`: Lista com tipos diferenciados

### 6. Estrutura de Dados

```javascript
// Página de Advogado
{
  tipoPagina: 'advogado',
  nomePagina: 'Dr. João Silva',
  nomeAdvogado: 'João Silva',
  oab: 'OAB/SP 123456',
  // ... outros campos
}

// Página de Escritório
{
  tipoPagina: 'escritorio',
  nomePagina: 'Silva & Associados',
  nomeEscritorio: 'Silva & Associados Advocacia Ltda',
  cnpj: '12345678000199',
  nomeAdvogado: 'João Silva', // Responsável
  oab: 'OAB/SP 123456',
  // ... outros campos
}
```

### 7. Benefícios

1. **Flexibilidade**: Suporte a diferentes modelos de negócio
2. **Conformidade**: CNPJ único garante conformidade legal
3. **Organização**: Diferenciação clara entre tipos
4. **Escalabilidade**: Base para futuras funcionalidades específicas

### 8. Uso

1. **Criar Página**:
   - Selecionar tipo (Advogado/Escritório)
   - Preencher campos específicos
   - Sistema valida CNPJ automaticamente

2. **Gerenciar**:
   - Lista mostra tipo da página
   - Edição mantém validações
   - Preview adaptado ao tipo

3. **Visualizar**:
   - Página pública mostra informações corretas
   - CNPJ formatado para escritórios
   - Responsável técnico identificado

## Tecnologias Utilizadas
- React.js para interface
- Firebase Firestore para persistência
- Validação de CNPJ em JavaScript
- Tailwind CSS para estilização

## Status
✅ Implementado e funcional
✅ Validações ativas
✅ Interface adaptada
✅ Backend configurado
