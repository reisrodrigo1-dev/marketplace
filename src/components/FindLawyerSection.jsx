import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, MapPin, Scale, ArrowRight } from 'lucide-react';

const FindLawyerSection = () => {
  const navigate = useNavigate();

  const handleFindLawyer = () => {
    navigate('/encontrar-advogado');
  };

  const features = [
    {
      icon: <Search className="w-6 h-6" />,
      title: "Busca Especializada",
      description: "Encontre advogados por área de especialização"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Profissionais Qualificados",
      description: "Todos os advogados são verificados e qualificados"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Localização",
      description: "Filtre por cidade e região de sua preferência"
    },
    {
      icon: <Scale className="w-6 h-6" />,
      title: "Transparência",
      description: "Informações claras sobre experiência e especialidades"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Precisa de Assistência Jurídica?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Conecte-se com advogados especialistas de todo o Brasil. Nossa plataforma reúne 
            profissionais qualificados em todas as áreas do direito.
          </p>
          
          {/* Botão Principal */}
          <div className="mb-12">
            <button
              onClick={handleFindLawyer}
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Search className="w-6 h-6" />
              Encontre um Advogado Especialista
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Advogados Cadastrados</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Especialidades Jurídicas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600">Consultas Realizadas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FindLawyerSection;
