import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Principle, ChatTurn } from '../types';

interface DeepDiveChatModalProps {
  principle: Principle;
  onClose: () => void;
}

const DeepDiveChatModal: React.FC<DeepDiveChatModalProps> = ({ principle, onClose }) => {
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyPromptVisible, setApiKeyPromptVisible] = useState(false);

  const chatRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const initializeChat = useCallback(async () => {
    setError(null);
    setApiKeyPromptVisible(false);

    try {
      // Pre-flight check for API key selection
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setApiKeyPromptVisible(true);
          setError('No API Key selected. Please select an API key to start this chat.');
          return;
        }
      }

      // Always create a new GoogleGenAI instance for the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-pro', // Use Pro for complex tasks
        config: {
          systemInstruction: `You are Anna, an expert AI assistant specializing in the Responsible AI principle of ${principle.title}. Your goal is to provide in-depth explanations, examples, and answer complex questions related to ${principle.title}. Keep your responses thorough and informative. Use your advanced reasoning capabilities. Do not offer to search the web, focus purely on this principle.`,
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
        },
      });
      setChatHistory([
        { speaker: 'Anna', text: `Hello! I'm Anna. Let's do a deep dive into the principle of ${principle.title}. Ask me anything!`}
      ]);
    } catch (e: any) {
      console.error("Failed to initialize Deep Dive Chat:", e);
      setError(`Failed to initialize chat: ${e.message || 'Unknown error'}.`);
      setApiKeyPromptVisible(true);
    }
  }, [principle]);

  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentInput.trim() || !chatRef.current || isLoading) return;

    const userMessage = currentInput.trim();
    setChatHistory(prev => [...prev, { speaker: 'user', text: userMessage }]);
    setCurrentInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatRef.current.sendMessageStream({ message: userMessage });
      let fullAnnaResponse = '';
      setChatHistory(prev => [...prev, { speaker: 'Anna', text: '' }]); // Add empty Anna turn for streaming

      for await (const chunk of response) {
        if (chunk.text) {
          fullAnnaResponse += chunk.text;
          setChatHistory(prev => {
            const lastTurn = prev[prev.length - 1];
            if (lastTurn && lastTurn.speaker === 'Anna') {
              return [...prev.slice(0, -1), { ...lastTurn, text: fullAnnaResponse }];
            }
            return [...prev, { speaker: 'Anna', text: fullAnnaResponse }];
          });
        }
      }
    } catch (e: any) {
      console.error("Error sending message to Deep Dive Chat:", e);
      if (e.message.includes("API key")) {
        setError("API Key issue. Please check your API key.");
      } else {
        setError(`Failed to get response: ${e.message || 'Unknown error'}`);
      }
      setApiKeyPromptVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeySelection = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success after opening the dialog, re-initialize chat to pick up new key
      setApiKeyPromptVisible(false);
      initializeChat();
    } else {
      setError('API Key selection tool not available.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl border border-indigo-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-light leading-none"
          aria-label="Close deep dive chat"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">Deep Dive: {principle.title}</h2>

        {error && (
          <div role="alert" className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg border border-red-300 text-center text-sm mb-4">
            <p className="mb-2">{error}</p>
            {apiKeyPromptVisible && (
              <button
                onClick={handleApiKeySelection}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-red-300 text-sm"
              >
                Select API Key
              </button>
            )}
             {apiKeyPromptVisible && (
              <p className="mt-2 text-xs">
                Learn more about billing at{' '}
                <a
                  href="https://ai.google.dev/gemini-api/docs/billing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-800 underline hover:text-red-900"
                >
                  ai.google.dev/gemini-api/docs/billing
                </a>
              </p>
            )}
          </div>
        )}

        <div ref={scrollRef} className="h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 text-left">
          {chatHistory.map((turn, index) => (
            <div key={index} className={`mb-2 ${turn.speaker === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg max-w-[80%] ${
                turn.speaker === 'user' ? 'bg-indigo-100 text-indigo-800' :
                'bg-green-100 text-green-800' // For 'Anna'
              }`}>
                <strong className="font-semibold">{turn.speaker === 'user' ? 'You' : 'Anna'}:</strong> {turn.text}
              </span>
            </div>
          ))}
          {isLoading && (
            <div className="mb-2 text-left animate-pulse">
              <span className="inline-block p-2 rounded-lg bg-gray-200 text-gray-800 opacity-75 max-w-[80%]">
                <strong className="font-semibold">Anna Thinking:</strong> ...
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            placeholder="Ask Anna about this principle..."
            disabled={isLoading || apiKeyPromptVisible}
            aria-label={`Ask Anna about ${principle.title}`}
          ></textarea>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !currentInput.trim() || apiKeyPromptVisible}
            aria-label="Send message"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default DeepDiveChatModal;