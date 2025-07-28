
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import CourseManager from './CourseManager';

const courseSchema = z.object({
  title: z.string().min(3, 'Título obrigatório'),
  description: z.string().min(10, 'Descrição obrigatória'),
  cover: z.any().optional(),
  priceOriginal: z.coerce.number().min(0, 'Preço riscado obrigatório'),
  priceSale: z.coerce.number().min(0, 'Preço de venda obrigatório'),
});

export default function ProductCreator({ faseada }) {
  const { user } = useAuth();
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdCourse, setCreatedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [editCourse, setEditCourse] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm({
    resolver: zodResolver(courseSchema),
  });

  async function onSubmit(data) {
    setLoading(true);
    setError('');
    try {
      let imageUrl = '';
      if (data.cover && data.cover[0]) {
        const storage = getStorage();
        const storageRef = ref(storage, `courses/covers/${Date.now()}_${data.cover[0].name}`);
        await uploadBytes(storageRef, data.cover[0]);
        imageUrl = await getDownloadURL(storageRef);
      }
      const db = getFirestore();
      if (editCourse) {
        // Editar curso existente, salvando tudo
        const courseRef = doc(db, 'courses', editCourse.id);
        await updateDoc(courseRef, {
          ...editCourse,
          title: data.title,
          description: data.description,
          coverUrl: imageUrl || editCourse.coverUrl,
          priceOriginal: data.priceOriginal,
          priceSale: data.priceSale,
          userId: user?.uid || editCourse.userId || '',
        });
        setCourses((prev) => prev.map(c => c.id === editCourse.id ? { ...editCourse, title: data.title, description: data.description, coverUrl: imageUrl || editCourse.coverUrl, priceOriginal: data.priceOriginal, priceSale: data.priceSale, userId: user?.uid || editCourse.userId || '' } : c));
        setEditCourse(null);
      } else {
        // Criar novo curso completo
        const newCourseObj = {
          title: data.title,
          description: data.description,
          coverUrl: imageUrl,
          priceOriginal: data.priceOriginal,
          priceSale: data.priceSale,
          status: 'rascunho',
          sections: [],
          createdAt: new Date(),
          userId: user?.uid || '',
        };
        const docRef = await addDoc(collection(db, 'courses'), newCourseObj);
        const newCourse = {
          id: docRef.id,
          ...newCourseObj,
        };
        setCreatedCourse(newCourse);
        setCourses((prev) => [...prev, newCourse]);
      }
      reset();
      setCoverUrl('');
      setShowCreateForm(false);
    } catch (err) {
      setError('Erro ao salvar curso. Tente novamente.');
    }
    setLoading(false);
  }
  // Excluir curso
  async function handleDeleteCourse(id) {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;
    setLoading(true);
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'courses', id));
      setCourses((prev) => prev.filter(c => c.id !== id));
    } catch (err) {
      setError('Erro ao excluir curso.');
    }
    setLoading(false);
  }
  // Iniciar edição de curso
  function handleEditCourse(course) {
    setEditCourse(course);
    setShowCreateForm(true);
    setValue('title', course.title);
    setValue('description', course.description);
    setValue('priceOriginal', course.priceOriginal ?? '');
    setValue('priceSale', course.priceSale ?? '');
    setCoverUrl(course.coverUrl || '');
  }


  function handleCoverChange(e) {
    const file = e.target.files[0];
    if (file) {
      setCoverUrl(URL.createObjectURL(file));
      setValue('cover', e.target.files);
    }
  }

  // Buscar cursos criados ao abrir
  useEffect(() => {
    async function fetchCourses() {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setCourses(list);
    }
    fetchCourses();
  }, []);

  // Se estiver editando, mostrar CourseManager para módulos
  if (editCourse) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header com breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <button 
                onClick={() => { setShowCreateForm(false); setEditCourse(null); reset(); setCoverUrl(''); }}
                className="hover:text-blue-600 transition-colors"
              >
                Meus Cursos
              </button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">Editar Curso</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">Editar Curso</h1>
            <p className="text-gray-600 mt-2">Configure os detalhes básicos e gerencie o conteúdo do seu curso</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário Principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  Informações Básicas
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Título do Curso *
                    </label>
                    <input 
                      {...register('title')} 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400"
                      placeholder="Ex: Direito Empresarial Completo"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Descrição *
                    </label>
                    <textarea 
                      {...register('description')} 
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Descreva o que os alunos aprenderão neste curso..."
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Preço Original (R$) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          {...register('priceOriginal')} 
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-gray-900"
                          placeholder="0,00"
                        />
                      </div>
                      {errors.priceOriginal && <p className="text-red-500 text-sm mt-2">{errors.priceOriginal.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Preço Promocional (R$) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">R$</span>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          {...register('priceSale')} 
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors text-gray-900"
                          placeholder="0,00"
                        />
                      </div>
                      {errors.priceSale && <p className="text-red-500 text-sm mt-2">{errors.priceSale.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Imagem de Capa
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                      {coverUrl ? (
                        <div className="space-y-4">
                          <img src={coverUrl} alt="Capa" className="mx-auto h-32 w-48 object-cover rounded-lg shadow-md" />
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">Imagem selecionada</p>
                            <label className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              Alterar imagem
                              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="cursor-pointer block">
                          <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-600 font-medium">Clique para fazer upload</p>
                              <p className="text-sm text-gray-500">PNG, JPG até 5MB</p>
                            </div>
                          </div>
                          <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button 
                      type="submit" 
                      disabled={loading} 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alterações'
                      )}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setShowCreateForm(false); setEditCourse(null); reset(); setCoverUrl(''); }} 
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                  {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                </form>
              </div>
            </div>

            {/* Sidebar com preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  Status do Curso
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${editCourse?.status === 'publicado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {editCourse?.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Seções</span>
                    <span className="text-sm font-medium text-gray-900">{editCourse?.sections?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Dica Pro</h4>
                  <p className="text-sm text-gray-600">
                    Após salvar as informações básicas, você poderá adicionar seções e aulas ao seu curso.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gerenciar módulos/seções do curso */}
          <div className="mt-8">
            <CourseManager course={editCourse} onUpdateCourse={updated => {
              setEditCourse(updated);
              setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
            }} />
          </div>
        </div>
      </div>
    );
  }

  // Tela de listagem de cursos e botão criar/editar/excluir
  if (!showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header melhorado */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Meus Cursos</h1>
                <p className="text-blue-100 text-lg">Crie e gerencie seus cursos profissionais para transformar conhecimento em renda</p>
              </div>
              <button 
                onClick={() => { setShowCreateForm(true); setEditCourse(null); reset(); setCoverUrl(''); }} 
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all flex items-center shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Novo Curso
              </button>
            </div>
          </div>

          {/* Stats Cards melhorados */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Cursos</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Publicados</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'publicado').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'rascunho').length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Receita Total</p>
                  <p className="text-2xl font-bold text-gray-900">R$ 0,00</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Cursos melhorada */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-8 py-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Seus Cursos</h2>
              <p className="text-gray-600 mt-1">Gerencie e acompanhe o desempenho dos seus cursos</p>
            </div>
            
            {courses.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Crie seu primeiro curso</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Transforme seu conhecimento em uma fonte de renda. Crie cursos profissionais e alcance milhares de alunos.
                </p>
                <button 
                  onClick={() => { setShowCreateForm(true); setEditCourse(null); reset(); setCoverUrl(''); }} 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Criar Meu Primeiro Curso
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <div key={course.id} className="p-8 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          {course.coverUrl ? (
                            <img 
                              src={course.coverUrl} 
                              alt={course.title} 
                              className="w-20 h-20 rounded-xl object-cover shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <span className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            course.status === 'publicado' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {course.status === 'publicado' ? '✓' : '●'}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">{course.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              course.status === 'rascunho' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {course.status === 'rascunho' ? 'Rascunho' : 'Publicado'}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                          <div className="flex items-center space-x-4">
                            {course.priceOriginal && (
                              <span className="text-gray-400 line-through text-lg">R$ {course.priceOriginal}</span>
                            )}
                            {course.priceSale && (
                              <span className="text-green-600 font-bold text-xl">R$ {course.priceSale}</span>
                            )}
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              {course.sections?.length || 0} seções
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleEditCourse(course)} 
                          className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        
                        <button 
                          onClick={() => handleDeleteCourse(course.id)} 
                          className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Excluir
                        </button>
                        
                        <button
                          onClick={async () => {
                            const db = getFirestore();
                            const newStatus = course.status === 'publicado' ? 'rascunho' : 'publicado';
                            await updateDoc(doc(db, 'courses', course.id), { status: newStatus });
                            setCourses(prev => prev.map(c => c.id === course.id ? { ...c, status: newStatus } : c));
                          }}
                          className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                            course.status === 'publicado' 
                              ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {course.status === 'publicado' ? (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                              Despublicar
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Publicar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Formulário de criação de curso melhorado
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com navegação */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <button 
              onClick={() => { setShowCreateForm(false); setEditCourse(null); reset(); setCoverUrl(''); }}
              className="hover:text-blue-600 transition-colors"
            >
              Meus Cursos
            </button>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">Criar Novo Curso</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Criar Novo Curso</h1>
          <p className="text-gray-600">Compartilhe seu conhecimento e crie uma nova fonte de renda</p>
        </div>

        {/* Formulário Principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Vamos criar seu curso</h2>
            <p className="text-gray-600">Preencha as informações básicas para começar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <label htmlFor="course-title" className="block text-sm font-semibold text-gray-800 mb-3">
                Qual é o título do seu curso? *
              </label>
              <input
                id="course-title"
                {...register('title')}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-0 transition-colors placeholder-gray-400"
                placeholder="Ex: Direito Empresarial na Prática - Do Básico ao Avançado"
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title.message}
              </p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Descreva o que os alunos aprenderão *
              </label>
              <textarea 
                {...register('description')} 
                rows={5}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-0 transition-colors resize-none placeholder-gray-400"
                placeholder="Explique os objetivos do curso, o que os alunos aprenderão e como isso pode ajudá-los profissionalmente..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.description.message}
              </p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-3">
                Adicione uma imagem de capa atrativa
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors bg-gray-50">
                {coverUrl ? (
                  <div className="space-y-4">
                    <img src={coverUrl} alt="Capa" className="mx-auto h-40 w-60 object-cover rounded-xl shadow-lg" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Imagem selecionada</p>
                      <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Alterar Imagem
                        <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="space-y-4">
                      <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">Clique para fazer upload da capa</p>
                        <p className="text-sm text-gray-500">PNG, JPG ou GIF até 5MB</p>
                        <p className="text-xs text-gray-400 mt-1">Recomendado: 1280x720 pixels</p>
                      </div>
                    </div>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Defina o preço do seu curso
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Preço Original (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-lg">R$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      {...register('priceOriginal')} 
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl text-lg focus:border-blue-500 focus:ring-0 transition-colors"
                      placeholder="499,90"
                    />
                  </div>
                  {errors.priceOriginal && <p className="text-red-500 text-sm mt-2">{errors.priceOriginal.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Preço Promocional (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600 font-semibold text-lg">R$</span>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      {...register('priceSale')} 
                      className="w-full pl-12 pr-4 py-4 border-2 border-green-200 rounded-xl text-lg focus:border-green-500 focus:ring-0 transition-colors"
                      placeholder="299,90"
                    />
                  </div>
                  {errors.priceSale && <p className="text-red-500 text-sm mt-2">{errors.priceSale.message}</p>}
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-3 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                O preço promocional será destacado para atrair mais alunos
              </p>
            </div>

            <div className="flex gap-4 pt-8 border-t border-gray-200">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Criando curso...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Criar Curso
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => { setShowCreateForm(false); setEditCourse(null); reset(); setCoverUrl(''); }} 
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
            {error && <p className="text-red-500 text-center mt-4 flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>}
          </form>
        </div>
      </div>
    </div>
  );
}
