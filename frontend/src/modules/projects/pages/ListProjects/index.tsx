import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Grid } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomButton } from '#shared/components/CustomButton';
import { CustomIconButton } from '#shared/components/CustomIconButton';
import { FormDateTimePicker } from '#shared/components/form/FormDateTimePicker';
import { FormSelect } from '#shared/components/form/FormSelect';
import { FormSelectAsync } from '#shared/components/form/FormSelectAsync';
import { FormTextField } from '#shared/components/form/FormTextField';
import { HeaderList } from '#shared/components/HeaderList';
import { CustomSelect } from '#shared/components/inputs/CustomSelect';
import { Loading } from '#shared/components/Loading';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { ICustomer, limitedCustomersLength } from '#shared/types/backend/ICustomer';
import { IPortfolio, limitedPortfoliosLength } from '#shared/types/backend/IPortfolio';
import { IProject, IProjectFilters } from '#shared/types/backend/IProject';
import { IProjectType, limitedProjectTypesLength } from '#shared/types/backend/IProjectType';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import {
  StatusDateColor,
  statusDateOptions,
  statusDateTranslator,
} from '#shared/types/IStatusDate';
import { getStatusText } from '#shared/utils/getStatusText';
import {
  getSortOptions,
  IPaginationConfig,
  orderOptions,
  orderTranslator,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateProjectModal } from '#modules/projects/components/CreateProject';
import { DeleteProjectModal } from '#modules/projects/components/DeleteProject';
import { InfoProjectModal } from '#modules/projects/components/InfoProject';
import { IProjectCardInfo, ProjectCard } from '#modules/projects/components/ProjectCard';
import { ISubprojectCardInfo } from '#modules/projects/components/SubprojectCard';
import { UpdateProjectModal } from '#modules/projects/components/UpdateProject';
import {
  filterProjectSchema,
  IFilterProjectSchema,
} from '#modules/projects/schemas/filterProject.schema';

import { ListProjectContainer, ProjectList } from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProjectFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: {
    name: '',
    status_date: null,
    project_type: null,
    portfolio: null,
    customer: null,
    min_available: null,
    max_available: null,
    min_deadline: null,
    max_deadline: null,
    min_start: null,
    max_start: null,
    min_end: null,
    max_end: null,
    min_updated: null,
    max_updated: null,
  },
};

const sortTranslator: Record<string, string> = {
  name: 'Nome do Projeto',
  deadline: 'Prazo',
  available_date: 'Data de Disponibilidade',
  start_date: 'Data de Inicio',
  end_date: 'Data de Término',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
  customer: 'Cliente',
  project_type: 'Tipo de Projeto',
  portfolio: 'Portfolio',
};

const sortOptions = getSortOptions(sortTranslator);

export function ListProjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { getState, updateState } = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProjectFilters>>(() => {
    const pageParam = searchParams.get('page');
    const sortByParam = searchParams.get('sort_by');
    const orderByParam = searchParams.get('order_by');

    const filtersParam = searchParams.get('filters');

    let filters = getState<IProjectFilters>({
      category: 'filters',
      key: 'projects',
      defaultValue: defaultPaginationConfig.filters,
    });

    if (filtersParam) {
      filters = JSON.parse(filtersParam);

      updateState({
        category: 'filters',
        key: 'projects',
        value: filters,
        localStorage: true,
      });
    }

    const sort_by =
      sortByParam ||
      getState<string>({
        category: 'sort_by',
        key: 'projects',
        defaultValue: defaultPaginationConfig.sort_by,
      });

    const order_by =
      orderByParam ||
      getState<string>({
        category: 'order_by',
        key: 'projects',
        defaultValue: defaultPaginationConfig.order_by,
      });

    return {
      page: Number(pageParam) || defaultPaginationConfig.page,
      sort_by,
      order_by,
      filters,
    };
  });
  const [createProject, setCreateProject] = useState(false);
  const [infoProject, setInfoProject] = useState<IUpdateModal>(null);
  const [updateProject, setUpdateProject] = useState<IUpdateModal>(null);
  const [deleteProject, setDeleteProject] = useState<IDeleteModal>(null);
  const [createSubproject, setCreateSubproject] = useState<IUpdateModal>(null);

  const { getBackUrl, setBackUrl } = useGoBackUrl();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateTitle } = useTitle();
  const { checkPermissions } = useAuth();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      customer_id: apiConfig.filters.customer?.id,
      project_type_id: apiConfig.filters.project_type?.id,
      portfolio_id: apiConfig.filters.portfolio?.id,
    };
  }, [apiConfig]);

  const {
    loading: projectsLoading,
    data: projectsData,
    error: projectsError,
    send: getProjects,
  } = useGet<IPagingResult<IProject>>({
    url: '/projects',
    lazy: true,
  });

  const {
    loading: customersLoading,
    data: customersData,
    error: customersError,
    send: getCustomers,
  } = useGet<ICustomer[]>({
    url: '/customers/limited',
    lazy: true,
  });

  const {
    loading: portfoliosLoading,
    data: portfoliosData,
    error: portfoliosError,
    send: getPortfolios,
  } = useGet<IPortfolio[]>({
    url: '/portfolios/limited',
    lazy: true,
  });

  const {
    loading: projectTypesLoading,
    data: projectTypesData,
    error: projectTypesError,
    send: getProjectTypes,
  } = useGet<IProjectType[]>({
    url: '/project_types/limited',
    lazy: true,
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<IFilterProjectSchema>({
    resolver: yupResolver(filterProjectSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    getProjects({ params: apiParams });
  }, [apiParams, getProjects]);

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
    if (projectsError) {
      toast({ message: projectsError, severity: 'error' });

      return;
    }

    if (customersError) {
      toast({ message: customersError, severity: 'error' });

      return;
    }

    if (projectTypesError) {
      toast({ message: projectTypesError, severity: 'error' });

      return;
    }

    if (portfoliosError) {
      toast({ message: portfoliosError, severity: 'error' });
    }
  }, [projectsError, customersError, toast, projectTypesError, portfoliosError]);

  useEffect(() => {
    updateTitle('Projetos');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createProject: checkPermissions([
        [PermissionsUser.create_project, PermissionsUser.manage_project],
      ]),
      updateProject: checkPermissions([
        [PermissionsUser.update_project, PermissionsUser.manage_project],
      ]),
      deleteProject: checkPermissions([
        [PermissionsUser.delete_project, PermissionsUser.manage_project],
      ]),
      readProduct: checkPermissions([
        [PermissionsUser.read_product, PermissionsUser.manage_product],
      ]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const customersOptions = useMemo(() => {
    const options = !customersData ? [] : customersData;

    if (apiConfig.filters.customer) {
      const filter = options.find((customer) => customer.id === apiConfig.filters.customer!.id);

      if (!filter) {
        options.push(apiConfig.filters.customer as any);
      }
    }

    return options;
  }, [apiConfig.filters.customer, customersData]);

  const portfoliosOptions = useMemo(() => {
    const options = !portfoliosData ? [] : portfoliosData;

    if (apiConfig.filters.portfolio) {
      const filter = options.find((portfolio) => portfolio.id === apiConfig.filters.portfolio!.id);

      if (!filter) {
        options.push(apiConfig.filters.portfolio as any);
      }
    }

    return options;
  }, [apiConfig.filters.portfolio, portfoliosData]);

  const projectTypesOptions = useMemo(() => {
    const options = !projectTypesData ? [] : projectTypesData;

    if (apiConfig.filters.project_type) {
      const filter = options.find(
        (project_type) => project_type.id === apiConfig.filters.project_type!.id,
      );

      if (!filter) {
        options.push(apiConfig.filters.project_type as any);
      }
    }

    return options;
  }, [apiConfig.filters.project_type, projectTypesData]);

  const handleApplyFilters = useCallback(
    (formData: IFilterProjectSchema) => {
      const filtersValue = { ...formData, status_date: formData.status_date?.value || '' };

      setApiConfig((oldConfig) => ({
        ...oldConfig,
        filters: filtersValue,
        page: 1,
      }));

      updateState({
        category: 'filters',
        key: 'projects',
        value: filtersValue,
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
      ...defaultPaginationConfig.filters,
      status_date: defaultPaginationConfig.filters.status_date
        ? {
            label: statusDateTranslator[defaultPaginationConfig.filters.status_date] || '',
            value: defaultPaginationConfig.filters.status_date,
          }
        : null,
    });

    updateState({
      category: 'filters',
      key: 'projects',
      value: undefined,
      localStorage: true,
    });
  }, [resetForm, updateState]);

  const handleNavigateProducts = useCallback(
    (id: string, pathString: string) => {
      const search = { filters: JSON.stringify({ project: { id, pathString } }) };

      setBackUrl('products', location);

      navigate({
        pathname: '/products',
        search: `?${createSearchParams(search)}`,
      });
    },
    [location, navigate, setBackUrl],
  );

  const projectsFormatted = useMemo<IProjectCardInfo[]>(() => {
    if (!projectsData) {
      return [];
    }

    return projectsData.data.map<IProjectCardInfo>((project) => {
      const subprojectsFormatted = project.subprojects.map<ISubprojectCardInfo>((subproject) => ({
        ...subproject,
        status: getStatusText(subproject.statusDate),
        statusColor: StatusDateColor[subproject.statusDate.status],
        lateColor: subproject.statusDate.late ? StatusDateColor.late : undefined,
        pathString: `${subproject.name} | ${project.name} | ${project.customer.name}`,
      }));

      return {
        ...project,
        customer: project.customer.name,
        subprojects: subprojectsFormatted,
        status: getStatusText(project.statusDate),
        statusColor: StatusDateColor[project.statusDate.status],
        lateColor: project.statusDate.late ? StatusDateColor.late : undefined,
        pathString: `${project.name} | ${project.customer.name}`,
      };
    });
  }, [projectsData]);

  if (projectsLoading) return <Loading loading={projectsLoading} />;

  return (
    <>
      {createProject && (
        <CreateProjectModal
          openModal={createProject}
          closeModal={() => setCreateProject(false)}
          reloadList={() => getProjects({ params: apiParams })}
          defaultCustomer={apiConfig.filters.customer}
        />
      )}

      {createSubproject && (
        <CreateProjectModal
          openModal={!!createSubproject}
          closeModal={() => setCreateSubproject(null)}
          reloadList={() => getProjects({ params: apiParams })}
          project_id={createSubproject.id}
        />
      )}

      {updateProject && (
        <UpdateProjectModal
          openModal={!!updateProject}
          closeModal={() => setUpdateProject(null)}
          project_id={updateProject.id}
          reloadList={() => getProjects({ params: apiParams })}
        />
      )}

      {infoProject && (
        <InfoProjectModal
          openModal={!!infoProject}
          closeModal={() => setInfoProject(null)}
          project_id={infoProject.id}
        />
      )}

      {deleteProject && (
        <DeleteProjectModal
          openModal={!!deleteProject}
          closeModal={() => setDeleteProject(null)}
          project={deleteProject}
          reloadList={() => getProjects({ params: apiParams })}
        />
      )}

      <ListProjectContainer>
        <HeaderList
          id="projects"
          goBackUrl={getBackUrl('projects')}
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createProject && (
                <CustomIconButton
                  action={() => setCreateProject(true)}
                  title="Cadastrar Projeto"
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
                    key: 'projects',
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
                    key: 'projects',
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
                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormTextField
                      control={control}
                      name="name"
                      label="Nome"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.name}
                      errors={errors.name}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelect
                      control={control}
                      name="status_date"
                      label="Status"
                      margin_type="no-margin"
                      defaultValue={
                        apiConfig.filters.status_date
                          ? {
                              value: apiConfig.filters.status_date,
                              label: statusDateTranslator[apiConfig.filters.status_date],
                            }
                          : null
                      }
                      options={statusDateOptions}
                      optionLabel="label"
                      errors={errors.status_date as any}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="customer"
                      label="Cliente"
                      options={customersOptions}
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.customer}
                      margin_type="no-margin"
                      errors={errors.customer as any}
                      loading={customersLoading}
                      handleOpen={() => getCustomers()}
                      handleFilter={(params) => getCustomers(params)}
                      limitFilter={limitedCustomersLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="portfolio"
                      label="Portfolio"
                      options={portfoliosOptions}
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.portfolio}
                      margin_type="no-margin"
                      errors={errors.portfolio as any}
                      loading={portfoliosLoading}
                      handleOpen={() => getPortfolios()}
                      handleFilter={(params) => getPortfolios(params)}
                      limitFilter={limitedPortfoliosLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormSelectAsync
                      control={control}
                      name="project_type"
                      label="Tipo de Projeto"
                      options={projectTypesOptions}
                      optionLabel="name"
                      optionValue="id"
                      defaultValue={apiConfig.filters.project_type}
                      margin_type="no-margin"
                      errors={errors.project_type as any}
                      loading={projectTypesLoading}
                      handleOpen={() => getProjectTypes()}
                      handleFilter={(params) => getProjectTypes(params)}
                      limitFilter={limitedProjectTypesLength}
                      filterField="name"
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_deadline"
                      label="Prazo (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_deadline}
                      errors={errors.min_deadline}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_deadline"
                      label="Prazo (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_deadline}
                      errors={errors.max_deadline}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_start"
                      label="Data de Inicio (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_start}
                      errors={errors.min_start}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_start"
                      label="Data de Inicio (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_start}
                      errors={errors.max_start}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_available"
                      label="Data de Disponibilidade (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_available}
                      errors={errors.min_available}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_available"
                      label="Data de Disponibilidade (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_available}
                      errors={errors.max_available}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_end"
                      label="Data de Término (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_end}
                      errors={errors.min_end}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_end"
                      label="Data de Término (Max)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.max_end}
                      errors={errors.max_end}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="min_updated"
                      label="Data de Atualização (Min)"
                      margin_type="no-margin"
                      defaultValue={apiConfig.filters.min_updated}
                      errors={errors.min_updated}
                    />
                  </Grid>

                  <Grid item lg={3} md={4} sm={6} xs={12}>
                    <FormDateTimePicker
                      control={control}
                      name="max_updated"
                      label="Data de Atualização (Max)"
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
            totalPages: projectsData?.pagination.total_pages || 1,
            totalResults: projectsData?.pagination.total_results || 0,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        >
          <ProjectList>
            {projectsFormatted.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                permissions={permissions}
                setCreateSub={(id) => setCreateSubproject({ id })}
                setInfo={(id) => setInfoProject({ id })}
                setUpdate={(id) => setUpdateProject({ id })}
                setDelete={(id, name) => setDeleteProject({ id, name })}
                navigateProducts={handleNavigateProducts}
              />
            ))}
          </ProjectList>
        </HeaderList>
      </ListProjectContainer>
    </>
  );
}
