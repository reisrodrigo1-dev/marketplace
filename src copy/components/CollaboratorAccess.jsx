import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collaborationService, lawyerPageService } from '../firebase/firestore';

const CollaboratorAccess = ({ onPageSelect }) => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (user) {
      loadCollaborations();
    }
  }, [user]);

  const loadCollaborations = async () => {
    setLoading(true);
    try {
      const result = await collaborationService.getCollaboratorAccess(user.uid);
      
      if (result.success) {
        // Para cada colaboração, buscar dados da página
        const collaborationsWithPages = await Promise.all(
          result.data.map(async (collaboration) => {
            const pageResult = await lawyerPageService.getPageById(collaboration.pageId);
            return {
              ...collaboration,
              pageData: pageResult.success ? pageResult.data : null
            };
          })
        );
        
        setCollaborations(collaborationsWithPages);
      } else {
        console.error('Erro ao carregar acessos como colaborador:', result.error);
      }
    } catch (error) {
      console.error('Erro ao carregar acessos como colaborador:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCollaboration = async (collaborationId) => {
    if (!confirm('Tem certeza que deseja sair desta colaboração?')) {
      return;
    }

    try {
      const result = await collaborationService.removeCollaboration(collaborationId, user.uid);
      
      if (result.success) {
        await loadCollaborations();
      } else {
        alert('Erro ao sair da colaboração: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao sair da colaboração:', error);
      alert('Erro ao sair da colaboração');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (collaborations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Páginas Colaborativas
        </h3>
        <div className="text-center py-8">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma colaboração ativa
          </h4>
          <p className="text-gray-600">
            Você ainda não foi convidado para colaborar em nenhuma página
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Páginas Colaborativas ({collaborations.length})
      </h3>

      <div className="space-y-4">
        {collaborations.map((collaboration) => (
          <div
            key={collaboration.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {collaboration.pageData?.title?.charAt(0)?.toUpperCase() || 
                       collaboration.pageData?.specialization?.charAt(0)?.toUpperCase() || 
                       '?'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {collaboration.pageData?.title || collaboration.pageData?.specialization || 'Página sem título'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Página de <strong>{collaboration.ownerData?.name || 'Nome não disponível'}</strong>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500">SEU CARGO:</span>
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
                
                <div className="text-xs text-gray-500">
                  Colaborando desde {collaboration.createdAt?.toLocaleDateString('pt-BR')}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onPageSelect && onPageSelect(collaboration.pageId, collaboration.permissions)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Acessar
                </button>
                <button
                  onClick={() => handleLeaveCollaboration(collaboration.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sair da colaboração"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaboratorAccess;
