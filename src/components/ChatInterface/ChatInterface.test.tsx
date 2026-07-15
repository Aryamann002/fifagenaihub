/**
 * Tests for the ChatInterface component — message flow, suggestions,
 * injected queries, error handling, and accessibility. Exercises the
 * useChat hook end-to-end against a mocked /api/chat.
 * @module components/ChatInterface/ChatInterface.test
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import ChatInterface from '@/components/ChatInterface/ChatInterface';
import type { ChatContext } from '@/types';

const CONTEXT: ChatContext = { stadiumId: 'metlife', role: 'fan' };

const originalFetch = global.fetch;

/** Mocks /api/chat with a canned assistant reply */
function mockChatApi(reply = 'Gate B is on the north side.'): jest.Mock {
  const mock = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      reply,
      detectedLanguage: 'en',
      confidence: 0.9,
      suggestions: ['Need directions?', 'Want food options?'],
      category: 'navigation',
    }),
  });
  global.fetch = mock as unknown as typeof fetch;
  return mock;
}

afterEach(() => {
  global.fetch = originalFetch;
});

describe('ChatInterface', () => {
  it('renders the empty state with role-specific guidance', () => {
    render(<ChatInterface context={CONTEXT} title="AI Concierge" />);

    expect(screen.getByRole('region', { name: 'AI Concierge' })).toBeInTheDocument();
    expect(screen.getByText(/stadium navigation, food options/)).toBeInTheDocument();
  });

  it('sends a message and renders the assistant reply', async () => {
    const user = userEvent.setup();
    const fetchMock = mockChatApi();
    render(<ChatInterface context={CONTEXT} />);

    await user.type(screen.getByLabelText('Type your message'), 'Where is Gate B?');
    await user.click(screen.getByRole('button', { name: 'Send message' }));

    // Optimistic user message appears immediately
    expect(screen.getByText('Where is Gate B?')).toBeInTheDocument();

    // Assistant reply arrives from the (mocked) API
    expect(await screen.findByText('Gate B is on the north side.')).toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/chat');
    expect(JSON.parse(init.body as string).message).toBe('Where is Gate B?');
  });

  it('sends on Enter and renders follow-up suggestions', async () => {
    const user = userEvent.setup();
    mockChatApi();
    render(<ChatInterface context={CONTEXT} />);

    await user.type(screen.getByLabelText('Type your message'), 'Hello{Enter}');

    expect(await screen.findByRole('button', { name: 'Need directions?' })).toBeInTheDocument();
  });

  it('sends a suggestion when clicked', async () => {
    const user = userEvent.setup();
    const fetchMock = mockChatApi();
    render(<ChatInterface context={CONTEXT} />);

    await user.type(screen.getByLabelText('Type your message'), 'Hello{Enter}');
    await user.click(await screen.findByRole('button', { name: 'Need directions?' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string).message).toBe(
      'Need directions?',
    );
  });

  it('automatically dispatches an injected pending query', async () => {
    const fetchMock = mockChatApi();
    const onHandled = jest.fn();
    render(
      <ChatInterface
        context={CONTEXT}
        pendingQuery="How do I navigate to North at MetLife Stadium?"
        onPendingQueryHandled={onHandled}
      />,
    );

    expect(
      await screen.findByText('How do I navigate to North at MetLife Stadium?'),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onHandled).toHaveBeenCalled();
  });

  it('shows an alert when the API returns an error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({ error: 'Too many requests. Please slow down and try again.' }),
    }) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<ChatInterface context={CONTEXT} />);

    await user.type(screen.getByLabelText('Type your message'), 'Hello{Enter}');

    expect(await screen.findByRole('alert')).toHaveTextContent(/Too many requests/);
  });

  it('clears the conversation via the Clear button', async () => {
    const user = userEvent.setup();
    mockChatApi();
    render(<ChatInterface context={CONTEXT} />);

    await user.type(screen.getByLabelText('Type your message'), 'Hello{Enter}');
    await screen.findByText('Gate B is on the north side.');

    await user.click(screen.getByRole('button', { name: 'Clear all messages' }));

    expect(screen.queryByText('Gate B is on the north side.')).not.toBeInTheDocument();
    expect(screen.getByText(/Welcome to FanHub 26!/)).toBeInTheDocument();
  });

  it('disables the send button while the input is empty', () => {
    render(<ChatInterface context={CONTEXT} />);
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();
  });

  it('shows a live character count', async () => {
    const user = userEvent.setup();
    render(<ChatInterface context={CONTEXT} />);

    await user.type(screen.getByLabelText('Type your message'), 'Hello');
    expect(screen.getByText('5/500')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ChatInterface context={CONTEXT} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
