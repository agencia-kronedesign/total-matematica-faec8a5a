
import React from 'react';

const VideoConferenceRequest: React.FC = () => {
  return (
    <section className="py-12 px-4 bg-totalYellow">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold text-totalBlue mb-6">
          Solicite uma videoconferência ou visita de um representante!
        </h2>
        
        <form className="max-w-md mx-auto space-y-4">
          <input 
            type="text" 
            placeholder="Nome" 
            className="w-full px-4 py-2 rounded border-none" 
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full px-4 py-2 rounded border-none" 
          />
          <div className="flex items-center justify-center space-x-2">
            <input 
              id="terms" 
              type="checkbox" 
              className="rounded border-gray-300" 
            />
            <label htmlFor="terms" className="text-sm text-totalBlue">
              Aceito os termos de uso
            </label>
          </div>
          <button className="bg-totalBlue text-white font-semibold py-2 px-8 rounded hover:bg-blue-900 transition-colors">
            Vamos conversar!
          </button>
        </form>
      </div>
    </section>
  );
};

export default VideoConferenceRequest;
