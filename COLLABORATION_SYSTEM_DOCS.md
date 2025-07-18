# Sistema de Colaboração DireitoHub

## Visão Geral

O sistema de colaboração permite que advogados convidem outros advogados para acessar suas páginas com diferentes níveis de permissão. Isso é útil para escritórios, parcerias ou quando você precisa que alguém ajude a gerenciar seus clientes e agendamentos.

## Funcionalidades Implementadas

### 1. Convites de Colaboração

**Localização:** Gerenciador de Páginas > Cada página tem um "Gerenciador de Colaboração"

**Como funciona:**
- Clique em "Convidar Colaborador" em qualquer página
- Digite o código do cliente do advogado que você quer convidar
- Escolha o nível de acesso (Dono, Advogado, Estagiário ou Financeiro)
- O convite é enviado automaticamente

### 2. Níveis de Acesso

#### 🔑 **Dono**
- **Permissões:** Clientes, Agendamentos e Financeiro
- **Descrição:** Acesso total à página, igual ao proprietário

#### ⚖️ **Advogado**
- **Permissões:** Clientes e Agendamentos
- **Descrição:** Pode gerenciar clientes e agendamentos, mas não vê dados financeiros

#### 📚 **Estagiário**
- **Permissões:** Clientes e Agendamentos
- **Descrição:** Mesmo acesso que Advogado, ideal para estagiários

#### 💰 **Financeiro**
- **Permissões:** Apenas Financeiro
- **Descrição:** Acesso exclusivo aos dados financeiros da página

### 3. Notificações de Convites

**Localização:** Aparece automaticamente no topo do Gerenciador de Páginas

**Como funciona:**
- Quando alguém te convida, aparece uma notificação
- Você pode aceitar ou recusar o convite
- Convites aceitos se tornam colaborações ativas

### 4. Acesso Colaborativo

**Localização:** Seção "Páginas Colaborativas" no Gerenciador de Páginas

**Como funciona:**
- Mostra todas as páginas onde você é colaborador
- Clique em "Acessar" para ver os dados da página
- As abas disponíveis dependem das suas permissões

### 5. Gerenciamento de Colaboradores

**Localização:** Cada página no Gerenciador de Páginas

**Como funciona:**
- Veja todos os colaboradores da sua página
- Remova colaboradores quando necessário
- Acompanhe desde quando cada pessoa colabora

## Estrutura do Banco de Dados

### Coleção: `collaboration_invites`
```javascript
{
  senderUserId: "id_do_remetente",
  targetUserId: "id_do_destinatario",
  pageId: "id_da_pagina",
  role: "lawyer", // owner, lawyer, intern, financial
  permissions: ["clients", "appointments"], // array das permissões
  message: "Mensagem do convite",
  status: "pending", // pending, accepted, rejected
  createdAt: timestamp,
  updatedAt: timestamp,
  respondedAt: timestamp
}
```

### Coleção: `collaborations`
```javascript
{
  ownerUserId: "id_do_dono",
  collaboratorUserId: "id_do_colaborador",
  pageId: "id_da_pagina",
  role: "lawyer",
  permissions: ["clients", "appointments"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Fluxo de Uso

### Para Convidar Alguém:
1. Acesse o "Gerenciador de Páginas"
2. Encontre a página que você quer compartilhar
3. Na seção "Colaboradores", clique em "Convidar Colaborador"
4. Digite o código do cliente do advogado
5. Escolha o nível de acesso
6. Clique em "Enviar Convite"

### Para Responder a um Convite:
1. Acesse o "Gerenciador de Páginas"
2. Se você tem convites pendentes, verá uma notificação no topo
3. Clique em "Aceitar" ou "Recusar"
4. Se aceitar, a página aparecerá em "Páginas Colaborativas"

### Para Acessar uma Página Colaborativa:
1. Vá para "Páginas Colaborativas"
2. Encontre a página que você quer acessar
3. Clique em "Acessar"
4. Use as abas disponíveis conforme suas permissões

### Para Gerenciar Colaboradores:
1. Vá para o "Gerenciador de Páginas"
2. Na sua página, veja a seção "Colaboradores"
3. Para remover alguém, clique no ícone de lixeira
4. Para convidar mais pessoas, clique em "Convidar Colaborador"

## Benefícios

### Para Escritórios:
- Múltiplos advogados podem gerenciar a mesma página
- Controle granular de permissões
- Estagiários podem ajudar sem acesso ao financeiro

### Para Parcerias:
- Compartilhamento seguro de clientes
- Colaboração em casos específicos
- Transparência controlada

### Para Delegação:
- Assistentes podem gerenciar agendamentos
- Contadores podem acessar apenas dados financeiros
- Flexibilidade total de acesso

## Segurança

- ✅ Apenas proprietários podem convidar colaboradores
- ✅ Convites expiram se não respondidos
- ✅ Colaboradores podem sair a qualquer momento
- ✅ Proprietários podem remover colaboradores
- ✅ Permissões são verificadas em cada operação

## Códigos de Cliente

Para convidar alguém, você precisa do **código do cliente** dele. Este código de 8 caracteres:
- É único para cada usuário
- Pode ser encontrado no perfil do usuário
- É usado para identificar advogados de forma segura
- Formato: `ABC12345` (letras e números, sem O ou 0)

## Próximos Passos

Este sistema é a base para colaboração. Futuramente, pode ser expandido com:
- Chat entre colaboradores
- Notificações em tempo real
- Relatórios de atividade colaborativa
- Integração com calendários compartilhados
- Assinatura digital de documentos

## Troubleshooting

### "Usuário não encontrado com este código"
- Verifique se o código está correto
- Confirme se a pessoa já criou uma conta no DireitoHub
- Códigos são case-sensitive

### "Não autorizado a responder este convite"
- O convite pode ter expirado
- Verifique se você está logado com a conta correta

### "Erro ao carregar colaborações"
- Verifique sua conexão com a internet
- Recarregue a página
- Entre em contato com o suporte se persistir

---

**Desenvolvido para DireitoHub - Sistema de Gestão Jurídica**
