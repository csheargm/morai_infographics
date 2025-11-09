import React, { useState, useCallback } from 'react';
import { Principle } from '../types';
import { GoogleGenAI } from '@google/genai';

interface PrincipleDetailPopoverProps {
  principleInfo: { principle: Principle, rect: DOMRect };
  onMouseEnterPopover: () => void;
  onMouseLeavePopover: () => void;
  onOpenDeepDiveChat: (principle: Principle) => void; // New prop for deep dive chat
}

const PrincipleDetailPopover: React.FC<PrincipleDetailPopoverProps> = ({ 
  principleInfo, 
  onMouseEnterPopover, 
  onMouseLeavePopover, 
  onOpenDeepDiveChat 
}) => {
  const { principle, rect } = principleInfo;

  const [isLoadingMoreExamples, setIsLoadingMoreExamples] = useState(false);
  const [moreExamples, setMoreExamples] = useState<string | null>(null);
  const [exampleError, setExampleError] = useState<string | null>(null);

  const getDomain = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.replace('www.', '');
    } catch {
      return url; // Fallback if URL is invalid
    }
  };

  const handleGenerateMoreExamples = useCallback(async () => {
    setIsLoadingMoreExamples(true);
    setExampleError(null);
    setMoreExamples(null); // Clear previous examples

    try {
      // Always create a new GoogleGenAI instance for the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash', // Use Flash for quick example generation
        contents: `Provide 3-5 real-world, concise examples for the Responsible AI principle of ${principle.title} based on this description: '${principle.description}'. Format them as a bulleted list.`,
      });

      setMoreExamples(response.text);
    } catch (error: any) {
      console.error("Error generating more examples:", error);
      if (error.message.includes("API key")) {
        setExampleError("API Key issue. Please check your API key.");
      } else {
        setExampleError(`Failed to generate examples: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoadingMoreExamples(false);
    }
  }, [principle]);

  // Calculate position
  const popoverStyle: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + window.scrollY + 15, // 15px below the card
    left: rect.left + rect.width / 2,
    transform: 'translateX(-50%)', // Center horizontally relative to the card
    zIndex: 1000, // Ensure it's on top
    // Ensure it doesn't go off screen (basic check)
    maxWidth: 'calc(100vw - 40px)', // Max width to prevent overflow
    minWidth: '200px', // Min width for readability
  };

  return (
    <div
      className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-sm border border-indigo-200"
      style={popoverStyle}
      onMouseEnter={onMouseEnterPopover}
      onMouseLeave={onMouseLeavePopover}
      aria-modal="false" // Not a full modal anymore
      role="tooltip"
      aria-labelledby="principle-popover-title"
    >
      <button
        onClick={onMouseLeavePopover} // Close button now calls mouse leave handler
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-light leading-none"
        aria-label="Close details"
      >
        &times;
      </button>
      <h3 id="principle-popover-title" className="text-2xl font-bold text-indigo-800 mb-3">
        {principle.title}
      </h3>
      <p className="text-base text-gray-700 leading-relaxed mb-4">
        {principle.description}
      </p>

      {/* Generate More Examples Section */}
      <div className="mt-4 border-t border-gray-200 pt-4">
        <button
          onClick={handleGenerateMoreExamples}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoadingMoreExamples}
          aria-live="polite"
        >
          {isLoadingMoreExamples ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Generate More Examples'}
        </button>
        {exampleError && <p className="text-red-600 text-sm mt-2">{exampleError}</p>}
        {moreExamples && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-gray-700 text-sm">
            <h4 className="font-semibold mb-2">Additional Examples:</h4>
            <div dangerouslySetInnerHTML={{ __html: moreExamples }} /> {/* Render markdown as HTML */}
          </div>
        )}
      </div>

      {/* Existing Learn More Section */}
      {principle.sources && principle.sources.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Learn more:</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {principle.sources.map((link, index) => (
              <li key={index}>
                <a
                  href={link.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                  title={link.title}
                >
                  {link.title} ({getDomain(link.uri)})
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deep Dive Chat Button */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <button
          onClick={() => onOpenDeepDiveChat(principle)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          aria-label={`Start deep dive chat about ${principle.title}`}
        >
          Ask Anna (Deep Dive)
        </button>
      </div>
    </div>
  );
};

export default PrincipleDetailPopover;