import { Clear, QueryBuilder, Today } from '@mui/icons-material';
import { Box, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { useMemo } from 'react';
import { Control, Controller, FieldError } from 'react-hook-form';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';

type IFormDatePicker = {
  name: string;
  label: string;
  control: Control<any>;
  defaultValue?: Date | null;
  errors?: FieldError;
  disabled?: boolean;
  margin_type?: 'no-margin' | 'left-margin';
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
    };
  }, [margin_type]);

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue || null}
      render={({ field }) => (
        <DateTimePicker
          onChange={(newValue) => field.onChange(newValue)}
          value={field.value}
          disabled={disabled}
          showToolbar
          showDaysOutsideCurrentMonth
          components={{
            ActionBar: ({ onSetToday, onClear }) => (
              <Box
                display="flex"
                sx={(theme) => ({ borderTop: `1px solid ${theme.palette.divider}` })}
              >
                <CustomButton
                  variant="text"
                  size="medium"
                  onClick={onSetToday}
                  margin_type="no-margin"
                >
                  Hoje
                </CustomButton>

                <CustomButton
                  variant="text"
                  size="medium"
                  onClick={onClear}
                  margin_type="no-margin"
                >
                  Limpar
                </CustomButton>
              </Box>
            ),
            OpenPickerIcon: () => <Today fontSize="medium" />,
          }}
          OpenPickerButtonProps={{
            size: 'small',
            sx: { marginRight: '-0.5rem', marginLeft: '-0.4rem' },
          }}
          views={['year', 'month', 'day', 'hours', 'minutes']}
          renderInput={(textFieldProps) => (
            <TextField
              {...textFieldProps}
              required={required}
              label={label}
              name={name}
              error={!!errors}
              helperText={errors ? errors.message : ''}
              InputProps={{
                ...textFieldProps.InputProps,
                endAdornment: (
                  <>
                    {field.value && (
                      <CustomIconButton
                        action={() => field.onChange(null)}
                        iconType="custom"
                        title="Limpar"
                        size="small"
                        sx={{ zIndex: 10, padding: '2px' }}
                        CustomIcon={<Clear fontSize="small" />}
                      />
                    )}

                    <CustomIconButton
                      action={() => field.onChange(new Date())}
                      iconType="custom"
                      title="Agora"
                      size="medium"
                      sx={{ zIndex: 10, padding: '2px' }}
                      CustomIcon={<QueryBuilder fontSize="small" />}
                    />

                    {textFieldProps.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={sxFixed}
            />
          )}
        />
      )}
    />
  );
}
