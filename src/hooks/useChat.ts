/**
 * useChat — Custom hook for managing GenAI chat state.
 * Handles message history, API communication, loading states, and error handling.
 * Integrates with the /api/chat endpoint for GenAI responses.
 * @module hooks/useChat
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, ChatContext, ChatResponse } from '@/types';

/** Return type for the useChat hook */
interface UseChatReturn {
  /** Array of chat messages in chronological order */
  messages: ChatMessage[];
  /** Whether a response is currently being generated */
  isLoading: boolean;
  /** Current error message, if any */
  error: string | null;
  /** Send a message to the GenAI assistant */
  sendMessage: (content: string) => Promise<void>;
  /** Clear all messages and reset state */
  clearMessages: () => void;
  /** Suggested follow-up questions from the last response */
  suggestions: string[];
}

/**
 * Manages the full lifecycle of a GenAI chat conversation.
 * Provides optimistic UI updates, error handling, and suggestion tracking.
 *
 * @param context - The chat context (stadium, role, language)
 * @returns Chat state and control functions
 */
export function useChat(context: ChatContext): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  /** Generates a unique message ID */
  const generateId = (): string => {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  /**
   * Sends a user message and receives an AI response.
   * Uses optimistic updates — the user message appears immediately.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();
      if (!trimmedContent || isLoading) return;

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Optimistic update: add user message immediately
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmedContent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);
      setSuggestions([]);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmedContent, context }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { error?: string }).error || `Request failed with status ${response.status}`,
          );
        }

        const data = (await response.json()) as ChatResponse;

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.reply,
          timestamp: Date.now(),
          detectedLanguage: data.detectedLanguage,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setSuggestions(data.suggestions ?? []);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          return; // Request was cancelled — not an error
        }
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [context, isLoading],
  );

  /** Clears all messages, errors, and suggestions */
  const clearMessages = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    setError(null);
    setSuggestions([]);
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    suggestions,
  };
}
