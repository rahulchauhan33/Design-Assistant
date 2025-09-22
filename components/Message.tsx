
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '../types';
import { UserIcon } from './icons/UserIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { CheckIcon } from './icons/CheckIcon';

interface MessageProps {
  message: ChatMessage;
  onViewImage: (src: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
  assistantIcon: React.ComponentType<{ className?: string }>;
}

const Message: React.FC<MessageProps> = ({ message, onViewImage, onSuggestionClick, isLoading, assistantIcon: AssistantIcon }) => {
  const { role, content, image } = message;
  const [isCopied, setIsCopied] = useState(false);

  const isUser = role === 'user';
  const isSystem = role === 'system';
  const isAssistant = role === 'assistant';

  const handleCopy = () => {
    if (isCopied || !content) return;
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
        {isAssistant && content && content !== '...' && (
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
        {image && (
            <button
              onClick={() => onViewImage(image)}
              className="block w-full rounded-md mb-3 bg-gray-200 dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#1C1C1C] focus:ring-[#ABF62D]"
              aria-label="View image full screen"
            >
                 <img src={image} alt="User upload" className="max-h-64 w-full object-contain transition-transform duration-200 ease-in-out hover:scale-105" />
            </button>
        )}
        <ReactMarkdown
          children={content}
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
            strong: ({node, ...props}) => <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc space-y-1 pl-5 my-2" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal space-y-1 pl-5 my-2" {...props} />,
            a: ({node, ...props}) => <a className="text-[#69961a] dark:text-[#ABF62D] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
            code: ({node, inline, className, children, ...props}: any) => {
              return !inline ? (
                <pre className="bg-gray-100 dark:bg-[#1E1E1E] p-3 my-2 rounded-md overflow-x-auto text-sm font-mono">
                  <code className={`${className || ''}`} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code className="bg-gray-200 dark:bg-zinc-700 rounded px-1.5 py-1 text-sm font-mono" {...props}>
                  {children}
                </code>
              )
            },
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-4 border border-gray-200 dark:border-zinc-700 rounded-lg">
                <table className="w-full text-sm" {...props} />
              </div>
            ),
            thead: ({node, ...props}) => <thead className="bg-gray-100 dark:bg-zinc-900" {...props} />,
            th: ({node, ...props}) => <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider" {...props} />,
            tbody: ({node, ...props}) => <tbody className="divide-y divide-gray-200 dark:divide-zinc-800" {...props} />,
            td: ({node, ...props}) => <td className="px-4 py-3" {...props} />,
            del: ({node, ...props}) => <del className="text-gray-500" {...props} />,
            blockquote: ({ node, ...props }: any) => {
              const suggestionText = node?.children?.[0]?.children?.[0]?.value?.trim();
              if (isAssistant && suggestionText) {
                return (
                  <button
                    onClick={() => onSuggestionClick(suggestionText)}
                    disabled={isLoading}
                    className="block w-full text-left px-4 py-2 my-1 text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-[#1f1f1f] border border-gray-200 dark:border-zinc-700 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-300 dark:hover:border-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#161616] focus:ring-[#ABF62D] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestionText}
                  </button>
                );
              }
              return <blockquote className="pl-4 italic border-l-4 border-gray-300 dark:border-zinc-700 my-2" {...props} />;
            },
          }}
        />
      </div>
      {isUser && <IconComponent className={iconClasses} />}
    </div>
  );
};

export default Message;
