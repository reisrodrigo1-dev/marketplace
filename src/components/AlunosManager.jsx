import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { salesPageService } from '../firebase/salesPageService';
import { alunoService } from '../firebase/alunoService';
import { getAuth, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import Modal from './Modal';

export default function AlunosManager() {
  const { user } = useAuth();
  const [salesPages, setSalesPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPages, setLoadingPages] = useState(true);
  const [editingAluno, setEditingAluno] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    dataNascimento: '',
    endereco: ''
  });

  // Carregar páginas de vendas do usuário
  useEffect(() => {
    async function fetchPages() {
      if (!user?.uid) return;

      setLoadingPages(true);
      try {
        const result = await salesPageService.getUserSalesPages(user.uid);
        if (result.success) {
          setSalesPages(result.data);
          if (result.data.length > 0) {
            setSelectedPageId(result.data[0].id);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar páginas:', error);
      } finally {
        setLoadingPages(false);
      }
    }

    fetchPages();
  }, [user]);

  // Carregar alunos quando a página é selecionada
  useEffect(() => {
    async function fetchAlunos() {
      if (!selectedPageId) {
        setAlunos([]);
        return;
      }

      setLoading(true);
      try {
        const result = await alunoService.getAlunosUnicosPorPagina(selectedPageId);
        if (result.success) {
          setAlunos(result.data);
        }
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAlunos();
  }, [selectedPageId]);

  const handleResetPassword = async (email) => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      alert(`E-mail de redefinição de senha enviado para ${email}`);
    } catch (error) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      alert('Erro ao enviar e-mail de redefinição de senha. Verifique se o e-mail está correto.');
    }
  };

  const handleEditAluno = (aluno) => {
    setEditingAluno(aluno);
    setFormData({
      nome: aluno.nome || '',
      email: aluno.email || '',
      telefone: aluno.telefone || '',
      cpf: aluno.cpf || '',
      dataNascimento: aluno.dataNascimento || '',
      endereco: aluno.endereco || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAluno) return;

    try {
      // Atualizar informações do aluno no Firestore
      const userRef = doc(db, 'users', editingAluno.alunoId);
      const dadosAtualizados = {
        name: formData.nome,
        telefone: formData.telefone,
        cpf: formData.cpf,
        dataNascimento: formData.dataNascimento,
        endereco: formData.endereco
      };
      await updateDoc(userRef, {
        ...dadosAtualizados,
        updatedAt: new Date()
      });

      // Atualizar a lista local
      setAlunos(prev => prev.map(aluno => 
        aluno.alunoId === editingAluno.alunoId 
          ? { ...aluno, nome: formData.nome, telefone: formData.telefone, cpf: formData.cpf, dataNascimento: formData.dataNascimento, endereco: formData.endereco }
          : aluno
      ));

      setShowEditModal(false);
      setEditingAluno(null);
      alert('Informações do aluno atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      alert('Erro ao atualizar informações do aluno.');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  if (loadingPages) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando páginas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Alunos</h1>
          <p className="text-gray-600">
            Gerencie os alunos matriculados em suas páginas de vendas
          </p>
        </div>

        {/* Filtro de Páginas */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="page-select" className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Página de Vendas:
              </label>
              <select
                id="page-select"
                value={selectedPageId}
                onChange={(e) => setSelectedPageId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma página...</option>
                {salesPages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.nomePagina || page.titulo || 'Página sem nome'}
                  </option>
                ))}
              </select>
            </div>

            {selectedPageId && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">{alunos.length}</span> aluno(s) cadastrado(s)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Alunos */}
        {selectedPageId && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Alunos Cadastrados</h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando alunos...</p>
              </div>
            ) : alunos.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">Nenhum aluno cadastrado nesta página ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E-mail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CPF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data de Nascimento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cursos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Primeiro Acesso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alunos.map((aluno) => (
                      <tr key={aluno.alunoId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-sm font-medium">
                                {aluno.nome?.charAt(0)?.toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {aluno.nome || 'Nome não informado'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{aluno.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {aluno.telefone || 'Não informado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {aluno.cpf || 'Não informado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {aluno.dataNascimento || 'Não informado'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {aluno.totalCursos} curso(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(aluno.primeiroAcesso)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleEditAluno(aluno)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => handleResetPassword(aluno.email)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3.053 0-5.789-2.131-6.5-5M15 7a2 2 0 00-2 2m2-2v5a2 2 0 01-2 2M9 7v5a2 2 0 002 2m0-8a2 2 0 012-2m-2 2a2 2 0 00-2 2m0 0v5a2 2 0 002 2M9 7a2 2 0 012-2M9 7a2 2 0 00-2 2m2 2v5" />
                            </svg>
                            Reset Senha
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal de Edição */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Aluno">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do aluno"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                placeholder="E-mail do aluno"
              />
              <p className="text-xs text-gray-500 mt-1">
                O e-mail não pode ser alterado por questões de segurança
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Telefone do aluno"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <input
                type="text"
                value={formData.cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="CPF do aluno"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, dataNascimento: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <textarea
                value={formData.endereco}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Endereço completo do aluno"
                rows="3"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}