


import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';
import type { Personality } from '../types';
import { Personality as PersonalityEnum } from '../types';

interface InputBarProps {
  onSendMessage: (prompt: string, image: { data: string; mimeType: string } | null) => void;
  isLoading: boolean;
  activePersonality: Personality;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading, activePersonality }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isImageGenMode = activePersonality === PersonalityEnum.IMAGE_GEN;

  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImage({ data: base64, mimeType: file.type });
    }
  }, []);

  const removeImage = useCallback(() => {
    setImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, []);

  useEffect(() => {
    // When the active personality changes, clear any staged image to prevent
    // accidentally sending an image to the wrong persona.
    removeImage();
  }, [activePersonality, removeImage]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!text && !image)) return;
    onSendMessage(text, image);
    setText('');
    setImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };


  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };

  return (
    <div className="p-2 sm:p-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto">
        {image && !isImageGenMode && (
          <div className="mb-3 inline-flex items-start gap-2 animate-fadeIn">
            <img src={image.data} alt="Preview" className="w-20 h-20 object-cover rounded-md border-2 border-gray-300 dark:border-zinc-700" />
            <button
              onClick={removeImage}
              className="p-1 rounded-full text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-zinc-700 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-black focus:ring-red-500"
              aria-label="Remove image"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-zinc-700 rounded-full p-2 focus-within:ring-2 focus-within:ring-[#ABF62D] transition-all duration-300">
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" id="file-upload" disabled={isLoading || isImageGenMode} />
          <label 
            htmlFor="file-upload" 
            role="button"
            aria-label="Upload an image"
            tabIndex={(isLoading || isImageGenMode) ? -1 : 0}
            onKeyDown={handleLabelKeyDown}
            className={`cursor-pointer p-3 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#1A1A1A] focus:ring-[#ABF62D] ${isLoading || isImageGenMode ? 'cursor-not-allowed opacity-50' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </label>
          <input
            id="prompt-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
                isImageGenMode 
                ? "Describe the image you want to create..."
                : image 
                    ? "Image selected, add text or send for review..." 
                    : "Upload an image and ask for feedback..."
            }
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-400 focus:outline-none"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || (!text && !image && !isImageGenMode) || (isImageGenMode && !text)} 
            className="p-3 rounded-full bg-[#ABF62D] disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed hover:scale-110 transition-transform transform focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#1A1A1A] focus:ring-[#ABF62D]"
            aria-label="Send message"
            >
            {isLoading ? (
                <SpinnerIcon className="h-6 w-6 text-black" />
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" transform="rotate(90 12 12) translate(0, -5)" /></svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputBar;