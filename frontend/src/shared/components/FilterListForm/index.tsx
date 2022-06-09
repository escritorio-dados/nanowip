import { Grid } from '@mui/material';
import { useCallback } from 'react';
import { UseFormHandleSubmit, UseFormReset } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { IKeepStatesContextData } from '#shared/hooks/keepStates';
import { IPaginationConfig } from '#shared/utils/pagination';

export type IListFilter<T> = {
  keepState: IKeepStatesContextData;
  stateKey: string;
  apiConfig: IPaginationConfig<T>;
  updateApiConfig: (filter: T) => void;
};

type IFilterListForm<T> = {
  keepState: IKeepStatesContextData;
  stateKey: string;
  updateApiConfig: (filter: T) => void;
  defaultFilter: T;
  children: JSX.Element;
  handleSubmit: UseFormHandleSubmit<T>;
  resetForm: UseFormReset<T>;
};

export function FilterListForm<T>({
  keepState,
  stateKey,
  updateApiConfig,
  defaultFilter,
  children,
  handleSubmit,
  resetForm,
}: IFilterListForm<T>) {
  const handleApplyFilters = useCallback(
    (formData: T) => {
      updateApiConfig(formData);

      keepState.updateState({
        category: 'filters',
        key: stateKey,
        value: formData,
        localStorage: true,
      });
    },
    [keepState, stateKey, updateApiConfig],
  );

  const handleClearFilters = useCallback(() => {
    updateApiConfig(defaultFilter);

    resetForm(defaultFilter as any);

    keepState.updateState({
      category: 'filters',
      key: stateKey,
      value: undefined,
      localStorage: true,
    });
  }, [updateApiConfig, defaultFilter, resetForm, keepState, stateKey]);

  return (
    <form onSubmit={handleSubmit(handleApplyFilters as any)} noValidate>
      {children}

      <Grid container columnSpacing={2}>
        <Grid item md={6} xs={12}>
          <CustomButton type="submit" size="small">
            Aplicar Filtros
          </CustomButton>
        </Grid>
        <Grid item md={6} xs={12}>
          <CustomButton color="info" size="small" onClick={handleClearFilters}>
            Limpar Filtros
          </CustomButton>
        </Grid>
      </Grid>
    </form>
  );
}
