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
import { IProjectType, IProjectTypeFilters } from '#shared/types/backend/IProjectType';
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

import { CreateProjectTypeModal } from '#modules/projectTypes/components/CreateProjectType';
import { DeleteProjectTypeModal } from '#modules/projectTypes/components/DeleteProjectType';
import { InfoProjectTypeModal } from '#modules/projectTypes/components/InfoProjectType';
import { UpdateProjectTypeModal } from '#modules/projectTypes/components/UpdateProjectType';
import {
  filterProjectTypeSchema,
  IFilterProjectTypeSchema,
} from '#modules/projectTypes/schema/filterProjectType.schema';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProjectTypeFilters> = {
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

export function ListProjectType() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProjectTypeFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IProjectTypeFilters>({
      category: 'filters',
      key: 'project_types',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'project_types',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'project_types',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'project_types',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [deleteProjectType, setDeleteProjectType] = useState<IDeleteModal>(null);
  const [updateProjectType, setUpdateProjectType] = useState<IUpdateModal>(null);
  const [createProjectType, setCreateProjectType] = useState(false);
  const [infoProjectType, setInfoProjectType] = useState<IUpdateModal>(null);

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
    loading: projectTypesLoading,
    data: projectTypesData,
    error: projectTypesError,
    send: getProjectTypes,
    updateData: updateProjectTypesData,
  } = useGet<IPagingResult<IProjectType>>({
    url: '/project_types',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterProjectTypeSchema>({
    resolver: yupResolver(filterProjectTypeSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getProjectTypes({ params: apiParams });
  }, [apiParams, getProjectTypes]);

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
    if (projectTypesError) {
      toast({ message: projectTypesError, severity: 'error' });
    }
  }, [projectTypesError, toast]);

  useEffect(() => {
    updateTitle('Tipos de Projeto');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createProjectType: checkPermissions([
        [PermissionsUser.create_project_type, PermissionsUser.manage_project_type],
      ]),
      updateProjectType: checkPermissions([
        [PermissionsUser.update_project_type, PermissionsUser.manage_project_type],
      ]),
      deleteProjectType: checkPermissions([
        [PermissionsUser.delete_project_type, PermissionsUser.manage_project_type],
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
      const search = { filters: JSON.stringify({ project_type: { id, name } }) };

      setBackUrl('projects', location);

      navigate({
        pathname: '/projects',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const cols = useMemo<ICol<IProjectType>[]>(() => {
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
                action={() => setInfoProjectType({ id })}
              />

              {permissions.updateProjectType && (
                <CustomIconButton
                  type="edit"
                  size="small"
                  title="Editar tipo de projeto"
                  action={() => setUpdateProjectType({ id })}
                />
              )}

              {permissions.deleteProjectType && (
                <CustomIconButton
                  type="delete"
                  size="small"
                  title="Deletar tipo de projeto"
                  action={() => setDeleteProjectType({ id, name })}
                />
              )}
            </div>
          );
        },
      },
    ];
  }, [
    handleNavigateProjects,
    permissions.deleteProjectType,
    permissions.readProject,
    permissions.updateProjectType,
  ]);

  const handleApplyFilters = useCallback(
    (formData: IFilterProjectTypeSchema) => {
      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: { ...formData },
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'project_types',
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
      key: 'project_types',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  if (projectTypesLoading) return <Loading loading={projectTypesLoading} />;

  return (
    <>
      {createProjectType && (
        <CreateProjectTypeModal
          openModal={createProjectType}
          closeModal={() => setCreateProjectType(false)}
          handleAdd={(newData) =>
            updateProjectTypesData((current) => handleAddItem({ newData, current }))
          }
        />
      )}

      {!!deleteProjectType && (
        <DeleteProjectTypeModal
          openModal={!!deleteProjectType}
          projectType={deleteProjectType}
          closeModal={() => setDeleteProjectType(null)}
          handleDeleteData={(id) =>
            updateProjectTypesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateProjectType && (
        <UpdateProjectTypeModal
          openModal={!!updateProjectType}
          closeModal={() => setUpdateProjectType(null)}
          projectType_id={updateProjectType.id}
          handleUpdateData={(id, newData) =>
            updateProjectTypesData((current) => handleUpdateItem({ id, newData, current }))
          }
        />
      )}

      {!!infoProjectType && (
        <InfoProjectTypeModal
          openModal={!!infoProjectType}
          closeModal={() => setInfoProjectType(null)}
          projectType_id={infoProjectType.id}
        />
      )}

      {projectTypesData && (
        <CustomTable<IProjectType>
          id="project_types"
          cols={cols}
          data={projectTypesData.data}
          tableMinWidth="500px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createProjectType && (
                <CustomIconButton
                  action={() => setCreateProjectType(true)}
                  title="Cadastrar tipo de projeto"
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
                    key: 'project_types',
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
                    key: 'project_types',
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
            totalPages: projectTypesData.pagination.total_pages,
            totalResults: projectTypesData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
