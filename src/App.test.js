import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Vaccine Locator', () => {
  render(<App />);
  const linkElement = screen.getByText(/Vaccine Locator/i);
  expect(linkElement).toBeInTheDocument();
});
