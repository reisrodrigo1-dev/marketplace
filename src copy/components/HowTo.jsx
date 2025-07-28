import React from 'react';

const HowTo = () => {
  const videos = [
    {
      id: 1,
      title: "Como elaborar uma petição inicial",
      thumbnail: "/src/assets/video-1.svg",
      duration: "12:34"
    },
    {
      id: 2,
      title: "Estratégias de defesa em processos trabalhistas",
      thumbnail: "/src/assets/video-2.svg",
      duration: "18:45"
    },
    {
      id: 3,
      title: "Organização de escritório jurídico",
      thumbnail: "/src/assets/video-3.svg",
      duration: "15:22"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Como fazer
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Aprenda com nossos tutoriais práticos e melhore sua prática jurídica
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.map((video) => (
            <div 
              key={video.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden cursor-pointer group"
            >
              <div className="relative">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white rounded-full p-4 shadow-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {video.title}
                </h3>
                
                <div className="mt-4 text-blue-600 font-medium text-sm group-hover:underline">
                  Assistir agora →
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Ver todos os vídeos
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowTo;
