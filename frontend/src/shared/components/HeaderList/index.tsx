import { ArrowBack, Search, Sort } from '@mui/icons-material';
import { Pagination, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useKeepStates } from '#shared/hooks/keepStates';

import { CustomIconButton } from '../CustomIconButton';
import { CustomPopover } from '../CustomPopover';
import {
  ActiveFiltersNumber,
  FooterContainer,
  HeaderActions,
  HeaderContainer,
  HeaderFilter,
} from './styles';

type IHeaderContainer = {
  filterContainer?: JSX.Element;
  sortContainer?: JSX.Element;
  custom_actions?: JSX.Element;
  children?: JSX.Element;
  pagination?: {
    totalPages: number;
    totalResults: number;
    currentPage: number;
    changePage: (newPage: number) => void;
  };
  goBackUrl?: { pathname: string; search: string };
  activeFilters?: number;
  id: string;
};

export function HeaderList({
  custom_actions,
  filterContainer,
  sortContainer,
  children,
  pagination,
  goBackUrl,
  id,
  activeFilters,
}: IHeaderContainer) {
  const { getState, updateState } = useKeepStates();

  const [showFilter, setShowFilter] = useState(() =>
    getState<boolean>({ category: 'show_filter', key: id, defaultValue: true }),
  );

  const navigate = useNavigate();

  return (
    <>
      <HeaderContainer>
        <HeaderActions>
          <div>
            {goBackUrl && (
              <CustomIconButton
                action={() => navigate(goBackUrl)}
                title="Voltar"
                type="custom"
                CustomIcon={<ArrowBack />}
              />
            )}

            {filterContainer && (
              <ActiveFiltersNumber badgeContent={activeFilters || 0} color="primary">
                <CustomIconButton
                  action={() => {
                    updateState({
                      category: 'show_filter',
                      key: id,
                      value: !showFilter,
                      localStorage: true,
                    });

                    setShowFilter(!showFilter);
                  }}
                  title="Filtros"
                  type="custom"
                  CustomIcon={<Search />}
                />
              </ActiveFiltersNumber>
            )}
            {sortContainer && (
              <CustomPopover
                help="Ordenar"
                icon={<Sort />}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              >
                {sortContainer}
              </CustomPopover>
            )}
          </div>

          <div>{custom_actions}</div>
        </HeaderActions>

        {filterContainer && (
          <HeaderFilter in={showFilter} timeout="auto">
            <div>{filterContainer}</div>
          </HeaderFilter>
        )}
      </HeaderContainer>

      {children}

      <FooterContainer>
        {pagination && (
          <>
            <Pagination
              variant="outlined"
              shape="rounded"
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={(_, newPage) => pagination.changePage(newPage)}
            />

            <Typography>{pagination.totalResults} Resultados</Typography>
          </>
        )}
      </FooterContainer>
    </>
  );
}
