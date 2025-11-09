import React, { useState } from 'react';
// FIX: Corrected typo from RESPONSIBLE_AI_PRINCIPIPLES to RESPONSIBLE_AI_PRINCIPLES.
import { RESPONSIBLE_AI_PRINCIPLES } from './constants';
import InfographicCard from './components/InfographicCard';
import LiveChat from './components/LiveChat';

function App() {
  const [showLiveChat, setShowLiveChat] = useState(false);

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

      {/* Live Chat Section */}
      <section className="mt-16 text-center">
        <button
          onClick={() => setShowLiveChat(!showLiveChat)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-expanded={showLiveChat}
          aria-controls="live-chat-panel"
        >
          {showLiveChat ? 'Close AI Conversation' : 'Start AI Conversation'}
        </button>
        {showLiveChat && (
          <div id="live-chat-panel" className="mt-8">
            <LiveChat />
          </div>
        )}
      </section>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>
          © 2025 Responsible AI Infographic. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default App;