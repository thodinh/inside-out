import React from 'react';
import { render, screen } from 'testUtils';
import App1 from '../demos/demo1';

describe('Details', () => {
  it('should render correctly', () => {
    render(<App1 />);

    expect(screen.getByText('this is name')).toBeInTheDocument();
    expect(screen.getByText('this is age')).toBeInTheDocument();
  });
});
