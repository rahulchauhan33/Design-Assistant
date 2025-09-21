
import React from 'react';

interface SuggestionPromptsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionPrompts: React.FC<SuggestionPromptsProps> = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-center gap-2">
            {suggestions.map((suggestion, index) => (
                <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-zinc-700 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-[#ABF62D]"
                >
                    {suggestion}
                </button>
            ))}
        </div>
    </div>
  );
};

export default SuggestionPrompts;