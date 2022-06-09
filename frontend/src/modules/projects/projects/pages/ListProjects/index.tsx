import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { HeaderList } from '#shared/components/HeaderList';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/backend/PermissionsUser';
import { IPagingResult } from '#shared/types/backend/shared/IPagingResult';
import { StatusDateColor } from '#shared/types/IStatusDate';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import { getStatusText } from '#shared/utils/getStatusText';
import { getSortOptions, IPaginationConfig } from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateProjectModal } from '#modules/projects/projects/components/CreateProject';
import { DeleteProjectModal } from '#modules/projects/projects/components/DeleteProject';
import { InfoProjectModal } from '#modules/projects/projects/components/InfoProject';
import { IProjectCardInfo, ProjectCard } from '#modules/projects/projects/components/ProjectCard';
import { ISubprojectCardInfo } from '#modules/projects/projects/components/SubprojectCard';
import { UpdateProjectModal } from '#modules/projects/projects/components/UpdateProject';

import { IProjectFilters, IProject } from '../../types/IProject';
import { defaultProjectFilter, ListProjectsFilter } from './form';
import { ListProjectContainer, ProjectList } from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProjectFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultProjectFilter,
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

const stateKey = 'projects';

export function ListProjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProjectFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
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
      status_date: apiConfig.filters.status_date?.value,
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

  useEffect(() => {
    getProjects({ params: apiParams });
  }, [apiParams, getProjects]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (projectsError) {
      toast({ message: projectsError, severity: 'error' });
    }
  }, [projectsError, toast]);

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
                  iconType="add"
                />
              )}
            </>
          }
          sortContainer={
            <SortForm
              sortOptions={sortOptions}
              sortTranslator={sortTranslator}
              defaultOrder={apiConfig.order_by}
              defaultSort={apiConfig.sort_by}
              updateSort={(sortBy, orderBy) => {
                setApiConfig((oldConfig) => ({ ...oldConfig, sort_by: sortBy, order_by: orderBy }));

                keepState.updateManyStates([
                  {
                    category: 'sort_by',
                    key: stateKey,
                    value: sortBy,
                    localStorage: true,
                  },
                  {
                    category: 'order_by',
                    key: stateKey,
                    value: orderBy,
                    localStorage: true,
                  },
                ]);
              }}
            />
          }
          filterContainer={
            <ListProjectsFilter
              apiConfig={apiConfig}
              keepState={keepState}
              stateKey={stateKey}
              updateApiConfig={(filters) => {
                setApiConfig((oldConfig) => ({
                  ...oldConfig,
                  filters,
                  page: 1,
                }));
              }}
            />
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
