import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatMessage from './ChatMessage';

describe('ChatMessage — user variant', () => {
  it('renders content in right-aligned bubble', () => {
    render(<ChatMessage role="user" content="Hello there" />);
    const bubble = screen.getByText('Hello there').closest('div') as HTMLElement;
    expect(bubble).toHaveStyle({ marginLeft: 'auto' });
  });

  it('uses --od-card background token for user messages', () => {
    render(<ChatMessage role="user" content="Hello" />);
    const bubble = screen.getByText('Hello').closest('div') as HTMLElement;
    expect(bubble.style.background).toBe('var(--od-card)');
  });
});

describe('ChatMessage — aiden variant', () => {
  it('renders content in left-aligned bubble', () => {
    render(<ChatMessage role="aiden" content="Hi there" />);
    const bubble = screen.getByText('Hi there').closest('div') as HTMLElement;
    expect(bubble).toHaveStyle({ marginRight: 'auto' });
  });

  it('uses --od-navy background token for aiden messages', () => {
    render(<ChatMessage role="aiden" content="Hi" />);
    const bubble = screen.getByText('Hi').closest('div') as HTMLElement;
    expect(bubble.style.background).toBe('var(--od-navy)');
  });

  it('renders typing indicator when isTyping is true', () => {
    render(<ChatMessage role="aiden" content="" isTyping />);
    expect(screen.getByLabelText(/Aiden is typing/i)).toBeInTheDocument();
  });

  it('does not render typing indicator when isTyping is false', () => {
    render(<ChatMessage role="aiden" content="Response text" />);
    expect(screen.queryByLabelText(/Aiden is typing/i)).not.toBeInTheDocument();
    expect(screen.getByText('Response text')).toBeInTheDocument();
  });

  it('does not render content when typing indicator is shown', () => {
    render(<ChatMessage role="aiden" content="hidden content" isTyping />);
    expect(screen.queryByText('hidden content')).not.toBeInTheDocument();
  });
});
