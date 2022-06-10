import { LibraryAdd } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { IPagingResult } from '#shared/types/IPagingResult';
import { StatusDateColor } from '#shared/types/IStatusDate';
import { getApiConfig, updateSearchParams } from '#shared/utils/apiConfig';
import { getStatusText } from '#shared/utils/getStatusText';
import { getSortOptions, IPaginationConfig } from '#shared/utils/pagination';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { CreateValueChainModal } from '#modules/valueChains/components/CreateValueChain';
import { CreateValueChainTrailModal } from '#modules/valueChains/components/CreateValueChainTrail';
import { DeleteValueChainModal } from '#modules/valueChains/components/DeleteValueChain';
import { InfoValueChainModal } from '#modules/valueChains/components/InfoValueChain';
import { UpdateValueChainModal } from '#modules/valueChains/components/UpdateValueChain';
import {
  IValueChainCardInfo,
  ValueChainCard,
} from '#modules/valueChains/components/ValueChainCard';
import { IValueChain, IValueChainFilters } from '#modules/valueChains/types/IValueChain';

import { defaultValueChainFilter, ListValueChainsFilter } from './form';
import { ListValueChainContainer, ValueChainList } from './styles';

type IUpdateModal = { id: string } | null;
type IDeleteModal = { id: string; name: string } | null;

const defaultPaginationConfig: IPaginationConfig<IValueChainFilters> = {
  page: 1,
  sort_by: 'name',
  order_by: 'ASC',
  filters: defaultValueChainFilter,
};

const sortTranslator: Record<string, string> = {
  name: 'Nome',
  available_date: 'Data de Disponibilidade',
  start_date: 'Data de Inicio',
  end_date: 'Data de Término',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
  product: 'Produto',
};

const sortOptions = getSortOptions(sortTranslator);

const stateKey = 'value_chains';

export function ListValueChains() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<IValueChainFilters>>(() =>
    getApiConfig({ searchParams, defaultPaginationConfig, keepState, stateKey }),
  );
  const [createValueChain, setCreateValueChain] = useState(false);
  const [createValueChainTrail, setCreateValueChainTrail] = useState(false);
  const [infoValueChain, setInfoValueChain] = useState<IUpdateModal>(null);
  const [updateValueChain, setUpdateValueChain] = useState<IUpdateModal>(null);
  const [deleteValueChain, setDeleteValueChain] = useState<IDeleteModal>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { getBackUrl, setBackUrl } = useGoBackUrl();
  const { updateTitle } = useTitle();
  const { checkPermissions } = useAuth();
  const { toast } = useToast();

  const apiParams = useMemo(() => {
    return {
      page: apiConfig.page,
      sort_by: apiConfig.sort_by,
      order_by: apiConfig.order_by,
      ...removeEmptyFields(apiConfig.filters),
      product_id: apiConfig.filters.product?.id,
      status_date: apiConfig.filters.status_date?.value,
    };
  }, [apiConfig]);

  const {
    loading: valueChainsLoading,
    data: valueChainsData,
    error: valueChainsError,
    send: getValueChains,
  } = useGet<IPagingResult<IValueChain>>({
    url: '/value_chains',
    lazy: true,
  });

  useEffect(() => {
    getValueChains({ params: apiParams });
  }, [apiParams, getValueChains]);

  useEffect(() => {
    setSearchParams(updateSearchParams({ apiConfig, searchParams }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiConfig]);

  useEffect(() => {
    if (valueChainsError) {
      toast({ message: valueChainsError, severity: 'error' });
    }
  }, [valueChainsError, toast]);

  useEffect(() => {
    updateTitle('Cadeias de valor');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createValueChain: checkPermissions([
        [PermissionsUser.create_value_chain, PermissionsUser.manage_value_chain],
      ]),
      updateValueChain: checkPermissions([
        [PermissionsUser.update_value_chain, PermissionsUser.manage_value_chain],
      ]),
      deleteValueChain: checkPermissions([
        [PermissionsUser.delete_value_chain, PermissionsUser.manage_value_chain],
      ]),
      readTasks: checkPermissions([[PermissionsUser.read_task, PermissionsUser.manage_task]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const valueChainsFormatted = useMemo<IValueChainCardInfo[]>(() => {
    if (!valueChainsData) {
      return [];
    }

    return valueChainsData.data.map<IValueChainCardInfo>((valueChain) => {
      return {
        ...valueChain,
        status: getStatusText(valueChain.statusDate),
        statusColor: StatusDateColor[valueChain.statusDate.status],
        lateColor: valueChain.statusDate.late ? StatusDateColor.late : undefined,
      };
    });
  }, [valueChainsData]);

  const handleNavigateTasks = useCallback(
    (id: string) => {
      setBackUrl('tasks', location);

      navigate(`/tasks/graph/${id}`);
    },
    [location, navigate, setBackUrl],
  );

  if (valueChainsLoading) return <Loading loading={valueChainsLoading} />;

  return (
    <>
      {createValueChain && (
        <CreateValueChainModal
          openModal={createValueChain}
          closeModal={() => setCreateValueChain(false)}
          reloadList={() => getValueChains({ params: apiParams })}
          defaultProduct={apiConfig.filters.product}
        />
      )}

      {createValueChainTrail && (
        <CreateValueChainTrailModal
          openModal={createValueChainTrail}
          closeModal={() => setCreateValueChainTrail(false)}
          reloadList={() => getValueChains({ params: apiParams })}
          defaultProduct={apiConfig.filters.product}
        />
      )}

      {updateValueChain && (
        <UpdateValueChainModal
          openModal={!!updateValueChain}
          closeModal={() => setUpdateValueChain(null)}
          value_chain_id={updateValueChain.id}
          reloadList={() => getValueChains({ params: apiParams })}
        />
      )}

      {infoValueChain && (
        <InfoValueChainModal
          openModal={!!infoValueChain}
          closeModal={() => setInfoValueChain(null)}
          value_chain_id={infoValueChain.id}
        />
      )}

      {deleteValueChain && (
        <DeleteValueChainModal
          openModal={!!deleteValueChain}
          closeModal={() => setDeleteValueChain(null)}
          valueChain={deleteValueChain}
          reloadList={() => getValueChains({ params: apiParams })}
        />
      )}

      <ListValueChainContainer>
        <HeaderList
          id="value_chains"
          goBackUrl={getBackUrl('value_chains')}
          activeFilters={activeFiltersNumber}
          custom_actions={
            <>
              {permissions.createValueChain && (
                <>
                  <CustomIconButton
                    action={() => setCreateValueChainTrail(true)}
                    title="Utilizar Trilha"
                    iconType="custom"
                    CustomIcon={
                      <LibraryAdd
                        sx={(theme) => ({
                          color: theme.palette.success.light,
                        })}
                      />
                    }
                  />

                  <CustomIconButton
                    action={() => setCreateValueChain(true)}
                    title="Cadastrar Cadeia de valor"
                    iconType="add"
                  />
                </>
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
            <ListValueChainsFilter
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
            totalPages: valueChainsData?.pagination.total_pages || 1,
            totalResults: valueChainsData?.pagination.total_results || 0,
            changePage: (newPage) => setApiConfig((oldConfig) => ({ ...oldConfig, page: newPage })),
          }}
        >
          <ValueChainList>
            {valueChainsFormatted.map((valueChain) => (
              <ValueChainCard
                key={valueChain.id}
                valueChain={valueChain}
                permissions={permissions}
                setInfo={(id) => setInfoValueChain({ id })}
                setUpdate={(id) => setUpdateValueChain({ id })}
                setDelete={(id, name) => setDeleteValueChain({ id, name })}
                handleNavigationTasks={handleNavigateTasks}
              />
            ))}
          </ValueChainList>
        </HeaderList>
      </ListValueChainContainer>
    </>
  );
}
