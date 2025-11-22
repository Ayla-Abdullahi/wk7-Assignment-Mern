import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock dynamic import component
vi.mock('./components/Hello.jsx', () => ({ default: () => <p>Code splitting works! Backend status: ok</p> }));

import App from './App.jsx';

describe('App lazy loading', () => {
  it('shows fallback then lazy component', async () => {
    render(<App />);
    // Fallback appears immediately
    expect(screen.getByText(/Loading chunk/i)).toBeInTheDocument();
    // Lazy component eventually renders
    const lazyText = await screen.findByText(/Code splitting works!/i);
    expect(lazyText).toBeInTheDocument();
  });
});
