



import React, { useState, useCallback, useEffect } from 'react';
import type { ChatMessage, PersonalityData, SavedChat } from './types';
import { Personality } from './types';
import { PERSONALITIES } from './constants';
import { getDesignFeedback, generateImage } from './services/geminiService';
import PersonalitySelector from './components/PersonalitySelector';
import ChatInterface from './components/ChatInterface';
import InputBar from './components/InputBar';
import ThemeToggle from './components/ThemeToggle';
import ImageModal from './components/ImageModal';
import SuggestionPrompts from './components/SuggestionPrompts';
import { TrashIcon } from './components/icons/TrashIcon';
import { SaveIcon } from './components/icons/SaveIcon';
import { HistoryIcon } from './components/icons/HistoryIcon';
import { CheckIcon } from './components/icons/CheckIcon';
import ChatHistoryModal from './components/ChatHistoryModal';

const SAVED_CHATS_KEY = 'design-assistant-saved-chats';
const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'assistant',
  content: 'Hello! I am your Design Assistant. Please select a personality, upload a design screenshot, and ask for feedback.'
};


const App: React.FC = () => {
  const [activePersonality, setActivePersonality] = useState<Personality>(Personality.UX_COACH);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // State for chat history management
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [isApiConfigured, setIsApiConfigured] = useState(true);


  useEffect(() => {
    // Check for API Key on initial load
    if (!process.env.API_KEY) {
        setIsApiConfigured(false);
    }
      
    // Load saved chats from localStorage on initial render
    try {
        const storedChats = localStorage.getItem(SAVED_CHATS_KEY);
        if (storedChats) {
            setSavedChats(JSON.parse(storedChats));
        }
    } catch (e) {
        console.error("Failed to load saved chats from localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Effect to save chats to localStorage whenever they change
  useEffect(() => {
    try {
        localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(savedChats));
    } catch (e) {
        console.error("Failed to save chats to localStorage", e);
    }
  }, [savedChats]);


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
    
    // If it's the first user message, replace the initial message
    const newMessages = messages.length === 1 && messages[0].id === 'init'
        ? [userMessage]
        : [...messages, userMessage];

    setMessages(newMessages);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessagePlaceholder: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '...',
    };
    setMessages(prev => [...prev, assistantMessagePlaceholder]);


    try {
       if (activePersonality === Personality.IMAGE_GEN) {
            if (!prompt) {
                throw new Error("Please provide a text description for the image you want to generate.");
            }
            const base64ImageData = await generateImage(prompt);
            const assistantMessage: ChatMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: `Here's the image generated for: "${prompt}"`,
                image: `data:image/png;base64,${base64ImageData}`
            };
            setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? assistantMessage : msg));

        } else {
            const response = await getDesignFeedback(prompt, image, activePersonalityData);
            const assistantMessage: ChatMessage = {
                id: assistantMessageId,
                role: 'assistant',
                content: response,
            };
            setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? assistantMessage : msg));
        }
    } catch (e) {
      console.error('Error during message handling:', e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      const systemMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'system',
        content: `I'm sorry, I ran into a problem and couldn't complete your request. Please try again.\n\n**Error Details:**\n\`\`\`\n${errorMessage}\n\`\`\``
      };
      setMessages(prev => prev.map(msg => msg.id === assistantMessageId ? systemMessage : msg));
    } finally {
      setIsLoading(false);
    }
  }, [activePersonality, activePersonalityData, messages]);
  
  const handleSuggestionClick = (suggestion: string) => {
    const inputBar = document.getElementById('prompt-input') as HTMLInputElement | null;
    if (inputBar) {
        inputBar.value = suggestion;
        inputBar.focus();
    }
    // For this case, we'll just send it directly.
    handleSendMessage(suggestion, null);
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  }

  const handleSaveChat = () => {
    const newSavedChat: SavedChat = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        messages,
        personality: activePersonality
    };
    setSavedChats(prev => [newSavedChat, ...prev]);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleLoadChat = (chatId: string) => {
    const chatToLoad = savedChats.find(c => c.id === chatId);
    if (chatToLoad) {
        setMessages(chatToLoad.messages);
        setActivePersonality(chatToLoad.personality);
        setIsHistoryOpen(false);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setSavedChats(prev => prev.filter(c => c.id !== chatId));
  };


  const activeTabId = `personality-tab-${activePersonality}`;
  const isPristine = messages.length <= 1 && messages[0].id === 'init';

  return (
    <div className="h-dvh flex flex-col bg-white dark:bg-[#0D0D0D] text-gray-800 dark:text-gray-100 font-sans antialiased">
       {!isApiConfigured && (
          <div role="alert" className="bg-red-600 dark:bg-red-800 text-white p-3 text-center text-sm font-medium shadow-lg">
            <p><strong>Configuration Error:</strong> The Gemini API key is not set.</p>
            <p className="text-xs mt-1 font-normal">To fix this, set the <code>API_KEY</code> environment variable in your Vercel project settings and redeploy.</p>
          </div>
        )}
       <main className="flex-1 flex flex-col items-center p-2 pb-0 sm:p-4 w-full max-w-4xl mx-auto min-h-0">
        <header className="w-full py-4 sm:py-8 flex flex-col gap-4 sm:flex-row sm:justify-between items-center">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Design Assistant
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Instant feedback from your AI design team.</p>
          </div>
           <div className="flex items-center gap-2">
            <button
                onClick={handleClearChat}
                disabled={isPristine}
                aria-label="Clear Chat"
                title="Clear Chat"
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0D0D0D] focus:ring-[#ABF62D] transition-all"
            >
                <TrashIcon className="h-6 w-6" />
            </button>
            <button
                onClick={handleSaveChat}
                disabled={isPristine}
                aria-label="Save Chat"
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0D0D0D] focus:ring-[#ABF62D] transition-all"
            >
                {saveStatus === 'saved' ? <CheckIcon className="h-6 w-6 text-[#ABF62D]" /> : <SaveIcon className="h-6 w-6" />}
            </button>
             <button
                onClick={() => setIsHistoryOpen(true)}
                aria-label="View Saved Chats"
                className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0D0D0D] focus:ring-[#ABF62D] transition-all"
            >
                <HistoryIcon className="h-6 w-6" />
            </button>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </header>
        
        <PersonalitySelector
          activePersonality={activePersonality}
          onSelectPersonality={setActivePersonality}
          isLoading={isLoading}
        />

        <div 
            id="chat-panel"
            role="tabpanel"
            aria-labelledby={activeTabId}
            className="w-full flex-1 flex flex-col my-2 sm:my-6 bg-gray-50 dark:bg-black rounded-xl border border-gray-200 dark:border-zinc-800 shadow-lg dark:shadow-2xl dark:shadow-zinc-900/50 overflow-hidden"
        >
          <ChatInterface 
            messages={messages} 
            isLoading={isLoading}
            onViewImage={setViewingImage}
            onSuggestionClick={handleSuggestionClick}
            assistantIcon={activePersonalityData.icon}
          />
          {isPristine && !isLoading && (
            <SuggestionPrompts 
              suggestions={activePersonalityData.suggestions}
              onSuggestionClick={handleSuggestionClick}
            />
          )}
          <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} activePersonality={activePersonality} />
        </div>
      </main>
      <footer className="text-center px-4 pb-4 pt-1 sm:p-4 text-sm text-zinc-600 dark:text-zinc-400">
        Designed by <a href="https://www.linkedin.com/in/rahul-chauhan-a022ab79/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#69961a] dark:hover:text-[#ABF62D] transition-colors">Rahul Chauhan</a>
      </footer>
      <ImageModal src={viewingImage} onClose={() => setViewingImage(null)} />
      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedChats={savedChats}
        onLoadChat={handleLoadChat}
        onDeleteChat={handleDeleteChat}
      />
    </div>
  );
};

export default App;