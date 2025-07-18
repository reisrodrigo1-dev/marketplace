import { useState, useEffect } from 'react';
import { collaborationService } from '../firebase/firestore';
import { permissionService } from '../services/permissionService';

// Hook para verificar permissões de usuário
export const usePermissions = (userId, pageId) => {
  const [permissions, setPermissions] = useState({
    loading: true,
    isOwner: false,
    role: null,
    permissions: [],
    canEdit: false,
    canDelete: false,
    canInvite: false,
    canViewFinancial: false,
    canManageClients: false,
    canManageAppointments: false
  });

  useEffect(() => {
    if (!userId || !pageId) {
      setPermissions(prev => ({ ...prev, loading: false }));
      return;
    }

    loadPermissions();
  }, [userId, pageId]);

  const loadPermissions = async () => {
    try {
      setPermissions(prev => ({ ...prev, loading: true }));

      // Verificar permissões gerais
      const permissionsResult = await collaborationService.checkUserPermissions(userId, pageId);
      
      if (!permissionsResult.success) {
        console.error('Erro ao carregar permissões:', permissionsResult.error);
        setPermissions(prev => ({ ...prev, loading: false }));
        return;
      }

      const { isOwner, role, permissions: userPermissions } = permissionsResult.data;

      // Verificar permissões específicas
      const [
        canEditResult,
        canDeleteResult, 
        canInviteResult,
        canViewFinancialResult,
        canManageClientsResult,
        canManageAppointmentsResult
      ] = await Promise.all([
        permissionService.canEdit(userId, pageId),
        permissionService.canDelete(userId, pageId),
        permissionService.canInvite(userId, pageId),
        permissionService.canViewFinancial(userId, pageId),
        permissionService.canManageClients(userId, pageId),
        permissionService.canManageAppointments(userId, pageId)
      ]);

      setPermissions({
        loading: false,
        isOwner,
        role,
        permissions: userPermissions,
        canEdit: canEditResult.success ? canEditResult.hasPermission : false,
        canDelete: canDeleteResult.success ? canDeleteResult.hasPermission : false,
        canInvite: canInviteResult.success ? canInviteResult.hasPermission : false,
        canViewFinancial: canViewFinancialResult.success ? canViewFinancialResult.hasPermission : false,
        canManageClients: canManageClientsResult.success ? canManageClientsResult.hasPermission : false,
        canManageAppointments: canManageAppointmentsResult.success ? canManageAppointmentsResult.hasPermission : false
      });

    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setPermissions(prev => ({ ...prev, loading: false }));
    }
  };

  return permissions;
};

// Hook para verificar uma permissão específica
export const useHasPermission = (userId, pageId, permission) => {
  const [result, setResult] = useState({
    loading: true,
    hasPermission: false,
    reason: null
  });

  useEffect(() => {
    if (!userId || !pageId || !permission) {
      setResult({ loading: false, hasPermission: false, reason: 'Parâmetros inválidos' });
      return;
    }

    checkPermission();
  }, [userId, pageId, permission]);

  const checkPermission = async () => {
    try {
      setResult(prev => ({ ...prev, loading: true }));

      const permissionResult = await permissionService.hasPermission(userId, pageId, permission);
      
      setResult({
        loading: false,
        hasPermission: permissionResult.success ? permissionResult.hasPermission : false,
        reason: permissionResult.reason || permissionResult.error
      });

    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      setResult({
        loading: false,
        hasPermission: false,
        reason: error.message
      });
    }
  };

  return result;
};

// Hook para carregar páginas com acesso financeiro
export const useFinancialPages = (userId) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setPages([]);
      setLoading(false);
      return;
    }

    loadPages();
  }, [userId]);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await collaborationService.getPagesWithFinancialAccess(userId);
      
      if (result.success) {
        setPages(result.data);
      } else {
        setError(result.error);
        setPages([]);
      }
    } catch (error) {
      console.error('Erro ao carregar páginas financeiras:', error);
      setError(error.message);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    loadPages();
  };

  return { pages, loading, error, refetch };
};
