import React from 'react';
import { Principle } from '../types';

interface PrincipleDetailPopoverProps {
  principleInfo: { principle: Principle, rect: DOMRect };
  onMouseEnterPopover: () => void;
  onMouseLeavePopover: () => void;
}

const PrincipleDetailPopover: React.FC<PrincipleDetailPopoverProps> = ({ principleInfo, onMouseEnterPopover, onMouseLeavePopover }) => {
  const { principle, rect } = principleInfo;

  const getDomain = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname.replace('www.', '');
    } catch {
      return url; // Fallback if URL is invalid
    }
  };

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
    </div>
  );
};

export default PrincipleDetailPopover;