import { AddCircle, Delete, Edit, Info } from '@mui/icons-material';
import { IconButton, IconButtonProps } from '@mui/material';
import { ReactNode } from 'react';

import { CustomTooltip } from '../CustomTooltip';

export type ICIconButtonProps = Omit<IconButtonProps, 'action'> & {
  title: string;
  action(event: React.MouseEvent<HTMLButtonElement>): void;
  iconType: 'add' | 'edit' | 'delete' | 'custom' | 'info';
  iconSize?: 'large' | 'small';
  CustomIcon?: ReactNode;
};

export function CustomIconButton({
  title,
  action,
  iconType,
  CustomIcon,
  iconSize,
  ...props
}: ICIconButtonProps) {
  return (
    <CustomTooltip title={title}>
      <IconButton onClick={action} size="medium" {...props}>
        {iconType === 'add' && (
          <AddCircle fontSize={iconSize || 'medium'} sx={{ color: 'success.light' }} />
        )}

        {iconType === 'edit' && (
          <Edit fontSize={iconSize || 'medium'} sx={{ color: 'info.dark' }} />
        )}

        {iconType === 'delete' && (
          <Delete fontSize={iconSize || 'medium'} sx={{ color: 'error.main' }} />
        )}

        {iconType === 'info' && (
          <Info fontSize={iconSize || 'medium'} sx={{ color: 'text.primary' }} />
        )}

        {iconType === 'custom' && CustomIcon}
      </IconButton>
    </CustomTooltip>
  );
}
