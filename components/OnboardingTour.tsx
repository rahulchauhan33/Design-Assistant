
import React, { useState, useLayoutEffect, useCallback } from 'react';
import type { TourStep } from '../types';

interface OnboardingTourProps {
  steps: TourStep[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onFinish: () => void;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, currentStep, setCurrentStep, onFinish }) => {
  const [highlightStyle, setHighlightStyle] = useState({});
  const [popoverStyle, setPopoverStyle] = useState({});

  const step = steps[currentStep];

  // Memoize the position update logic. It only changes when the step changes.
  const updatePosition = useCallback(() => {
    if (!step) return;

    const element = document.getElementById(step.targetId);
    if (element) {
      const rect = element.getBoundingClientRect();
      const padding = 10;

      setHighlightStyle({
        width: `${rect.width + padding}px`,
        height: `${rect.height + padding}px`,
        top: `${rect.top - padding / 2}px`,
        left: `${rect.left - padding / 2}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        borderRadius: '8px',
      });

      // Position popover below the element, centered
      setPopoverStyle({
        top: `${rect.bottom + padding}px`,
        left: `${rect.left + rect.width / 2}px`,
      });
    }
  }, [step]);

  // Effect for scrolling the element into view and setting up listeners
  useLayoutEffect(() => {
    if (step) {
      const element = document.getElementById(step.targetId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Delay initial positioning to allow for smooth scroll to complete.
      const timeoutId = setTimeout(updatePosition, 300);

      window.addEventListener('resize', updatePosition);
      // Use capture: true for scroll events to catch them early.
      window.addEventListener('scroll', updatePosition, true);

      // Cleanup function to remove listeners.
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [step, updatePosition]);


  if (!step) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute transition-all duration-300 ease-in-out" style={highlightStyle} />
      <div 
        className="absolute bg-[#1A1A1A] text-white p-5 rounded-lg shadow-2xl w-[90vw] max-w-sm transform -translate-x-1/2 animate-fadeIn" 
        style={popoverStyle}
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-content"
        >
        <h3 id="tour-title" className="text-lg font-bold text-[#ABF62D] mb-2">{step.title}</h3>
        <p id="tour-content" className="text-gray-300 text-sm mb-4">{step.content}</p>
        <div className="flex justify-between items-center">
          <button onClick={onFinish} className="text-sm text-gray-500 hover:text-white transition-colors">Skip</button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button onClick={handlePrev} className="px-4 py-2 text-sm rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors">
                Prev
              </button>
            )}
            <button onClick={handleNext} className="px-4 py-2 text-sm rounded-md bg-[#ABF62D] text-black font-semibold hover:scale-105 transition-transform">
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
