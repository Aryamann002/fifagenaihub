/**
 * ChatInterface — Accessible GenAI chat component.
 * Provides a fully keyboard-navigable, screen-reader-friendly chat interface
 * with ARIA live regions for real-time message announcements.
 * @module components/ChatInterface
 */

'use client';

import { useState, useRef, useEffect, type ReactNode, type KeyboardEvent, type FormEvent } from 'react';
import { useChat } from '@/hooks/useChat';
import type { ChatContext } from '@/types';
import styles from './ChatInterface.module.css';

/** Maximum character limit for user messages */
const MAX_MESSAGE_LENGTH = 500;

/** Props for the ChatInterface component */
interface ChatInterfaceProps {
  /** Chat context including stadium and user role */
  context: ChatContext;
  /** Optional title displayed above the chat */
  title?: string;
  /** Optional placeholder text for the input field */
  placeholder?: string;
  /** Query injected from outside (e.g. a stadium map zone click) — sent automatically */
  pendingQuery?: string;
  /** Called after a pending query has been dispatched */
  onPendingQueryHandled?: () => void;
}

/**
 * Renders an accessible GenAI chat interface with message history,
 * typing indicators, suggested follow-ups, and keyboard shortcuts.
 *
 * Accessibility features:
 * - ARIA live region announces new messages to screen readers
 * - Keyboard shortcuts: Enter to send, Escape to clear input
 * - Semantic HTML with proper roles and labels
 * - Visual character counter with screen reader support
 */
export default function ChatInterface({
  context,
  title = 'AI Assistant',
  placeholder = 'Ask me anything about the stadium...',
  pendingQuery,
  onPendingQueryHandled,
}: ChatInterfaceProps) {
  const { messages, isLoading, error, sendMessage, clearMessages, suggestions } = useChat(context);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /** Screen reader announcement — derived from the latest assistant message */
  const lastMessage = messages[messages.length - 1];
  const lastAnnouncement =
    lastMessage?.role === 'assistant' ? `AI response: ${lastMessage.content}` : '';

  /**
   * Dispatch queries injected from outside (e.g. stadium map zone clicks).
   * Waits until any in-flight request finishes so the query is never dropped
   * by useChat's re-entry guard.
   */
  useEffect(() => {
    if (pendingQuery && !isLoading) {
      sendMessage(pendingQuery);
      onPendingQueryHandled?.();
    }
  }, [pendingQuery, isLoading, sendMessage, onPendingQueryHandled]);

  /** Scroll to the latest message when messages change */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /** Handle form submission */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue;
    setInputValue('');
    await sendMessage(message);
  };

  /** Handle keyboard shortcuts */
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (inputValue.trim() && !isLoading) {
        const message = inputValue;
        setInputValue('');
        sendMessage(message);
      }
    }

    if (event.key === 'Escape') {
      setInputValue('');
      inputRef.current?.blur();
    }
  };

  /** Handle clicking a suggestion */
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue('');
    sendMessage(suggestion);
  };

  /** Render safe markdown-style bold syntax: **text** */
  const renderFormattedMessage = (content: string): ReactNode => {
    const segments = content.split(/(\*\*[^*\n]+\*\*)/g);
    return segments.map((segment, index) => {
      if (/^\*\*[^*\n]+\*\*$/.test(segment)) {
        return <strong key={`bold-${index}`}>{segment.slice(2, -2)}</strong>;
      }
      return <span key={`text-${index}`}>{segment}</span>;
    });
  };

  const characterCount = inputValue.length;
  const isInputEmpty = !inputValue.trim();

  return (
    <section className={styles.chatContainer} aria-label={title} id="chat-interface">
      {/* Chat Header */}
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.statusDot} aria-hidden="true" />
          <h2 className={styles.title}>{title}</h2>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearMessages}
            aria-label="Clear all messages"
          >
            Clear
          </button>
        )}
      </header>

      {/* Messages Area */}
      <div
        className={styles.messagesArea}
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden="true">
              🏟️
            </div>
            <p className={styles.emptyTitle}>Welcome to FanHub 26!</p>
            <p className={styles.emptySubtitle}>
              {context.role === 'fan'
                ? 'Ask me about stadium navigation, food options, accessibility services, transportation, or sustainability tips.'
                : 'Query operational intelligence: crowd density, gate flow, resource allocation, or incident management.'}
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${
              message.role === 'user' ? styles.userMessage : styles.assistantMessage
            }`}
          >
            <div className={styles.messageAvatar} aria-hidden="true">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className={styles.messageContent}>
              <div className={styles.messageHeader}>
                <span className={styles.messageRole}>
                  {message.role === 'user' ? 'You' : 'FanHub AI'}
                </span>
                {message.detectedLanguage && message.detectedLanguage !== 'en' && (
                  <span className={styles.languageBadge}>{message.detectedLanguage.toUpperCase()}</span>
                )}
                {message.role === 'assistant' && message.category && (
                  <span className={styles.categoryBadge} title="Query category">
                    {message.category}
                  </span>
                )}
              </div>
              <p className={styles.messageText}>{renderFormattedMessage(message.content)}</p>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className={`${styles.message} ${styles.assistantMessage}`} aria-label="AI is typing">
            <div className={styles.messageAvatar} aria-hidden="true">
              🤖
            </div>
            <div className={styles.typingIndicator}>
              <span className={styles.typingDot} style={{ animationDelay: '0ms' }} />
              <span className={styles.typingDot} style={{ animationDelay: '150ms' }} />
              <span className={styles.typingDot} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className={styles.errorMessage} role="alert">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !isLoading && (
        <div className={styles.suggestions} role="group" aria-label="Suggested questions">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className={styles.suggestionButton}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <form className={styles.inputArea} onSubmit={handleSubmit}>
        <label htmlFor="chat-input" className="sr-only">
          Type your message
        </label>
        <textarea
          ref={inputRef}
          id="chat-input"
          className={styles.input}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          aria-describedby="char-count keyboard-hint"
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <div className={styles.inputActions}>
          <span id="char-count" className={styles.charCount} aria-live="polite">
            {characterCount}/{MAX_MESSAGE_LENGTH}
          </span>
          <button
            type="submit"
            className={styles.sendButton}
            disabled={isLoading || isInputEmpty}
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <span id="keyboard-hint" className="sr-only">
          Press Enter to send, Shift+Enter for new line, Escape to clear
        </span>
      </form>

      {/* Screen reader announcement region */}
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {lastAnnouncement}
      </div>
    </section>
  );
}
