import { yupResolver } from '@hookform/resolvers/yup';
import { ListAlt } from '@mui/icons-material';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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
import { ITrail, ITrailFilters } from '#shared/types/backend/ITrail';
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

import { CreateTrailModal } from '#modules/trails/components/CreateTrail';
import { DeleteTrailModal } from '#modules/trails/components/DeleteTrail';
import { InfoTrailModal } from '#modules/trails/components/InfoTrail';
import { UpdateTrailModal } from '#modules/trails/components/UpdateTrail';
import { filterTrailSchema, IFilterTrailSchema } from '#modules/trails/schema/filterTrail.schema';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<ITrailFilters> = {
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

export function ListTrail() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ITrailFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ITrailFilters>({
      category: 'filters',
      key: 'trails',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'trails',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'trails',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'trails',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteTrail, setDeleteTrail] = useState<IDeleteModal>(null);
  const [updateTrail, setUpdateTrail] = useState<IUpdateModal>(null);
  const [createTrail, setCreateTrail] = useState(false);
  const [infoTrail, setInfoTrail] = useState<IUpdateModal>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { setBackUrl } = useGoBackUrl();
  const { toast } = useToast();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
    };
  }, [apiConfig]);

  const {
    loading: trailsLoading,
    data: trailsData,
    error: trailsError,
    send: getTrails,
    updateData: updateTrailsData,
  } = useGet<IPagingResult<ITrail>>({
    url: '/trails',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterTrailSchema>({
    resolver: yupResolver(filterTrailSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getTrails({ params: apiParams });
  }, [apiParams, getTrails]);

  useEffect(() => {
    if (trailsError) {
      toast({ message: trailsError, severity: 'error' });
    }
  }, [trailsError, toast]);

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
    updateTitle('Trilhas');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createTrail: checkPermissions([[PermissionsUser.create_trail, PermissionsUser.manage_trail]]),
      updateTrail: checkPermissions([[PermissionsUser.update_trail, PermissionsUser.manage_trail]]),
      deleteTrail: checkPermissions([[PermissionsUser.delete_trail, PermissionsUser.manage_trail]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleApplyFilters = useCallback(
    (formData: IFilterTrailSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'trails',
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
      key: 'trails',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const handleNavigateTasks = useCallback(
    (id: string) => {
      setBackUrl('task_trails', location);

      navigate(`/task_trails/graph/${id}`);
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<ITrail>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, name }) => {
          return (
            <div style={{ display: 'flex' }}>
              <CustomIconButton
                type="custom"
                size="small"
                title="Visualizar Trilha"
                CustomIcon={<ListAlt fontSize="small" />}
                action={() => handleNavigateTasks(id)}
              />

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoTrail({ id })}
              />

              {permissions.updateTrail && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Trilha"
                  action={() => setUpdateTrail({ id })}
                />
              )}

              {permissions.deleteTrail && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Trilha"
                  action={() => setDeleteTrail({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [handleNavigateTasks, permissions.deleteTrail, permissions.updateTrail]);

  if (trailsLoading) return <Loading loading={trailsLoading} />;

  return (
    <>
      {createTrail && (
        <CreateTrailModal
          openModal={createTrail}
          closeModal={() => setCreateTrail(false)}
          handleAdd={(newData) =>
            updateTrailsData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deleteTrail && (
        <DeleteTrailModal
          openModal={!!deleteTrail}
          closeModal={() => setDeleteTrail(null)}
          trail={deleteTrail}
          handleDeleteData={(id) =>
            updateTrailsData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateTrail && (
        <UpdateTrailModal
          openModal={!!updateTrail}
          closeModal={() => setUpdateTrail(null)}
          trail_id={updateTrail.id}
          handleUpdateData={(id, newData) =>
            updateTrailsData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoTrail && (
        <InfoTrailModal
          openModal={!!infoTrail}
          closeModal={() => setInfoTrail(null)}
          trail_id={infoTrail.id}
        />
      )}

      {trailsData && (
        <CustomTable<ITrail>
          id="trails"
          cols={cols}
          data={trailsData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createTrail && (
                <CustomIconButton
                  action={() => setCreateTrail(true)}
                  title="Cadastrar Cliente"
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
                    key: 'trails',
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
                    key: 'trails',
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
            totalPages: trailsData.pagination.total_pages,
            totalResults: trailsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
