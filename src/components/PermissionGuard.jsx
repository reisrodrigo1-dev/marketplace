import React from 'react';
import { usePermissions, useHasPermission } from '../hooks/usePermissions';
import { useAuth } from '../contexts/AuthContext';

// Componente para proteger conteúdo baseado em permissões
const PermissionGuard = ({ 
  children, 
  pageId, 
  permission = null, 
  role = null,
  fallback = null,
  requireOwner = false,
  requireAny = false, // Se true, qualquer uma das condições é suficiente
  onAccessDenied = null 
}) => {
  const { user } = useAuth();
  const permissions = usePermissions(user?.uid, pageId);

  // Loading state
  if (permissions.loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Verificar se é owner quando requerido
  if (requireOwner && !permissions.isOwner) {
    if (onAccessDenied) onAccessDenied('Apenas o proprietário pode acessar');
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <p className="text-yellow-800 text-sm">
          ⚠️ Apenas o proprietário da página pode acessar esta funcionalidade
        </p>
      </div>
    );
  }

  // Verificar role específico
  if (role && permissions.role !== role && !permissions.isOwner) {
    if (onAccessDenied) onAccessDenied(`Acesso restrito ao perfil: ${role}`);
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
        <p className="text-yellow-800 text-sm">
          ⚠️ Acesso restrito ao perfil: {role}
        </p>
      </div>
    );
  }

  // Verificar permissão específica
  if (permission && !permissions.permissions.includes(permission) && !permissions.isOwner) {
    if (onAccessDenied) onAccessDenied(`Permissão necessária: ${permission}`);
    return fallback || (
      <div className="bg-red-50 border border-red-200 rounded p-3">
        <p className="text-red-800 text-sm">
          🚫 Você não tem permissão para acessar esta funcionalidade
        </p>
      </div>
    );
  }

  // Se todas as verificações passaram, renderizar o conteúdo
  return children;
};

// Componente para ações específicas (botões, links, etc.)
const ProtectedAction = ({ 
  children, 
  pageId, 
  action, // 'edit', 'delete', 'invite', 'financial', 'clients', 'appointments'
  disabled = false,
  disabledMessage = null,
  onClick,
  className = '',
  ...props 
}) => {
  const { user } = useAuth();
  const permissions = usePermissions(user?.uid, pageId);

  const getActionPermission = (action) => {
    switch (action) {
      case 'edit': return permissions.canEdit;
      case 'delete': return permissions.canDelete;
      case 'invite': return permissions.canInvite;
      case 'financial': return permissions.canViewFinancial;
      case 'clients': return permissions.canManageClients;
      case 'appointments': return permissions.canManageAppointments;
      default: return false;
    }
  };

  const hasPermission = getActionPermission(action);
  const isDisabled = disabled || !hasPermission;

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      if (!hasPermission) {
        alert(disabledMessage || `Você não tem permissão para ${action}`);
      }
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };

  return React.cloneElement(children, {
    ...props,
    className: `${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`,
    disabled: isDisabled,
    onClick: handleClick,
    title: isDisabled ? (disabledMessage || `Permissão necessária: ${action}`) : props.title
  });
};

// Componente para exibir indicadores de role/permissões
const RoleIndicator = ({ pageId, showPermissions = false }) => {
  const { user } = useAuth();
  const permissions = usePermissions(user?.uid, pageId);

  if (permissions.loading) {
    return <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>;
  }

  const getRoleColor = (role, isOwner) => {
    if (isOwner) return 'bg-green-100 text-green-800';
    switch (role) {
      case 'lawyer': return 'bg-blue-100 text-blue-800';
      case 'intern': return 'bg-purple-100 text-purple-800';
      case 'financial': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role, isOwner) => {
    if (isOwner) return 'Proprietário';
    switch (role) {
      case 'lawyer': return 'Advogado';
      case 'intern': return 'Estagiário';
      case 'financial': return 'Financeiro';
      default: return 'Sem acesso';
    }
  };

  return (
    <div className="space-y-2">
      <span className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${getRoleColor(permissions.role, permissions.isOwner)}
      `}>
        {getRoleLabel(permissions.role, permissions.isOwner)}
      </span>
      
      {showPermissions && permissions.permissions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {permissions.permissions.map(permission => (
            <span
              key={permission}
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
            >
              {permission}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export { PermissionGuard, ProtectedAction, RoleIndicator };
export default PermissionGuard;
