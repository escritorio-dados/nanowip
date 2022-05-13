/* eslint-disable no-nested-ternary */
import { Autocomplete, SxProps, TextField } from '@mui/material';
import { useCallback, useMemo } from 'react';

import { PopperStyled } from './styles';

type ICustomSelect = {
  label: string;
  value: any;
  onChange: (newValue: any) => void;
  options: any;
  optionLabel?: string;
  multiple?: boolean;
  errors?: string;
  disabled?: boolean;
  margin_type?: 'no-margin' | 'left-margin';
  sx?: SxProps;
  required?: boolean;
  freeSolo?: boolean;
};

export function CustomSelect({
  multiple,
  options,
  optionLabel,
  label,
  errors,
  disabled,
  margin_type,
  sx,
  required,
  freeSolo,
  onChange,
  value,
}: ICustomSelect) {
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
      ...sx,
    };
  }, [margin_type, sx]);

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
    (option: any, valuec: any) => {
      if (!optionLabel) {
        return option === valuec;
      }

      return option[optionLabel] === valuec[optionLabel];
    },
    [optionLabel],
  );

  return (
    <Autocomplete
      noOptionsText="Nenhuma Opção"
      filterSelectedOptions
      getOptionLabel={getLabel}
      freeSolo={freeSolo}
      multiple={multiple}
      options={options}
      disabled={disabled}
      onChange={(_, data) => onChange(data)}
      isOptionEqualToValue={isOptionValueEqual}
      PopperComponent={PopperStyled}
      value={value}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          label={label}
          error={!!errors}
          helperText={errors || ''}
          inputProps={{
            ...params.inputProps,
          }}
          sx={sxFixed}
        />
      )}
      fullWidth
    />
  );
}
