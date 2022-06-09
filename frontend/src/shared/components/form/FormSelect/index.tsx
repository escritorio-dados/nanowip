/* eslint-disable no-nested-ternary */
import { Autocomplete, TextField } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';

import { PopperStyled } from './styles';

type IFormAutoComplete = {
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
};

export function FormSelect({
  multiple,
  options,
  optionLabel,
  optionValue,
  control,
  label,
  name,
  defaultValue,
  errors,
  disabled,
  margin_type,
  required,
  freeSolo,
}: IFormAutoComplete) {
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
          getOptionLabel={getLabel}
          freeSolo={freeSolo}
          multiple={multiple}
          options={options}
          disabled={disabled}
          onChange={(_, data) => field.onChange(data)}
          isOptionEqualToValue={isOptionValueEqual}
          PopperComponent={PopperStyled}
          renderInput={(params) => (
            <TextField
              {...params}
              required={required}
              label={label}
              name={name}
              error={!!errors}
              helperText={
                errors ? (Array.isArray(errors) ? errors[0].message : errors.message) : ''
              }
              inputProps={{
                ...params.inputProps,
              }}
              sx={sxFixed}
            />
          )}
          fullWidth
        />
      )}
    />
  );
}
