import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Hello from './components/Hello.jsx';

// Mock fetch for component
global.fetch = vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ status: 'ok', env: 'test' }) }));

describe('Hello component', () => {
  it('renders backend status', async () => {
    render(<Hello />);
    const el = await screen.findByText(/Backend status:/);
    expect(el.textContent).toContain('ok');
  });
});
