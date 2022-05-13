import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { FormDatePicker } from '#shared/components/form/FormDatePicker';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICollaborator, limitedCollaboratorsLength } from '#shared/types/backend/ICollaborator';
import {
  ICollaboratorStatus,
  ICollaboratorStatusFilters,
} from '#shared/types/backend/ICollaboratorStatus';
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
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateCollaboratorStatusModal } from '#modules/collaboratorsStatus/components/CreateCollaboratorStatus';
import { DeleteCollaboratorStatusModal } from '#modules/collaboratorsStatus/components/DeleteCollaboratorStatus';
import { InfoCollaboratorStatusModal } from '#modules/collaboratorsStatus/components/InfoCollaboratorStatus';
import { UpdateCollaboratorStatusModal } from '#modules/collaboratorsStatus/components/UpdateCollaboratorStatus';
import {
  filterCollaboratorStatusSchema,
  IFilterCollaboratorStatusSchema,
} from '#modules/collaboratorsStatus/schema/filterCollaboratorStatus.schema';

type IDeleteModal = { id: string; date: string; collaborator: string } | null;
type IUpdateModal = { id: string } | null;

type ICollaboratorStatusFormatted = Omit<ICollaboratorStatus, 'date' | 'salary'> & {
  date: string;
  salary: string;
  collaboratorName: string;
};

const defaultPaginationConfig: IPaginationConfig<ICollaboratorStatusFilters> = {
  page: 1,
  sort_by: 'date',
  order_by: 'DESC',
  filters: {
    collaborator: null,
    max_date: null,
    min_date: null,
    max_month_hours: '',
    min_month_hours: '',
    max_salary: '',
    min_salary: '',
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  date: 'Data',
  salary: 'Salario',
  month_hours: 'Horas Trabalhadas',
  collaborator: 'Colaborador',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListCollaboratorStatus() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICollaboratorStatusFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<ICollaboratorStatusFilters>({
      category: 'filters',
      key: 'collaboratorsStatus',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'collaboratorsStatus',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'collaboratorsStatus',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'collaboratorsStatus',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteCollaboratorStatus, setDeleteCollaboratorStatus] = useState<IDeleteModal>(null);
  const [updateCollaboratorStatus, setUpdateCollaboratorStatus] = useState<IUpdateModal>(null);
  const [createCollaboratorStatus, setCreateCollaboratorStatus] = useState(false);
  const [infoCollaboratorStatus, setInfoCollaboratorStatus] = useState<IUpdateModal>(null);

  const { getBackUrl } = useGoBackUrl();
  const { toast } = useToast();
  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      collaborator_id: apiConfig.filters.collaborator?.id,
    };
  }, [apiConfig]);

  const {
    loading: collaboratorsStatusLoading,
    data: collaboratorsStatusData,
    error: collaboratorsStatusError,
    send: getCollaboratorStatuss,
    updateData: updateCollaboratorStatussData,
  } = useGet<IPagingResult<ICollaboratorStatus>>({
    url: '/collaborators_status',
    lazy: true,
  });

  const {
    loading: collaboratorsLoading,
    data: collaboratorsData,
    error: collaboratorsError,
    send: getCollaborators,
  } = useGet<ICollaborator[]>({
    url: '/collaborators/limited',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterCollaboratorStatusSchema>({
    resolver: yupResolver(filterCollaboratorStatusSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getCollaboratorStatuss({ params: apiParams });
  }, [apiParams, getCollaboratorStatuss]);

  useEffect(() => {
    if (collaboratorsStatusError) {
      toast({ message: collaboratorsStatusError, severity: 'error' });

      return;
    }

    if (collaboratorsError) {
      toast({ message: collaboratorsError, severity: 'error' });
    }
  }, [collaboratorsStatusError, toast, collaboratorsError]);

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
    updateTitle('Status dos Colaboradores');
  }, [updateTitle]);

  const collaboratorsOptions = useMemo(() => {
    const options = !collaboratorsData ? [] : collaboratorsData;

    if (apiConfig.filters.collaborator) {
      const filter = options.find((project) => project.id === apiConfig.filters.collaborator!.id);

      if (!filter) {
        options.push(apiConfig.filters.collaborator as any);
      }
    }

    return options;
  }, [apiConfig.filters.collaborator, collaboratorsData]);

  const permissions = useMemo(() => {
    return {
      createCollaboratorStatus: checkPermissions([
        [PermissionsUser.create_collaborator_status, PermissionsUser.manage_collaborator_status],
      ]),
      updateCollaboratorStatus: checkPermissions([
        [PermissionsUser.update_collaborator_status, PermissionsUser.manage_collaborator_status],
      ]),
      deleteCollaboratorStatus: checkPermissions([
        [PermissionsUser.delete_collaborator_status, PermissionsUser.manage_collaborator_status],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const handleApplyFilters = useCallback(
    (formData: IFilterCollaboratorStatusSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'collaboratorsStatus',
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

    resetForm(defaultPaginationConfig.filters as any);

    updateState({
      category: 'filters',
      key: 'collaboratorsStatus',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const data = useMemo<ICollaboratorStatusFormatted[]>(() => {
    if (!collaboratorsStatusData) {
      return [];
    }

    return collaboratorsStatusData.data.map((collaboratorStatus) => ({
      ...collaboratorStatus,
      collaboratorName: collaboratorStatus.collaborator.name,
      date: parseDateApi(collaboratorStatus.date, "LLLL 'de' yyyy", '-'),
      salary: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
        collaboratorStatus.salary,
      ),
    }));
  }, [collaboratorsStatusData]);

  const cols = useMemo<ICol<ICollaboratorStatusFormatted>[]>(() => {
    return [
      { key: 'collaboratorName', header: 'Colaborador', minWidth: '200px' },
      { key: 'date', header: 'Data', minWidth: '200px' },
      { key: 'salary', header: 'Salario', minWidth: '150px' },
      { key: 'monthHours', header: 'Horas Trabalhadas', minWidth: '150px' },
      {
        header: 'Opções',
        maxWidth: '150px',
        customColumn: ({ id, date, collaboratorName }) => {
          return (
            <div style={{ display: 'flex', position: 'relative' }}>
              <CustomIconButton
                type="info"
                size="small"
                title="Informações"
                action={() => setInfoCollaboratorStatus({ id })}
              />

              {permissions.updateCollaboratorStatus && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar Status do Colaborador"
                  action={() => setUpdateCollaboratorStatus({ id })}
                />
              )}

              {permissions.deleteCollaboratorStatus && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar Status do Colaborador"
                  action={() =>
                    setDeleteCollaboratorStatus({ id, date, collaborator: collaboratorName })
                  }
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [permissions.deleteCollaboratorStatus, permissions.updateCollaboratorStatus]);

  if (collaboratorsStatusLoading) return <Loading loading={collaboratorsStatusLoading} />;

  return (
    <>
      {createCollaboratorStatus && (
        <CreateCollaboratorStatusModal
          openModal={createCollaboratorStatus}
          closeModal={() => setCreateCollaboratorStatus(false)}
          handleAdd={(newData) =>
            updateCollaboratorStatussData((current) => handleAddItem({ newData, current }))
          }
          defaultCollaborator={apiConfig.filters.collaborator}
        />
      )}

      {!!deleteCollaboratorStatus && (
        <DeleteCollaboratorStatusModal
          openModal={!!deleteCollaboratorStatus}
          closeModal={() => setDeleteCollaboratorStatus(null)}
          collaboratorStatus={deleteCollaboratorStatus}
          handleDeleteData={(id) =>
            updateCollaboratorStatussData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateCollaboratorStatus && (
        <UpdateCollaboratorStatusModal
          openModal={!!updateCollaboratorStatus}
          closeModal={() => setUpdateCollaboratorStatus(null)}
          collaboratorStatus_id={updateCollaboratorStatus.id}
          handleUpdateData={(id, newData) =>
            updateCollaboratorStatussData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoCollaboratorStatus && (
        <InfoCollaboratorStatusModal
          openModal={!!infoCollaboratorStatus}
          closeModal={() => setInfoCollaboratorStatus(null)}
          collaboratorStatus_id={infoCollaboratorStatus.id}
        />
      )}

      {collaboratorsStatusData && (
        <CustomTable<ICollaboratorStatusFormatted>
          id="collaboratorsStatus"
          goBackUrl={getBackUrl('collaborators_status')}
          cols={cols}
          data={data}
          activeFilters={activeFiltersNumber}
          tableMinWidth="600px"
          custom_actions={
            <>
              {permissions.createCollaboratorStatus && (
                <CustomIconButton
                  action={() => setCreateCollaboratorStatus(true)}
                  title="Cadastrar Colaborador"
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
                    key: 'collaboratorsStatus',
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
                    key: 'collaboratorsStatus',
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
                    <FormSelectAsync
                      control={control}
                      margin_type="no-margin"
                      name="collaborator"
                      label="Colaborador"
                      options={collaboratorsOptions}
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.collaborator}
                      errors={errors.collaborator as any}
                      loading={collaboratorsLoading}
                      handleOpen={() => getCollaborators()}
                      handleFilter={(params) => getCollaborators(params)}
                      limitFilter={limitedCollaboratorsLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDatePicker
                      control={control}
                      name="min_date"
                      label="Data (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_date}
                      errors={errors.min_date}
                      customView={['year', 'month']}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormDatePicker
                      control={control}
                      name="max_date"
                      label="Data (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_date}
                      errors={errors.max_date}
                      customView={['year', 'month']}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="min_salary"
                      label="Salario (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_salary}
                      errors={errors.min_salary}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="max_salary"
                      label="Salario (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_salary}
                      errors={errors.max_salary}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="min_month_hours"
                      label="Horas Trabalhadas (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_month_hours}
                      errors={errors.min_month_hours}
                    />
                  </Grid>

                  <Grid item sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="max_month_hours"
                      label="Horas Trabalhadas (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_month_hours}
                      errors={errors.max_month_hours}
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
            totalPages: collaboratorsStatusData.pagination.total_pages,
            totalResults: collaboratorsStatusData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
