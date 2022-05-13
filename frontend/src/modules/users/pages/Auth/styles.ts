import { styled } from '@mui/material';
import { Paper } from '@mui/material';

export const FormStyled = styled('form')`
  display: flex;
  flex-direction: column;

  width: 500;
`;

export const AuthContainer = styled(Paper)`
  max-width: 600px;
  margin: auto;
  margin-top: calc(50vh - 64px - 150px);
  padding: 2rem;
`;
