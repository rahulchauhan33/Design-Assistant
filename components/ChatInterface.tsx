import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import Message from './Message';
import { PERSONALITIES } from '../constants';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const LoadingIndicator: React.FC = () => {
    const AssistantIcon = PERSONALITIES[0].icon;
    return (
        <div className="flex items-end gap-3 justify-start">
             <AssistantIcon className="h-8 w-8 text-gray-500 dark:text-gray-600 flex-shrink-0" />
            <div className="bg-white dark:bg-[#161616] border border-gray-200 dark:border-zinc-800 rounded-lg p-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#ABF62D] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-[#ABF62D] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-[#ABF62D] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
        </div>
    )
};


const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 p-6 space-y-6 overflow-y-auto">
      {messages.map((msg) => {
        // The loading indicator is now handled separately, so we don't render the placeholder message.
        if (msg.role === 'assistant' && msg.content === '...') {
          return null;
        }
        return <Message key={msg.id} message={msg} />;
      })}
      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default ChatInterface;