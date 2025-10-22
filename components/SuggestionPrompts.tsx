
import React, { useState } from 'react';
import { ChevronIcon } from './icons/ChevronIcon';

interface SuggestionPromptsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionPrompts: React.FC<SuggestionPromptsProps> = ({ suggestions, onSuggestionClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-[#ABF62D] rounded-md p-2 hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
        aria-expanded={isOpen}
        aria-controls="suggestion-panel"
      >
        <span>Suggestions</span>
        <ChevronIcon className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div
        id="suggestion-panel"
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {suggestions.map((suggestion, index) => (
                  <button
                      key={index}
                      onClick={() => onSuggestionClick(suggestion)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-zinc-700 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-[#ABF62D]"
                  >
                      {suggestion}
                  </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuggestionPrompts;