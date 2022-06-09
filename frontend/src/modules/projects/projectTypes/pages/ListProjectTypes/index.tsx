import { ListAlt } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
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
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateProjectTypeModal } from '#modules/projects/projectTypes/components/CreateProjectType';
import { DeleteProjectTypeModal } from '#modules/projects/projectTypes/components/DeleteProjectType';
import { InfoProjectTypeModal } from '#modules/projects/projectTypes/components/InfoProjectType';
import { UpdateProjectTypeModal } from '#modules/projects/projectTypes/components/UpdateProjectType';

import { IProjectType, IProjectTypeFilters } from '../../types/IProjectType';
import { defaultProjectTypeFilter, ListProjectTypesFilter } from './form';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IProjectTypeFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultProjectTypeFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'project_types';

export function ListProjectType() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IProjectTypeFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
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

  useEffect(() => {
    getProjectTypes({ params: apiParams });
  }, [apiParams, getProjectTypes]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

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
        maxWidth: '175px',
        minWidth: '175px',
        customColumn: ({ id, name }) => {
          return (
            <Box sx={{ display: 'flex' }}>
              {permissions.readProject && (
                <CustomIconButton
                  iconType="custom"
                  iconSize="small"
                  title="Ir para projetos"
                  CustomIcon={<ListAlt fontSize="small" />}
                  action={() => handleNavigateProjects(id, name)}
                />
              )}

              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoProjectType({ id })}
              />

              {permissions.updateProjectType && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar tipo de projeto"
                  action={() => setUpdateProjectType({ id })}
                />
              )}

              {permissions.deleteProjectType && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar tipo de projeto"
                  action={() => setDeleteProjectType({ id, name })}
                />
              )}
            </Box>
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

  if (projectTypesLoading) return <Loading loading={projectTypesLoading} />;

  return (
    <>
      {createProjectType && (
        <CreateProjectTypeModal
          openModal={createProjectType}
          closeModal={() => setCreateProjectType(false)}
          addList={(newData) =>
            updateProjectTypesData((current) => handleAddItem({ data: newData, current }))
          }
        />
      )}

      {!!deleteProjectType && (
        <DeleteProjectTypeModal
          openModal={!!deleteProjectType}
          projectType={deleteProjectType}
          closeModal={() => setDeleteProjectType(null)}
          updateList={(id) =>
            updateProjectTypesData((current) => handleDeleteItem({ id, current }))
          }
        />
      )}

      {!!updateProjectType && (
        <UpdateProjectTypeModal
          openModal={!!updateProjectType}
          closeModal={() => setUpdateProjectType(null)}
          projectType_id={updateProjectType.id}
          updateList={(id, newData) =>
            updateProjectTypesData((current) => handleUpdateItem({ id, data: newData, current }))
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
          tableMinWidth="375px"
          tableMaxWidth="900px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createProjectType && (
                <CustomIconButton
                  action={() => setCreateProjectType(true)}
                  title="Cadastrar tipo de projeto"
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
            <ListProjectTypesFilter
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
            totalPages: projectTypesData.pagination.total_pages,
            totalResults: projectTypesData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
