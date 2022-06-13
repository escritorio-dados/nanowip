import { IKeepStatesContextData } from '#shared/hooks/keepStates';

import { IPaginationConfig } from './pagination';

type IGetApiConfig<T> = {
  defaultApiConfig: IPaginationConfig<T>;
  keepState: IKeepStatesContextData;
  stateKey: string;
};

export function getApiConfig<T>({
  defaultApiConfig,
  keepState,
  stateKey,
}: IGetApiConfig<T>): IPaginationConfig<T> {
  const apiConfig = keepState.getState<IPaginationConfig<T>>({
    category: 'api_config',
    key: stateKey,
    defaultValue: defaultApiConfig,
  });

  return apiConfig;
}

type IUpdateApiConfig<T> = {
  keepState: IKeepStatesContextData;
  stateKey: string;
  apiConfig: IPaginationConfig<T>;
  newConfig: Partial<IPaginationConfig<T>>;
};

export function updateApiConfig<T>({
  keepState,
  apiConfig,
  stateKey,
  newConfig,
}: IUpdateApiConfig<T>) {
  const newApiConfig = { ...apiConfig, ...newConfig };

  keepState.updateState({
    category: 'api_config',
    key: stateKey,
    value: newApiConfig,
    localStorage: true,
  });

  return newApiConfig;
}

type IHandleFilterNavigation<T> = {
  defaultApiConfig: IPaginationConfig<T>;
  stateKey: string;
  keepState: IKeepStatesContextData;
  filters: Partial<T>;
};

export function handleFilterNavigation<T>({
  defaultApiConfig,
  stateKey,
  keepState,
  filters,
}: IHandleFilterNavigation<T>) {
  const apiConfigAssignments = getApiConfig({
    defaultApiConfig,
    stateKey,
    keepState,
  });

  updateApiConfig({
    keepState,
    stateKey,
    apiConfig: apiConfigAssignments,
    newConfig: {
      page: 1,
      filters: { ...defaultApiConfig.filters, ...filters },
    },
  });
}
