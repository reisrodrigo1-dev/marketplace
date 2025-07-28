
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { lawyerPageService } from '../firebase/firestore';

const SalesPageDebug = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [testSlug, setTestSlug] = useState('vendas-debug-');
  const [testResult, setTestResult] = useState(null);

  const loadUserPages = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await lawyerPageService.getUserPages(user.uid);
      if (result.success) {
        setPages(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSlugSearch = async () => {
    setLoading(true);
    try {
      console.log('🔍 Testando slug:', testSlug);
      const result = await lawyerPageService.getPageBySlug(testSlug);
      console.log('📄 Resultado:', result);
      setTestResult(result);
    } catch (error) {
      console.error('Erro no teste:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserPages();
  }, [user]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Debug Página de Vendas</h2>
      <button onClick={loadUserPages} className="mb-4 px-3 py-1 bg-blue-500 text-white rounded">Recarregar Páginas</button>
      {loading && <p>Carregando...</p>}
      <ul className="mb-6">
        {pages.map(page => (
          <li key={page.id} className="border-b py-2">{page.nomePagina || page.id}</li>
        ))}
      </ul>
      <div className="mb-6">
        <label className="block mb-2 font-medium">Testar Slug:</label>
        <input type="text" value={testSlug} onChange={e => setTestSlug(e.target.value)} className="border px-2 py-1 rounded w-full mb-2" />
        <button onClick={testSlugSearch} className="px-3 py-1 bg-yellow-500 text-white rounded">Testar</button>
      </div>
      {testResult && (
        <div className="mb-6">
          <h3 className="font-semibold">Resultado:</h3>
          {testResult.success ? (
            <div>
              <h4 className="font-medium text-green-800">✅ Sucesso</h4>
              <pre className="bg-green-50 p-2 rounded text-xs">{JSON.stringify(testResult.data, null, 2)}</pre>
            </div>
          ) : (
            <div>
              <h4 className="font-medium text-red-800">❌ Erro</h4>
              <p className="text-sm text-red-600">{testResult.error}</p>
            </div>
          )}
        </div>
      )}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>💡 Dica:</strong> Abra o Console do navegador (F12) para ver logs detalhados.
        </p>
      </div>
    </div>
  );
};

export default SalesPageDebug;
