import React, { useState, useRef, useCallback } from 'react';
import { RESPONSIBLE_AI_PRINCIPLES } from './constants';
import InfographicCard from './components/InfographicCard';
import LiveChat from './components/LiveChat';
import PrincipleDetailPopover from './components/PrincipleDetailPopover';
import DeepDiveChatModal from './components/DeepDiveChatModal'; // New import
import { Principle } from './types';

function App() {
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [hoveredPrincipleInfo, setHoveredPrincipleInfo] = useState<{ principle: Principle, rect: DOMRect } | null>(null);
  const [showDeepDiveChat, setShowDeepDiveChat] = useState(false); // New state for deep dive modal
  const [selectedDeepDivePrinciple, setSelectedDeepDivePrinciple] = useState<Principle | null>(null); // New state for deep dive principle
  const dismissTimeoutRef = useRef<number | null>(null); // Ref to store timeout ID

  // Function to clear the dismissal timeout
  const clearTimeoutHandler = useCallback(() => {
    if (dismissTimeoutRef.current) {
      clearTimeout(dismissTimeoutRef.current);
      dismissTimeoutRef.current = null;
    }
  }, []);

  // Handler for when mouse enters a card
  const handleCardMouseEnter = useCallback((principle: Principle, rect: DOMRect) => {
    clearTimeoutHandler(); // Clear any pending dismissal
    setHoveredPrincipleInfo({ principle, rect });
  }, [clearTimeoutHandler]);

  // Handler for when mouse leaves a card
  const handleCardMouseLeave = useCallback(() => {
    dismissTimeoutRef.current = window.setTimeout(() => {
      setHoveredPrincipleInfo(null);
      dismissTimeoutRef.current = null;
    }, 100); // Small delay to allow mouse to move to popover
  }, []);

  // Handler for when mouse enters the popover
  const handlePopoverMouseEnter = useCallback(() => {
    clearTimeoutHandler(); // Prevent popover from dismissing if mouse enters it
  }, [clearTimeoutHandler]);

  // Handler for when mouse leaves the popover (or explicit close)
  const handlePopoverMouseLeave = useCallback(() => {
    clearTimeoutHandler(); // Clear any pending timeout from card
    setHoveredPrincipleInfo(null); // Immediately dismiss popover
  }, [clearTimeoutHandler]);

  // Handler for closing the LiveChat from within the LiveChat component
  const handleCloseLiveChat = useCallback(() => {
    setShowLiveChat(false);
  }, []);

  // Handler to open Deep Dive Chat
  const handleOpenDeepDiveChat = useCallback((principle: Principle) => {
    setSelectedDeepDivePrinciple(principle);
    setShowDeepDiveChat(true);
    setHoveredPrincipleInfo(null); // Dismiss popover when deep dive chat opens
  }, []);

  // Handler to close Deep Dive Chat
  const handleCloseDeepDiveChat = useCallback(() => {
    setShowDeepDiveChat(false);
    setSelectedDeepDivePrinciple(null);
  }, []);


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
          <InfographicCard
            key={principle.id}
            principle={principle}
            onMouseEnterCard={handleCardMouseEnter}
            onMouseLeaveCard={handleCardMouseLeave}
          />
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
            <LiveChat onCloseChat={handleCloseLiveChat} />
          </div>
        )}
      </section>

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>
          © 2025 Responsible AI Infographic. All rights reserved.
        </p>
      </footer>

      {/* Principle Detail Popover */}
      {hoveredPrincipleInfo && (
        <PrincipleDetailPopover
          principleInfo={hoveredPrincipleInfo}
          onMouseEnterPopover={handlePopoverMouseEnter}
          onMouseLeavePopover={handlePopoverMouseLeave}
          onOpenDeepDiveChat={handleOpenDeepDiveChat} // Pass handler for deep dive chat
        />
      )}

      {/* Deep Dive Chat Modal */}
      {showDeepDiveChat && selectedDeepDivePrinciple && (
        <DeepDiveChatModal
          principle={selectedDeepDivePrinciple}
          onClose={handleCloseDeepDiveChat}
        />
      )}
    </div>
  );
}

export default App;