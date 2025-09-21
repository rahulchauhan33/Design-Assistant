import React, { useEffect, useRef } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (src) {
      // Save the element that triggered the modal for focus restoration
      triggerElementRef.current = document.activeElement as HTMLElement;
      
      // Focus the close button when the modal opens
      const focusTimeout = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        // Focus trapping: prevent tabbing outside the modal
        if (e.key === 'Tab') {
          e.preventDefault();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(focusTimeout);
        window.removeEventListener('keydown', handleKeyDown);
        // Restore focus to the element that opened the modal
        triggerElementRef.current?.focus();
      };
    }
  }, [src, onClose]);

  if (!src) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Full screen image view"
    >
      <button
        ref={closeButtonRef}
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full bg-black/50 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Close image view"
      >
        <CloseIcon className="h-8 w-8" />
      </button>
      <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="Full screen view of user upload"
          className="object-contain max-w-full max-h-full rounded-lg shadow-2xl"
        />
      </div>
    </div>
  );
};

export default ImageModal;