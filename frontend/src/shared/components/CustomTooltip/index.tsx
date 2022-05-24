import { Tooltip } from '@mui/material';

import { TextEllipsis } from '#shared/styledComponents/common';

type ICustomTooltip = { title: string | JSX.Element; children: string | JSX.Element };

export function CustomTooltip({ title, children }: ICustomTooltip) {
  return (
    <>
      <Tooltip
        arrow
        componentsProps={{
          tooltip: {
            sx: (theme) => ({
              backgroundColor: theme.palette.background.default,
              border: `1px solid ${theme.palette.divider}`,
            }),
          },
        }}
        title={title}
      >
        {typeof children === 'string' ? <TextEllipsis>{children}</TextEllipsis> : children}
      </Tooltip>
    </>
  );
}
