import { styled } from '@mui/material';
import { Badge, Box } from '@mui/material';
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

export const AssignmentsNumber = styled(Badge)`
  & .MuiBadge-badge {
    right: 4px;
    top: 10px;
    border: 1px solid ${({ theme }) => theme.palette.background.paper};
    padding: 0 4px;
  }
`;

export const TaskCardActions = styled(Box)`
  display: flex;
  align-items: center;
  height: 50%;

  padding: 0 0.5rem;
`;

export const ValueChainText = styled(Box)`
  display: flex;
  align-items: center;
  height: 50%;
  padding: 0 0.5rem;

  > button {
    display: block;
    color: ${({ theme }) => theme.palette.primary.main};
    text-transform: capitalize;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`;

export const CustomHandle = styled(Handle)`
  width: 1px;
  height: 1px;
  border: 0;
`;
