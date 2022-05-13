import { OutlinedTextFieldProps, TextField } from '@mui/material';
import { useMemo } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';

type IFormTextField = Omit<OutlinedTextFieldProps, 'variant'> & {
  name: string;
  control: Control<any>;
  errors?: FieldError | undefined;
  margin_type?: 'no-margin' | 'left-margin';
};

export function FormTextField({
  errors,
  margin_type,
  sx,
  name,
  control,
  defaultValue,
  helperText,
  ...props
}: IFormTextField) {
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

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || ''}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          variant="outlined"
          error={!!errors}
          sx={sxFixed}
          helperText={errors ? errors.message : helperText}
          {...props}
        />
      )}
    />
  );
}
