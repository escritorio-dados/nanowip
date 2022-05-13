import { styled } from '@mui/material';
import { Box } from '@mui/material';
import { Handle } from 'react-flow-renderer';

export const TaskContainer = styled(Box)`
  background: ${({ theme }) => theme.palette.backgoundAlt};
  border-width: 2px;
  border-style: solid;
  cursor: default;

  > header {
    display: flex;
    min-height: 3rem;
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
    align-items: center;
    cursor: grab;
    padding: 0 1rem;
  }
`;

export const CustomHandle = styled(Handle)`
  width: 1px;
  height: 1px;
  border: 0;
`;
