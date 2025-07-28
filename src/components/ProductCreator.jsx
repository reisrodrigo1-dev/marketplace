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
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-2xl mt-8">
        <h2 className="text-3xl font-bold mb-8 text-blue-600 font-inter-bold">Editar Curso</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mb-8">
          <div>
            <label className="block font-bold mb-2 text-lg text-gray-800">Título do Curso</label>
            <input {...register('title')} className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-400 font-inter-medium" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block font-bold mb-2 text-lg text-gray-800">Descrição</label>
            <textarea {...register('description')} className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-400 font-inter-medium" rows={4} />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold mb-2 text-lg text-gray-800">Preço Riscado (R$)</label>
              <input type="number" step="0.01" min="0" {...register('priceOriginal')} className="w-full border-2 border-yellow-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-yellow-400 font-inter-medium" />
              {errors.priceOriginal && <p className="text-red-500 text-sm mt-1">{errors.priceOriginal.message}</p>}
            </div>
            <div>
              <label className="block font-bold mb-2 text-lg text-gray-800">Preço de Venda (R$)</label>
              <input type="number" step="0.01" min="0" {...register('priceSale')} className="w-full border-2 border-blue-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-blue-400 font-inter-medium" />
              {errors.priceSale && <p className="text-red-500 text-sm mt-1">{errors.priceSale.message}</p>}
            </div>
          </div>
          <div>
            <label className="block font-bold mb-2 text-lg text-gray-800">Imagem de Capa</label>
            <input type="file" accept="image/*" onChange={handleCoverChange} className="block" />
            {coverUrl && <img src={coverUrl} alt="Capa" className="mt-4 h-40 rounded-xl shadow-lg border-2 border-yellow-300 object-cover" />}
          </div>
          <div className="flex gap-4 mt-8">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition">Salvar Alterações</button>
            <button type="button" onClick={() => { setShowCreateForm(false); setEditCourse(null); reset(); setCoverUrl(''); }} className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-300 transition">Cancelar</button>
          </div>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </form>
        {/* Gerenciar módulos/seções do curso */}
        <CourseManager course={editCourse} onUpdateCourse={updated => {
          setEditCourse(updated);
          setCourses(prev => prev.map(c => c.id === updated.id ? updated : c));
        }} />
      </div>
    );
  }

  // Tela de listagem de cursos e botão criar/editar/excluir
  if (!showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Cursos</h1>
              <p className="text-gray-600 mt-1">Crie e gerencie seus cursos profissionais para venda</p>
            </div>
            <button onClick={() => { setShowCreateForm(true); setEditCourse(null); reset(); setCoverUrl(''); }} className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Novo Curso
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Cursos</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cursos Publicados</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'publicado').length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cursos em Rascunho</p>
                  <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'rascunho').length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Cursos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Seus Cursos</h2>
            </div>
            {courses.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum curso criado</h3>
                <p className="text-gray-600 mb-6">Crie seu primeiro curso para começar a vender.</p>
                <button onClick={() => { setShowCreateForm(true); setEditCourse(null); reset(); setCoverUrl(''); }} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Criar Curso
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {courses.map((course) => (
                  <div key={course.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {course.coverUrl ? (
                        <img src={course.coverUrl} alt={course.title} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">—</div>
                      )}
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.status === 'rascunho' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{course.status === 'rascunho' ? 'Rascunho' : 'Publicado'}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis'}}>{course.description}</p>
                        <div className="flex gap-2 mt-1">
                          {course.priceOriginal && (
                            <span className="text-gray-400 line-through">R$ {course.priceOriginal}</span>
                          )}
                          {course.priceSale && (
                            <span className="text-green-700 font-semibold">R$ {course.priceSale}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => handleEditCourse(course)} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200">
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
                        className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium font-bold transition ${course.status === 'publicado' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        title={course.status === 'publicado' ? 'Despublicar' : 'Publicar'}
                      >
                        {course.status === 'publicado' ? 'Despublicar' : 'Publicar'}
                      </button>
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

  // Formulário de criação/edição de curso
  return (
    <div className="max-w-3xl mx-auto bg-white p-12 rounded-2xl shadow-2xl mt-10 border border-blue-100">
      <h2 className="text-4xl font-bold mb-10 text-blue-600 font-inter-bold text-center">{editCourse ? 'Editar Curso' : 'Criar Novo Curso'}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div>
          <label htmlFor="course-title" className="block font-bold mb-3 text-xl text-gray-800 font-inter-bold">Título do Curso</label>
          <input
            id="course-title"
            {...register('title')}
            className="w-full border-2 border-blue-300 rounded-xl px-5 py-4 text-xl focus:ring-2 focus:ring-blue-400 font-inter-medium bg-blue-50 placeholder:text-blue-300"
            placeholder="Ex: Direito Empresarial na Prática"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'course-title-error' : undefined}
          />
          {errors.title && <p id="course-title-error" className="text-red-500 text-base mt-2">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block font-bold mb-3 text-xl text-gray-800 font-inter-bold">Descrição</label>
          <textarea {...register('description')} className="w-full border-2 border-blue-300 rounded-xl px-5 py-4 text-xl focus:ring-2 focus:ring-blue-400 font-inter-medium bg-blue-50 placeholder:text-blue-300" rows={4} placeholder="Descreva o conteúdo e objetivo do curso..." />
          {errors.description && <p className="text-red-500 text-base mt-2">{errors.description.message}</p>}
        </div>
        <div>
          <label className="block font-bold mb-3 text-xl text-gray-800 font-inter-bold">Imagem de Capa</label>
          <input type="file" accept="image/*" onChange={handleCoverChange} className="block" />
          {coverUrl && <img src={coverUrl} alt="Capa" className="mt-6 h-48 rounded-xl shadow-lg border-2 border-yellow-300 object-cover mx-auto" />}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-bold mb-3 text-xl text-gray-800 font-inter-bold">Preço Riscado (R$)</label>
            <input type="number" step="0.01" min="0" {...register('priceOriginal')} className="w-full border-2 border-yellow-300 rounded-xl px-5 py-4 text-xl focus:ring-2 focus:ring-yellow-400 font-inter-medium bg-yellow-50 placeholder:text-yellow-300" placeholder="Ex: 499.90" />
            {errors.priceOriginal && <p className="text-red-500 text-base mt-2">{errors.priceOriginal.message}</p>}
          </div>
          <div>
            <label className="block font-bold mb-3 text-xl text-gray-800 font-inter-bold">Preço de Venda (R$)</label>
            <input type="number" step="0.01" min="0" {...register('priceSale')} className="w-full border-2 border-blue-300 rounded-xl px-5 py-4 text-xl focus:ring-2 focus:ring-blue-400 font-inter-medium bg-blue-50 placeholder:text-blue-300" placeholder="Ex: 299.90" />
            {errors.priceSale && <p className="text-red-500 text-base mt-2">{errors.priceSale.message}</p>}
          </div>
        </div>
        <div className="flex gap-6 mt-10 justify-center">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-xl shadow hover:bg-blue-700 transition">{editCourse ? 'Salvar Alterações' : 'Avançar'}</button>
          <button type="button" onClick={() => { setShowCreateForm(false); setEditCourse(null); reset(); setCoverUrl(''); }} className="bg-gray-200 text-gray-700 px-10 py-4 rounded-2xl font-bold text-xl shadow hover:bg-gray-300 transition">Cancelar</button>
        </div>
        {error && <p className="text-red-500 mt-4 text-center text-lg">{error}</p>}
      </form>
    </div>
  );
}
