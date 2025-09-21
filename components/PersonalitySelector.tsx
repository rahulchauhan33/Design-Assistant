import React from 'react';
import { PERSONALITIES } from '../constants';
import type { Personality } from '../types';

interface PersonalitySelectorProps {
  activePersonality: Personality;
  onSelectPersonality: (personality: Personality) => void;
}

const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ activePersonality, onSelectPersonality }) => {
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 w-full">
      {PERSONALITIES.map((p) => {
        const isActive = activePersonality === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelectPersonality(p.id)}
            className={`relative flex flex-col items-center text-center p-3 md:p-6 rounded-lg border transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0D0D0D] focus:ring-[#ABF62D]
              ${isActive 
                ? 'bg-white dark:bg-[#1A1A1A] border-[#ABF62D] shadow-[0_0_15px_rgba(171,246,45,0.3)]' 
                : 'bg-gray-100 dark:bg-[#161616] border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600'
              }`}
          >
            <p.icon className={`h-8 w-8 md:h-12 md:w-12 mb-2 md:mb-3 transition-colors ${isActive ? 'text-[#ABF62D]' : 'text-gray-600 dark:text-gray-500'}`} />
            <h3 className={`text-sm md:text-lg font-semibold transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-300'}`}>{p.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1 hidden md:block">{p.description}</p>
          </button>
        );
      })}
    </div>
  );
};

export default PersonalitySelector;