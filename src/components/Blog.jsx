import React from 'react';

const Blog = () => {
  const posts = [
    {
      category: "Novidades na prática",
      title: "Revisão da vida toda",
      excerpt: "O STF decidiu que a revisão das aposentadorias...",
      date: "15 Jul 2025",
      image: "/src/assets/blog-1.svg"
    },
    {
      category: "Como se faz...",
      title: "Ação revisão planos de saúde",
      excerpt: "É possível a propositura de medidas com o objetivo de rever os valores...",
      date: "14 Jul 2025",
      image: "/src/assets/blog-2.svg"
    },
    {
      category: "Jurisprudência",
      title: "Novos precedentes em direito digital",
      excerpt: "Análise das principais decisões sobre proteção de dados...",
      date: "13 Jul 2025",
      image: "/src/assets/blog-3.svg"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Blog
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Mantenha-se atualizado com as últimas novidades do direito
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <article 
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-gray-500 text-sm ml-auto">
                    {post.date}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                
                <div className="text-blue-600 font-medium text-sm group-hover:underline">
                  Ler mais →
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Ver todos os posts
          </button>
        </div>
      </div>
    </section>
  );
};

export default Blog;
