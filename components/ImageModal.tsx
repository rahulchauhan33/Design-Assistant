import React, { useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface ImageModalProps {
  src: string | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 p-2 rounded-full bg-black/50"
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
