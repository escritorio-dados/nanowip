import { Tooltip } from '@mui/material';

import { TextEllipsis } from '#shared/styledComponents/common';

type ICustomTooltip = { title: string | JSX.Element; text: string | JSX.Element };

export function CustomTooltip({ title, text }: ICustomTooltip) {
  return (
    <>
      <Tooltip
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
        {typeof text === 'string' ? <TextEllipsis>{text}</TextEllipsis> : text}
      </Tooltip>
    </>
  );
}
