import { createContext, useCallback, useState, useContext, ReactNode, useMemo } from 'react';

type IKeepStatesProviderProps = { children: ReactNode };

type IStates = { [key: string]: any | undefined };
type ICategory = { [category: string]: IStates | undefined };

type IUpdateStatesParams = { category: string; key: string; value: any; localStorage?: boolean };
type IGetStatesParams = { category: string; key: string; defaultValue?: any };

export type IKeepStatesContextData = {
  updateState(params: IUpdateStatesParams): void;
  updateManyStates(params: IUpdateStatesParams[], keep?: boolean): void;
  getState<T>(params: IGetStatesParams): T;
};

const KeepStatesContext = createContext<IKeepStatesContextData>({} as IKeepStatesContextData);

export function KeepStatesProvider({ children }: IKeepStatesProviderProps) {
  const [sessionStates, setSessionStates] = useState<ICategory>({});

  const [storageStates, setStorageStates] = useState<ICategory>(() => {
    const state = localStorage.getItem('@nanowip:keep_states');

    if (state) {
      return JSON.parse(state);
    }

    return {};
  });

  const updateState = useCallback(
    ({ category, key, value, localStorage: keepLocalStorage }: IUpdateStatesParams) => {
      if (keepLocalStorage) {
        setStorageStates((oldState) => {
          const newState = {
            ...oldState,
            [category]: {
              ...oldState[category],
              [key]: value,
            },
          };

          localStorage.setItem('@nanowip:keep_states', JSON.stringify(newState));

          return newState;
        });
      } else {
        setSessionStates((oldState) => ({
          ...oldState,
          [category]: {
            ...oldState[category],
            [key]: value,
          },
        }));
      }
    },
    [],
  );

  const updateManyStates = useCallback((states: IUpdateStatesParams[], keep?: boolean) => {
    if (keep) {
      setStorageStates((oldState) => {
        const newState = { ...oldState };

        states.forEach(({ category, key, value }) => {
          newState[category] = {
            ...newState[category],
            [key]: value,
          };
        });

        localStorage.setItem('@nanowip:keep_states', JSON.stringify(newState));

        return newState;
      });
    } else {
      setSessionStates((oldState) => {
        const newState = { ...oldState };

        states.forEach(({ category, key, value }) => {
          newState[category] = {
            ...newState[category],
            [key]: value,
          };
        });

        return newState;
      });
    }
  }, []);

  const getState = useCallback(
    ({ category, key, defaultValue }: IGetStatesParams) => {
      const stateCategory = storageStates[category] || sessionStates[category];

      const value = stateCategory ? stateCategory[key] : undefined;

      if (value === false) {
        return value;
      }

      return value || defaultValue;
    },
    [sessionStates, storageStates],
  );

  const keepStateValue = useMemo(() => {
    return { updateState, getState, updateManyStates };
  }, [updateState, getState, updateManyStates]);

  return <KeepStatesContext.Provider value={keepStateValue}>{children}</KeepStatesContext.Provider>;
}

export function useKeepStates(): IKeepStatesContextData {
  const context = useContext(KeepStatesContext);

  if (!context) {
    throw new Error('useKeepStates must be used within an KeepStatesProvider');
  }

  return context;
}
