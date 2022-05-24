import { ButtonProps, SxProps, useTheme } from '@mui/material';
import { Button } from '@mui/material';
import { useMemo } from 'react';

type ICButtonProps = ButtonProps & {
  margin_type?: 'no-margin' | 'left-margin';
  custom_color?: string;
  sx?: SxProps;
};

export function CustomButton({
  custom_color,
  margin_type,
  sx,
  variant,
  children,
  ...props
}: ICButtonProps) {
  const theme = useTheme();

  const sxFixed = useMemo(() => {
    let marginTop: string | undefined = '1rem';
    let marginLeft: string | undefined;

    if (margin_type) {
      marginTop = undefined;
    }

    if (margin_type === 'left-margin') {
      marginLeft = '1rem';
    }

    return {
      marginTop,
      marginLeft,
      backgroundColor: custom_color,
      color: variant === 'text' ? theme.palette.text.primary : undefined,
      ...sx,
    };
  }, [custom_color, margin_type, sx, theme, variant]);

  return (
    <Button
      fullWidth
      variant={variant || 'contained'}
      color="primary"
      size="large"
      sx={sxFixed}
      {...props}
    >
      {children}
    </Button>
  );
}
