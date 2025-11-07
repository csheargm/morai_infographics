import React from 'react';
import { RESPONSIBLE_AI_PRINCIPLES } from './constants';
import InfographicCard from './components/InfographicCard';

function App() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-indigo-800 leading-tight">
          Responsible AI: Core Principles
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
          Ensuring artificial intelligence is developed and used in ways that are ethical, transparent, and aligned with human values, guided by 8 core principles.
        </p>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {RESPONSIBLE_AI_PRINCIPLES.map((principle) => (
          <InfographicCard key={principle.id} principle={principle} />
        ))}
      </main>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>
          © 2024 Responsible AI Infographic. All rights reserved. <br />
          Developed in collaboration with the MORAI (Multicultural Open Responsible AI) Working Group. <br />
          Learn more at <a href="https://github.com/aivisionforum/ai-ethics-governance" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">aivisionforum/ai-ethics-governance</a>
        </p>
      </footer>
    </div>
  );
}

export default App;