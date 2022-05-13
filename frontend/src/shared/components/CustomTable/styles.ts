import { styled } from '@mui/material';
import { Paper, TableCell, TableRow, TableRowProps } from '@mui/material';

export const TableContainerStyled = styled(Paper)`
  margin: auto;

  border: 2px solid ${({ theme }) => theme.palette.divider};
  border-radius: 5px;

  .table-container {
    min-width: 600px;
  }
`;

export const TableCellHeader = styled(TableCell)`
  background: ${({ theme }) => theme.palette.secondary.main};

  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

  & + div {
    border-left: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

export const TableCellData = styled(TableCell)`
  padding: 0.3rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};

  & + div {
    border-left: 1px solid ${({ theme }) => theme.palette.divider};
  }
`;

type TableRowStyled = TableRowProps & { component: string };

export const TableRowStyled = styled(TableRow)<TableRowStyled>`
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.palette.background.default};
  }
`;
