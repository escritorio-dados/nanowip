import { AddCircle, Delete, Edit, Info } from '@mui/icons-material';
import { IconButton, SxProps } from '@mui/material';
import { ReactNode } from 'react';

import { CustomTooltip } from '../CustomTooltip';

type ICIconButtonProps = {
  title: string;
  action(event: React.MouseEvent<HTMLButtonElement>): void;
  type: 'add' | 'edit' | 'delete' | 'custom' | 'info';
  size?: 'large' | 'small';
  CustomIcon?: ReactNode;
  sx?: SxProps;
};

export function CustomIconButton({ title, action, type, CustomIcon, size, sx }: ICIconButtonProps) {
  return (
    <CustomTooltip title={title}>
      <IconButton onClick={action} size="large" sx={{ color: 'text.primary', ...sx }}>
        {type === 'add' && (
          <AddCircle fontSize={size || 'medium'} sx={{ color: 'success.light' }} />
        )}

        {type === 'edit' && <Edit fontSize={size || 'medium'} sx={{ color: 'info.dark' }} />}

        {type === 'delete' && <Delete fontSize={size || 'medium'} sx={{ color: 'error.main' }} />}

        {type === 'info' && <Info fontSize={size || 'medium'} sx={{ color: 'text.primary' }} />}

        {type === 'custom' && CustomIcon}
      </IconButton>
    </CustomTooltip>
  );
}
