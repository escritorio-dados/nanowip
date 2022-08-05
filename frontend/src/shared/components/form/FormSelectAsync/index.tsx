/* eslint-disable no-nested-ternary */
import {
  Autocomplete,
  AutocompleteRenderOptionState,
  CircularProgress,
  createFilterOptions,
  TextField,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';

import { PopperStyled } from './styles';

type IFormSelectAsync = {
  name: string;
  label: string;
  control: Control<any>;
  defaultValue?: any;
  options: any;
  optionLabel?: string;
  optionValue?: string;
  multiple?: boolean;
  errors?: FieldError | FieldError[];
  disabled?: boolean;
  margin_type?: 'no-margin' | 'left-margin';
  required?: boolean;
  freeSolo?: boolean;
  loading?: boolean;
  handleOpen: () => void;
  handleFilter: (filterParams?: any) => void;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    options: any,
    state: AutocompleteRenderOptionState,
  ) => JSX.Element;
  limitFilter: number;
  filterField: string;
  helperText?: string;
};

export function FormSelectAsync({
  multiple,
  options,
  optionLabel,
  control,
  label,
  name,
  defaultValue,
  errors,
  disabled,
  margin_type,
  required,
  freeSolo,
  loading,
  handleOpen,
  handleFilter,
  limitFilter = 100,
  filterField,
  helperText,
  optionValue,
  renderOption,
}: IFormSelectAsync) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const sxFixed = useMemo(() => {
    let marginTop: string | undefined = '1em';
    let marginLeft: string | undefined;

    if (margin_type) {
      marginTop = undefined;
    }

    if (margin_type === 'left-margin') {
      marginLeft = '1em';
    }

    return {
      marginTop,
      marginLeft,
    };
  }, [margin_type]);

  const getLabel = useCallback<(option: any) => string>(
    (option: any) => {
      if (!option) {
        return '';
      }

      if (!optionLabel) {
        return option;
      }

      return option[optionLabel];
    },
    [optionLabel],
  );

  const isOptionValueEqual = useCallback(
    (option: any, value: any) => {
      if (!optionValue) {
        return option === value;
      }

      return option[optionValue] === value[optionValue];
    },
    [optionValue],
  );

  const handleFilters = useCallback(
    (inputValue: string) => {
      if ((options && options.length >= limitFilter - (defaultValue ? 1 : 0)) || filtered) {
        const filterParams =
          inputValue !== '' ? { params: { [filterField]: inputValue } } : undefined;

        handleFilter(filterParams);

        setFiltered(inputValue !== '');
      }
    },
    [defaultValue, filterField, filtered, handleFilter, limitFilter, options],
  );

  const handleOnOpen = useCallback(() => {
    setOpen(true);

    if (firstLoad) {
      handleOpen();

      setFirstLoad(false);
    }
  }, [firstLoad, handleOpen]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || (multiple ? [] : null)}
      render={({ field }) => (
        <Autocomplete
          {...field}
          noOptionsText="Nenhuma Opção"
          filterSelectedOptions
          filterOptions={(filterOptions, params) => {
            const filteredOptions = createFilterOptions<any>()(filterOptions, params);

            if (!freeSolo) {
              return filteredOptions;
            }

            const { inputValue } = params;

            // Suggest the creation of a new value
            const isExisting = filterOptions.some((option) => inputValue === getLabel(option));

            if (inputValue !== '' && !isExisting) {
              let newOptions: string | { [key: string]: string } = inputValue;

              if (optionLabel || optionValue) {
                newOptions = {
                  [optionLabel || optionValue]: newOptions,
                  [optionValue || optionLabel]: newOptions,
                };
              }

              filteredOptions.push(newOptions);
            }

            return filteredOptions;
          }}
          open={open}
          getOptionLabel={getLabel}
          freeSolo={freeSolo}
          multiple={multiple}
          options={options}
          disabled={disabled}
          onChange={(_, data) => field.onChange(data)}
          onInputChange={(_, newInputValue) => handleFilters(newInputValue)}
          isOptionEqualToValue={isOptionValueEqual}
          PopperComponent={PopperStyled}
          loading={loading}
          loadingText="Carregando"
          onOpen={handleOnOpen}
          onClose={() => {
            setOpen(false);
          }}
          sx={sxFixed}
          renderOption={renderOption || undefined}
          renderInput={(params) => (
            <TextField
              {...params}
              required={required}
              label={label}
              name={name}
              error={!!errors}
              helperText={
                errors
                  ? Array.isArray(errors)
                    ? errors[0].message
                    : errors.message
                  : helperText || ''
              }
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="primary" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          fullWidth
        />
      )}
    />
  );
}
