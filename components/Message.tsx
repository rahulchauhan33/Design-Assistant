import React, { useState } from 'react';
import type { ChatMessage } from '../types';
import { UserIcon } from './icons/UserIcon';
import { PERSONALITIES } from '../constants';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface MessageProps {
  message: ChatMessage;
}

const FormattedContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 pl-2">
          {listItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.startsWith('* ')) {
      listItems.push(line.substring(2));
    } else {
      flushList();
      if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={index}><strong className="font-semibold text-gray-900 dark:text-gray-100">{line.slice(2, -2)}</strong></p>);
      } else {
        elements.push(<p key={index}>{line}</p>);
      }
    }
  });

  flushList();

  return <div className="space-y-3">{elements}</div>;
};


const Message: React.FC<MessageProps> = ({ message }) => {
  const { role, content, image } = message;
  const [isCopied, setIsCopied] = useState(false);

  const isUser = role === 'user';
  const isSystem = role === 'system';
  const isAssistant = role === 'assistant';

  const AssistantIcon = PERSONALITIES[0].icon;
  
  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const bubbleClasses = isUser
    ? 'bg-gray-100 dark:bg-[#1C1C1C] rounded-tr-none border border-gray-200 dark:border-zinc-700'
    : isSystem
    ? 'bg-red-900/50 border border-red-700 text-red-300 dark:text-red-200'
    : 'bg-white dark:bg-[#161616] rounded-tl-none border border-gray-200 dark:border-zinc-800';

  const containerClasses = isUser ? 'justify-end' : 'justify-start';

  const IconComponent = isUser ? UserIcon : AssistantIcon;
  const iconClasses = "h-8 w-8 text-gray-500 dark:text-gray-600 flex-shrink-0";

  return (
    <div className={`group flex items-end gap-3 ${containerClasses}`}>
      {!isUser && !isSystem && <IconComponent className={iconClasses} />}
      <div className={`relative rounded-lg p-4 max-w-2xl text-gray-800 dark:text-gray-300 whitespace-pre-wrap font-medium ${bubbleClasses}`}>
        {isAssistant && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1 rounded-md text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#ABF62D]"
            aria-label={isCopied ? "Copied!" : "Copy message"}
          >
            {isCopied ? (
              <CheckIcon className="h-4 w-4 text-[#ABF62D]" />
            ) : (
              <ClipboardIcon className="h-4 w-4" />
            )}
          </button>
        )}
        {image && <img src={image} alt="User upload" className="rounded-md mb-3 max-h-64 border border-gray-300 dark:border-zinc-700" />}
        {isSystem ? (
            <p>{content}</p>
        ) : (
            <FormattedContent content={content} />
        )}
      </div>
      {isUser && <IconComponent className={iconClasses} />}
    </div>
  );
};

export default Message;