import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collaborationService } from '../firebase/firestore';
import CollaborationModal from './CollaborationModal';

const CollaborationManager = ({ pageId, onCollaborationChange }) => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [canInvite, setCanInvite] = useState(false);

  const roleLabels = {
    owner: 'Dono',
    lawyer: 'Advogado',
    intern: 'Estagiário',
    financial: 'Financeiro'
  };

  const permissionLabels = {
    clients: 'Clientes',
    appointments: 'Agendamentos',
    financial: 'Financeiro'
  };

  useEffect(() => {
    if (user && pageId) {
      checkInvitePermissions();
      loadCollaborations();
    }
  }, [user, pageId]);

  const checkInvitePermissions = async () => {
    try {
      const result = await collaborationService.canInviteToPage(user.uid, pageId);
      setCanInvite(result.success && result.canInvite);
    } catch (error) {
      console.error('Erro ao verificar permissões de convite:', error);
      setCanInvite(false);
    }
  };

  const loadCollaborations = async () => {
    setLoading(true);
    try {
      const result = await collaborationService.getOwnedCollaborations(user.uid);
      
      if (result.success) {
        // Filtrar colaborações desta página específica
        const pageCollaborations = result.data.filter(collab => collab.pageId === pageId);
        setCollaborations(pageCollaborations);
      } else {
        console.error('Erro ao carregar colaborações:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar colaborações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaboration = async (collaborationId) => {
    if (!confirm('Tem certeza que deseja remover este colaborador?')) {
      return;
    }

    try {
      const result = await collaborationService.removeCollaboration(collaborationId, user.uid);
      
      if (result.success) {
        await loadCollaborations();
        onCollaborationChange && onCollaborationChange();
      } else {
        alert('Erro ao remover colaboração: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao remover colaboração:', error);
      alert('Erro ao remover colaboração');
    }
  };

  const handleInviteSuccess = () => {
    loadCollaborations();
    onCollaborationChange && onCollaborationChange();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Colaboradores ({collaborations.length})
        </h3>
        {canInvite && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Convidar Colaborador
          </button>
        )}
      </div>

      {collaborations.length === 0 ? (
        <div className="text-center py-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum colaborador ainda
          </h4>
          <p className="text-gray-600 mb-4">
            {canInvite 
              ? 'Convide outros advogados para colaborar nesta página'
              : 'Apenas o proprietário da página pode convidar colaboradores'
            }
          </p>
          {canInvite && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enviar Primeiro Convite
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {collaborations.map((collaboration) => (
            <div
              key={collaboration.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {collaboration.collaboratorData?.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {collaboration.collaboratorData?.name || 'Nome não disponível'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {collaboration.collaboratorData?.email || 'Email não disponível'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3 flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500">CARGO:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {roleLabels[collaboration.role] || collaboration.role}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500">ACESSO:</span>
                    <div className="flex space-x-1">
                      {collaboration.permissions?.map((permission) => (
                        <span
                          key={permission}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {permissionLabels[permission] || permission}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Colaborando desde {collaboration.createdAt?.toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleRemoveCollaboration(collaboration.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remover colaborador"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Convite - Só aparece se pode convidar */}
      {canInvite && (
        <CollaborationModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          pageId={pageId}
          onSuccess={handleInviteSuccess}
        />
      )}
    </div>
  );
};

export default CollaborationManager;
