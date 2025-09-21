import React, { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, PersonalityData } from './types';
import { Personality } from './types';
import { PERSONALITIES } from './constants';
import { getDesignFeedback } from './services/geminiService';
import PersonalitySelector from './components/PersonalitySelector';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';
import ThemeToggle from './components/ThemeToggle';

const App: React.FC = () => {
  const [activePersonality, setActivePersonality] = useState<Personality>(Personality.UX_COACH);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure we load a non-empty array from storage
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
      } catch (e) {
        console.error('Failed to parse chat history from localStorage', e);
      }
    }
    // Return default message if nothing in storage, it's empty, or parsing fails
    return [{
      id: 'init',
      role: 'assistant',
      content: 'Hello! I am your Design Assistant. Please select a personality, upload a design screenshot, and ask for feedback.'
    }];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const activePersonalityData = PERSONALITIES.find(p => p.id === activePersonality) as PersonalityData;
  
  const handleSendMessage = useCallback(async (prompt: string, image: { data: string; mimeType: string } | null) => {
    if (!prompt && !image) return;

    setIsLoading(true);
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      image: image?.data
    };
    setMessages(prev => [...prev, userMessage]);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessagePlaceholder: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '...',
    };
    setMessages(prev => [...prev, assistantMessagePlaceholder]);


    try {
      const response = await getDesignFeedback(prompt, image, activePersonalityData);
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: response,
      };
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? assistantMessage : msg));
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      const systemMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'system',
        content: `Error: ${errorMessage}`
      };
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? systemMessage : msg));
    } finally {
      setIsLoading(false);
    }
  }, [activePersonalityData]);
  
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-[#0D0D0D] text-gray-800 dark:text-gray-200 font-sans antialiased">
       <main className="flex-1 flex flex-col items-center p-4 w-full max-w-4xl mx-auto">
        <header className="w-full py-8 text-center relative">
          <div className="absolute top-1/2 -translate-y-1/2 right-0">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Design Assistant
          </h1>

          <p className="text-gray-600 dark:text-gray-500">Instant feedback from your AI design team.</p>
        </header>
        
        <PersonalitySelector
          activePersonality={activePersonality}
          onSelectPersonality={setActivePersonality}
        />

        <div className="w-full flex-1 flex flex-col my-6 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-zinc-800 shadow-lg dark:shadow-2xl dark:shadow-zinc-900/50 overflow-hidden">
          <ChatInterface messages={messages} isLoading={isLoading} />
          <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-zinc-600 dark:text-zinc-500">
        Designed by <a href="https://www.linkedin.com/in/rahul-chauhan-a022ab79/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#ABF62D] transition-colors">Rahul Chauhan</a>
      </footer>
    </div>
  );
};

export default App;