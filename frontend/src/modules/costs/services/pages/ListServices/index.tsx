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
import { IService, IServiceFilters } from '#shared/types/backend/costs/IService';
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

import { CreateServiceModal } from '../../components/CreateService';
import { DeleteServiceModal } from '../../components/DeleteService';
import { InfoServiceModal } from '../../components/InfoService';
import { UpdateServiceModal } from '../../components/UpdateService';
import { filterServiceSchema, IFilterServiceSchema } from '../../schema/filterService.schema';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IServiceFilters> = {
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

export function ListService() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IServiceFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IServiceFilters>({
      category: 'filters',
      key: 'services',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'services',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'services',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'services',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteService, setDeleteService] = useState<IDeleteModal>(null);
  const [updateService, setUpdateService] = useState<IUpdateModal>(null);
  const [createService, setCreateService] = useState(false);
  const [infoService, setInfoService] = useState<IUpdateModal>(null);

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
    loading: servicesLoading,
    data: servicesData,
    error: servicesError,
    send: getServices,
    updateData: updateServicesData,
  } = useGet<IPagingResult<IService>>({
    url: '/services',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterServiceSchema>({
    resolver: yupResolver(filterServiceSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getServices({ params: apiParams });
  }, [apiParams, getServices]);

  useEffect(() => {
    if (servicesError) {
      toast({ message: servicesError, severity: 'error' });
    }
  }, [servicesError, toast]);

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
    updateTitle('Serviço');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createService: checkPermissions([
        [PermissionsUser.create_document_type, PermissionsUser.manage_document_type],
      ]),
      updateService: checkPermissions([
        [PermissionsUser.update_document_type, PermissionsUser.manage_document_type],
      ]),
      deleteService: checkPermissions([
        [PermissionsUser.delete_document_type, PermissionsUser.manage_document_type],
      ]),
      readCosts: checkPermissions([[PermissionsUser.read_cost, PermissionsUser.manage_cost]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleApplyFilters = useCallback(
    (formData: IFilterServiceSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'services',
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
      key: 'services',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const handleNavigateCostDistributions = useCallback(
    (id: string, name: string) => {
      const search = { filters: JSON.stringify({ service: { id, name } }) };

      setBackUrl('cost_distributions', location);

      navigate({
        pathname: '/cost_distributions',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<IService>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '200px',
        customColumn: ({ id, name }) => {
          return (
            <div style={{ display: 'flex' }}>
              {permissions.readCosts && (
                <CustomIconButton
                  type="custom"
                  size="small"
                  title="Ir para distribuição dos custos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateCostDistributions(id, name)}
                />
              )}

              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoService({ id })}
              />

              {permissions.updateService && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Serviço"
                  action={() => setUpdateService({ id })}
                />
              )}

              {permissions.deleteService && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Serviço"
                  action={() => setDeleteService({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [
    handleNavigateCostDistributions,
    permissions.deleteService,
    permissions.readCosts,
    permissions.updateService,
  ]);

  if (servicesLoading) return <Loading loading={servicesLoading} />;

  return (
    <>
      {createService && (
        <CreateServiceModal
          openModal={createService}
          closeModal={() => setCreateService(false)}
          handleAdd={(newData) =>
            updateServicesData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deleteService && (
        <DeleteServiceModal
          openModal={!!deleteService}
          closeModal={() => setDeleteService(null)}
          service={deleteService}
          handleDeleteData={(id) =>
            updateServicesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateService && (
        <UpdateServiceModal
          openModal={!!updateService}
          closeModal={() => setUpdateService(null)}
          service_id={updateService.id}
          handleUpdateData={(id, newData) =>
            updateServicesData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoService && (
        <InfoServiceModal
          openModal={!!infoService}
          closeModal={() => setInfoService(null)}
          service_id={infoService.id}
        />
      )}

      {servicesData && (
        <CustomTable<IService>
          id="services"
          cols={cols}
          data={servicesData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createService && (
                <CustomIconButton
                  action={() => setCreateService(true)}
                  title="Cadastrar Serviço"
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
                    key: 'services',
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
                    key: 'services',
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
            totalPages: servicesData.pagination.total_pages,
            totalResults: servicesData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}