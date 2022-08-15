import { Box, styled, Typography } from '@mui/material';

export const MilestoneMainContent = styled(Box)`
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: ${({ theme }) => theme.palette.primary.light};

    transform: scale(1.03);
  }
`;

export const TextEllipsisMultiline = styled(Typography)`
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -webkit-box;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
`;
