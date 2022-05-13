import { createContext, useCallback, useState, useContext, ReactNode, useMemo } from 'react';

import { useKeepStates } from './keepStates';

type IGoBackUrlProviderProps = { children: ReactNode };

type ILocation = { pathname: string; search: string };

type IGoBackUrlContextData = {
  getBackUrl(page: string): ILocation | undefined;
  setBackUrl(page: string, location: ILocation): void;
};

type IGoBackState = { [page: string]: ILocation };

const GoBackUrlContext = createContext<IGoBackUrlContextData>({} as IGoBackUrlContextData);

export function GoBackUrlProvider({ children }: IGoBackUrlProviderProps) {
  const { getState, updateState } = useKeepStates();

  const [goBackUrl, setGoBackUrl] = useState<IGoBackState>(
    getState({ category: 'back_url', key: 'data', defaultValue: {} }),
  );

  const getBackUrl = useCallback(
    (page: string) => {
      return goBackUrl[page];
    },
    [goBackUrl],
  );

  const setBackUrl = useCallback(
    (page: string, location: ILocation) => {
      const newState = {
        ...goBackUrl,
        [page]: location,
      };

      setGoBackUrl(newState);

      updateState({ category: 'back_url', key: 'data', value: newState, localStorage: true });
    },
    [goBackUrl, updateState],
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
