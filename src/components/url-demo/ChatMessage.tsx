'use client';

import React from 'react';

interface ChatMessageProps {
  role: 'user' | 'aiden';
  content: string;
  isTyping?: boolean;
}

export default function ChatMessage({ role, content, isTyping = false }: ChatMessageProps) {
  const isUser = role === 'user';

  const bubbleStyle: React.CSSProperties = {
    maxWidth: '85%',
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
    lineHeight: 1.6,
    borderRadius: isUser ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
    background: isUser ? '#252275' : '#141250',
    color: isUser ? 'var(--od-white)' : 'var(--od-text)',
    marginLeft: isUser ? 'auto' : undefined,
    marginRight: isUser ? undefined : 'auto',
  };

  return (
    <>
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .typing-dot { animation: none !important; opacity: 0.6; }
        }
        .typing-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          background: var(--od-muted);
          border-radius: 50%;
          margin: 0 2px;
          animation: typing-bounce 1.2s ease infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
      `}</style>
      <div style={bubbleStyle}>
        {isTyping ? (
          <span aria-label="Aiden is typing">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        ) : (
          content
        )}
      </div>
    </>
  );
}
