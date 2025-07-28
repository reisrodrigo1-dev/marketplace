// Serviço de controle de permissões para colaboração
import { collaborationService } from '../firebase/firestore';

export const permissionService = {
  // Definições de roles e suas permissões
  ROLES: {
    OWNER: 'owner',
    LAWYER: 'lawyer', 
    INTERN: 'intern',
    FINANCIAL: 'financial'
  },

  PERMISSIONS: {
    EDIT: 'edit',
    DELETE: 'delete', 
    INVITE: 'invite',
    CLIENTS: 'clients',
    APPOINTMENTS: 'appointments',
    FINANCIAL: 'financial'
  },

  // Definir permissões padrão por role
  getDefaultPermissions(role) {
    switch (role) {
      case this.ROLES.OWNER:
        return [
          this.PERMISSIONS.EDIT,
          this.PERMISSIONS.DELETE,
          this.PERMISSIONS.INVITE,
          this.PERMISSIONS.CLIENTS,
          this.PERMISSIONS.APPOINTMENTS,
          this.PERMISSIONS.FINANCIAL
        ];
      
      case this.ROLES.LAWYER:
        return [
          this.PERMISSIONS.CLIENTS,
          this.PERMISSIONS.APPOINTMENTS,
          this.PERMISSIONS.FINANCIAL
        ];
      
      case this.ROLES.INTERN:
        return [
          this.PERMISSIONS.CLIENTS,
          this.PERMISSIONS.APPOINTMENTS
        ];
      
      case this.ROLES.FINANCIAL:
        return [
          this.PERMISSIONS.FINANCIAL
        ];
      
      default:
        return [];
    }
  },

  // Verificar se o usuário tem uma permissão específica
  async hasPermission(userId, pageId, permission) {
    try {
      const permissionsResult = await collaborationService.checkUserPermissions(userId, pageId);
      if (!permissionsResult.success) {
        return { success: false, hasPermission: false, error: permissionsResult.error };
      }

      const { isOwner, permissions } = permissionsResult.data;
      
      // Owner sempre tem todas as permissões
      if (isOwner) {
        return { success: true, hasPermission: true };
      }

      // Verificar se tem a permissão específica
      const hasPermission = permissions.includes(permission);
      
      return { 
        success: true, 
        hasPermission,
        reason: hasPermission ? null : `Permissão '${permission}' não encontrada`
      };
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return { success: false, hasPermission: false, error: error.message };
    }
  },

  // Verificar múltiplas permissões de uma vez
  async hasPermissions(userId, pageId, requiredPermissions) {
    try {
      const permissionsResult = await collaborationService.checkUserPermissions(userId, pageId);
      if (!permissionsResult.success) {
        return { success: false, hasPermissions: false, error: permissionsResult.error };
      }

      const { isOwner, permissions } = permissionsResult.data;
      
      // Owner sempre tem todas as permissões
      if (isOwner) {
        return { success: true, hasPermissions: true, missingPermissions: [] };
      }

      // Verificar quais permissões estão faltando
      const missingPermissions = requiredPermissions.filter(
        perm => !permissions.includes(perm)
      );

      const hasPermissions = missingPermissions.length === 0;
      
      return { 
        success: true, 
        hasPermissions,
        missingPermissions,
        reason: hasPermissions ? null : `Permissões faltantes: ${missingPermissions.join(', ')}`
      };
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return { success: false, hasPermissions: false, error: error.message };
    }
  },

  // Helper para verificar se pode editar
  async canEdit(userId, pageId) {
    const permissionsResult = await collaborationService.checkUserPermissions(userId, pageId);
    if (!permissionsResult.success) {
      return { success: false, hasPermission: false, error: permissionsResult.error };
    }
    
    // Apenas owner pode editar
    const hasPermission = permissionsResult.data.isOwner;
    return { 
      success: true, 
      hasPermission,
      reason: hasPermission ? null : 'Apenas o proprietário pode editar'
    };
  },

  // Helper para verificar se pode deletar
  async canDelete(userId, pageId) {
    const permissionsResult = await collaborationService.checkUserPermissions(userId, pageId);
    if (!permissionsResult.success) {
      return { success: false, hasPermission: false, error: permissionsResult.error };
    }
    
    // Apenas owner pode deletar
    const hasPermission = permissionsResult.data.isOwner;
    return { 
      success: true, 
      hasPermission,
      reason: hasPermission ? null : 'Apenas o proprietário pode excluir'
    };
  },

  // Helper para verificar se pode convidar
  async canInvite(userId, pageId) {
    const permissionsResult = await collaborationService.checkUserPermissions(userId, pageId);
    if (!permissionsResult.success) {
      return { success: false, hasPermission: false, error: permissionsResult.error };
    }
    
    // Apenas owner pode convidar
    const hasPermission = permissionsResult.data.isOwner;
    return { 
      success: true, 
      hasPermission,
      reason: hasPermission ? null : 'Apenas o proprietário pode enviar convites'
    };
  },

  // Helper para verificar se pode ver financeiro
  async canViewFinancial(userId, pageId) {
    return await this.hasPermission(userId, pageId, this.PERMISSIONS.FINANCIAL);
  },

  // Helper para verificar se pode gerenciar clientes
  async canManageClients(userId, pageId) {
    return await this.hasPermission(userId, pageId, this.PERMISSIONS.CLIENTS);
  },

  // Helper para verificar se pode gerenciar agendamentos
  async canManageAppointments(userId, pageId) {
    return await this.hasPermission(userId, pageId, this.PERMISSIONS.APPOINTMENTS);
  },

  // Obter descrição do role
  getRoleDescription(role) {
    switch (role) {
      case this.ROLES.OWNER:
        return 'Proprietário - Controle total da página (editar, excluir, convidar)';
      case this.ROLES.LAWYER:
        return 'Advogado - Acesso a clientes, agendamentos e financeiro';
      case this.ROLES.INTERN:
        return 'Estagiário - Acesso a clientes e agendamentos';
      case this.ROLES.FINANCIAL:
        return 'Financeiro - Acesso apenas às informações financeiras';
      default:
        return 'Role não reconhecido';
    }
  },

  // Obter descrição da permissão
  getPermissionDescription(permission) {
    switch (permission) {
      case this.PERMISSIONS.EDIT:
        return 'Editar informações da página';
      case this.PERMISSIONS.DELETE:
        return 'Excluir a página';
      case this.PERMISSIONS.INVITE:
        return 'Convidar novos colaboradores';
      case this.PERMISSIONS.CLIENTS:
        return 'Gerenciar clientes';
      case this.PERMISSIONS.APPOINTMENTS:
        return 'Gerenciar agendamentos';
      case this.PERMISSIONS.FINANCIAL:
        return 'Visualizar informações financeiras';
      default:
        return 'Permissão não reconhecida';
    }
  }
};

export default permissionService;
