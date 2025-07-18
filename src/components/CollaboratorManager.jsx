import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collaborationService } from '../firebase/firestore';
import CollaborationModal from './CollaborationModal';

const CollaboratorManager = ({ pageId, pageData, isOwner = false }) => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const roleLabels = {
    owner: 'Proprietário',
    lawyer: 'Advogado',
    intern: 'Estagiário',
    financial: 'Financeiro'
  };

  const roleDescriptions = {
    lawyer: 'Acesso a clientes, agendamentos e financeiro',
    intern: 'Acesso a clientes e agendamentos',
    financial: 'Acesso apenas ao financeiro'
  };

  const availableRoles = [
    { value: 'lawyer', label: 'Advogado', description: 'Acesso completo (clientes, agendamentos, financeiro)' },
    { value: 'intern', label: 'Estagiário', description: 'Acesso limitado (clientes e agendamentos)' },
    { value: 'financial', label: 'Financeiro', description: 'Acesso apenas ao financeiro' }
  ];

  useEffect(() => {
    if (user && pageId) {
      loadCollaborations();
    }
  }, [user, pageId]);

  const loadCollaborations = async () => {
    setLoading(true);
    try {
      console.log('🔄 Carregando colaborações para página:', pageId);
      
      const result = await collaborationService.getOwnedCollaborations(user.uid);
      
      if (result.success) {
        // Filtrar colaborações desta página específica
        const pageCollaborations = result.data.filter(collab => collab.pageId === pageId);
        console.log('✅ Colaborações carregadas:', pageCollaborations);
        setCollaborations(pageCollaborations);
      } else {
        console.error('❌ Erro ao carregar colaborações:', result.error);
      }
    } catch (error) {
      console.error('💥 Erro inesperado ao carregar colaborações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCollaborator = async (collaborationId, collaboratorName) => {
    if (!isOwner) {
      alert('Apenas o proprietário da página pode remover colaboradores.');
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${collaboratorName} da colaboração? Esta ação não pode ser desfeita.`
    );

    if (confirmed) {
      try {
        const result = await collaborationService.removeCollaboration(collaborationId, user.uid);
        
        if (result.success) {
          alert('Colaborador removido com sucesso!');
          loadCollaborations(); // Recarregar lista
        } else {
          alert('Erro ao remover colaborador: ' + result.error);
        }
      } catch (error) {
        console.error('Erro ao remover colaborador:', error);
        alert('Erro inesperado ao remover colaborador.');
      }
    }
  };

  const handleEditCollaborator = (collaboration) => {
    if (!isOwner) {
      alert('Apenas o proprietário da página pode alterar perfis.');
      return;
    }

    setEditingCollaborator(collaboration);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (newRole) => {
    try {
      console.log('🔄 Atualizando perfil para:', newRole);
      
      const result = await collaborationService.updateCollaboratorRole(
        editingCollaborator.id, 
        newRole, 
        user.uid
      );

      if (result.success) {
        alert('Perfil do colaborador atualizado com sucesso!');
        setShowEditModal(false);
        setEditingCollaborator(null);
        loadCollaborations(); // Recarregar lista
      } else {
        alert('Erro ao atualizar perfil: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao atualizar colaborador:', error);
      alert('Erro inesperado ao atualizar perfil do colaborador.');
    }
  };

  const getPermissionsByRole = (role) => {
    switch (role) {
      case 'lawyer':
        return ['clients', 'appointments', 'financial'];
      case 'intern':
        return ['clients', 'appointments'];
      case 'financial':
        return ['financial'];
      default:
        return [];
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      case 'lawyer':
        return 'bg-green-100 text-green-800';
      case 'intern':
        return 'bg-yellow-100 text-yellow-800';
      case 'financial':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com informações da página */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Colaboradores da Página</h2>
            <p className="text-gray-600 mt-1">
              {pageData.nomePagina || 'Página selecionada'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Você é o <strong>proprietário</strong> desta página
            </p>
          </div>

          {isOwner && (
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
      </div>

      {/* Lista de colaboradores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Colaboradores Ativos ({collaborations.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando colaboradores...</p>
          </div>
        ) : collaborations.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum colaborador ainda</h3>
            <p className="text-gray-600 mb-4">
              Convide pessoas para colaborar na sua página profissional
            </p>
            {isOwner && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Convidar Primeiro Colaborador
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {collaborations.map((collaboration) => (
              <div key={collaboration.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {collaboration.collaboratorData?.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {collaboration.collaboratorData?.name || 'Nome não disponível'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {collaboration.collaboratorData?.email || 'Email não disponível'}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(collaboration.role)}`}>
                          {roleLabels[collaboration.role]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {roleDescriptions[collaboration.role]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCollaborator(collaboration)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Alterar Perfil
                      </button>
                      
                      <button
                        onClick={() => handleRemoveCollaborator(collaboration.id, collaboration.collaboratorData?.name)}
                        className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de convite */}
      {showInviteModal && (
        <CollaborationModal
          pageId={pageId}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
            loadCollaborations();
          }}
        />
      )}

      {/* Modal de edição de perfil */}
      {showEditModal && editingCollaborator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Alterar Perfil do Colaborador
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">
                  {editingCollaborator.collaboratorData?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingCollaborator.collaboratorData?.email}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Selecionar novo perfil:
                </label>
                {availableRoles.map((role) => (
                  <div key={role.value}>
                    <button
                      onClick={() => handleSaveEdit(role.value)}
                      className={`w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                        editingCollaborator.role === role.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{role.label}</p>
                          <p className="text-sm text-gray-600">{role.description}</p>
                        </div>
                        {editingCollaborator.role === role.value && (
                          <span className="text-blue-600">✓</span>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaboratorManager;
