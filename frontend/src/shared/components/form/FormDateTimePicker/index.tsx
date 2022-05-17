import { SxProps, TextField } from '@mui/material';
import { MobileDateTimePicker } from '@mui/x-date-pickers';
import { useMemo } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';

type IFormDatePicker = {
  name: string;
  label: string;
  control: Control<any>;
  defaultValue?: Date | null;
  errors?: FieldError;
  disabled?: boolean;
  margin_type?: 'no-margin' | 'left-margin';
  sx?: SxProps;
  required?: boolean;
};

export function FormDateTimePicker({
  control,
  label,
  name,
  defaultValue,
  errors,
  disabled,
  margin_type,
  sx,
  required,
}: IFormDatePicker) {
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
      width: '100%',
      ...sx,
    };
  }, [margin_type, sx]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || null}
      render={({ field }) => (
        <MobileDateTimePicker
          onChange={(newValue) => field.onChange(newValue)}
          value={field.value}
          disabled={disabled}
          clearable
          clearText="Limpar"
          cancelText="Cancelar"
          showTodayButton
          todayText="Hoje"
          toolbarTitle="Selecionar Data e Hora"
          views={['year', 'month', 'day', 'hours', 'minutes']}
          renderInput={(textFieldProps) => (
            <TextField
              {...textFieldProps}
              required={required}
              label={label}
              name={name}
              error={!!errors}
              helperText={errors ? errors.message : ''}
              inputProps={{
                ...textFieldProps.inputProps,
              }}
              sx={sxFixed}
            />
          )}
        />
      )}
    />
  );
}
