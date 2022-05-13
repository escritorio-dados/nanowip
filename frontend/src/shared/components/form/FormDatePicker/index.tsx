import { SxProps, TextField } from '@mui/material';
import { DatePicker, CalendarPickerView } from '@mui/x-date-pickers';
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
  customView?: CalendarPickerView[];
};

export function FormDatePicker({
  control,
  label,
  name,
  defaultValue,
  errors,
  disabled,
  margin_type,
  sx,
  required,
  customView,
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
        <DatePicker
          onChange={(newValue) => field.onChange(newValue)}
          value={field.value}
          disabled={disabled}
          cancelText="Cancelar"
          showTodayButton
          todayText="Hoje"
          views={customView || ['year', 'month', 'day']}
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