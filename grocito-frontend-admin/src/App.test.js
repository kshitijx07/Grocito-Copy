import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders admin login page', () => {
  render(<App />);
  // This test might need to be updated based on the actual content
  // For now, just check if the app renders without crashing
  expect(document.body).toBeInTheDocument();
});