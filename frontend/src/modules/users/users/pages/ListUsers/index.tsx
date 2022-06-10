import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { IPagingResult } from '#shared/types/IPagingResult';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import {
  getSortOptions,
  handleAddItem,
  handleDeleteItem,
  handleUpdateItem,
  IPaginationConfig,
} from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateUserModal } from '#modules/users/users/components/CreateUser';
import { DeleteUserModal } from '#modules/users/users/components/DeleteUser';
import { InfoUserModal } from '#modules/users/users/components/InfoUser';
import { UpdateUserModal } from '#modules/users/users/components/UpdateUser';
import { DEFAULT_USER_ID, IUser, IUserFilters } from '#modules/users/users/types/IUser';

import { defaultUserFilter, ListUsersFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

const defaultPaginationConfig: IPaginationConfig<IUserFilters> = {
  page: 1,
  sort_by: 'updated_at',
  order_by: 'DESC',
  filters: defaultUserFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  email: 'Email',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'users';

export function ListUser() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IUserFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [deleteUser, setDeleteUser] = useState<IDeleteModal>(null);
  const [infoUser, setInfoUser] = useState<IUpdateModal>(null);
  const [updateUser, setUpdateUser] = useState<IUpdateModal>(null);
  const [createUser, setCreateUser] = useState(false);

  const { checkPermissions, user: userLogged } = useAuth();
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
    loading: usersLoading,
    data: usersData,
    error: usersError,
    send: getUsers,
    updateData: updateUsersData,
  } = useGet<IPagingResult<IUser>>({
    url: '/users',
    lazy: true,
  });

  useEffect(() => {
    getUsers({ params: apiParams });
  }, [apiParams, getUsers]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (usersError) {
      toast({ message: usersError, severity: 'error' });
    }
  }, [usersError, toast]);

  useEffect(() => {
    updateTitle('Usuarios');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      updateUser: checkPermissions([[PermissionsUser.update_user, PermissionsUser.manage_user]]),
      deleteUser: checkPermissions([[PermissionsUser.delete_user, PermissionsUser.manage_user]]),
      createUser: checkPermissions([[PermissionsUser.create_user, PermissionsUser.manage_user]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const cols = useMemo<ICol<IUser>[]>(() => {
    return [
      { key: 'name', header: 'Nome', minWidth: '200px' },
      { key: 'email', header: 'Email', minWidth: '200px' },
      {
        header: 'Opções',
        maxWidth: '150px',
        minWidth: '150px',
        customColumn: ({ id, name }) => {
          const changeRootOnlyWithRoot = !(id === DEFAULT_USER_ID && id !== userLogged.id);

          const rootDontDelete = id !== DEFAULT_USER_ID;

          return (
            <Box display="flex" alignItems="center">
              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoUser({ id })}
              />

              {permissions.updateUser && changeRootOnlyWithRoot && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Usuario"
                  action={() => setUpdateUser({ id })}
                />
              )}

              {permissions.deleteUser && rootDontDelete && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Usuario"
                  action={() => setDeleteUser({ id, name })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [permissions, userLogged.id]);

  if (usersLoading) return <Loading loading={usersLoading} />;

  return (
    <>
      {!!deleteUser && (
        <DeleteUserModal
          openModal={!!deleteUser}
          closeModal={() => setDeleteUser(null)}
          user={deleteUser}
          updateList={(id) => updateUsersData((current) => handleDeleteItem({ id, current }))}
        />
      )}

      {!!updateUser && (
        <UpdateUserModal
          openModal={!!updateUser}
          closeModal={() => setUpdateUser(null)}
          user_id={updateUser.id}
          updateList={(id, data) =>
            updateUsersData((current) => handleUpdateItem({ id, data, current }))
          }
        />
      )}

      {!!infoUser && (
        <InfoUserModal
          openModal={!!infoUser}
          closeModal={() => setInfoUser(null)}
          user_id={infoUser.id}
        />
      )}

      {createUser && (
        <CreateUserModal
          openModal={createUser}
          closeModal={() => setCreateUser(false)}
          addList={(data) => updateUsersData((current) => handleAddItem({ data, current }))}
        />
      )}

      {usersData && (
        <CustomTable<IUser>
          id="users"
          cols={cols}
          data={usersData.data}
          tableMinWidth="550px"
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createUser && (
                <CustomIconButton
                  action={() => setCreateUser(true)}
                  title="Cadastrar Usuario"
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
            <ListUsersFilter
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
            totalPages: usersData.pagination.total_pages,
            totalResults: usersData.pagination.total_results,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        />
      )}
    </>
  );
}
