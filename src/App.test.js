import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Digital Book Journal title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Digital Book Journal/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Name of the book input', () => {
  render(<App />);
  const inputElement = screen.getByPlaceholderText(/Name of the book/i);
  expect(inputElement).toBeInTheDocument();
});

test('renders Rating card section', () => {
  render(<App />);
  const ratingElements = screen.getAllByText(/Rating/i);
  expect(ratingElements.length).toBeGreaterThan(0);
});
