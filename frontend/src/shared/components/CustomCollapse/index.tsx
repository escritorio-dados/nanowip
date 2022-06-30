import { Box, BoxProps, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

import { useKeepStates } from '#shared/hooks/keepStates';

import { CollapseBody, CollapseContainer, CollapseHeader } from './styles';

export type ICustomCollapse = BoxProps & {
  customActions?: JSX.Element;
  title: string;
  stateKey?: string;
  children: JSX.Element;
  startClose?: boolean;
  onlySession?: boolean;
};

export function CustomCollapse({
  stateKey,
  title,
  customActions,
  children,
  startClose,
  onlySession,
  ...props
}: ICustomCollapse) {
  const { getState, updateState } = useKeepStates();

  const [show, setShow] = useState(
    stateKey
      ? getState<boolean>({ category: 'collapse', key: stateKey, defaultValue: !startClose })
      : !startClose,
  );

  const changeCollapse = useCallback(() => {
    if (stateKey) {
      updateState({
        category: 'collapse',
        key: stateKey,
        value: !show,
        localStorage: !onlySession,
      });
    }

    setShow(!show);
  }, [show, stateKey, onlySession, updateState]);

  return (
    <CollapseContainer {...props}>
      <CollapseHeader>
        <Box className="title" onClick={changeCollapse}>
          <Typography component="h2">{title}</Typography>
        </Box>

        <Box>{customActions}</Box>
      </CollapseHeader>

      <CollapseBody in={show} timeout="auto">
        <Box>{children}</Box>
      </CollapseBody>
    </CollapseContainer>
  );
}
