

import React, { useRef } from 'react';
import { PERSONALITIES } from '../constants';
import type { Personality } from '../types';

interface PersonalitySelectorProps {
  activePersonality: Personality;
  onSelectPersonality: (personality: Personality) => void;
  isLoading: boolean;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ activePersonality, onSelectPersonality, isLoading }) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const tabCount = PERSONALITIES.length;
    let newIndex = index;
    let keyHandled = true;

    switch (e.key) {
      case 'ArrowRight':
        newIndex = (index + 1) % tabCount;
        break;
      case 'ArrowLeft':
        newIndex = (index - 1 + tabCount) % tabCount;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabCount - 1;
        break;
      default:
        keyHandled = false;
        break;
    }

    if (keyHandled) {
      e.preventDefault();
      onSelectPersonality(PERSONALITIES[newIndex].id);
      tabRefs.current[newIndex]?.focus();
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full" role="tablist" aria-label="Select a personality">
      {PERSONALITIES.map((p, index) => {
        const isActive = activePersonality === p.id;
        const tabId = `personality-tab-${p.id}`;

        return (
          <button
            key={p.id}
            id={tabId}
            // Fix: Changed the ref callback from an implicit return `() => expression` to a void return `() => { expression; }` to match the expected Ref type.
            ref={el => { tabRefs.current[index] = el; }}
            role="tab"
            onClick={() => onSelectPersonality(p.id)}
            onKeyDown={e => handleKeyDown(e, index)}
            aria-selected={isActive}
            aria-controls="chat-panel"
            tabIndex={isActive ? 0 : -1}
            disabled={isLoading}
            className={`relative flex flex-col items-center text-center p-3 sm:p-4 rounded-lg border transition-all duration-300 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0D0D0D] focus:ring-[#ABF62D] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${!isLoading ? 'hover:-translate-y-1' : ''}
              ${isActive 
                ? 'bg-white dark:bg-[#1A1A1A] border-[#ABF62D] shadow-[0_0_15px_rgba(171,246,45,0.3)]' 
                : 'bg-gray-100 dark:bg-[#161616] border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600'
              }`}
          >
            <p.icon className={`h-8 w-8 sm:h-10 sm:w-10 mb-2 transition-colors ${isActive ? 'text-[#69961a] dark:text-[#ABF62D]' : 'text-gray-600 dark:text-gray-400'}`} aria-hidden="true" />
            <h3 className={`text-sm sm:text-base font-semibold transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}>{p.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">{p.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default PersonalitySelector;