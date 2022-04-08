import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import * as Context from '../../context';

import Button from '.';

jest.mock('../../context');

describe('Button', () => {
  it('renders non-themed', async () => {
    render(
      <Button
        node={null}
        onClick={jest.fn()}
        text="mario"
        name="signupButton"
      />
    );
    expect(screen.getByRole('button').className).toEqual('signupButton');
  });
  it('renders themed string', () => {
    // @ts-expect-error - for testing
    Context.useNileContextTheme = () => 'something';
    render(
      <Button
        node={null}
        onClick={jest.fn()}
        text="mario"
        name="signupButton"
      />
    );
    expect(screen.getByRole('button').className).toEqual(
      'something-signupButton'
    );
  });
  it('renders themed component', () => {
    const onClick = jest.fn();
    render(
      <Button
        node={<div>mybutton</div>}
        onClick={onClick}
        text="mario"
        name="signupButton"
      />
    );
    const button = screen.getByText('mybutton');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});
