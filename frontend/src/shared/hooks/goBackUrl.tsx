import { createContext, useCallback, useState, useContext, ReactNode, useMemo } from 'react';

import { useKeepStates } from './keepStates';

type IGoBackUrlProviderProps = { children: ReactNode };

type ILocation = { pathname: string; search: string };

type IGoBackUrlContextData = {
  getBackUrl(page: string): string | ILocation | undefined;
  setBackUrl(page: string, location: string | ILocation): void;
};

type IGoBackState = { [page: string]: string | ILocation };

const GoBackUrlContext = createContext<IGoBackUrlContextData>({} as IGoBackUrlContextData);

export function GoBackUrlProvider({ children }: IGoBackUrlProviderProps) {
  const keepState = useKeepStates();

  const [goBackUrl, setGoBackUrl] = useState<IGoBackState>(
    keepState.getState({ category: 'back_url', key: 'data', defaultValue: {} }),
  );

  const getBackUrl = useCallback(
    (page: string) => {
      return goBackUrl[page];
    },
    [goBackUrl],
  );

  const setBackUrl = useCallback(
    (page: string, url: ILocation | string) => {
      const newState = {
        ...goBackUrl,
        [page]: url,
      };

      setGoBackUrl(newState);

      keepState.updateState({
        category: 'back_url',
        key: 'data',
        value: newState,
        localStorage: true,
      });
    },
    [goBackUrl, keepState],
  );

  const goBackUrlValue = useMemo(() => {
    return {
      getBackUrl,
      setBackUrl,
    };
  }, [getBackUrl, setBackUrl]);

  return <GoBackUrlContext.Provider value={goBackUrlValue}>{children}</GoBackUrlContext.Provider>;
}

export function useGoBackUrl(): IGoBackUrlContextData {
  const context = useContext(GoBackUrlContext);

  if (!context) {
    throw new Error('useGoBackUrl must be used within an GoBackUrlProvider');
  }

  return context;
}
