/* eslint-disable no-nested-ternary */
import {
  Autocomplete,
  AutocompleteRenderOptionState,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import { PopperStyled } from './styles';

type ICustomSelectAsync = {
  label: string;
  value: any;
  onChange: (newValue: any) => void;
  options: any;
  optionLabel?: string;
  optionValue?: string;
  multiple?: boolean;
  errors?: string;
  disabled?: boolean;
  margin_type?: 'no-margin' | 'left-margin';
  required?: boolean;
  freeSolo?: boolean;
  loading?: boolean;
  handleOpen: () => void;
  handleFilter: (filterParams?: any) => void;
  limitFilter: number;
  filterField: string;
  helperText?: string;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement>,
    options: any,
    state: AutocompleteRenderOptionState,
  ) => JSX.Element;
};

export function CustomSelectAsync({
  multiple,
  options,
  optionLabel,
  label,
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
  onChange,
  value,
  optionValue,
  renderOption,
}: ICustomSelectAsync) {
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
    (option: any, cvalue: any) => {
      if (!optionValue) {
        return option === cvalue;
      }

      return option[optionValue] === cvalue[optionValue];
    },
    [optionValue],
  );

  const handleFilters = useCallback(
    (inputValue: string) => {
      if ((options && options.length >= limitFilter) || filtered) {
        const filterParams =
          inputValue !== '' ? { params: { [filterField]: inputValue } } : undefined;

        handleFilter(filterParams);

        setFiltered(inputValue !== '');
      }
    },
    [filterField, filtered, handleFilter, limitFilter, options],
  );

  const handleOnOpen = useCallback(() => {
    setOpen(true);

    if (firstLoad) {
      handleOpen();

      setFirstLoad(false);
    }
  }, [firstLoad, handleOpen]);

  return (
    <Autocomplete
      noOptionsText="Nenhuma Opção"
      filterSelectedOptions
      open={open}
      getOptionLabel={getLabel}
      freeSolo={freeSolo}
      multiple={multiple}
      options={options}
      disabled={disabled}
      onChange={(_, data) => onChange(data)}
      onInputChange={(_, newInputValue) => handleFilters(newInputValue)}
      isOptionEqualToValue={isOptionValueEqual}
      PopperComponent={PopperStyled}
      loading={loading}
      loadingText="Carregando"
      onOpen={handleOnOpen}
      onClose={() => {
        setOpen(false);
      }}
      value={value}
      renderOption={renderOption || undefined}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          label={label}
          error={!!errors}
          helperText={errors || helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="primary" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={sxFixed}
        />
      )}
      fullWidth
    />
  );
}
