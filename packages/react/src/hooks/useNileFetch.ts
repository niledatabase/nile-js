import { NileApiResults } from '@theniledev/js';
import React from 'react';

export interface ApiResponse<T> {
  raw: void | Response;
  value(): Promise<T>;
}

type ResultsCanBe =
  | Array<NileApiResults>
  | NileApiResults
  | (() => NileApiResults)
  | (() => Array<NileApiResults>);
/**
 * The primary hook to use when wanting stateful nile requests
 * @param fn - the fetch function(s) to use
 * @returns a tuple of loading state and the potentially fetched value(s)
 */
export function useNileFetch<T = unknown>(args: ResultsCanBe): [boolean, T] {
  const [isLoading, setIsLoading] = React.useState(false);
  const [fetched, setFetched] = React.useState<unknown>([]);

  const _fn = React.useMemo<ResultsCanBe>(() => {
    return args;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fnsToCall =
    React.useMemo<null | ResultsCanBe>((): null | ResultsCanBe => {
      if (typeof _fn === 'function') {
        return _fn;
      } else if (!Array.isArray(_fn) && typeof _fn === 'object' && _fn) {
        if (_fn instanceof Promise || 'request' in _fn) {
          return [_fn];
        }
      } else if (Array.isArray(_fn)) {
        return _fn.filter(
          (f: NileApiResults) => f instanceof Promise || 'request' in f
        );
      }
      return null;
    }, [_fn]);

  React.useEffect(() => {
    async function doFetch() {
      if (fnsToCall) {
        setIsLoading(true);
        const promiseHandler = async (f: ResultsCanBe) => {
          if ('request' in f) {
            return f.request();
          } else if (typeof f === 'function') {
            const fns = f();
            if (Array.isArray(fns)) {
              return Promise.all(fns);
            }
            return fns;
          }
          return f;
        };
        const callers = Array.isArray(fnsToCall)
          ? fnsToCall.map(promiseHandler)
          : [promiseHandler(fnsToCall)];
        const rawCalls = await Promise.all(callers).catch(() =>
          setIsLoading(false)
        );
        if (!rawCalls || rawCalls.length === 0) {
          return;
        }

        const vals = await Promise.all(
          rawCalls.map(async (c: unknown) => {
            if (typeof c === 'object' && c != null && 'value' in c) {
              // @ts-expect-error - its def checked
              const val = await c.value();
              return val;
            }

            return c;
          })
        ).catch(() => setIsLoading(false));

        if (!vals) {
          return;
        }

        const items = vals.filter(Boolean);
        if (items.length) {
          if (
            (Array.isArray(fnsToCall) && fnsToCall.length === 1) ||
            typeof fnsToCall === 'function'
          ) {
            const [item] = items;
            setFetched(item);
          } else if (Array.isArray(fnsToCall)) {
            setFetched(items);
          }
        }
        setIsLoading(false);
      }
    }
    doFetch();
    return () => {
      fnsToCall &&
        Array.isArray(fnsToCall) &&
        fnsToCall.forEach((f) => {
          if ('controller' in f) {
            f.controller.abort();
          }
        });
    };
  }, [fnsToCall, _fn]);

  return [isLoading, fetched as T];
}
