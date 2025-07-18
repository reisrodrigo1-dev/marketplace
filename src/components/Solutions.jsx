import React from 'react';

const Solutions = () => {
  const solutions = [
    {
      title: "SISTEMAS",
      description: "Sistemas jurídicos modernos e eficientes",
      icon: "🖥️",
      href: "#sistemas"
    },
    {
      title: "COMO SE FAZ",
      description: "Tutoriais práticos para advogados",
      icon: "📚",
      href: "#como-se-faz"
    },
    {
      title: "SITES PROFISSIONAIS",
      description: "Sites personalizados para escritórios",
      icon: "🌐",
      href: "#sites"
    },
    {
      title: "MENTORIAS",
      description: "Orientação especializada",
      icon: "👨‍🏫",
      href: "#mentorias"
    },
    {
      title: "INTELIGÊNCIA ARTIFICIAL",
      description: "IA aplicada ao direito",
      icon: "🤖",
      href: "#ia"
    },
    {
      title: "PRECEDENTES",
      description: "Base de precedentes jurídicos",
      icon: "⚖️",
      href: "#precedentes"
    },
    {
      title: "SERVIÇOS DE APOIO",
      description: "Suporte completo para sua advocacia",
      icon: "🤝",
      href: "#servicos"
    },
    {
      title: "BANCO DE OPORTUNIDADES",
      description: "Conecte-se com clientes",
      icon: "💼",
      href: "#oportunidades"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nossas Soluções
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ferramentas e serviços especializados para potencializar sua prática jurídica
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {solutions.map((solution, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer group"
            >
              <div className="text-4xl mb-4">{solution.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                {solution.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {solution.description}
              </p>
              <div className="mt-4 text-blue-600 font-medium text-sm group-hover:underline">
                Saiba mais →
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
