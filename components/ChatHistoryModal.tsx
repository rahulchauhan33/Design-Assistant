

import React, { useRef, useEffect } from 'react';
import type { SavedChat } from '../types';
import { PERSONALITIES } from '../constants';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedChats: SavedChat[];
  onLoadChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ isOpen, onClose, savedChats, onLoadChat, onDeleteChat }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const focusTimeout = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(focusTimeout);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleDelete = (chatId: string) => {
    if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
        onDeleteChat(chatId);
    }
  };

  const getFirstUserMessage = (messages: SavedChat['messages']) => {
    const userMessage = messages.find(m => m.role === 'user');
    const content = userMessage?.content || "Untitled Chat";
    return content.length > 50 ? content.substring(0, 50) + '...' : content;
  }
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-modal-title"
    >
      <div
        ref={modalRef}
        className="relative flex flex-col w-full max-w-2xl h-[80vh] max-h-[700px] bg-[#161616] text-white rounded-lg shadow-2xl border border-zinc-800 m-4 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
          <h2 id="history-modal-title" className="text-xl font-bold">Saved Conversations</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close saved chats"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {savedChats.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-400">
              <p>You have no saved conversations.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {savedChats.map((chat) => {
                const personality = PERSONALITIES.find(p => p.id === chat.personality);
                const Icon = personality?.icon;

                return (
                  <li key={chat.id} className="group bg-[#1A1A1A] p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                      <div className='flex-1 min-w-0'>
                        {Icon && <personality.icon className="h-6 w-6 mb-2 text-zinc-400" />}
                        <p className="text-sm font-semibold text-gray-200 truncate pr-2" title={getFirstUserMessage(chat.messages)}>
                          {getFirstUserMessage(chat.messages)}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          Saved on {new Date(chat.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 self-end mt-3 sm:mt-0 sm:self-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onLoadChat(chat.id)}
                          className="px-4 py-2 text-sm font-semibold rounded-md bg-[#ABF62D] text-black hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] focus:ring-[#ABF62D]"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleDelete(chat.id)}
                          aria-label="Delete chat"
                          className="p-2 rounded-md text-zinc-300 hover:bg-red-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1A1A] focus:ring-red-500"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryModal;