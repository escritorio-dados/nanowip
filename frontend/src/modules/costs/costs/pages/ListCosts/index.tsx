import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';

import { CustomIconButton } from '#shared/components/CustomIconButton';
import { CustomTable, ICol } from '#shared/components/CustomTable';
import { CustomTooltip } from '#shared/components/CustomTooltip';
import { Loading } from '#shared/components/Loading';
import { SortForm } from '#shared/components/SortForm';
import { useAuth } from '#shared/hooks/auth';
import { useGoBackUrl } from '#shared/hooks/goBackUrl';
import { useKeepStates } from '#shared/hooks/keepStates';
import { useTitle } from '#shared/hooks/title';
import { useToast } from '#shared/hooks/toast';
import { useGet } from '#shared/services/useAxios';
import { IPagingResult } from '#shared/types/IPagingResult';
import { PermissionsUser } from '#shared/types/PermissionsUser';
import { getApiConfig, updateApiConfig } from '#shared/utils/apiConfig';
import { getSortOptions, IPaginationConfig } from '#shared/utils/pagination';
import { parseDateApi } from '#shared/utils/parseDateApi';
import { removeEmptyFields } from '#shared/utils/removeEmptyFields';

import { ICost, ICostFilters } from '#modules/costs/costs/types/ICost';

import { CreateCostModal } from '../../components/CreateCost';
import { DeleteCostModal } from '../../components/DeleteCost';
import { InfoCostModal } from '../../components/InfoCost';
import { UpdateCostModal } from '../../components/UpdateCost';
import { defaultCostFilter, ListCostsFilter } from './form';

type IDeleteModal = { id: string; name: string } | null;
type IUpdateModal = { id: string } | null;

type ICostFormatted = {
  id: string;
  reason: string;
  value: string;
  paymentDate: string;
  serviceProvider: string;
  status: string;
};

export const defaultApiConfigCosts: IPaginationConfig<ICostFilters> = {
  page: 1,
  sort_by: 'created_at',
  order_by: 'DESC',
  filters: defaultCostFilter,
};

const sortTranslator: Record<string, string> = {
  reason: 'Motivo',
  value: 'Valor',
  description: 'Descrição',
  document_number: 'Numero do Documento',
  document_type: 'Tipo de Documento',
  service_provider: 'Provedor de Serviço',
  issue_date: 'Data de Lançamento',
  due_date: 'Data de Vencimento',
  payment_date: 'Data de Pagamento',
  updated_at: 'Data de Atualização',
  created_at: 'Data de Criação',
};

const sortOptions = getSortOptions(sortTranslator);

export const stateKeyCosts = 'costs';

export function ListCost() {
  const keepState = useKeepStates();

  const [apiConfig, setApiConfig] = useState<IPaginationConfig<ICostFilters>>(() =>
    getApiConfig({
      defaultApiConfig: defaultApiConfigCosts,
      keepState,
      stateKey: stateKeyCosts,
    }),
  );
  const [deleteCost, setDeleteCost] = useState<IDeleteModal>(null);
  const [updateCost, setUpdateCost] = useState<IUpdateModal>(null);
  const [createCost, setCreateCost] = useState(false);
  const [infoCost, setInfoCost] = useState<IUpdateModal>(null);

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
      document_number: apiConfig.filters.documentNumber || undefined,
      document_type_id: apiConfig.filters.documentType?.id,
      service_provider_id: apiConfig.filters.serviceProvider?.id,
      status: apiConfig.filters.status?.value,
    };
  }, [apiConfig]);

  const {
    loading: costsLoading,
    data: costsData,
    error: costsError,
    send: getCosts,
  } = useGet<IPagingResult<ICost>>({
    url: '/costs',
    lazy: true,
  });

  useEffect(() => {
    getCosts({ params: apiParams });
  }, [apiParams, getCosts]);

  useEffect(() => {
    if (costsError) {
      toast({ message: costsError, severity: 'error' });
    }
  }, [costsError, toast]);

  useEffect(() => {
    updateTitle('Custos');
  }, [updateTitle]);

  const permissions = useMemo(() => {
    return {
      createCost: checkPermissions([[PermissionsUser.create_cost, PermissionsUser.manage_cost]]),
      updateCost: checkPermissions([[PermissionsUser.update_cost, PermissionsUser.manage_cost]]),
      deleteCost: checkPermissions([[PermissionsUser.delete_cost, PermissionsUser.manage_cost]]),
    };
  }, [checkPermissions]);

  const activeFiltersNumber = useMemo(() => {
    return Object.values(removeEmptyFields(apiConfig.filters, true)).filter((data) => data).length;
  }, [apiConfig.filters]);

  const data = useMemo<ICostFormatted[]>(() => {
    if (!costsData) {
      return [];
    }

    return costsData.data.map<ICostFormatted>((cost) => ({
      ...cost,
      paymentDate: parseDateApi(cost.paymentDate, 'dd/MM/yyyy', '-'),
      value: new Intl.NumberFormat('pt-Br', { currency: 'BRL', style: 'currency' }).format(
        cost.value,
      ),
      serviceProvider: cost.serviceProvider?.name || '',
    }));
  }, [costsData]);

  const cols = useMemo<ICol<ICostFormatted>[]>(() => {
    return [
      { key: 'serviceProvider', header: 'Prestador do Serviço', minWidth: '200px' },
      {
        key: 'reason',
        header: 'Motivo',
        minWidth: '200px',
        maxWidth: '400px',
        customColumn: ({ reason }) => {
          return (
            <>
              <CustomTooltip title={reason}>{reason}</CustomTooltip>
            </>
          );
        },
      },
      { key: 'value', header: 'Valor', minWidth: '120px' },
      { key: 'paymentDate', header: 'Pagamento', maxWidth: '120px' },
      { key: 'status', header: 'Status', minWidth: '100px' },
      {
        header: 'Opções',
        maxWidth: '150px',
        minWidth: '150px',
        customColumn: ({ id, reason }) => {
          return (
            <Box sx={{ display: 'flex', position: 'relative', alignItems: 'center' }}>
              <CustomIconButton
                iconType="info"
                iconSize="small"
                title="Informações"
                action={() => setInfoCost({ id })}
              />

              {permissions.updateCost && (
                <CustomIconButton
                  iconType="edit"
                  iconSize="small"
                  title="Editar Custo"
                  action={() => setUpdateCost({ id })}
                />
              )}

              {permissions.deleteCost && (
                <CustomIconButton
                  iconType="delete"
                  iconSize="small"
                  title="Deletar Custo"
                  action={() => setDeleteCost({ id, name: reason })}
                />
              )}
            </Box>
          );
        },
      },
    ];
  }, [permissions.deleteCost, permissions.updateCost]);

  return (
    <>
      <Loading loading={costsLoading} />

      {createCost && (
        <CreateCostModal
          openModal={createCost}
          closeModal={() => setCreateCost(false)}
          reloadList={() => getCosts({ params: apiParams })}
        />
      )}

      {!!deleteCost && (
        <DeleteCostModal
          openModal={!!deleteCost}
          closeModal={() => setDeleteCost(null)}
          reloadList={() => getCosts({ params: apiParams })}
          cost={deleteCost}
        />
      )}

      {!!updateCost && (
        <UpdateCostModal
          openModal={!!updateCost}
          closeModal={() => setUpdateCost(null)}
          cost_id={updateCost.id}
          reloadList={() => getCosts({ params: apiParams })}
        />
      )}

      {!!infoCost && (
        <InfoCostModal
          openModal={!!infoCost}
          closeModal={() => setInfoCost(null)}
          cost_id={infoCost.id}
        />
      )}

      <CustomTable<ICostFormatted>
        id="costs"
        goBackUrl={getBackUrl('costs')}
        cols={cols}
        data={data}
        activeFilters={activeFiltersNumber}
        tableMinWidth="890px"
        custom_actions={
          <>
            {permissions.createCost && (
              <CustomIconButton
                action={() => setCreateCost(true)}
                title="Cadastrar Custo"
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
                  stateKey: stateKeyCosts,
                }),
              );
            }}
          />
        }
        filterContainer={
          <ListCostsFilter
            apiConfig={apiConfig}
            updateApiConfig={(filters) => {
              setApiConfig(
                updateApiConfig({
                  apiConfig,
                  keepState,
                  newConfig: { filters, page: 1 },
                  stateKey: stateKeyCosts,
                }),
              );
            }}
          />
        }
        pagination={{
          currentPage: apiConfig.page,
          totalPages: costsData?.pagination.total_pages || 1,
          totalResults: costsData?.pagination.total_results || 0,
          changePage: (page) =>
            setApiConfig(
              updateApiConfig({
                apiConfig,
                keepState,
                newConfig: { page },
                stateKey: stateKeyCosts,
              }),
            ),
        }}
      />
    </>
  );
}
