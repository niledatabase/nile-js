import React from 'react';
import { render, screen } from '@testing-library/react'

import Button from '.';

describe('Button', () => {
    it('renders non-themed', () => {
        render(<Button onClick={jest.fn()} text="mario" name="signupButton" />);
        expect(screen.getByRole('button').className).toEqual('nile');
    })
    it('renders themed string', () => {
        render(<Button onClick={jest.fn()} text="mario" name="signupButton" />);
        expect(screen.getByRole('button').className).toEqual('nile');
    })
    it('renders themed component', () => {
        render(<Button onClick={jest.fn()} text="mario" name="signupButton" />);
        expect(screen.getByRole('button').className).toEqual('nile');
    })
})