import { styled } from '@mui/material';
import { Popper } from '@mui/material';

export const PopperStyled = styled(Popper)`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 5px;
`;
