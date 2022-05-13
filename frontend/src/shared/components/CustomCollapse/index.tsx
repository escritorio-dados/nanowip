import { Box, BoxProps, Typography } from '@mui/material';
import { useState } from 'react';

import { useKeepStates } from '#shared/hooks/keepStates';

import { CollapseBody, CollapseContainer, CollapseHeader } from './styles';

export type ICustomCollapse = BoxProps & {
  customActions?: JSX.Element;
  title: string;
  stateKey: string;
  children: JSX.Element;
};

export function CustomCollapse({
  stateKey,
  title,
  customActions,
  children,
  ...props
}: ICustomCollapse) {
  const { getState, updateState } = useKeepStates();

  const [show, setShow] = useState(
    getState<boolean>({ category: 'collapse', key: stateKey, defaultValue: true }),
  );

  return (
    <CollapseContainer {...props}>
      <CollapseHeader>
        <Box
          className="title"
          onClick={() => {
            updateState({
              category: 'collapse',
              key: stateKey,
              value: !show,
              localStorage: true,
            });

            setShow(!show);
          }}
        >
          <Typography component="h2">{title}</Typography>
        </Box>

        <div>{customActions}</div>
      </CollapseHeader>

      <CollapseBody in={show} timeout="auto">
        <div>{children}</div>
      </CollapseBody>
    </CollapseContainer>
  );
}
