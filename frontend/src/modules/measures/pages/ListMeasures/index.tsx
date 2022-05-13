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
import { IMeasure, IMeasureFilters } from '#shared/types/backend/IMeasure';
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

import { CreateMeasureModal } from '#modules/measures/components/CreateMeasure';
import { DeleteMeasureModal } from '#modules/measures/components/DeleteMeasure';
import { InfoMeasureModal } from '#modules/measures/components/InfoMeasure';
import { UpdateMeasureModal } from '#modules/measures/components/UpdateMeasure';
import {
  filterMeasureSchema,
  IFilterMeasureSchema,
} from '#modules/measures/schema/filterMeasure.schema';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IMeasureFilters> = {
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

export function ListMeasure() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IMeasureFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IMeasureFilters>({
      category: 'filters',
      key: 'measures',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'measures',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'measures',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'measures',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteMeasure, setDeleteMeasure] = useState<IDeleteModal>(null);
  const [updateMeasure, setUpdateMeasure] = useState<IUpdateModal>(null);
  const [createMeasure, setCreateMeasure] = useState(false);
  const [infoMeasure, setInfoMeasure] = useState<IUpdateModal>(null);

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
    loading: measuresLoading,
    data: measuresData,
    error: measuresError,
    send: getMeasures,
    updateData: updateMeasuresData,
  } = useGet<IPagingResult<IMeasure>>({
    url: '/measures',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterMeasureSchema>({
    resolver: yupResolver(filterMeasureSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getMeasures({ params: apiParams });
  }, [apiParams, getMeasures]);

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
    if (measuresError) {
      toast({ message: measuresError, severity: 'error' });
    }
  }, [measuresError, toast]);

  useEffect(() => {
    updateTitle('Unidades de medida');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createMeasure: checkPermissions([
        [PermissionsUser.create_measure, PermissionsUser.manage_measure],
      ]),
      updateMeasure: checkPermissions([
        [PermissionsUser.update_measure, PermissionsUser.manage_measure],
      ]),
      deleteMeasure: checkPermissions([
        [PermissionsUser.delete_measure, PermissionsUser.manage_measure],
      ]),
      readProject: checkPermissions([
        [PermissionsUser.read_product, PermissionsUser.manage_product],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleNavigateProducts = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ measure: { id, name } }) };

      setBackUrl('products', location);

      navigate({
        pathname: '/products',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, setBackUrl, navigate],
  );

  const cols = useMemo<ICol<IMeasure>[]>(() => {
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
                  title="Ir para produtos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateProducts(id, name)}
                />
              )}

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoMeasure({ id })}
              />

              {permissions.updateMeasure && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar unidade de medida"
                  action={() => setUpdateMeasure({ id })}
                />
              )}

              {permissions.deleteMeasure && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar unidade de medida"
                  action={() => setDeleteMeasure({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [
    handleNavigateProducts,
    permissions.deleteMeasure,
    permissions.readProject,
    permissions.updateMeasure,
  ]);

  const handleApplyFilters = useCallback(
    (formData: IFilterMeasureSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'measures',
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
      key: 'measures',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  if (measuresLoading) return <Loading loading={measuresLoading} />;

  return (
    <>
      {createMeasure && (
        <CreateMeasureModal
          openModal={createMeasure}
          closeModal={() => setCreateMeasure(false)}
          handleAdd={(newData) =>
            updateMeasuresData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deleteMeasure && (
        <DeleteMeasureModal
          openModal={!!deleteMeasure}
          measure={deleteMeasure}
          closeModal={() => setDeleteMeasure(null)}
          handleDeleteData={(id) =>
            updateMeasuresData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateMeasure && (
        <UpdateMeasureModal
          openModal={!!updateMeasure}
          closeModal={() => setUpdateMeasure(null)}
          measure_id={updateMeasure.id}
          handleUpdateData={(id, newData) =>
            updateMeasuresData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoMeasure && (
        <InfoMeasureModal
          openModal={!!infoMeasure}
          closeModal={() => setInfoMeasure(null)}
          measure_id={infoMeasure.id}
        />
      )}

      {measuresData && (
        <CustomTable<IMeasure>
          id="measures"
          cols={cols}
          data={measuresData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createMeasure && (
                <CustomIconButton
                  action={() => setCreateMeasure(true)}
                  title="Cadastrar unidade de medida"
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
                    key: 'measures',
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
                    key: 'measures',
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
            totalPages: measuresData.pagination.total_pages,
            totalResults: measuresData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
