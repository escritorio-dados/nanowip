import { CircularProgress } from '@mui/material';

import { BackdropStyled } from './styles';

type ILoadingProps = { loading: boolean };

export function Loading({ loading }: ILoadingProps) {
  return (
    <BackdropStyled open={loading}>
      <CircularProgress color="primary" size={75} />
    </BackdropStyled>
  );
}
