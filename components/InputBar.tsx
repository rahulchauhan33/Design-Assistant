import React, { useState, useRef, useCallback } from 'react';

interface InputBarProps {
  onSendMessage: (prompt: string, image: { data: string; mimeType: string } | null) => void;
  isLoading: boolean;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<{ data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImage({ data: base64, mimeType: file.type });
    }
  }, []);

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

  const removeImage = () => {
    setImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="p-4 bg-white/80 dark:bg-black/50 backdrop-blur-sm border-t border-gray-200 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto">
        {image && (
          <div className="mb-3 relative inline-block">
              <img src={image.data} alt="Preview" className="w-20 h-20 object-cover rounded-md border-2 border-gray-300 dark:border-zinc-700" />
              <button 
                onClick={removeImage} 
                className="absolute -top-2 -right-2 bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold border-2 border-white dark:border-black hover:bg-red-500 transition-all"
                aria-label="Remove image"
              >
                &times;
              </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center gap-3 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-zinc-700 rounded-full p-2 focus-within:ring-2 focus-within:ring-[#ABF62D] transition-all duration-300">
          <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask for feedback, or describe your image..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-zinc-500 focus:outline-none"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || (!text && !image)} 
            className="p-2 rounded-full bg-[#ABF62D] disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed hover:scale-110 transition-transform transform"
            aria-label="Send message"
            >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" transform="rotate(90 12 12) translate(0, -5)" /></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputBar;