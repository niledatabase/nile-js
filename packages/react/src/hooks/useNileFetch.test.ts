import { act, renderHook } from '@testing-library/react-hooks';
import { NileApiResults } from '@theniledev/js';

import { useNileFetch } from './useNileFetch';

describe('useNileFetch', () => {
  it('returns loading and a single item when passed single item', async () => {
    const resolver = jest.fn();
    const baseFetch: NileApiResults = Promise.resolve(resolver);
    await act(async () => {
      const { result } = renderHook(() => useNileFetch(baseFetch));
      await expect(result.current).toEqual([false, null]);
    });
  });

  it('returns loading and an array when multiple args are passed', async () => {
    const resolver = jest.fn();
    const baseFetch: NileApiResults = Promise.resolve(resolver);
    await act(async () => {
      const { result } = renderHook(() => useNileFetch([baseFetch, baseFetch]));
      await expect(result.current).toEqual([false, null]);
    });
  });

  it('calls promise functions and values', async () => {
    const requestResolver = jest.fn();
    const valueResolver = jest.fn();
    const baseFetch: NileApiResults = {
      controller: new AbortController(),
      request: () => {
        requestResolver();
        return Promise.resolve({
          raw: undefined,
          value: () => Promise.resolve(() => valueResolver()),
        });
      },
    };
    await act(async () => {
      renderHook(() => useNileFetch(baseFetch));
    });
    expect(requestResolver).toHaveBeenCalledTimes(1);
    expect(valueResolver).toHaveBeenCalledTimes(1);
  });

  it('calls functions ', async () => {
    const requestResolver = jest.fn();
    const baseFetch = () => Promise.resolve(requestResolver());
    await act(async () => {
      renderHook(() => useNileFetch(baseFetch));
    });
    expect(requestResolver).toHaveBeenCalledTimes(1);
  });

  it('calls function with an array', async () => {
    const requestResolver1 = jest.fn();
    const requestResolver2 = jest.fn();
    const baseFetch = () => [
      Promise.resolve(requestResolver1()),
      Promise.resolve(requestResolver2()),
    ];
    await act(async () => {
      renderHook(() => useNileFetch(baseFetch));
    });
    expect(requestResolver1).toHaveBeenCalledTimes(1);
    expect(requestResolver2).toHaveBeenCalledTimes(1);
  });
});
