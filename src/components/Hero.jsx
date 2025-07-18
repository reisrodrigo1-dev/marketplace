import React from 'react';

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden" style={{background: 'linear-gradient(to bottom right, #001a7f, #0048aa, #000)'}}>
      {/* Background Video */}
      <div className="absolute inset-0 opacity-30">
        <video 
          src="/videos/video_1_direitoHub_HOME.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
            <img 
              src="/logo_direitoHub_Branco.png" 
              alt="DireitoHub" 
              className="h-32 w-auto mx-auto"
            />
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32" style={{background: 'linear-gradient(to top, #f1f1f1, transparent)'}}></div>
    </section>
  );
};

export default Hero;
