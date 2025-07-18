import React from 'react';
import { useParams, useLocation } from 'react-router-dom';

const RouteTest = () => {
  const { slug } = useParams();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🧪 Teste de Roteamento</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold text-blue-900">📍 Informações da Rota</h2>
            <p className="text-sm text-blue-800 mt-2">
              <strong>Slug capturado:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{slug || 'undefined'}</code>
            </p>
            <p className="text-sm text-blue-800">
              <strong>Pathname:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{location.pathname}</code>
            </p>
            <p className="text-sm text-blue-800">
              <strong>Search:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{location.search}</code>
            </p>
            <p className="text-sm text-blue-800">
              <strong>Hash:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{location.hash}</code>
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-semibold text-green-900">✅ Roteamento Funcionando</h2>
            <p className="text-sm text-green-800 mt-2">
              Se você está vendo esta página, o roteamento do React Router está funcionando corretamente.
              O problema pode estar na busca dos dados no Firebase.
            </p>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="font-semibold text-yellow-900">🔧 Próximos Passos</h2>
            <div className="text-sm text-yellow-800 mt-2 space-y-2">
              <p>1. Verifique se a página existe no banco: <a href="/debug-paginas" className="text-blue-600 underline">/debug-paginas</a></p>
              <p>2. Confirme se o slug está correto: <code className="bg-yellow-100 px-1 rounded">{slug}</code></p>
              <p>3. Verifique os logs do console para mais detalhes</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              🏠 Voltar ao Início
            </button>
            <button
              onClick={() => window.location.href = '/debug-paginas'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              🐛 Debug de Páginas
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🔄 Recarregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteTest;
