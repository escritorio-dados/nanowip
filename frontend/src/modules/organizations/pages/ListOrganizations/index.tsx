import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import {
  DEFAULT_ORGANIZATION_IDS,
  IOrganization,
  IOrganizationFilters,
} from '#shared/types/backend/IOrganization';
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

import { CreateOrganizationModal } from '#modules/organizations/components/CreateOrganization';
import { DeleteOrganizationModal } from '#modules/organizations/components/DeleteOrganization';
import { InfoOrganizationModal } from '#modules/organizations/components/InfoOrganization';
import { UpdateOrganizationModal } from '#modules/organizations/components/UpdateOrganization';
import {
  filterOrganizationSchema,
  IFilterOrganizationSchema,
} from '#modules/organizations/schema/filterOrganization.schema';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IOrganizationFilters> = {
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

export function ListOrganization() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IOrganizationFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IOrganizationFilters>({
      category: 'filters',
      key: 'organizations',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'organizations',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'organizations',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'organizations',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteOrganization, setDeleteOrganization] = useState<IDeleteModal>(null);
  const [updateOrganization, setUpdateOrganization] = useState<IUpdateModal>(null);
  const [createOrganization, setCreateOrganization] = useState(false);
  const [infoOrganization, setInfoOrganization] = useState<IUpdateModal>(null);

  const { toast } = useToast();
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
    loading: organizationsLoading,
    data: organizationsData,
    error: organizationsError,
    send: getOrganizations,
    updateData: updateOrganizationsData,
  } = useGet<IPagingResult<IOrganization>>({
    url: '/organizations',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterOrganizationSchema>({
    resolver: yupResolver(filterOrganizationSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getOrganizations({ params: apiParams });
  }, [apiParams, getOrganizations]);

  useEffect(() => {
    if (organizationsError) {
      toast({ message: organizationsError, severity: 'error' });
    }
  }, [organizationsError, toast]);

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
    updateTitle('Clientes');
  }, [updateTitle]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleApplyFilters = useCallback(
    (formData: IFilterOrganizationSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'organizations',
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
      key: 'organizations',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const cols = useMemo<ICol<IOrganization>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, name }) => {
          return (
            <div style={{ display: 'flex' }}>
              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoOrganization({ id })}
              />

              <CustomIconButton
                type="edit"
                size="small"
                title="Editar Organização"
                action={() => setUpdateOrganization({ id })}
              />

              {id !== DEFAULT_ORGANIZATION_IDS.SYSTEM &&
                id !== DEFAULT_ORGANIZATION_IDS.UNASPRESS && (
                  <CustomIconButton
                    type="delete"
                    size="small"
                    title="Deletar Organização"
                    action={() => setDeleteOrganization({ id, name })}
                  />
                )}
            </div>
          );
        },
      },
    ];
  }, []);

  if (organizationsLoading) return <Loading loading={organizationsLoading} />;

  return (
    <>
      {createOrganization && (
        <CreateOrganizationModal
          openModal={createOrganization}
          closeModal={() => setCreateOrganization(false)}
          handleAdd={(newData) =>
            updateOrganizationsData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deleteOrganization && (
        <DeleteOrganizationModal
          openModal={!!deleteOrganization}
          closeModal={() => setDeleteOrganization(null)}
          organization={deleteOrganization}
          handleDeleteData={(id) =>
            updateOrganizationsData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateOrganization && (
        <UpdateOrganizationModal
          openModal={!!updateOrganization}
          closeModal={() => setUpdateOrganization(null)}
          organization_id={updateOrganization.id}
          handleUpdateData={(id, newData) =>
            updateOrganizationsData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoOrganization && (
        <InfoOrganizationModal
          openModal={!!infoOrganization}
          closeModal={() => setInfoOrganization(null)}
          organization_id={infoOrganization.id}
        />
      )}

      {organizationsData && (
        <CustomTable<IOrganization>
          id="organizations"
          cols={cols}
          data={organizationsData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              <CustomIconButton
                action={() => setCreateOrganization(true)}
                title="Cadastrar Organização"
                type="add"
              />
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
                    key: 'organizations',
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
                    key: 'organizations',
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
            totalPages: organizationsData.pagination.total_pages,
            totalResults: organizationsData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
