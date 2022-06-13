import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { getApiConfig, updateApiConfig } from '#shared/utils/apiConfig';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateRoleModal } from '#modules/users/roles/components/CreateRole';
import { DeleteRoleModal } from '#modules/users/roles/components/DeleteRole';
import { InfoRoleModal } from '#modules/users/roles/components/InfoRole';
import { UpdateRoleModal } from '#modules/users/roles/components/UpdateRole';
import { IRole, IRoleFilters } from '#modules/users/roles/types/IRole';

import { defaultRoleFilter, ListRolesFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

export const defaultApiConfigRoles: IPaginationConfig<IRoleFilters> = {
  page: 1,
  sort_by: 'updated_at',
  order_by: 'DESC',
  filters: defaultRoleFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeyRoles = 'roles';

export function ListRole() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IRoleFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigRoles,
      keepState,
      stateKey: stateKeyRoles,
    }),
  );
  const [deleteRole, setDeleteRole] = useState<IDeleteModal>(null);
  const [updateRole, setUpdateRole] = useState<IUpdateModal>(null);
  const [createRole, setCreateRole] = useState(false);
  const [infoRole, setInfoRole] = useState<IUpdateModal>(null);

  const { checkPermissions } = useAuth();
  const { updateTitle } = useTitle();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      permission: apiConfig.filters.permission?.permission,
    };
  }, [apiConfig]);

  const {
    loading: rolesLoading,
    data: rolesData,
    error: rolesError,
    send: getRoles,
    updateData: updateRolesData,
  } = useGet<IPagingResult<IRole>>({
    url: '/roles',
    lazy: true,
  });

  useEffect(() => {
    if (rolesError) {
      toast({ message: rolesError, severity: 'error' });
    }
  }, [rolesError, toast]);

  useEffect(() => {
    getRoles({ params: apiParams });
  }, [apiParams, getRoles]);

  useEffect(() => {
    updateTitle('Lista de papeis');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      updateRole: checkPermissions([[PermissionsUser.update_role, PermissionsUser.manage_role]]),
      deleteRole: checkPermissions([[PermissionsUser.delete_role, PermissionsUser.manage_role]]),
      createRole: checkPermissions([[PermissionsUser.create_role, PermissionsUser.manage_role]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const cols = useMemo<ICol<IRole>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '150px',
        minWidth: '150px',
        customColumn: ({ id, name }) => {
          return (
            <Box display="flex" alignItems="center">
              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoRole({ id })}
              />

              {permissions.updateRole && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Papel"
                  action={() => setUpdateRole({ id })}
                />
              )}

              {permissions.deleteRole && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Papel"
                  action={() => setDeleteRole({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [permissions]);

  return (
    <>
      <Loading loading={rolesLoading} />

      {!!deleteRole && (
        <DeleteRoleModal
          openModal={!!deleteRole}
          closeModal={() => setDeleteRole(null)}
          role={deleteRole}
          updateList={(id) => updateRolesData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!updateRole && (
        <UpdateRoleModal
          openModal={!!updateRole}
          closeModal={() => setUpdateRole(null)}
          role_id={updateRole.id}
          updateList={(id, data) =>
            updateRolesData((current) => handleUpdateItem({ id, data, current }))
          }
        />
      )}

      {!!infoRole && (
        <InfoRoleModal
          openModal={!!infoRole}
          closeModal={() => setInfoRole(null)}
          role_id={infoRole.id}
        />
      )}

      {createRole && (
        <CreateRoleModal
          openModal={createRole}
          closeModal={() => setCreateRole(false)}
          addList={(data) => updateRolesData((current) => handleAddItem({ data, current }))}
        />
      )}

      <CustomTable<IRole>
        id="roles"
        cols={cols}
        data={rolesData?.data || []}
        tableMinWidth="350px"
        tableMaxWidth="900px"
        activeFilters={activeFiltersNumber}
        custom_actions={
          <>
            {permissions.createRole && (
              <CustomIconButton
                action={() => setCreateRole(true)}
                title="Cadastrar Papel"
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
            updateSort={(sort_by, order_by) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { sort_by, order_by },
                  stateKey: stateKeyRoles,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListRolesFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyRoles,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: rolesData?.pagination.total_pages || 1,
          totalResults: rolesData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyRoles,
              }),
            ),
        }}
      />
    </>
  );
}
