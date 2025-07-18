# Sistema de Permissões para Colaboração - DireitoHub

## Resumo da Implementação

O sistema de permissões foi implementado para controlar o acesso às funcionalidades das páginas de advogados baseado no perfil/role do usuário.

## Estrutura de Roles

### 1. **Owner (Proprietário)**
- **Acesso**: Total à página
- **Permissões**: Todas as permissões (edit, delete, invite, deactivate, financial, clients, appointments)
- **Características**: É o criador/dono da página - ÚNICO que pode editar, excluir, convidar e desativar

### 2. **Lawyer (Advogado)**
- **Acesso**: Operacional completo (sem controle administrativo)
- **Permissões**: financial, clients, appointments
- **Características**: Colaborador com acesso amplo mas sem poder administrativo

### 3. **Intern (Estagiário)**
- **Acesso**: Limitado a clientes e agendamentos
- **Permissões**: clients, appointments
- **Características**: Acesso básico para tarefas operacionais

### 4. **Financial (Financeiro)**
- **Acesso**: Apenas informações financeiras
- **Permissões**: financial
- **Características**: Pode visualizar dados financeiros de páginas autorizadas

## Regras de Negócio Implementadas

### ✅ **Controle Administrativo (APENAS OWNER)**
- **Editar Página**: Somente o proprietário pode editar informações da página
- **Excluir Página**: Somente o proprietário pode excluir a página
- **Enviar Convites**: Somente o proprietário pode convidar novos colaboradores
- **Desativar Página**: Somente o proprietário pode desativar/ativar a página

### ✅ **Acesso Operacional**
- **Lawyer**: Acesso a clientes, agendamentos e informações financeiras
- **Financial**: Pode escolher páginas e visualizar informações financeiras
- **Intern**: Acesso limitado a clientes e agendamentos

## Componentes Implementados

### 1. **permissionService.js**
```javascript
// Serviço central de controle de permissões
export const permissionService = {
  ROLES: { OWNER, LAWYER, INTERN, FINANCIAL },
  PERMISSIONS: { EDIT, DELETE, INVITE, CLIENTS, APPOINTMENTS, FINANCIAL },
  hasPermission(userId, pageId, permission),
  canEdit(userId, pageId),
  canDelete(userId, pageId),
  // etc...
}
```

### 2. **FinancialPageSelector.jsx**
- Componente para seleção de páginas na tela financeira
- Mostra apenas páginas que o usuário tem acesso financeiro
- Exibe indicadores de role/acesso

### 3. **FinancialDashboardWithPermissions.jsx**
- Dashboard financeiro com controle de acesso
- Verifica permissões antes de exibir dados
- Implementa seleção de páginas para usuários com perfil financeiro

### 4. **PermissionGuard.jsx**
```javascript
// Componentes para proteção baseada em permissões
<PermissionGuard pageId={pageId} permission="edit">
  <EditButton />
</PermissionGuard>

<ProtectedAction pageId={pageId} action="delete">
  <DeleteButton />
</ProtectedAction>

<RoleIndicator pageId={pageId} showPermissions />
```

### 5. **usePermissions.js**
```javascript
// Hooks para gerenciamento de permissões
const permissions = usePermissions(userId, pageId);
const { hasPermission } = useHasPermission(userId, pageId, 'edit');
const { pages } = useFinancialPages(userId);
```

## Funções Adicionadas ao firestore.js

### **collaborationService**
```javascript
// Verificações de permissão
canEditPage(userId, pageId)
canDeletePage(userId, pageId) 
canInviteToPage(userId, pageId)
canViewFinancial(userId, pageId)
getPagesWithFinancialAccess(userId)
```

### **financialService**
```javascript
// Métodos com controle de acesso
getPaymentHistoryByPage(pageId, userId)
getFinancialSummaryByPage(pageId, userId)
```

## Como Usar

### 1. **Proteger Componentes**
```jsx
import { PermissionGuard, ProtectedAction } from '../components/PermissionGuard';

// Proteger seção inteira
<PermissionGuard pageId={pageId} permission="edit">
  <EditForm />
</PermissionGuard>

// Proteger ação específica
<ProtectedAction pageId={pageId} action="delete">
  <button>Excluir Página</button>
</ProtectedAction>
```

### 2. **Verificar Permissões em Código**
```jsx
import { usePermissions } from '../hooks/usePermissions';

const MyComponent = ({ pageId }) => {
  const { canEdit, canDelete, role } = usePermissions(user.uid, pageId);
  
  return (
    <div>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
      <span>Seu perfil: {role}</span>
    </div>
  );
};
```

### 3. **Tela Financeira com Seleção**
```jsx
import FinancialDashboardWithPermissions from '../components/FinancialDashboardWithPermissions';

// Componente completo com seleção de páginas e controle de acesso
<FinancialDashboardWithPermissions />
```

## Fluxo de Verificação

1. **Usuário acessa funcionalidade**
2. **Sistema verifica role/permissões** via `checkUserPermissions()`
3. **Componente decide** se exibe ou bloqueia acesso
4. **Feedback visual** para usuário (mensagens de erro, indicadores)

## Segurança

- ✅ **Verificação no Backend**: Todos os métodos verificam permissões no servidor
- ✅ **Validação de Acesso**: Métodos financeiros validam acesso antes de retornar dados
- ✅ **Feedback Claro**: Usuários recebem mensagens explicativas sobre restrições
- ✅ **Role-Based**: Controle baseado em roles bem definidos

## Próximos Passos

1. **Integrar componentes** nas telas existentes
2. **Testar workflows** de colaboração
3. **Ajustar UX** baseado em feedback
4. **Expandir permissões** se necessário

## Exemplo de Uso Completo

```jsx
// Página de gerenciamento com controle de permissões
const LawyerPageManager = ({ pageId }) => {
  const permissions = usePermissions(user.uid, pageId);
  
  return (
    <div>
      {/* Indicador de Role */}
      <RoleIndicator pageId={pageId} showPermissions />
      
      {/* Ações Protegidas */}
      <div className="actions">
        <ProtectedAction pageId={pageId} action="edit">
          <button>Editar Página</button>
        </ProtectedAction>
        
        <ProtectedAction pageId={pageId} action="invite">
          <button>Convidar Colaborador</button>
        </ProtectedAction>
        
        <ProtectedAction pageId={pageId} action="delete">
          <button className="text-red-600">Excluir Página</button>
        </ProtectedAction>
      </div>
      
      {/* Seções Protegidas */}
      <PermissionGuard pageId={pageId} permission="financial">
        <FinancialSection />
      </PermissionGuard>
      
      <PermissionGuard pageId={pageId} permission="clients">
        <ClientsSection />
      </PermissionGuard>
    </div>
  );
};
```

Esta implementação garante que:
- **Fono (Owner/Lawyer)**: Pode editar, excluir e convidar
- **Financeiro**: Pode escolher páginas e ver informações financeiras
- **Segurança**: Todas as ações são validadas no backend
- **UX**: Feedback claro sobre permissões e restrições
