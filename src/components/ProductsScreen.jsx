import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../firebase/productService';

export default function ProductsScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (user?.uid) {
        const result = await productService.getUserProducts(user.uid);
        if (result.success) setProducts(result.data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Carregando produtos...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">Meus Produtos</h1>
            <p className="text-gray-600 mt-1">Gerencie os produtos que você cadastrou para venda</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700">Novo Produto</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-blue-50 border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-4">Produtos para Venda</h2>
          <p className="text-lg text-gray-600 mb-2">Visualize, edite e organize seus produtos de forma profissional.</p>
        </div>
      </section>

      {/* Produtos */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {products.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <h2 className="text-lg font-semibold text-yellow-800">Nenhum produto cadastrado</h2>
            <p className="text-gray-500 mt-2">Cadastre produtos para começar a vender.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(prod => (
              <div key={prod.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col justify-between hover:shadow-xl transition-shadow">
                <div>
                  <h3 className="text-xl font-bold text-blue-700 mb-2">{prod.nome || prod.titulo}</h3>
                  <p className="text-gray-600 mb-3">{prod.descricao}</p>
                  {prod.preco && (
                    <p className="text-green-700 font-semibold mb-2">Preço: R$ {prod.preco}</p>
                  )}
                </div>
                <div className="flex gap-2 mt-6">
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700">Editar</button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700">Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-10">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Meus Produtos. Todos os direitos reservados.</p>
          <p className="text-gray-400 mt-2 text-sm">Página criada com DireitoHub</p>
        </div>
      </footer>
    </div>
  );
}
