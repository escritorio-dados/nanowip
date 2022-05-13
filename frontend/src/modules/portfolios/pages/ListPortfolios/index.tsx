import { yupResolver } from '@hookform/resolvers/yup';
import { ListAlt } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPortfolio, IPortfolioFilters } from '#shared/types/backend/IPortfolio';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreatePortfolioModal } from '#modules/portfolios/components/CreatePortfolio';
import { DeletePortfolioModal } from '#modules/portfolios/components/DeletePortfolio';
import { InfoPortfolioModal } from '#modules/portfolios/components/InfoPortfolio';
import { UpdatePortfolioModal } from '#modules/portfolios/components/UpdatePortfolio';
import {
  filterPortfolioSchema,
  IFilterPortfolioSchema,
} from '#modules/portfolios/schema/filterPortfolio.schema';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IPortfolioFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: {
    name: '',
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListPortfolio() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IPortfolioFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IPortfolioFilters>({
      category: 'filters',
      key: 'portfolios',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'portfolios',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'portfolios',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'portfolios',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deletePortfolio, setDeletePortfolio] = useState<IDeleteModal>(null);
  const [updatePortfolio, setUpdatePortfolio] = useState<IUpdateModal>(null);
  const [createPortfolio, setCreatePortfolio] = useState(false);
  const [infoPortfolio, setInfoPortfolio] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setBackUrl } = useGoBackUrl();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
    };
  }, [apiConfig]);

  const {
    loading: portfoliosLoading,
    data: portfoliosData,
    error: portfoliosError,
    send: getPortfolios,
    updateData: updatePortfoliosData,
  } = useGet<IPagingResult<IPortfolio>>({
    url: '/portfolios',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterPortfolioSchema>({
    resolver: yupResolver(filterPortfolioSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getPortfolios({ params: apiParams });
  }, [apiParams, getPortfolios]);

  useEffect(() => {
    const { page, order_by, sort_by, filters } = apiConfig;

    const filtersString = JSON.stringify(removeEmptyFields(filters, true));

    searchParams.set('page', String(page));
    searchParams.set('order_by', order_by);
    searchParams.set('sort_by', sort_by);

    if (filtersString !== '{}') {
      searchParams.set('filters', filtersString);
    } else {
      searchParams.delete('filters');
    }

    setSearchParams(searchParams);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (portfoliosError) {
      toast({ message: portfoliosError, severity: 'error' });
    }
  }, [portfoliosError, toast]);

  useEffect(() => {
    updateTitle('Portfólios');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createPortfolio: checkPermissions([
        [PermissionsUser.create_portfolio, PermissionsUser.manage_portfolio],
      ]),
      updatePortfolio: checkPermissions([
        [PermissionsUser.update_portfolio, PermissionsUser.manage_portfolio],
      ]),
      deletePortfolio: checkPermissions([
        [PermissionsUser.delete_portfolio, PermissionsUser.manage_portfolio],
      ]),
      readProject: checkPermissions([
        [PermissionsUser.read_project, PermissionsUser.manage_project],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateProjects = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ portfolio: { id, name } }) };

      setBackUrl('projects', location);

      navigate({
        pathname: '/projects',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<IPortfolio>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, name }) => {
          return (
            <div style={{ display: 'flex' }}>
              {permissions.readProject && (
                <CustomIconButton
                  type="custom"
                  size="small"
                  title="Ir para projetos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateProjects(id, name)}
                />
              )}

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoPortfolio({ id })}
              />

              {permissions.updatePortfolio && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Portfolio"
                  action={() => setUpdatePortfolio({ id })}
                />
              )}

              {permissions.deletePortfolio && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Portfolio"
                  action={() => setDeletePortfolio({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [
    handleNavigateProjects,
    permissions.deletePortfolio,
    permissions.readProject,
    permissions.updatePortfolio,
  ]);

  const handleApplyFilters = useCallback(
    (formData: IFilterPortfolioSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'portfolios',
        value: formData,
        localStorage: true,
      });
    },
    [updateState],
  );

  const handleClearFilters = useCallback(() => {
    setApiConfig((oldConfig) => ({
      ...oldConfig,
      filters: defaultPaginationConfig.filters,
      page: 1,
    }));

    resetForm({
      name: '',
      max_updated: null,
      min_updated: null,
    });

    updateState({
      category: 'filters',
      key: 'portfolios',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  if (portfoliosLoading) return <Loading loading={portfoliosLoading} />;

  return (
    <>
      {createPortfolio && (
        <CreatePortfolioModal
          openModal={createPortfolio}
          closeModal={() => setCreatePortfolio(false)}
          handleAdd={(newData) =>
            updatePortfoliosData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deletePortfolio && (
        <DeletePortfolioModal
          openModal={!!deletePortfolio}
          portfolio={deletePortfolio}
          closeModal={() => setDeletePortfolio(null)}
          handleDeleteData={(id) =>
            updatePortfoliosData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updatePortfolio && (
        <UpdatePortfolioModal
          openModal={!!updatePortfolio}
          closeModal={() => setUpdatePortfolio(null)}
          portfolio_id={updatePortfolio.id}
          handleUpdateData={(id, newData) =>
            updatePortfoliosData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoPortfolio && (
        <InfoPortfolioModal
          openModal={!!infoPortfolio}
          closeModal={() => setInfoPortfolio(null)}
          portfolio_id={infoPortfolio.id}
        />
      )}

      {portfoliosData && (
        <CustomTable<IPortfolio>
          id="portfolios"
          cols={cols}
          data={portfoliosData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createPortfolio && (
                <CustomIconButton
                  action={() => setCreatePortfolio(true)}
                  title="Cadastrar Portfolio"
                  type="add"
                />
              )}
            </>
          }
          sortContainer={
            <Box
              sx={{
                width: '300px',
                padding: '0.6rem',
                border: `2px solid`,
                borderColor: 'divider',
              }}
            >
              <CustomSelect
                label="Classificar por"
                onChange={(newValue) => {
                  setApiConfig((oldConfig) => ({ ...oldConfig, sort_by: newValue.value }));

                  updateState({
                    category: 'sort_by',
                    key: 'portfolios',
                    value: newValue.value,
                    localStorage: true,
                  });
                }}
                options={sortOptions}
                optionLabel="label"
                value={{ value: apiConfig.sort_by, label: sortTranslator[apiConfig.sort_by] }}
              />

              <CustomSelect
                label="Ordem"
                onChange={(newValue) => {
                  setApiConfig((oldConfig) => ({ ...oldConfig, order_by: newValue.value }));

                  updateState({
                    category: 'order_by',
                    key: 'portfolios',
                    value: newValue.value,
                    localStorage: true,
                  });
                }}
                options={orderOptions}
                optionLabel="label"
                value={{ value: apiConfig.order_by, label: orderTranslator[apiConfig.order_by] }}
              />
            </Box>
          }
          filterContainer={
            <>
              <form onSubmit={handleSubmit(handleApplyFilters)} noValidate>
                <Grid container spacing={2}>
                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="name"
                      label="Nome"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.name}
                      errors={errors.name}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_updated"
                      label="Data de Atualização (Minima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_updated}
                      errors={errors.min_updated}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_updated"
                      label="Data de Atualização (Maxima)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_updated}
                      errors={errors.max_updated}
                    />
                  </Grid>
                </Grid>

                <Grid container columnSpacing={2}>
                  <Grid item md={6} xs={12}>
                    <CustomButton type="submit" size="medium">
                      Aplicar Filtros
                    </CustomButton>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <CustomButton color="info" size="medium" onClick={handleClearFilters}>
                      Limpar Filtros
                    </CustomButton>
                  </Grid>
                </Grid>
              </form>
            </>
          }
          pagination={{
            currentPage: apiConfig.page,
            totalPages: portfoliosData.pagination.total_pages,
            totalResults: portfoliosData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
