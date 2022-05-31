import { Table, TableBody, TableContainer, TableHead } from '@mui/material';

import { HeaderList } from '../HeaderList';
import { TableContainerStyled, TableCellHeader, TableCellData, TableRowStyled } from './styles';

export type ICol<T extends IObjectWithId> = {
  header: string;
  key?: string;
  minWidth?: string;
  maxWidth?: string;
  customColumn?: (data: T) => JSX.Element;
  padding?: string;
};

type IObjectWithId = { id: string; [key: string]: any };

type ICustomTable<T extends IObjectWithId> = {
  cols: ICol<T>[];
  data: T[];
  pagination?: {
    totalPages: number;
    totalResults: number;
    currentPage: number;
    changePage: (newPage: number) => void;
  };
  filterContainer?: JSX.Element;
  sortContainer?: JSX.Element;
  custom_actions?: JSX.Element;
  tableMaxWidth?: string;
  tableMinWidth?: string;
  id: string;
  goBackUrl?: { pathname: string; search: string };
  activeFilters?: number;
};

export function CustomTable<T extends IObjectWithId>({
  cols,
  data,
  pagination,
  filterContainer,
  custom_actions,
  tableMaxWidth,
  tableMinWidth,
  sortContainer,
  id,
  goBackUrl,
  activeFilters,
}: ICustomTable<T>) {
  return (
    <TableContainerStyled elevation={5} sx={{ maxWidth: tableMaxWidth || '1536px' }}>
      <TableContainer sx={{ minWidth: tableMinWidth || '300px' }}>
        <HeaderList
          custom_actions={custom_actions}
          filterContainer={filterContainer}
          sortContainer={sortContainer}
          pagination={pagination}
          goBackUrl={goBackUrl}
          activeFilters={activeFilters}
          id={id}
        >
          <Table component="div">
            <TableHead component="div">
              {cols.map((col) => (
                <TableCellHeader
                  component="div"
                  key={col.header}
                  sx={{ width: col.maxWidth, minWidth: col.minWidth, maxWidth: col.maxWidth }}
                >
                  {col.header}
                </TableCellHeader>
              ))}
            </TableHead>

            <TableBody component="div">
              {data.map((row) => (
                <TableRowStyled component="div" key={row.id}>
                  {cols.map((col) =>
                    col.customColumn ? (
                      <TableCellData
                        component="div"
                        key={col.header}
                        sx={{
                          width: col.maxWidth,
                          minWidth: col.minWidth,
                          maxWidth: col.maxWidth,
                          padding: col.padding,
                        }}
                      >
                        {col.customColumn(row)}
                      </TableCellData>
                    ) : (
                      <TableCellData
                        component="div"
                        key={col.header}
                        sx={{
                          width: col.maxWidth,
                          minWidth: col.minWidth,
                          maxWidth: col.maxWidth,
                          padding: col.padding,
                        }}
                      >
                        {col.key ? row[col.key] : 'Informação não encontrada'}
                      </TableCellData>
                    ),
                  )}
                </TableRowStyled>
              ))}
            </TableBody>
          </Table>
        </HeaderList>
      </TableContainer>
    </TableContainerStyled>
  );
}
